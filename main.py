from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
import pandas as pd
import json

from fastapi.middleware.cors import CORSMiddleware



# Importing the core Stabilifi ML components
from src.combined_index import StressIndexGenerator
from src.explain import StressExplainer
from src.agentic_suggestions import SuggestionEngine

app = FastAPI(
    title="Stabilifi: Financial Stress Detection API",
    description="Predictive & Prescriptive Financial Stress Detection System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:9002",
        "http://127.0.0.1:9002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Starting Stabilifi API Server...")
try:
    index_generator = StressIndexGenerator()
    liquidity_explainer = StressExplainer('models/liquidity_stress_(paysim)_best_model.pkl')
    credit_explainer = StressExplainer('models/credit_stress_(bankchurners)_best_model.pkl')
    suggestion_engine = SuggestionEngine()
    print("All ML modules loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: ML components failed to load. Error: {e}")

# 1. Update the Schema: What the Next.js Frontend WILL Send
class StressRequest(BaseModel):
    # Core User Spending Habits
    total_cash_in_obs: float
    total_cash_out_obs: float
    balance_depletion_obs: float
    # Core Credit Behaviors
    Total_Revolving_Bal_Normalized: float
    Avg_Utilization_Ratio_Normalized: float
    transaction_amount_intensity: float


@app.get("/")
def read_root():
    return {"status": "Online", "message": "Welcome to the Stabilifi API. Send POST requests to /predict."}

@app.post("/predict")
def predict_stress(request: StressRequest):
    try:
        # Calculate calculated metrics securely on the backend
        safe_incoming = request.total_cash_in_obs if request.total_cash_in_obs > 0 else 1
        calc_out_in_ratio = request.total_cash_out_obs / safe_incoming

        # 2. Map Liquidity features using front-end inputs + backend logic
        liquidity_features = pd.DataFrame([{
            'total_cash_in_obs': request.total_cash_in_obs,
            'total_cash_out_obs': request.total_cash_out_obs,
            'balance_depletion_obs': request.balance_depletion_obs,
            'outgoing_to_incoming_ratio': calc_out_in_ratio
        }])

        # 3. Map Credit inputs: Combines 3 live inputs with 12 well-researched baselines
        credit_features = pd.DataFrame([{
            'Customer_Age': 46,                  # Global avg age of retail banking customer
            'Months_on_book': 36,                # Average length of relationship
            'Total_Relationship_Count': 4,       # Typical number of products (checking, savings, credit)
            'Months_Inactive_12_mon': 2,         # Typical inactivity periods
            'Contacts_Count_12_mon': 2,          # Normal customer support interactions
            'transaction_amount_intensity': request.transaction_amount_intensity, 
            'open_to_buy_ratio': 1 - request.Avg_Utilization_Ratio_Normalized, # Directly inverse of utilization
            'Gender_Encoded': 0,                 # Model baseline
            'Education_Level_Encoded': 3,        # Median category (e.g., Graduate)
            'Income_Category_Encoded': 2,        # Median income band
            'Card_Category_Encoded': 0,          # Standard tier card (Blue/Basic)
            'Credit_Limit_Normalized': 0.4,      # 40% of max limit
            'Total_Revolving_Bal_Normalized': request.Total_Revolving_Bal_Normalized,
            'Total_Trans_Amt_Normalized': 0.5,   # Median transaction volume
            'Avg_Utilization_Ratio_Normalized': request.Avg_Utilization_Ratio_Normalized
        }])
        
        # 4. Enforce exact column order for XGBoost (DO NOT CHANGE ORDER)
        expected_order = [
            'Customer_Age', 'Months_on_book', 'Total_Relationship_Count', 
            'Months_Inactive_12_mon', 'Contacts_Count_12_mon', 'transaction_amount_intensity', 
            'open_to_buy_ratio', 'Gender_Encoded', 'Education_Level_Encoded', 
            'Income_Category_Encoded', 'Card_Category_Encoded', 'Credit_Limit_Normalized', 
            'Total_Revolving_Bal_Normalized', 'Total_Trans_Amt_Normalized', 'Avg_Utilization_Ratio_Normalized'
        ]
        credit_features = credit_features[expected_order]

        # 5. Run the pipeline
        stress_profile = index_generator.generate_combined_index(liquidity_features, credit_features)
        top_liq_factors = liquidity_explainer.get_top_contributing_factors(liquidity_features, top_n=1)
        top_cred_factors = credit_explainer.get_top_contributing_factors(credit_features, top_n=1)

        stress_profile['top_liquidity_factors'] = top_liq_factors
        stress_profile['top_credit_factors'] = top_cred_factors

        final_response_str = suggestion_engine.generate_prescription(stress_profile)
        return json.loads(final_response_str)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)