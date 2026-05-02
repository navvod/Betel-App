import csv
import re
import sys
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand, CommandError

URL      = "https://exagri.info/mkt/index.html"
BASE_URL = "https://exagri.info/mkt"
CSV_PATH = Path(__file__).resolve().parents[3] / "api" / "ml" / "BetelPrice.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

COLUMN_MAP = {
    "Export-Peedunu-Max":            ("Export", "Peedunu", "Premium"),
    "Export-Peedunu-Min":            ("Export", "Peedunu", "Standard"),
    "Export-Kanda Kola-Max":         ("Export", "Kanda",   "Premium"),
    "Export-Kanda Kola-Min":         ("Export", "Kanda",   "Standard"),
    "Local-Peedunu-(Highest Price)": ("Local",  "Peedunu", "Premium"),
    "Local-Peedunu-(Average Price)": ("Local",  "Peedunu", "Standard"),
    "Local-Keti-(Highest Price)":    ("Local",  "Keti",    "Premium"),
    "Local-Keti-(Average Price)":    ("Local",  "Keti",    "Standard"),
    "Local-korikan-(Highest Price)": ("Local",  "Korikan", "Premium"),
    "Local-korikan-(Average Price)": ("Local",  "Korikan", "Standard"),
}
SKIP_DISTRICTS = {"national"}


def normalise(s):
    return re.sub(r"\s+", " ", s).strip().lower()


def format_date(dt):
    return f"{dt.month}/{dt.day}/{dt.year}"


def parse_price(value):
    v = value.strip().replace(",", "").replace(".00", "").replace(".0", "")
    if v in ("-", "", "N/A", "n/a"):
        return None
    try:
        return str(int(float(v)))
    except ValueError:
        return None


def get_existing_dates(csv_path):
    if not csv_path.exists():
        return set()
    dates = set()
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if row:
                dates.add(row[0].strip())
    return dates


def fetch(url):
    resp = requests.get(url, timeout=30, headers=HEADERS)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def get_latest_date_url():
    from datetime import datetime
    soup = fetch(URL)
    existing = get_existing_dates(CSV_PATH)
    seen = {}
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        m = re.search(r"(\d{2})\.(\d{2})\.(\d{4})\.html", href)
        if not m:
            continue
        day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            dt = datetime(year, month, day)
        except ValueError:
            continue
        canonical = f"{BASE_URL}/{year}/{m.group(1)}.{m.group(2)}.{m.group(3)}.html"
        if dt not in seen:
            seen[dt] = canonical
    new_dates = [(dt, url) for dt, url in seen.items() if format_date(dt) not in existing]
    if not new_dates:
        return None, None
    new_dates.sort(key=lambda x: x[0], reverse=True)
    return new_dates[0]


def extract_betel_rows(soup, report_date):
    betel_table = None
    for heading in soup.find_all(["h2", "h3", "h4", "b", "strong", "td", "th"]):
        if heading.get_text(strip=True).strip().lower() == "betel":
            for sib in heading.find_next_siblings():
                if sib.name == "table":
                    betel_table = sib
                    break
                if sib.name in ("h2", "h3", "h4"):
                    break
            if betel_table:
                break
    if betel_table is None:
        for tbl in soup.find_all("table"):
            if "peedunu" in tbl.get_text().lower():
                betel_table = tbl
                break
    if betel_table is None:
        return []
    header_row = betel_table.find("tr")
    if not header_row:
        return []
    headers = [th.get_text(separator=" ", strip=True) for th in header_row.find_all(["th", "td"])]
    col_indices = {}
    for idx, hdr in enumerate(headers):
        for key, mapping in COLUMN_MAP.items():
            if normalise(key) == normalise(hdr):
                col_indices[idx] = mapping
                break
    if not col_indices:
        return []
    date_str = format_date(report_date)
    rows = []
    for tr in betel_table.find_all("tr")[1:]:
        cells = [td.get_text(strip=True) for td in tr.find_all(["th", "td"])]
        if not cells:
            continue
        district = cells[0].strip()
        if not district or normalise(district) in SKIP_DISTRICTS:
            continue
        for idx, (market_type, commercial_type, quality_grade) in col_indices.items():
            if idx >= len(cells):
                continue
            price = parse_price(cells[idx])
            if price is None:
                continue
            rows.append([date_str, district, market_type, commercial_type, quality_grade, price, "", ""])
    return rows


def append_to_csv(csv_path, rows):
    write_header = not csv_path.exists()
    with csv_path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(["Date", "District", "Market Type", "Commercial Type", "Quality Grade", "Price", "", " "])
        writer.writerows(rows)


class Command(BaseCommand):
    help = "Scrape exagri.info and append new weekly Betel prices to BetelPrice.csv"

    def handle(self, *args, **options):
        self.stdout.write("Checking for new Betel prices on exagri.info ...")
        try:
            dt, url = get_latest_date_url()
        except Exception as exc:
            raise CommandError(f"Failed to fetch index page: {exc}") from exc
        if dt is None:
            self.stdout.write(self.style.WARNING("No new data — CSV is already up to date."))
            return
        date_str = format_date(dt)
        self.stdout.write(f"New week found: {date_str}  ->  {url}")
        try:
            soup = fetch(url)
            rows = extract_betel_rows(soup, dt)
        except Exception as exc:
            raise CommandError(f"Failed to fetch/parse price page: {exc}") from exc
        if not rows:
            raise CommandError("Page fetched but no Betel rows extracted. Site layout may have changed.")
        append_to_csv(CSV_PATH, rows)
        try:
            import sys as _sys
            for mod_name in list(_sys.modules.keys()):
                if "price_predict" in mod_name or "ml_utils" in mod_name:
                    mod = _sys.modules[mod_name]
                    if hasattr(mod, "DATA_CACHE"):
                        mod.DATA_CACHE = None
        except Exception:
            pass
        self.stdout.write(self.style.SUCCESS(f"Done. Added {len(rows)} rows for {date_str} -> {CSV_PATH}"))
