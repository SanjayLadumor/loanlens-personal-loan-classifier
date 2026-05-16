# LoanLens - Personal Loan Classifier
# Personal-Loan-Classifier

End-to-end ML project to predict personal loan acceptance for a retail bank (Thera Bank). Includes business-driven EDA, feature engineering, imbalance handling with SMOTENC, GridSearchCV tuning, model comparison, SHAP-based explainability, interactive analytics dashboards, bulk CSV prediction support, and Flask-based deployment. Optimized for high recall to minimize missed revenue opportunities.

---

# Personal Loan Acceptance Prediction 🧠

## Project Overview

| Feature | Description |
| --- | --- |
| Domain | Banking / Predictive Analytics |
| Business Problem | Convert liability customers into personal loan customers |
| Goal | Predict which customers are likely to accept a personal loan |
| Algorithms Used | Logistic Regression, Random Forest Classifier |
| Dataset Size | 5,000 customer records |
| Target Variable | Personal Loan (1 – Accepted, 0 – Not Accepted) |
| Deployment | Interactive Flask-based web application |
| Hosting Platform | Render |
| Explainability | SHAP (SHapley Additive exPlanations) |
| Additional Features | Real-time prediction, CSV batch prediction, analytics dashboard, dynamic feature simulation |

---

# 📊 Dataset Information

| Feature | Description |
| --- | --- |
| Source | Thera Bank Personal Loan Dataset |
| Customer Type | Existing depositors |
| Data Nature | Demographic, Financial & Behavioral |
| Class Distribution | ~10% positive class (highly imbalanced) |

---

# 🧾 Feature Description

| Category | Features |
| --- | --- |
| Demographics | Age, Experience, Family, Education |
| Financial | Income, Mortgage |
| Banking Behavior | CCAvg, CD Account, Online, Credit Card |
| Engineered Features | Age Group, CCToIncomeRatio, Mortgage Category |

---

# 🔍 Exploratory Data Analysis (EDA)

## Key Insights

| Observation | Business Insight |
| --- | --- |
| Income < $50k → No loan acceptance | Low-income customers should not be targeted |
| CD Account holders → ~6.5× acceptance | Highest priority campaign group |
| High income + high mortgage | Higher likelihood of loan acceptance |
| Graduates & professionals dominate loan takers | Education impacts loan decisions |
| Only ~10% acceptance rate | Severe class imbalance problem |

---

# 🎯 Business Recommendations

| Focus Area | Action |
| --- | --- |
| Income | Target customers with income > $50,000 |
| Age Group | Focus on customers aged 30–60 |
| Banking Products | Prioritize CD Account holders |
| Mortgage | Target high-mortgage customers |
| Education | Prefer graduates & professionals |

---

# 🛠 Feature Engineering

| Feature | Purpose |
| --- | --- |
| CCToIncomeRatio | Captures spending behavior |
| Age Group | 20-30,30-40,etc... |
| Mortgage Category | None,Low,Normal,High |

---

# 🤖 Model Development

| Model | Preprocessing | Imbalance Handling | Pipeline |
| --- | --- | --- | --- |
| Logistic Regression | ColumnTransformer (scaling + encoding) | SMOTENC | Yes |
| Random Forest Classifier | Not required | SMOTENC | Yes |

---

# ⚖️ Model Evaluation Strategy

| Metric | Reason |
| --- | --- |
| Recall (Primary) | False negatives = missed revenue |
| Confusion Matrix | Error analysis |
| ROC-AUC Curve | Threshold-independent evaluation |
| Classification Report | Overall model performance |

---

# 🏆 Model Comparison & Selection

| Model | Performance Summary |
| --- | --- |
| Logistic Regression | Baseline model |
| Random Forest Classifier | Higher recall & ROC-AUC |
| Final Choice | Random Forest Classifier |

---

# 🌟 Web Application Features

The project includes a fully interactive multi-page web application integrated with the trained ML model.

---
# 🎨 Frontend & User Experience

The project includes a modern multi-page interactive web interface designed for real-time machine learning interaction and analytics visualization.

## Frontend Features

| Feature | Description |
| --- | --- |
| Multi-Page Dashboard | Separate pages for Prediction, Analysis, and Feature Effects |
| Interactive Inputs | Dynamic sliders, checkboxes, and user-controlled feature inputs |
| Real-Time Prediction UI | Instant probability and decision updates |
| SHAP Visualizations | Dynamic feature contribution bars |
| CSV Upload System | Upload custom datasets directly from frontend |
| CSV Download System | Export prediction and filtered datasets |
| Smart Analytics Dashboard | Live metrics and dataset statistics |
| Responsive UI | Optimized layout for desktop viewing |
| Interactive Tables | Dynamic tabular display for filtered datasets |
| Feature Simulation | Real-time probability updates on changing feature values |
| Visual Feedback System | Probability gauges and feature impact visualization |

---

## Frontend Technologies

| Category | Tools |
| --- | --- |
| Structure | HTML |
| Styling | CSS & Tailwind |
| Interactivity | JavaScript |
| Backend Communication | Flask APIs |
| Data Visualization | Custom charts and dynamic UI components |

---


# 🧠 Page 1 — Predictor Dashboard

## Functionalities

| Feature | Description |
| --- | --- |
| Real-time Prediction | User inputs customer details and receives instant prediction |
| Probability Visualization | Semi-circle probability gauge displays loan acceptance confidence |
| Decision Output | Displays Accepted / Rejected prediction |
| SHAP Explainability | Dynamic SHAP bars explain feature contribution |
| Batch CSV Prediction | Predicts loan acceptance for entire uploaded dataset |
| Download Predictions | Export predicted CSV containing Personal Loan column |

---

## Prediction Workflow

1. User enters customer feature values  
2. Frontend sends data to Flask backend  
3. Backend preprocesses data using trained pipeline  
4. Model predicts:
   - Loan Decision
   - Prediction Probability
5. SHAP values are generated dynamically  
6. Results are displayed visually in frontend  

---

# 📊 Page 2 — Smart Dataset Analysis

## Functionalities

| Feature | Description |
| --- | --- |
| Dataset Upload | Upload custom customer dataset |
| Default Dataset Support | Uses training dataset if no upload is provided |
| Dynamic Filtering | Filter rows using selected customer features |
| Flexible Inputs | Filters are optional and combinable |
| Live Statistics | Real-time metrics update based on filtered rows |
| Export CSV | Download filtered dataset |

---

## Analytics Dashboard

| Metric | Description |
| --- | --- |
| Total Rows | Count of filtered customers |
| Average Income | Mean income |
| Loan Acceptance % | % who accepted loan |
| CD Account % | % with CD account |
| Education Count | Education category distribution |

---

# 📈 Page 3 — Feature Effects Simulator

## Functionalities

| Feature | Description |
| --- | --- |
| Interactive Feature Controls | Dynamically change feature values |
| Live Probability Updates | Probability changes instantly |
| Dynamic SHAP Values | SHAP contributions update in real time |
| Feature Sensitivity Analysis | Observe how features affect prediction |

---

## SHAP Visualization

| Color | Meaning |
| --- | --- |
| 🔴 Red | Positive impact toward loan acceptance |
| 🔵 Blue | Negative impact toward rejection |

---

# 🚀 Deployment

## Live Demo
https://loanlens-personal-loan-classifier.onrender.com/
<br>

| Step | Description |
| --- | --- |
| Model Saving | Serialized using pickle |
| Backend Framework | Flask |
| Hosting Platform | Render |
| Prediction Type | Real-time + batch prediction |
| Explainability | SHAP integration |
| Frontend | HTML, CSS, JavaScript, Tailwind |

---

# 🧰 Tech Stack

| Category | Tools |
| --- | --- |
| Data Processing | Pandas, NumPy |
| Visualization | Matplotlib, Seaborn |
| Modeling | Scikit-learn, Imbalanced-learn |
| Explainability | SHAP |
| Backend | Flask |
| Frontend | HTML, CSS, JavaScript, Tailwind |
| Deployment | Render |
| Model Saving | Pickle |

---

# 👩‍💻 Authors

## Bhavya Motiyani

### Contributions
- Exploratory Data Analysis (EDA)
- Feature Engineering
- SMOTENC imbalance handling
- Machine Learning model development & evaluation
- SHAP explainability integration
- Backend development and Flask integration
- CSV prediction and analytics pipeline implementation

📧 Email: bhavyamotiyani68@gmail.com
🔗 [LinkedIn Profile](https://www.linkedin.com/in/bhavya-motiyani-059544306)
---

## Sanjay Ladumor

### Contributions
- Designed and developed the complete frontend architecture and interactive UI/UX
- Built multi-page dashboards for Prediction, Analysis, and Feature Effects simulation
- Implemented dynamic JavaScript-based visualizations and real-time user interactions
- Integrated frontend with Flask backend APIs for prediction, analytics, and CSV workflows (AI Assisted)
- Implemented responsive layouts, dynamic tables, filtering systems, and CSV export functionality
- Contributed to application workflow optimization, debugging, deployment integration, and user experience enhancements

  Github : https://github.com/SanjayLadumor
  <br>
  LinkedIn : https://www.linkedin.com/in/sanjay-ladumor-360a51381/

---

### Development Note
Certain implementation, debugging, and integration tasks were completed with AI-assisted development tools.
