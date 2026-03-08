import json
from .llm_service import call_llm_with_grounding, validate_llm_response, merge_base_and_llm


# Betel Leaf Disease Remedies (Severity-based) – Sinhala


REMEDY_DATA = {

    "Bacterial_Leaf_Blight": {
        "early": {
            "warning_level": "LOW",
            "cultural": [
                "ජලය එකතු වීම වැළැක්වීමට හොඳ ජල නිකාසය සකස් කරන්න",
                "ආසාදිත කොළ හා ශාඛා ඉවත් කර විනාශ කරන්න",
                "වගාව තුළ වායු සංසරණය වැඩි කිරීමට නිසි දුර පවත්වාගන්න"
            ],
            "scientific": [
                "තඹ ඔක්සික්ලෝරයිඩ් 0.3% (ග්‍රෑම් 3/ලීටර්) ස්ප්‍රේ කරන්න",
                "ස්ට්‍රෙප්ටොසයික්ලින් 100 ppm තඹ සමඟ මිශ්‍ර කර භාවිතා කරන්න"
            ],
            "prevention": [
                "රෝග රහිත වගා ද්‍රව්‍ය භාවිතා කරන්න",
                "වැසි සමයේදී කොළ තෙත් වීම අවම කරන්න",
                "වගා උපකරණ විෂබීජ නාශනය කරන්න"
            ]
        },
        "moderate": {
            "warning_level": "MEDIUM",
            "cultural": [
                "ආසාදිත පැළ කොටස් කප්පාදු කර ඉවත් කරන්න",
                "අධික තෙතමනය පාලනය කරන්න"
            ],
            "scientific": [
                "තඹ ද්‍රාවණය හා ස්ට්‍රෙප්ටොසයික්ලින් දින 10-14 කට වරක් යෙදීම",
                "පසූඩෝමෝනස් ජීව පාලන ක්‍රමයක් ලෙස භාවිතා කරන්න"
            ],
            "prevention": [
                "වගාව නිතර පරීක්ෂා කරන්න",
                "අධික නයිට්‍රජන් පොහොර භාවිතයෙන් වලකින්න"
            ]
        },
        "severe": {
            "warning_level": "HIGH",
            "cultural": [
                "සම්පූර්ණයෙන් ආසාදිත පැළ ඉවත් කර දහනය කරන්න"
            ],
            "scientific": [
                "තඹ සහ ප්‍රතිජීවක මිශ්‍ර ඖෂධ නිර්දේශ අනුව භාවිතා කරන්න",
                "ට්‍රයිකොඩර්මා ජීව පාලන ක්‍රම ලෙස භාවිතා කරන්න"
            ],
            "prevention": [
                "වගා මාරුව ක්‍රියාත්මක කරන්න",
                "වැසි සමයේදී ජලය එකතු වීම වැළැක්වීම"
            ]
        }
    },

    "Fungal_Brown_Spot": {
        "early": {
            "warning_level": "LOW",
            "cultural": [
                "ආසාදිත කොළ ඉවත් කරන්න විනාශ කරන්න",
                "වගාව තුළ හොඳ වායු සංසරණයක් පවත්වාගන්න"
            ],
            "scientific": [
                "මැන්කොසෙබ් 0.2% ස්ප්‍රේ කරන්න",
                "සල්ෆර් ද්‍රාවණ භාවිතා කරන්න"
            ],
            "prevention": [
                "වැසි සමයේදී තෙතමනය පාලනය කරන්න",
                "සෞඛ්‍ය සම්පන්න වගා පද්ධතියක් පවත්වාගන්න"
            ]
        },
        "moderate": {
            "warning_level": "MEDIUM",
            "cultural": [
                "ආසාදිත ශාඛා කප්පාදු කරන්න",
                "වගාව තුළ අධික සෙවන අඩු කරන්න"
            ],
            "scientific": [
                "කාබෙන්ඩසිම් 0.1% හෝ මෙටලැක්සිල් 0.1% භාවිතා කරන්න",
                "ට්‍රයිකොඩර්මා වයිරීඩි පැළ වටා පසට දමා මුල් කුණු වීම වැළැක්වීමට භාවිතා කරන්න"
            ],
            "prevention": [
                "සතිපතා නිරීක්ෂණය කරන්න"
            ]
        },
        "severe": {
            "warning_level": "HIGH",
            "cultural": [
                "ආසාදිත පැළ සම්පූර්ණයෙන් ඉවත් කර විනාශ කරන්න"
            ],
            "scientific": [
                "විශේෂඥ උපදෙස් අනුව ෆංගස් නාශක භාවිතා කරන්න"
            ],
            "prevention": [
                "රෝග ප්‍රතිරෝධී වර්ග භාවිතා කරන්න",
                "වගා මාරුව සිදු කරන්න"
            ]
        }
    },

    "Leaf_Spot": {
        "early": {
            "warning_level": "LOW",
            "cultural": [
                "ආසාදිත කොළ ඉවත් කරන්න",
                "වැටුණු කොළ සහ අපද්‍රව්‍ය පිරිසිදු කරන්න"
            ],
            "scientific": [
                "සතියකට වරක් ක්ලොරෝතාලොනීල් 0.2% ස්ප්‍රේ කරන්න"
            ],
            "prevention": [
                "වායු සංසරණය වැඩි කරන්න",
                "අතිරික්ත තෙතමනයෙන් වලකින්න"
            ]
        },
        "moderate": {
            "warning_level": "MEDIUM",
            "cultural": [
                "ආසාදිත කොළ කප්පාදු කරන්න"
            ],
            "scientific": [
                "මෙටලැක්සිල් + මැන්කොසෙබ් මිශ්‍රණය භාවිතා කරන්න"
            ],
            "prevention": [
                "ජලසම්පාදනය අඩු කරන්න",
                "සෞඛ්‍ය සම්පන්න වගා ක්‍රම පවත්වාගන්න"
            ]
        },
        "severe": {
            "warning_level": "HIGH",
            "cultural": [
                "ආසාදිත පැළ ඉවත් කර විනාශ කරන්න"
            ],
            "scientific": [
                "නිර්දේශිත පද්ධතිගත ෆංගස් නාශක භාවිතා කරන්න"
            ],
            "prevention": [
                "වගා මාරුව සිදු කරන්න"
            ]
        }
    },

    "Kalamadiri_Haniya": {
        "early": {
            "warning_level": "LOW",
            "cultural": [
                "ආසාදිත කොළ ඉවත් කරන්න",
                "වගාව තුළ අධික වියළි තත්ත්වය අඩු කරන්න",
                "නිසි සෙවන පවත්වාගන්න"
            ],
            "scientific": [
                "නීම් තෙල් 3% ස්ප්‍රේ කරන්න",
                "ස්පයිනෝසාඩ් හෝ අබාමෙක්ටින් අඩංගු කීටනාශක නිර්දේශිත ලෙස යෙදීම"
            ],
            "prevention": [
                "වගාව නිතර පරීක්ෂා කරන්න",
                "අධික රසායනික භාවිතයෙන් වලකින්න",
                "ස්වාභාවික සතුරන් ආරක්ෂා කරන්න"
            ]
        },
        "moderate": {
            "warning_level": "MEDIUM",
            "cultural": [
                "බරපතළ ලෙස හානියට පත් කොළ ඉවත් කරන්න",
                "වගාව තුළ දූවිලි තත්ත්වය අඩු කරන්න"
            ],
            "scientific": [
                "අබාමෙක්ටින් 0.5 මිලි/ලීටර් යෙදීම",
                "ස්පයිනෝසාඩ් නිර්දේශිත මාත්‍රාවෙන් භාවිතා කරන්න"
            ],
            "prevention": [
                "සතිපතා නිරීක්ෂණය කරන්න",
                "වගාව තුළ තෙතමනය මට්ටම පවත්වාගන්න"
            ]
        },
        "severe": {
            "warning_level": "HIGH",
            "cultural": [
                "බරපතළ ආසාදිත පැළ ඉවත් කර විනාශ කරන්න"
            ],
            "scientific": [
                "නිර්දේශිත පද්ධතිගත කීටනාශක භාවිතා කරන්න",
                "කෘෂිකර්ම නිලධාරියෙකුගේ උපදෙස් අනුව ඖෂධ යෙදීම"
            ],
            "prevention": [
                "ඒකාබද්ධ කීට පාලන (IPM) ක්‍රම අනුගමනය කරන්න",
                "වගාව තුළ පිරිසිදුකම පවත්වාගන්න"
            ]
        }
    },

    "Red_Spider_Mite": {
        "early": {
            "warning_level": "LOW",
            "cultural": [
                "පැළ මත ඇති ජාල (webbing) ඉවත් කරන්න",
                "වියළි තත්ත්වය අඩු කර නිසි තෙතමනය පවත්වාගන්න"
            ],
            "scientific": [
                "නීම් තෙල් 3% ස්ප්‍රේ කරන්න",
                "ගන්ධක 0.2% වතුරට මිශ්‍ර කර කොළ මත ස්ප්‍රේ කරන්න"
            ],
            "prevention": [
                "වගාව තුළ දූවිලි තත්ත්වය අඩු කරන්න",
                "ස්වාභාවික මයිට් සතුරන් ආරක්ෂා කරන්න"
            ]
        },
        "moderate": {
            "warning_level": "MEDIUM",
            "cultural": [
                "ආසාදිත කොළ ඉවත් කරන්න",
                "අධික උෂ්ණත්වය පාලනය කරන්න"
            ],
            "scientific": [
                "ඩයිකෝෆෝල් 0.05% හෝ අබාමෙක්ටින් 0.5 මිලි/ලීටර් යෙදීම",
                "ගන්ධක වතුරට මිශ්‍ර කර නැවත ස්ප්‍රේ කරන්න"
            ],
            "prevention": [
                "සතිපතා නිරීක්ෂණය කරන්න",
                "වගාව තුළ නිසි සෙවන පවත්වාගන්න"
            ]
        },
        "severe": {
            "warning_level": "HIGH",
            "cultural": [
                "බරපතළ ආසාදිත පැළ කොටස් ඉවත් කරන්න"
            ],
            "scientific": [
                "නිර්දේශිත මයිට් නාශක (Acaricide) භාවිතා කරන්න",
                "කෘෂිකර්ම නිලධාරියෙකුගේ උපදෙස් ලබාගෙන ඖෂධ යෙදීම"
            ],
            "prevention": [
                "ඖෂධ මාරුවෙන් භාවිතා කරන්න (resistance වැළැක්වීමට)",
                "වගාව තුළ පිරිසිදුකම හා තෙතමනය පවත්වාගන්න"
            ]
        }
    },

    "Caterpillar_Damage": {
        "early": {
            "warning_level": "LOW",
            "cultural": [
                "අත්යෙන් කීටයන් ඉවත් කරන්න"
            ],
            "scientific": [
                "නීම් තෙල් 3% ස්ප්‍රේ කරන්න"
            ],
            "prevention": [
                "වගාව නිතර පරීක්ෂා කරන්න",
                "ස්වාභාවික සතුරන් ආරක්ෂා කරන්න"
            ]
        },
        "moderate": {
            "warning_level": "MEDIUM",
            "cultural": [
                "ලයිට් ට්‍රැප් භාවිතා කරන්න",
                "ස්වාභාවික සතුරන් වර්ධනය කරන්න"
            ],
            "scientific": [
                "බැසිලස් තුරින්ජියෙන්සිස් (Bt) 0.1% භාවිතා කරන්න"
            ],
            "prevention": [
                "කීට ක්‍රියාකාරීත්වය නිරීක්ෂණය කරන්න"
            ]
        },
        "severe": {
            "warning_level": "HIGH",
            "cultural": [
                "බරපතළ ලෙස හානියට පත් පැළ ඉවත් කරන්න"
            ],
            "scientific": [
                "කෘෂිකර්ම නිලධාරියෙකුගේ උපදෙස් අනුව රසායනික කීටනාශක භාවිතා කරන්න"
            ],
            "prevention": [
                "නැවත ආසාදනය වීම වැළැක්වීමට පියවර ගන්න",
                "ඒකාබද්ධ කීට පාලන ක්‍රම අනුගමනය කරන්න"
            ]
        }
    }
}


# Normalize disease key to match REMEDY_DATA keys

DISEASE_KEY_MAP = {
    "bacteria_blight": "Bacterial_Leaf_Blight",        
    "bacterial_blight": "Bacterial_Leaf_Blight",       
    "bacterial_leaf_blight": "Bacterial_Leaf_Blight",
    "red_spider_mite_damage": "Red_Spider_Mite",
    "red_spider_mite": "Red_Spider_Mite",
    "caterpillar_damage": "Caterpillar_Damage",
    "leaf_spot": "Leaf_Spot",
    "brown_spot": "Fungal_Brown_Spot", 
    "fungal_brown_spot": "Fungal_Brown_Spot",
    "bacterial_leaf_blight": "Bacterial_Leaf_Blight",
    "kalamadiri_haniya": "Kalamadiri_Haniya",
    "kanamadiri_haniya": "Kalamadiri_Haniya",
}


def normalize_disease_key(raw_key: str) -> str:
    """Convert any variant of disease name to exact REMEDY_DATA key."""
    cleaned = raw_key.lower().strip().replace(" ", "_").replace("-", "_")
    # Fix common typo: kana -> kala
    cleaned = cleaned.replace("kanamadiri", "kalamadiri")
    return DISEASE_KEY_MAP.get(cleaned, raw_key)



# Rule-based (offline)

def get_rule_based(disease: str, severity: str) -> dict:
    """Get rule-based remedy. Works offline. Returns base data with warning_level."""
    norm_disease = normalize_disease_key(disease)
    data = REMEDY_DATA.get(norm_disease, {}).get(severity.lower(), {})
    if not data:
        print(f" No rule-based data for: {norm_disease}/{severity}")
    return data


def get_remedy(severity_label: str) -> dict:
    """Legacy helper: input format 'Disease/severity'"""
    disease, severity = severity_label.split("/")
    data = get_rule_based(disease, severity)
    return {
        "warning_level": data.get("warning_level", "UNKNOWN"),
        "cultural": data.get("cultural", []),
        "scientific": data.get("scientific", []),
        "prevention": data.get("prevention", [])
    }



# Hybrid advisory (online = LLM, offline = rule-based)

def get_hybrid_advisory(disease: str, severity: str, online: bool = True) -> dict:
    """
    Main advisory function.
    - offline: returns rule-based data directly
    - online: calls LLM, verifies output, merges with base data
    """
    # Always get base data first
    base_data = get_rule_based(disease, severity)

    if not base_data:
        # Unknown disease/severity combo
        return {
            "risk_level": "UNKNOWN",
            "cultural": [],
            "scientific": [],
            "prevention": [],
            "safety": [],
            "source": "none"
        }

    # Offline mode: return rule-based with consistent key names
    if not online:
        return {
            "risk_level": base_data.get("warning_level", "UNKNOWN"),
            "cultural": base_data.get("cultural", []),
            "scientific": base_data.get("scientific", []),
            "prevention": base_data.get("prevention", []),
            "safety": [],
            "source": "rule_based"
        }

    # Online mode: try LLM enhancement
    try:
        llm_text = call_llm_with_grounding(disease, severity, base_data)
        print("LLM raw response:", llm_text[:200], "...")

        # Validate with base_data for content verification
        if validate_llm_response(llm_text, base_data):
            llm_data = json.loads(llm_text)

            # Merge: ensure base items are preserved
            merged = merge_base_and_llm(base_data, llm_data)
            merged["source"] = "llm_enhanced"

            print(f" Using LLM-enhanced advisory for {disease}/{severity}")
            return merged
        else:
            print(" LLM validation failed → using rule-based fallback")
            return {
                "risk_level": base_data.get("warning_level", "UNKNOWN"),
                "cultural": base_data.get("cultural", []),
                "scientific": base_data.get("scientific", []),
                "prevention": base_data.get("prevention", []),
                "safety": [],
                "source": "rule_based_fallback"
            }

    except Exception as e:
        print(f" LLM error: {e} → using rule-based fallback")
        return {
            "risk_level": base_data.get("warning_level", "UNKNOWN"),
            "cultural": base_data.get("cultural", []),
            "scientific": base_data.get("scientific", []),
            "prevention": base_data.get("prevention", []),
            "safety": [],
            "source": "rule_based_fallback"
        }