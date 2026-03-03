import shap
import numpy as np
import pandas as pd
import joblib

class StressExplainer:
    def __init__(self, model_path: str):
        """
        Initializes the explainer with a trained Tree-based model (Random Forest or XGBoost).
        """
        print(f"Loading model from {model_path} for SHAP explainability...")
        try:
            self.model = joblib.load(model_path)
            # TreeExplainer is optimized for XGBoost, LightGBM, and Random Forest
            self.explainer = shap.TreeExplainer(self.model)
        except FileNotFoundError as e:
            print(f"Error loading model: {e}")
        except Exception as e:
            print(f"Error initializing SHAP explainer: {e}")

    def get_top_contributing_factors(self, user_features: pd.DataFrame, top_n: int = 3) -> list:
        """
        Calculates SHAP values for a specific user and returns the top features 
        driving the 'High Stress' prediction.
        """
        shap_values = self.explainer.shap_values(user_features)
        
        # Extract the 1D array of SHAP values specifically for the "High Stress" class
        if isinstance(shap_values, list):
            # Random Forest outputs a list of arrays
            target_class_index = 2 if len(shap_values) > 2 else -1
            user_shap_values = shap_values[target_class_index][0] 
        else:
            # XGBoost outputs a single multi-dimensional numpy array
            if len(shap_values.shape) == 3:
                # Multi-class shape: (n_samples, n_features, n_classes)
                target_class_index = 2 if shap_values.shape[2] > 2 else -1
                user_shap_values = shap_values[0, :, target_class_index]
            else:
                # Standard binary shape: (n_samples, n_features)
                user_shap_values = shap_values[0]

        # Map the extracted numbers to their feature names
        feature_names = user_features.columns.tolist()
        feature_contributions = list(zip(feature_names, user_shap_values))
        
        # Sort features by their SHAP value (magnitude of impact) in descending order
        feature_contributions.sort(key=lambda x: float(x[1]), reverse=True)
        
        # Extract the top N feature names that positively pushed the score toward High Stress
        top_factors = [feature for feature, impact in feature_contributions if float(impact) > 0][:top_n]
        
        if not top_factors:
            top_factors = ["General behavioral patterns"]
            
        return top_factors

if __name__ == "__main__":
    # Local Testing Example
    # Ensure you have a trained model saved in the models directory
    model_file = 'models/liquidity_stress_(paysim)_best_model.pkl'
    
    # Dummy feature vector matching the model's expected input
    dummy_input = pd.DataFrame([{
        'total_cash_in_obs': 2000, 
        'total_cash_out_obs': 5500, 
        'balance_depletion_obs': 3500, 
        'outgoing_to_incoming_ratio': 2.75
    }])
    
    try:
        explainer = StressExplainer(model_path=model_file)
        top_factors = explainer.get_top_contributing_factors(dummy_input, top_n=3)
        
        print("\n--- SHAP Explainability Output ---")
        print(f"Top factors driving the stress score: {top_factors}")
        
    except Exception as e:
        import traceback
        print(f"\n❌ TEST FAILED. Here is the exact Python error:")
        print("-" * 40)
        traceback.print_exc()
        print("-" * 40)