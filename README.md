# 🚀 Stabilifi --- AI Powered Financial Stress Detection Platform

> Predict financial stress before it happens using Machine Learning,
> Behavioral Analytics & Agentic AI.

------------------------------------------------------------------------

## 🌟 Project Overview

**Stabilifi** is an end‑to‑end Financial Stress Detection System that
combines:

-   💳 Credit Behavior Modeling (BankChurners Dataset)
-   💸 Liquidity Stress Modeling (PaySim Dataset)
-   🧠 Machine Learning + Explainability
-   🤖 Agentic AI Prescriptive Action Plans
-   🌐 Full‑Stack Web Dashboard (Next.js + Firebase)
-   ⚡ FastAPI Backend for Real-Time Predictions

This project simulates a production-grade FinTech AI risk intelligence
platform.

------------------------------------------------------------------------

# 🏗️ System Architecture

Frontend (Next.js + Firebase)\
⬇\
FastAPI Backend (`/predict`)\
⬇\
ML Models (.pkl)\
⬇\
Feature Engineering + Stress Index\
⬇\
Agentic Suggestion Engine

------------------------------------------------------------------------

# 📂 Project Structure

    financial_stress_project/
        financial-stress-detection/
            .vscode/
                settings.json
            api/
                main.py
                __init__.py
                __pycache__/
                    main.cpython-314.pyc
                    __init__.cpython-314.pyc
            data/
                features/
                    credit_features_labeled.csv
                    paysim_features_labeled.csv
                raw/
                    BankChurners.csv
                    paysim.csv
            models/
                credit_stress_(bankchurners)_best_model.pkl
                liquidity_stress_(paysim)_best_model.pkl
            notebooks/
                01_eda_paysim.ipynb
                02_eda_bankchurners.ipynb
                03_temporal_windowing.ipynb
            src/
                agentic_suggestions.py
                combined_index.py
                explain.py
                temporal_features.py
                train_models.py
                __init__.py
                __pycache__/
                    agentic_suggestions.cpython-314.pyc
                    combined_index.cpython-314.pyc
                    explain.cpython-314.pyc
                    __init__.cpython-314.pyc
            Stabilifi/
                .env
                .gitignore
                apphosting.yaml
                components.json
                env.download
                modified.txt
                next-env.d.ts
                next.config.ts
                package-lock.json
                package.json
                postcss.config.mjs
                requirements.txt
                tailwind.config.ts
                tsconfig.json
                src/
                    middleware.ts
                    ai/
                        dev.ts
                        genkit.ts
                        flows/
                            generate-detailed-action-plan.ts
                    app/
                        favicon.ico
                        globals.css
                        layout.tsx
                        page.tsx
                        api/
                            auth/
                                login/
                                    route.ts
                                logout/
                                    route.ts
                                me/
                                    route.ts
                                signup/
                                    route.ts
                        dashboard/
                            actions.ts
                            page.tsx
                        login/
                            page.tsx
                        signup/
                            page.tsx
                    components/
                        StabilifiDashboard.tsx
                        dashboard/
                            action-plan.tsx
                            historical-chart.tsx
                            risk-gauge.tsx
                        navigation/
                            footer.tsx
                            navbar.tsx
                        ui/
                            accordion.tsx
                            alert-dialog.tsx
                            alert.tsx
                            avatar.tsx
                            badge.tsx
                            button.tsx
                            calendar.tsx
                            card.tsx
                            carousel.tsx
                            chart.tsx
                            checkbox.tsx
                            collapsible.tsx
                            dialog.tsx
                            dropdown-menu.tsx
                            form.tsx
                            input.tsx
                            label.tsx
                            menubar.tsx
                            popover.tsx
                            progress.tsx
                            radio-group.tsx
                            scroll-area.tsx
                            select.tsx
                            separator.tsx
                            sheet.tsx
                            sidebar.tsx
                            skeleton.tsx
                            slider.tsx
                            switch.tsx
                            table.tsx
                            tabs.tsx
                            textarea.tsx
                            toast.tsx
                            toaster.tsx
                            tooltip.tsx
                    hooks/
                        use-auth.ts
                        use-mobile.tsx
                        use-toast.ts
                    lib/
                        auth-provider.tsx
                        firebase-admin.ts
                        firebase.ts
                        history.ts
                        placeholder-images.json
                        placeholder-images.ts
                        utils.ts
                    __pycache__/
                        __init__.cpython-314.pyc

------------------------------------------------------------------------

# 🧠 Machine Learning Pipeline

## 1️⃣ Liquidity Stress Model

-   Dataset: PaySim (Mobile Money Transactions)
-   Features engineered from transaction behavior
-   Model stored in: `models/liquidity_stress_(paysim)_best_model.pkl`

## 2️⃣ Credit Stress Model

-   Dataset: BankChurners
-   Behavioral credit features
-   Model stored in:
    `models/credit_stress_(bankchurners)_best_model.pkl`

## 3️⃣ Combined Stress Index

Located in:

    src/combined_index.py

Produces:

Final Stress Score (0--100)\
Categories: - Healthy\
- Early Stress\
- High Stress

------------------------------------------------------------------------

# 🔍 Explainability Engine

Located in:

    src/explain.py

Provides: - Top liquidity factor - Top credit factor - Risk reasoning

------------------------------------------------------------------------

# 🤖 Agentic AI Suggestions

Located in:

    src/agentic_suggestions.py

Generates: - Personalized action plans - Liquidity stabilization
strategies - Credit utilization optimization guidance

------------------------------------------------------------------------

# 🌐 Frontend (Stabilifi Web App)

Built with: - Next.js - TailwindCSS - Firebase Authentication -
Firestore History Tracking - Interactive Risk Gauge - Historical Stress
Chart

Key Component:

    Stabilifi/src/components/StabilifiDashboard.tsx

------------------------------------------------------------------------

# ⚡ Backend API

## Endpoint:

POST `/predict`

## Example Request:

{ "total_cash_in_obs": 5000, "total_cash_out_obs": 6500,
"balance_depletion_obs": 1500, "outgoing_to_incoming_ratio": 1.3,
"Avg_Utilization_Ratio_Normalized": 0.75,
"Total_Revolving_Bal_Normalized": 0.8, "transaction_amount_intensity":
150, "open_to_buy_ratio": 0.15 }

## Example Response:

{ "category": "High Stress", "final_stress_score": 72,
"top_liquidity_factor": "High outgoing-to-incoming ratio",
"top_credit_factor": "High credit utilization", "suggestions": \["Reduce
discretionary spending", "Increase emergency savings"\] }

------------------------------------------------------------------------

# 🔥 How to Run

## Backend

cd financial-stress-detection/api\
pip install -r requirements.txt\
uvicorn main:app --reload

## Frontend

cd Stabilifi\
npm install\
npm run dev

------------------------------------------------------------------------

# 📊 Highlights

✅ Dual-model stress detection\
✅ Combined behavioral index\
✅ Explainable AI\
✅ Agentic financial suggestions\
✅ Firebase-integrated UI\
✅ Production-style architecture

------------------------------------------------------------------------

# 🚀 Future Enhancements

-   LSTM stress forecasting\
-   Real-time streaming transactions\
-   Concept drift detection\
-   SHAP feature visualization\
-   Multi-model ensemble voting

------------------------------------------------------------------------

# 🎉 Final Note

Stabilifi is not just a model.\
It is a complete driven Financial Stress Intelligence Platform.
