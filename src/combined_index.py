import joblib
import pandas as pd
import numpy as np
import os

class FinancialHealthEngine:
    def __init__(self):
        print("🧠 Booting up Nexus Financial Health Engine...")
        
        # Determine correct path relative to where API is launched
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_dir = os.path.join(base_dir, '../models')
        
        try:
            self.credit_model = joblib.load(f'{model_dir}/credit_stress_best_model.pkl')
            self.liquidity_model = joblib.load(f'{model_dir}/liquidity_stress_best_model.pkl')
            self.fraud_model = joblib.load(f'{model_dir}/fraud_vulnerability_best_model.pkl')
            print("✅ All 3 models loaded successfully.")
        except Exception as e:
            print(f"⚠️ Error loading models. Check your models folder. Details: {e}")

    def _convert_to_100_scale(self, model, features, is_binary=False):
        """Converts raw model probability predictions into a clean 0-100 risk score"""
        probs = model.predict_proba(features)[0]
        
        if is_binary:
            # Fraud Model: [Prob(Healthy), Prob(Fraud)]
            return float(probs[1] * 100) if len(probs) > 1 else 0.0
        else:
            # Stress Models: [Prob(Healthy), Prob(Early Stress), Prob(High Stress)]
            if len(probs) == 3:
                # 50% weight to early stress, 100% weight to high stress
                return float((probs[1] * 50) + (probs[2] * 100))
            elif len(probs) == 2:
                return float(probs[1] * 100)
            return 0.0

    def generate_financial_health_profile(self, liquidity_features, credit_features):
        """Calculates the final FHS based on your custom algorithm"""
        
        # 1. Get component risk scores (0-100 scale)
        # Note: Fraud uses the liquidity (PaySim) features for its prediction!
        liquidity_stress_score = self._convert_to_100_scale(self.liquidity_model, liquidity_features)
        credit_stress_score = self._convert_to_100_scale(self.credit_model, credit_features)
        fraud_risk_score = self._convert_to_100_scale(self.fraud_model, liquidity_features, is_binary=True)
        
        # 2. Apply your FHS Formula!
        # 100 - (0.4 * Liq + 0.35 * Cred + 0.25 * Fraud)
        fhs_raw = 100 - ((0.40 * liquidity_stress_score) + 
                         (0.35 * credit_stress_score) + 
                         (0.25 * fraud_risk_score))
                         
        # Ensure it stays strictly between 0 and 100
        final_fhs = round(max(0, min(100, fhs_raw)), 1)
        
        # 3. Determine Category based on your exact thresholds
        if final_fhs >= 80:
            category = "Excellent"
        elif final_fhs >= 60:
            category = "Stable"
        elif final_fhs >= 40:
            category = "Warning"
        else:
            category = "Critical"
            
        # 4. Determine text-based Fraud Vulnerability
        if fraud_risk_score > 60:
            fraud_status = "High"
        elif fraud_risk_score > 30:
            fraud_status = "Moderate"
        else:
            fraud_status = "Low"

        return {
            "financial_health_score": final_fhs,
            "category": category,
            "components": {
                "liquidity_stress": round(liquidity_stress_score, 1),
                "credit_stress": round(credit_stress_score, 1),
                "fraud_vulnerability": fraud_status,
                "fraud_raw_score": round(fraud_risk_score, 1)
            }
        }