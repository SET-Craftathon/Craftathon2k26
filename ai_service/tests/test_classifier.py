from ai_service.main import process
from pprint import pprint

TEST_CASES = [
    {
        "name": "Grooming / coercion",
        "input": "send me pics and don’t tell anyone",
    },
    {
        "name": "Threat",
        "input": "If you don’t do this I will leak everything",
    },
    {
        "name": "Sexual content",
        "input": "explicit adult content being shared privately",
    },
    {
        "name": "Safe message",
        "input": "Let's meet tomorrow for lunch",
    },
    {
        "name": "Hierarchical pressure",
        "input": "Your boss is asking you to keep this secret",
    },
    {
        "name": "Accident context",
        "input": "There was a serious accident on the highway",
    },
    {
        "name": "With URL",
        "input": "Check this https://bad.com and don’t tell anyone",
    },
    {
        "name": "Multiple URLs",
        "input": "visit https://a.com and https://b.com now",
    },
    {
        "name": "Empty after URL removal",
        "input": "https://onlyurl.com",
    },
    {
        "name": "Mixed strong signal",
        "input": "send pics now or I will expose you https://evil.com",
    },
]


def test_pretty_pipeline():
    print("\n" + "=" * 60)
    print("AI PIPELINE TEST RESULTS")
    print("=" * 60)

    for case in TEST_CASES:
        print(f"\n🧪 Test: {case['name']}")
        print(f"Input: {case['input']}")

        result = process(case["input"])

        print("Output:")
        pprint(result, indent=2)

        print("-" * 60)