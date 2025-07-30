import urllib.request
import json

url = "https://real-estate-app-rwf1.onrender.com/api/simulate"
data = {
    "purchase_price": 9800,
    "land_price": 4000,
    "self_funding": 980,
    "loan_amount": 8820,
    "interest_rate": 2.0,
    "loan_years": 35,
    "monthly_rent": 45,
    "units": 6,
    "management_fee_rate": 5.0,
    "vacancy_rate": 10.0,
    "repair_reserve_rate": 3.0,
    "property_tax": 50,
    "insurance_cost": 10,
    "other_expenses": 20,
    "depreciation_years": 22,
    "expected_sale_price_rate": 80,
    "exit_cap_rate": 7.0,
    "year_built": 2020,
    "structure": "木造"
}

# APIリクエスト送信
req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        
        print("API Response received successfully!")
        print("\n=== Response keys ===")
        for key in result.keys():
            print(f"- {key}")
        
        # Save response to file for inspection
        with open('api_response_debug.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print("\nResponse saved to api_response_debug.json")
except Exception as e:
    print(f"API Error: {e}")