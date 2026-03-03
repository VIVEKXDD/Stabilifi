import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, recall_score
from sklearn.preprocessing import LabelEncoder  # <-- ADD THIS IMPORT
import joblib
import os
import warnings

warnings.filterwarnings('ignore')

def train_and_evaluate(X, y, dataset_name):
    print(f"\n{'='*40}")
    print(f"🚀 Training Models for: {dataset_name}")
    print(f"{'='*40}")
    
    # <-- ADD THESE TWO LINES TO FIX XGBOOST -->
    # This forces labels to be strictly 0, 1 (or 0, 1, 2) dynamically
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Use y_encoded instead of y
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    models = {
        "Logistic Regression (Baseline)": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42),
        "XGBoost": xgb.XGBClassifier(eval_metric='mlogloss', random_state=42)
    }
    
    best_model = None
    best_macro_recall = 0
    best_model_name = ""
    
    for name, model in models.items():
        print(f"\n--- {name} ---")
        
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        
        report = classification_report(y_test, predictions)
        print(report)
        
        current_recall = recall_score(y_test, predictions, average='macro')
        
        if current_recall > best_macro_recall:
            best_macro_recall = current_recall
            best_model = model
            best_model_name = name

    print(f"\n🏆 Best Model for {dataset_name}: {best_model_name} (Macro Recall: {best_macro_recall:.4f})")
    
    os.makedirs('../models', exist_ok=True)
    model_path = f'../models/{dataset_name.lower().replace(" ", "_")}_best_model.pkl'
    joblib.dump(best_model, model_path)
    print(f"💾 Saved best model to: {model_path}")
    
    return best_model

# ... (keep your run_training_pipeline function exactly the same) ...


def run_training_pipeline():
    try:
        # 1. Load the processed feature matrices
        print("Loading labeled feature matrices...")
        paysim_df = pd.read_csv('../data/features/paysim_features_labeled.csv')
        credit_df = pd.read_csv('../data/features/credit_features_labeled.csv')
        
        # 2. Prepare PaySim (Liquidity) Data
        # Drop the identifier column 'nameOrig' before training
        X_liquidity = paysim_df.drop(columns=['nameOrig', 'liquidity_stress_label'])
        y_liquidity = paysim_df['liquidity_stress_label']
        
        # 3. Prepare BankChurners (Credit) Data
        # Drop the identifier column 'CLIENTNUM' before training
        X_credit = credit_df.drop(columns=['CLIENTNUM', 'credit_stress_label'])
        y_credit = credit_df['credit_stress_label']
        
        # 4. Train and Evaluate
        train_and_evaluate(X_liquidity, y_liquidity, "Liquidity Stress (PaySim)")
        train_and_evaluate(X_credit, y_credit, "Credit Stress (BankChurners)")
        
        print("\n✅ Phase 4 & 5 Complete. Ready for Combined Stress Index Generation.")
        
    except FileNotFoundError as e:
        print(f"\n⚠️ Error: {e}")
        print("Please run 'src/temporal_features.py' first to generate the feature matrices.")


if __name__ == "__main__":
    run_training_pipeline()