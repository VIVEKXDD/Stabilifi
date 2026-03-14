import json

class SuggestionEngine:
    def __init__(self):
        print("🧠 Initializing Smart Financial Advisor...")

        # Base Advice for common risk drivers
        self.driver_advice_map = {
            'total_cash_out_obs': "Your cash outflows are high. Review discretionary spending for the next 30 days.",
            'balance_depletion_obs': "You frequently drain your account. Set up balance alerts to prevent overdrafts.",
            'outgoing_to_incoming_ratio': "You are spending more than you earn. Focus on stabilizing your cash flow.",
            'Avg_Utilization_Ratio_Normalized': "Your credit utilization is hurting your score. Aim to keep balances below 30% of your limit.",
            'Total_Revolving_Bal_Normalized': "Carrying revolving balances incurs high interest. Consider converting large purchases to automated EMIs.",
            'transaction_amount_intensity': "High transaction intensity detected. Review your recent large purchases.",
            'open_to_buy_ratio': "Your available credit is low. Avoid applying for new credit cards right now.",
            'Customer_Age': "Ensure your retirement and long-term savings strategies align with your current age bracket.",
            'Total_Relationship_Count': "Consider consolidating your financial accounts to get a clearer picture of your wealth."
        }

    def generate_prescription(self, health_profile: dict) -> str:
        """
        Takes the FHS profile and risk drivers, and outputs personalized financial advice.
        """
        category = health_profile.get('category', 'Stable')
        fraud_status = health_profile.get('fraud_status', 'Low')
        
        # In the API, we pass the risk drivers directly to the engine
        risk_drivers = health_profile.get('risk_drivers', [])
        
        # If legacy format is passed from older scripts, extract them safely
        if not risk_drivers:
            liq = health_profile.get('top_liquidity_factors', '')
            cred = health_profile.get('top_credit_factors', '')
            if liq: risk_drivers.append(liq)
            if cred: risk_drivers.append(cred)

        suggestions = []

        # 1. Provide advice based on specific behavior drivers (Explainable AI)
        for driver in risk_drivers:
            # Clean up the string in case it was formatted with spaces earlier
            clean_driver = driver.replace(' ', '_').lower() if isinstance(driver, str) else ''
            
            # Fuzzy match the driver against our advice map
            for key, advice in self.driver_advice_map.items():
                if key.lower() in clean_driver or (isinstance(driver, str) and key in driver):
                    if advice not in suggestions:
                        suggestions.append(advice)

        # 2. Add structural advice based on the overall FHS Category
        if category == "Critical":
            suggestions.insert(0, "🚨 URGENT: Implement strict budgeting immediately. Consider consulting a financial advisor for debt restructuring.")
            suggestions.append("Halt all non-essential discretionary spending until cash flow stabilizes.")
        elif category == "Warning":
            suggestions.insert(0, "⚠️ CAUTION: Your financial buffers are running low. Prioritize building a 3-month emergency fund.")
        elif category == "Excellent":
            suggestions.insert(0, "🌟 OUTSTANDING: Your financial habits are excellent. Consider exploring wealth-generation investments like index funds or real estate.")

        # 3. Inject Fraud Protection Advice if vulnerable
        if fraud_status == "High":
            suggestions.append("🛡️ FRAUD ALERT: Your transaction patterns show high vulnerability. Enable Two-Factor Authentication (2FA) immediately and freeze unused cards.")
        elif fraud_status == "Moderate":
            suggestions.append("🛡️ FRAUD WARNING: Review your recent transaction history for any unauthorized or unrecognized charges.")

        # 4. Fallback for healthy users with no specific driver matches
        if not suggestions:
            suggestions.append("Maintain your current financial habits and review your portfolio quarterly.")

        # Return just the suggestions list wrapped in JSON so the API can parse it easily
        output_payload = {
            "suggestions": suggestions[:4]  # Top 4 most critical pieces of advice
        }
        
        return json.dumps(output_payload)

if __name__ == "__main__":
    # Local Testing
    engine = SuggestionEngine()
    mock_profile = {
        "category": "Critical",
        "fraud_status": "High",
        "risk_drivers": ["outgoing_to_incoming_ratio", "Avg_Utilization_Ratio_Normalized"]
    }
    print(engine.generate_prescription(mock_profile))