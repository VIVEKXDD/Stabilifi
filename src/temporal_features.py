import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
import os

def process_paysim_temporal_windows(df: pd.DataFrame, obs_end_step: int = 30, pred_end_step: int = 60) -> pd.DataFrame:
    """
    Phase 1-4: Splits PaySim transaction data into observation and prediction windows 
    to extract features and construct target labels without data leakage.
    """
    print("--- Processing PaySim (Liquidity Stress) ---")
    
    # 1. Split data into Observation (T_obs) and Prediction (T_pred) windows
    obs_data = df[df['step'] <= obs_end_step]
    pred_data = df[(df['step'] > obs_end_step) & (df['step'] <= pred_end_step)]
    
    # 2. Extract Features from Observation Window (T_obs)
    cash_in = obs_data[obs_data['type'].isin(['CASH_IN', 'TRANSFER_IN'])].groupby('nameOrig')['amount'].sum().reset_index()
    cash_in.rename(columns={'amount': 'total_cash_in_obs'}, inplace=True)
    
    cash_out = obs_data[obs_data['type'].isin(['CASH_OUT', 'PAYMENT', 'TRANSFER'])].groupby('nameOrig')['amount'].sum().reset_index()
    cash_out.rename(columns={'amount': 'total_cash_out_obs'}, inplace=True)
    
    first_bals = obs_data.groupby('nameOrig').first().reset_index()[['nameOrig', 'oldbalanceOrg']]
    last_bals = obs_data.groupby('nameOrig').last().reset_index()[['nameOrig', 'newbalanceOrig']]
    balance_changes = pd.merge(first_bals, last_bals, on='nameOrig')
    balance_changes['balance_depletion_obs'] = balance_changes['oldbalanceOrg'] - balance_changes['newbalanceOrig']
    
    features = pd.merge(cash_in, cash_out, on='nameOrig', how='outer').fillna(0)
    features = pd.merge(features, balance_changes[['nameOrig', 'balance_depletion_obs']], on='nameOrig', how='left')
    features['outgoing_to_incoming_ratio'] = np.where(features['total_cash_in_obs'] > 0, 
                                                      features['total_cash_out_obs'] / features['total_cash_in_obs'], 
                                                      features['total_cash_out_obs'])

    # 3. Construct Labels from Performance Window (T_pred)
    pred_cash_in = pred_data[pred_data['type'].isin(['CASH_IN', 'TRANSFER_IN'])].groupby('nameOrig')['amount'].sum().reset_index()
    pred_cash_out = pred_data[pred_data['type'].isin(['CASH_OUT', 'PAYMENT', 'TRANSFER'])].groupby('nameOrig')['amount'].sum().reset_index()
    pred_behavior = pd.merge(pred_cash_in, pred_cash_out, on='nameOrig', how='outer', suffixes=('_in', '_out')).fillna(0)
    
    low_bal_events = pred_data[pred_data['newbalanceOrig'] < 100].groupby('nameOrig').size().reset_index(name='low_bal_count_pred')
    pred_behavior = pd.merge(pred_behavior, low_bal_events, on='nameOrig', how='left').fillna(0)

    def assign_liquidity_stress(row):
        if (row['amount_out'] > 1.5 * row['amount_in']) or (row['low_bal_count_pred'] >= 3):
            return 2 # High Stress
        elif row['amount_out'] > 1.0 * row['amount_in']:
            return 1 # Moderate Stress
        return 0     # Healthy

    pred_behavior['liquidity_stress_label'] = pred_behavior.apply(assign_liquidity_stress, axis=1)

    # 4. Create Final Dataset
    final_dataset = pd.merge(features, pred_behavior[['nameOrig', 'liquidity_stress_label']], on='nameOrig', how='inner')
    print(f"Generated {len(final_dataset)} labeled PaySim records.\n")
    return final_dataset


def process_bankchurners_credit_stress(df: pd.DataFrame) -> pd.DataFrame:
    """
    Phase 1-4: Processes BankChurners dataset to extract credit stress features,
    encode categoricals, normalize financials, and construct stress labels.
    """
    print("--- Processing BankChurners (Credit Stress) ---")
    data = df.copy()
    
    # 1. Encode Categorical Features
    categorical_cols = ['Gender', 'Education_Level', 'Income_Category', 'Card_Category', 'Attrition_Flag']
    le = LabelEncoder()
    for col in categorical_cols:
        if col in data.columns:
            data[col + '_Encoded'] = le.fit_transform(data[col])
            
    # 2. Normalize Financial Columns
    financial_cols = ['Credit_Limit', 'Total_Revolving_Bal', 'Total_Trans_Amt', 'Avg_Utilization_Ratio']
    scaler = MinMaxScaler()
    for col in financial_cols:
        if col in data.columns:
            data[col + '_Normalized'] = scaler.fit_transform(data[[col]])

    # 3. Feature Engineering
    data['transaction_amount_intensity'] = np.where(
        data['Total_Trans_Ct'] > 0, 
        data['Total_Trans_Amt'] / data['Total_Trans_Ct'], 0
    )
    data['open_to_buy_ratio'] = np.where(
        data['Credit_Limit'] > 0,
        data['Avg_Open_To_Buy'] / data['Credit_Limit'], 0
    )

    # 4. Construct Labels
    def assign_credit_stress(row):
        if (row['Avg_Utilization_Ratio'] > 0.7) or \
           (row.get('Total_Revolving_Bal_Normalized', 0) > 0.8 and row['open_to_buy_ratio'] < 0.2):
            return 2 # High Stress
        elif row['Avg_Utilization_Ratio'] > 0.4:
            return 1 # Moderate Stress
        return 0     # Healthy

    data['credit_stress_label'] = data.apply(assign_credit_stress, axis=1)
    
    # Combine with Attrition proxy
    if 'Attrition_Flag_Encoded' in data.columns and 'Attrited Customer' in le.classes_:
        attrited_val = le.transform(['Attrited Customer'])[0]
        data.loc[data['Attrition_Flag_Encoded'] == attrited_val, 'credit_stress_label'] = 2

    print(f"Generated {len(data)} labeled BankChurners records.\n")
    
    feature_columns = [
        'CLIENTNUM', 'Customer_Age', 'Months_on_book', 'Total_Relationship_Count', 
        'Months_Inactive_12_mon', 'Contacts_Count_12_mon', 
        'transaction_amount_intensity', 'open_to_buy_ratio',
        'credit_stress_label'
    ] + [col + '_Encoded' for col in categorical_cols if col != 'Attrition_Flag'] \
      + [col + '_Normalized' for col in financial_cols]
      
    final_cols = [col for col in feature_columns if col in data.columns]
    return data[final_cols]


if __name__ == "__main__":
    # Ensure output directory exists
    # 1. Look UP one folder (../) to create the features directory in the correct root location
    os.makedirs('../data/features', exist_ok=True)
    
    try:
        # Load Raw Data (You already fixed these paths perfectly!)
        print("Loading raw datasets...")
        paysim_raw = pd.read_csv('../data/raw/paysim.csv')
        bankchurners_raw = pd.read_csv('../data/raw/BankChurners.csv')
        
        # Process Datasets
        paysim_features = process_paysim_temporal_windows(paysim_raw)
        credit_features = process_bankchurners_credit_stress(bankchurners_raw)
        
        # 2. Look UP one folder (../) to save the CSVs in the correct root location
        paysim_features.to_csv('../data/features/paysim_features_labeled.csv', index=False)
        credit_features.to_csv('../data/features/credit_features_labeled.csv', index=False)
        
        print("✅ Pipeline Step 1-3 Complete. Feature matrices saved to the root 'data/features/' folder.")
        
    except FileNotFoundError as e:
        print(f"⚠️ Error: {e}")