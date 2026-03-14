import shap
import joblib
import pandas as pd
import numpy as np

class StressExplainer:
    def __init__(self, model_path):
        print(f"Loading model from {model_path} for Explainability...")
        self.model = joblib.load(model_path)
        self.explainer = None
        self.model_type = str(type(self.model)).lower()
        
        try:
            # If the winning model was a Tree (XGBoost/Random Forest)
            if 'forest' in self.model_type or 'xgb' in self.model_type:
                self.explainer = shap.TreeExplainer(self.model)
                self.is_tree = True
            # If the winning model was Linear (Logistic Regression)
            else:
                self.is_tree = False
                print("Linear model detected. Using coefficient extraction instead of SHAP.")
        except Exception as e:
            print(f"Error initializing explainer: {e}")

    def get_top_contributing_factors(self, features: pd.DataFrame, top_n=1):
        try:
            if not self.is_tree:
                # Extract Risk Drivers from Logistic Regression coefficients
                coefs = self.model.coef_[0]
                feature_importance = pd.Series(np.abs(coefs), index=features.columns)
                top_factors = feature_importance.nlargest(top_n).index.tolist()
                return top_factors[0] if top_n == 1 else ", ".join(top_factors)
            
            elif self.explainer:
                # Extract Risk Drivers from Tree models using SHAP
                shap_values = self.explainer.shap_values(features)
                vals = shap_values[0] if isinstance(shap_values, list) else shap_values
                feature_importance = pd.DataFrame(list(zip(features.columns, np.abs(vals[0]))),
                                                  columns=['col_name', 'feature_importance_vals'])
                feature_importance.sort_values(by=['feature_importance_vals'], ascending=False, inplace=True)
                top_factors = feature_importance.head(top_n)['col_name'].tolist()
                return top_factors[0] if top_n == 1 else ", ".join(top_factors)
                
        except Exception as e:
            print(f"Explainability fallback triggered: {e}")
            return features.columns[0] # Ultimate safety fallback