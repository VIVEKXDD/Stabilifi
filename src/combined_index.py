import joblib
import pandas as pd
import numpy as np

class StressIndexGenerator:
    def __init__(self, liquidity_model_path='models/liquidity_stress_(paysim)_best_model.pkl', 
                 credit_model_path='models/credit_stress_(bankchurners)_best_model.pkl'):
        """
        Loads the trained machine learning models for inference.
        """
        print("Loading trained models for scoring...")
        try:
            self.liquidity_model = joblib.load(liquidity_model_path)
            self.credit_model = joblib.load(credit_model_path)
        except FileNotFoundError as e:
            print(f"Error loading models: {e}. Please ensure train_models.py has been run.")

    def calculate_individual_score(self, model, features: pd.DataFrame) -> float:
        """
        Calculates the stress score (0-100) based on the probability of High Stress (Class 2).
        If the model outputs probability for High Stress, we scale it by 100.
        """
        # predict_proba returns an array of probabilities for classes [0, 1, 2]
        probabilities = model.predict_proba(features)[0]
        
        # We extract the probability of Class 2 (High Stress)
        # If the model only has 2 classes for some reason, we take the last one.
        high_stress_prob = probabilities[2] if len(probabilities) > 2 else probabilities[-1]
        
        # Convert to a 0-100 score
        return float(high_stress_prob * 100)

    def generate_combined_index(self, user_liquidity_features: pd.DataFrame, user_credit_features: pd.DataFrame) -> dict:
        """
        Generates the final stress index and categorizes the user.
        """
        # 1. Get individual scores
        liquidity_score = self.calculate_individual_score(self.liquidity_model, user_liquidity_features)
        credit_score = self.calculate_individual_score(self.credit_model, user_credit_features)
        
        # 2. Apply weighted formula
        final_index = (0.6 * liquidity_score) + (0.4 * credit_score)
        
        # 3. Categorize Risk Level
        if final_index <= 30:
            category = "Healthy"
        elif final_index <= 60:
            category = "Early Stress"
        else:
            category = "High Stress"
            
        return {
            "liquidity_stress_score": round(liquidity_score, 2),
            "credit_stress_score": round(credit_score, 2),
            "final_stress_score": round(final_index, 2),
            "category": category
        }

if __name__ == "__main__":
    # Example Usage for a single user
    generator = StressIndexGenerator()
    
    # Simulating a user's feature vector (these would normally come from your API/Database)
    # Note: Column names must match exactly what the models were trained on.
    dummy_liquidity = pd.DataFrame([{
        'total_cash_in_obs': 5000, 'total_cash_out_obs': 6000, 
        'balance_depletion_obs': 1000, 'outgoing_to_incoming_ratio': 1.2
    }])
    
    # Adding missing dummy columns required by the model (this will depend on your exact feature matrix)
    # This is purely for local testing of the script.
    print("\nTest Run Initialized. (Note: Dummy data requires exact feature matching to execute fully).")
    
    # In production, you would call:
    # result = generator.generate_combined_index(real_liquidity_data, real_credit_data)
    # print(result)