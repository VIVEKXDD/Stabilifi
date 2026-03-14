import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
import numpy as np

# 1. SETUP
warnings.filterwarnings('ignore')
sns.set_theme(style="whitegrid", palette="muted")

class FinancialEDA:
    def __init__(self, output_dir="../reports/figures"):
        # We use absolute paths to ensure the script finds the folder regardless of where it's run
        self.output_dir = os.path.abspath(output_dir)
        os.makedirs(self.output_dir, exist_ok=True)
        print(f"📁 EDA reports will be saved to: {self.output_dir}")

    def load_data(self):
        try:
            print("Loading engineered datasets...")
            self.credit_df = pd.read_csv('../data/features/credit_features_labeled.csv')
            self.liquidity_df = pd.read_csv('../data/features/paysim_features_labeled.csv')
            print("✅ Data loaded successfully.\n")
        except FileNotFoundError as e:
            print(f"❌ Error: {e}. Ensure you ran temporal_features.py and preprocessing first.")
            exit()

    # 2. STATISTICAL FUNCTIONS
    def basic_statistics(self, df, name):
        print(f"--- {name} Data Overview ---")
        print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
        print(f"Duplicates: {df.duplicated().sum()}")
        print("\nMissing Values:")
        print(df.isnull().sum()[df.isnull().sum() > 0])
        print("\nStatistical Summary (Top Features):")
        print(df.describe().T.head(10))
        print("-" * 40 + "\n")

    # 3. VISUALIZATION FUNCTIONS
    def plot_class_distribution(self, df, target_col, name):
        """Analyzes if the dataset is imbalanced"""
        plt.figure(figsize=(8, 5))
        ax = sns.countplot(data=df, x=target_col, palette="viridis")
        plt.title(f"Target Distribution: {name}", fontsize=14, fontweight='bold')
        for p in ax.patches:
            ax.annotate(f'{p.get_height()}', (p.get_x() + p.get_width() / 2., p.get_height()),
                        ha='center', va='center', xytext=(0, 5), textcoords='offset points')
        plt.tight_layout()
        plt.savefig(f"{self.output_dir}/{name}_class_distribution.png", dpi=300)
        plt.close()

    def plot_univariate_distributions(self, df, features, name):
        """Shows the spread and skewness of individual features"""
        for feature in features:
            if feature in df.columns:
                plt.figure(figsize=(8, 5))
                sns.histplot(data=df, x=feature, kde=True, bins=30, color="steelblue")
                plt.title(f"Distribution: {feature} ({name})", fontsize=14, fontweight='bold')
                plt.tight_layout()
                plt.savefig(f"{self.output_dir}/{name}_dist_{feature}.png", dpi=300)
                plt.close()

    def plot_correlation_heatmap(self, df, name, drop_cols=None):
        """Checks for multicollinearity"""
        if drop_cols:
            df = df.drop(columns=drop_cols, errors='ignore')
        plt.figure(figsize=(12, 10))
        corr = df.select_dtypes(include=[np.number]).corr()
        mask = np.triu(np.ones_like(corr, dtype=bool))
        sns.heatmap(corr, mask=mask, annot=False, cmap="coolwarm", center=0, linewidths=.5)
        plt.title(f"Correlation Heatmap: {name}", fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f"{self.output_dir}/{name}_heatmap.png", dpi=300)
        plt.close()

    def plot_bivariate_boxplots(self, df, features, target_col, name):
        """Impact of behaviors on stress level with Visual Clipping for Presentations"""
        for feature in features:
            if feature in df.columns:
                plt.figure(figsize=(8, 5))
                
                # Create a temporary copy of the data just for plotting
                plot_data = df.copy()
                
                # Visually squash the top and bottom 5% of extreme outliers for raw financial columns
                if 'ratio' in feature or 'obs' in feature:
                    lower_limit = plot_data[feature].quantile(0.05)
                    upper_limit = plot_data[feature].quantile(0.95)
                    plot_data[feature] = plot_data[feature].clip(lower=lower_limit, upper=upper_limit)

                sns.boxplot(data=plot_data, x=target_col, y=feature, palette="Set2")
                plt.title(f"Impact of {feature} on {name} Stress", fontsize=14, fontweight='bold')
                plt.tight_layout()
                plt.savefig(f"{self.output_dir}/{name}_boxplot_{feature}.png", dpi=300)
                plt.close()

    def plot_fraud_drivers(self, df, name):
        """Specifically correlates features with the Fraud label"""
        if 'isFraud' in df.columns and df['isFraud'].nunique() > 1:
            plt.figure(figsize=(10, 6))
            fraud_corr = df.select_dtypes(include=[np.number]).corr(method='spearman')['isFraud']
            fraud_corr = fraud_corr.drop(['isFraud', 'isFlaggedFraud'], errors='ignore').sort_values(ascending=False)
            sns.barplot(x=fraud_corr.index, y=fraud_corr.values, palette="Reds_r")
            plt.xticks(rotation=45)
            plt.title(f"Key Drivers of Fraud Vulnerability ({name})", fontsize=14, fontweight='bold')
            plt.tight_layout()
            plt.savefig(f"{self.output_dir}/{name}_fraud_correlation.png", dpi=300)
            plt.close()
        else:
            print(f"⚠️ Skipping Fraud Correlation for {name}: No fraud variance found.")

    # 4. EXECUTION PIPELINE
    def run_full_eda(self):
        self.load_data()
        
        # --- A. STATISTICS ---
        self.basic_statistics(self.credit_df, "Credit")
        self.basic_statistics(self.liquidity_df, "Liquidity")

        # --- B. DYNAMIC TARGET FINDING ---
        def find_target(df):
            possible_names = ['credit_stress_label', 'liquidity_stress_label', 'isFraud', 'stress_label']
            for name in possible_names:
                if name in df.columns: return name
            return df.columns[-1]

        credit_target = find_target(self.credit_df)
        liquidity_target = find_target(self.liquidity_df)

        # --- C. DEFINE KEY FEATURES (Including the Log and Crossed features) ---
        credit_features = [
            'Avg_Utilization_Ratio_Normalized', 
            'stability_index', # Feature Cross
            'Total_Trans_Amt_log' # Log Scaled
        ]
        
        liquidity_features = [
            'outgoing_to_incoming_ratio', 
            'balance_depletion_obs', 
            'amount_log' # Log Scaled
        ]

        # --- D. GENERATE ALL PLOTS ---
        print("📊 Generating professional visualizations...")

        # 1. Distributions
        self.plot_class_distribution(self.credit_df, credit_target, "Credit")
        self.plot_class_distribution(self.liquidity_df, liquidity_target, "Liquidity")

        # 2. Heatmaps
        self.plot_correlation_heatmap(self.credit_df, "Credit", drop_cols=['CLIENTNUM', credit_target])
        self.plot_correlation_heatmap(self.liquidity_df, "Liquidity", drop_cols=['nameOrig', 'nameDest', liquidity_target])

        # 3. Boxplots (Bivariate)
        self.plot_bivariate_boxplots(self.credit_df, credit_features, credit_target, "Credit")
        self.plot_bivariate_boxplots(self.liquidity_df, liquidity_features, liquidity_target, "Liquidity")

        # 4. Histograms (Univariate)
        self.plot_univariate_distributions(self.credit_df, credit_features, "Credit")
        self.plot_univariate_distributions(self.liquidity_df, liquidity_features, "Liquidity")

        # 5. Fraud Drivers (The missing link!)
        self.plot_fraud_drivers(self.liquidity_df, "Liquidity")

        print(f"\n✅ SUCCESS: All charts saved to {self.output_dir}")

if __name__ == "__main__":
    eda = FinancialEDA()
    eda.run_full_eda()