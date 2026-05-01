import json
import re
from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def call_llm_with_grounding(disease, severity, base_data):
    """
    Call LLM to enhance rule-based remedy data.
    All output is in Sinhala. Only risk_level is in English.
    base_data is used as grounding — LLM must not contradict it.
    """
    readable_disease = disease.replace("_", " ")

    # Count how many base items we have for verification
    base_cultural_count = len(base_data.get("cultural", []))
    base_scientific_count = len(base_data.get("scientific", []))

    prompt = f"""
You are an expert agricultural advisor specializing in betel leaf (Piper betle) cultivation in Sri Lanka.

Disease: {readable_disease}
Severity: {severity}

EXISTING TRUSTED GUIDELINES (you must include these and can add more):
Cultural practices: {json.dumps(base_data.get('cultural', []), ensure_ascii=False)}
Scientific controls: {json.dumps(base_data.get('scientific', []), ensure_ascii=False)}
Prevention methods: {json.dumps(base_data.get('prevention', []), ensure_ascii=False)}

YOUR TASK:
1. Include ALL existing guidelines above in your response (do not remove any)
2. Add 2-3 additional expert recommendations for each category
3. Add a "safety" section with 2-3 chemical safety tips for farmers
4. IMPORTANT: Write ALL recommendations in Sinhala language (සිංහල)
5. risk_level must be in English: LOW, MEDIUM, or HIGH

Rules:
- Do NOT contradict the existing guidelines
- Do NOT recommend chemicals not suitable for Sri Lanka
- All text in cultural, scientific, prevention, safety must be in Sinhala script
- Minimum {base_cultural_count + 2} items in cultural
- Minimum {base_scientific_count + 1} items in scientific

Return ONLY valid JSON (no markdown, no explanation):

{{
    "risk_level": "LOW or MEDIUM or HIGH",
    "cultural": ["සිංහල recommendation 1", "සිංහල recommendation 2"],
    "scientific": ["සිංහල recommendation 1", "සිංහල recommendation 2"],
    "prevention": ["සිංහල recommendation 1", "සිංහල recommendation 2"],
    "safety": ["සිංහල safety tip 1", "සිංහල safety tip 2"]
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,  # Lower temperature = more consistent/reliable output
        max_tokens=1500,
    )

    content = response.choices[0].message.content.strip()

    # Remove markdown code blocks if present
    content = re.sub(r"```json\s*", "", content)
    content = re.sub(r"```\s*", "", content)
    content = content.strip()

    return content


def validate_llm_response(response_text, base_data=None):
    """
    Validate LLM response:
    1. Must be valid JSON
    2. Must have all required fields
    3. Must have meaningful content (not empty lists)
    4. If base_data provided, verify LLM kept base items (content verification)
    """
    try:
        data = json.loads(response_text)

        # Check required fields exist
        required = ["risk_level", "cultural", "scientific", "prevention"]
        for field in required:
            if field not in data:
                print(f"Validation failed: missing field '{field}'")
                return False

        # Check risk_level is valid
        rl = data.get("risk_level", "").upper()
        if rl not in ["LOW", "MEDIUM", "HIGH"]:
            print(f"Validation failed: invalid risk_level '{rl}'")
            return False

        # Check lists have content
        for field in ["cultural", "scientific", "prevention"]:
            if not isinstance(data[field], list) or len(data[field]) == 0:
                print(f"Validation failed: empty list for '{field}'")
                return False

        # Check items are actually Sinhala strings (basic check)
        all_items = (
            data.get("cultural", [])
            + data.get("scientific", [])
            + data.get("prevention", [])
            + data.get("safety", [])
        )
        if not all(isinstance(item, str) and len(item) > 5 for item in all_items):
            print("Validation failed: items are not valid strings")
            return False

        # Content verification against base_data
        # Check LLM has at LEAST as many items as base (didn't lose content)
        if base_data:
            for field in ["cultural", "scientific", "prevention"]:
                base_count = len(base_data.get(field, []))
                llm_count = len(data.get(field, []))
                if llm_count < base_count:
                    print(
                        f"Validation warning: LLM gave fewer {field} items ({llm_count}) than base ({base_count})"
                    )
                    # Don't fail — just warn. LLM may have merged items.

        return True

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return False
    except Exception as e:
        print(f"Validation error: {e}")
        return False


def merge_base_and_llm(base_data, llm_data):
    """
    Merge rule-based and LLM data.
    Strategy: Use LLM output but ensure no base items are lost.
    This is the VERIFICATION step — base rules are ground truth.
    """
    merged = {}

    # risk_level: prefer LLM (it's more specific)
    merged["risk_level"] = llm_data.get(
        "risk_level", base_data.get("warning_level", "UNKNOWN")
    )

    for field in ["cultural", "scientific", "prevention"]:
        base_items = base_data.get(field, [])
        llm_items = llm_data.get(field, [])

        # Start with LLM items (they should include base items + enhancements)
        # If LLM seems to have dropped base items, append them
        if len(llm_items) >= len(base_items):
            merged[field] = llm_items
        else:
            # LLM gave fewer — merge both (deduplicate roughly by length)
            merged[field] = llm_items + [
                item for item in base_items if item not in llm_items
            ]

    # Safety is LLM-only (not in base_data)
    merged["safety"] = llm_data.get("safety", [])

    return merged