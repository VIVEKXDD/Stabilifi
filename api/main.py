from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
import pandas as pd
import json
from fastapi.middleware.cors import CORSMiddleware

# Importing your newly updated modules
from src.combined_index import FinancialHealthEngine
from src.explain import StressExplainer
from src.agentic_suggestions import SuggestionEngine

app = FastAPI(title="Nexus API: Financial Health Score")

# CORS middleware to allow your Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    health_engine = FinancialHealthEngine()
    liquidity_explainer = StressExplainer('models/liquidity_stress_best_model.pkl')
    credit_explainer = StressExplainer('models/credit_stress_best_model.pkl')
    suggestion_engine = SuggestionEngine()
except Exception as e:
    print(f"⚠️ Warning: ML components failed to load. Error: {e}")

class StressRequest(BaseModel):
    total_cash_in_obs: float
    total_cash_out_obs: float
    balance_depletion_obs: float
    Total_Revolving_Bal_Normalized: float
    Avg_Utilization_Ratio_Normalized: float
    transaction_amount_intensity: float

@app.get("/")
def read_root():
    return {"status": "Online", "message": "Nexus Financial Health API is running! Send POST requests to /predict."}

@app.post("/predict")
def predict_health(request: StressRequest):
    try:
        # Calculate calculated metrics securely on the backend
        safe_incoming = request.total_cash_in_obs if request.total_cash_in_obs > 0 else 1
        calc_out_in_ratio = request.total_cash_out_obs / safe_incoming

        # Build Liquidity/Fraud Features
        liquidity_features = pd.DataFrame([{
            'total_cash_in_obs': request.total_cash_in_obs,
            'total_cash_out_obs': request.total_cash_out_obs,
            'balance_depletion_obs': request.balance_depletion_obs,
            'outgoing_to_incoming_ratio': calc_out_in_ratio
        }])

        # Build Credit Features
        credit_features = pd.DataFrame([{
            'Customer_Age': 46,                  
            'Months_on_book': 36,                
            'Total_Relationship_Count': 4,       
            'Months_Inactive_12_mon': 2,         
            'Contacts_Count_12_mon': 2,          
            'transaction_amount_intensity': request.transaction_amount_intensity, 
            'open_to_buy_ratio': 1 - request.Avg_Utilization_Ratio_Normalized, 
            'Gender_Encoded': 0,                 
            'Education_Level_Encoded': 3,        
            'Income_Category_Encoded': 2,        
            'Card_Category_Encoded': 0,          
            'Credit_Limit_Normalized': 0.4,      
            'Total_Revolving_Bal_Normalized': request.Total_Revolving_Bal_Normalized,
            'Total_Trans_Amt_Normalized': 0.5,   
            'Avg_Utilization_Ratio_Normalized': request.Avg_Utilization_Ratio_Normalized
        }])
        
        # Enforce exact column order for XGBoost models
        credit_features = credit_features[[
            'Customer_Age', 'Months_on_book', 'Total_Relationship_Count', 
            'Months_Inactive_12_mon', 'Contacts_Count_12_mon', 'transaction_amount_intensity', 
            'open_to_buy_ratio', 'Gender_Encoded', 'Education_Level_Encoded', 
            'Income_Category_Encoded', 'Card_Category_Encoded', 'Credit_Limit_Normalized', 
            'Total_Revolving_Bal_Normalized', 'Total_Trans_Amt_Normalized', 'Avg_Utilization_Ratio_Normalized'
        ]]

        # 1. Generate the FHS Score!
        health_profile = health_engine.generate_financial_health_profile(liquidity_features, credit_features)

        # 2. Get AI Risk Drivers (Explainability)
        top_liq_factors = liquidity_explainer.get_top_contributing_factors(liquidity_features, top_n=1)
        top_cred_factors = credit_explainer.get_top_contributing_factors(credit_features, top_n=1)

        # 3. Generate Agentic Suggestions
        # Pass the rich health profile directly to the new Smart Advisor
        advisor_payload = {
            'category': health_profile['category'],
            'fraud_status': health_profile['components']['fraud_vulnerability'],
            'risk_drivers': [top_liq_factors, top_cred_factors]
        }
        suggestions_json = suggestion_engine.generate_prescription(advisor_payload)
        suggestions_list = json.loads(suggestions_json).get("suggestions", [])

        # 4. Assemble Final Response payload for the Dashboard
        final_response = {
            "financial_health_score": health_profile['financial_health_score'],
            "category": health_profile['category'],
            "components": health_profile['components'],
            "risk_drivers": [
                top_liq_factors.replace('_', ' ').title(),
                top_cred_factors.replace('_', ' ').title()
            ],
            "recommendations": suggestions_list
        }
        
        return final_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)