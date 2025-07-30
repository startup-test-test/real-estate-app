import requests
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

response = requests.post(url, json=data)
result = response.json()

print("Status code:", response.status_code)
print("\nResponse keys:", list(result.keys()))

if "annual_cash_flow" in result:
    print(f"\nannual_cash_flow has {len(result['annual_cash_flow'])} items")
    if result["annual_cash_flow"]:
        print("\nFirst year data:")
        print(json.dumps(result["annual_cash_flow"][0], indent=2))
        # Check if 売却時累計CF exists
        if "売却時累計CF" in result["annual_cash_flow"][0]:
            print("\n✅ 売却時累計CF found in response!")
        else:
            print("\n❌ 売却時累計CF not found in response")
else:
    print("\nNo annual_cash_flow in response")