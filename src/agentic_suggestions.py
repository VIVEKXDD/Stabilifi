import json

class SuggestionEngine:
    def __init__(self):
        """
        Initializes the Prescriptive Layer, mapping specific SHAP feature flags
        to actionable financial advice.
        """
        print("Initializing Suggestion Engine...")
        
        # Step 7 Logic: Liquidity Stress Drivers
        self.liquidity_advice_map = {
            'total_cash_out_obs': "Avoid large withdrawals and reduce discretionary spending for the next 30 days.",
            'balance_depletion_obs': "Set balance threshold alerts to monitor rapid account depletion.",
            'outgoing_to_incoming_ratio': "Focus on stabilizing your cash flow by delaying non-essential expenses.",
            'low_bal_count_pred': "Maintain a safety buffer to avoid frequent low-balance events."
        }
        
        # Step 7 Logic: Credit Stress Drivers
        self.credit_advice_map = {
            'Avg_Utilization_Ratio_Normalized': "Reduce credit utilization below 30%.",
            'Total_Revolving_Bal_Normalized': "Convert high revolving credit balances to automated EMIs.",
            'transaction_amount_intensity': "Avoid discretionary spending on credit cards.",
            'open_to_buy_ratio': "Avoid new credit applications to preserve your open-to-buy ratio."
        }

    def generate_prescription(self, stress_profile: dict) -> str:
        """
        Takes the combined stress profile and outputs the final personalized JSON payload.
        """
        score = stress_profile.get('final_stress_score', 0)
        category = stress_profile.get('category', 'Healthy')
        liq_factors = stress_profile.get('top_liquidity_factors', [])
        cred_factors = stress_profile.get('top_credit_factors', [])
        
        suggestions = set()
        
        # 1. Evaluate Liquidity Factors
        for factor in liq_factors:
            if factor in self.liquidity_advice_map:
                suggestions.add(self.liquidity_advice_map[factor])
                
        # 2. Evaluate Credit Factors
        for factor in cred_factors:
            if factor in self.credit_advice_map:
                suggestions.add(self.credit_advice_map[factor])
                
        # 3. Handle Severe Cases (Both High)
        if category == "High Stress" and liq_factors and cred_factors:
            suggestions.add("Activate emergency savings recommendations immediately.")
            suggestions.add("Consider financial counseling or debt restructuring strategies.")
            
        # Fallback for healthy users
        if not suggestions:
            suggestions.add("Maintain current healthy financial habits and continue building an emergency fund.")
            
        # 4. Format strictly to the required JSON output
        output_payload = {
            "final_stress_score": score,
            "category": category,
            "top_liquidity_factor": liq_factors[0] if liq_factors else "None",
            "top_credit_factor": cred_factors[0] if cred_factors else "None",
            "suggestions": list(suggestions)[:3]  # Prioritize the top 3 actionable items
        }
        
        return json.dumps(output_payload, indent=2)

if __name__ == "__main__":
    # Local Testing Example
    engine = SuggestionEngine()
    
    # Simulating the exact data structure passed from combined_index.py and explain.py
    mock_profile = {
        "final_stress_score": 74,
        "category": "High Stress",
        "top_liquidity_factors": ["total_cash_out_obs", "balance_depletion_obs"],
        "top_credit_factors": ["Avg_Utilization_Ratio_Normalized"]
    }
    
    final_json = engine.generate_prescription(mock_profile)
    print("\n--- Final System Output ---")
    print(final_json)