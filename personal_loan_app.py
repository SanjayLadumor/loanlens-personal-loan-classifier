from flask import Flask, request, render_template_string
import pickle
import pandas as pd

MODEL_PATH = "final_rfc_model.pkl"
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

app = Flask(__name__)

HTML = """
<!doctype html>
<html>
<head>
<title>Personal Loan Prediction</title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<style>
    * { box-sizing: border-box; }

    body {
        margin: 0;
        font-family: 'Segoe UI', sans-serif;
        height: 100vh;
        background: linear-gradient(135deg, #667eea, #764ba2);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .card {
        background: #ffffff;
        padding: 28px 32px;
        width: 420px;
        border-radius: 16px;
        box-shadow: 0 18px 40px rgba(0,0,0,0.25);
    }

    h2 {
        text-align: center;
        margin-bottom: 22px;
        color: #333;
    }

    .field { margin-bottom: 14px; }

    label {
        font-size: 13px;
        color: #555;
        font-weight: 600;
        margin-bottom: 5px;
        display: block;
    }

    .input-box {
        position: relative;
        width: 100%;
    }

    .input-box i {
        position: absolute;
        top: 50%;
        left: 12px;
        transform: translateY(-50%);
        color: #888;
        font-size: 14px;
    }

    input {
        width: 100%;
        height: 40px;
        padding: 8px 12px 8px 36px;
        border-radius: 10px;
        border: 1px solid #ddd;
        font-size: 14px;
    }

    input:focus {
        outline: none;
        border-color: #667eea;
    }

    button {
        width: 100%;
        height: 42px;
        margin-top: 10px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
    }

    .result {
        margin-top: 18px;
        text-align: center;
    }

    .prob {
        font-size: 14px;
        color: #666;
    }

    .error {
        color: red;
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
    }
</style>
</head>

<body>
<div class="card">
    <h2><i class="fa-solid fa-building-columns"></i> Loan Prediction</h2>

    <form method="post">
        <div class="field">
            <label>Age</label>
            <div class="input-box">
                <i class="fa-solid fa-user"></i>
                <input type="number" name="Age" min="18" max="100"
                       value="{{ request.form.get('Age','') }}" required>
            </div>
        </div>

        <div class="field">
            <label>Annual Income (USD)</label>
            <div class="input-box">
                <i class="fa-solid fa-dollar-sign"></i>
                <input type="number" step="0.01" min="1" name="Income"
                       value="{{ request.form.get('Income','') }}" required>
            </div>
        </div>

        <div class="field">
            <label>Credit Card Avg Spend / Month (USD)</label>
            <div class="input-box">
                <i class="fa-solid fa-credit-card"></i>
                <input type="number" step="0.01" min="0" name="CCAvg"
                       value="{{ request.form.get('CCAvg','') }}" required>
            </div>
        </div>

        <div class="field">
            <label>CD Account (0 / 1)</label>
            <div class="input-box">
                <i class="fa-solid fa-vault"></i>
                <input type="number" min="0" max="1" name="CD Account"
                       value="{{ request.form.get('CD Account','') }}" required>
            </div>
        </div>

        <div class="field">
            <label>Mortgage (USD)</label>
            <div class="input-box">
                <i class="fa-solid fa-house"></i>
                <input type="number" step="0.01" min="0" name="Mortgage"
                       value="{{ request.form.get('Mortgage','') }}" required>
            </div>
        </div>

        <div class="field">
            <label>Education (1 / 2 / 3)</label>
            <div class="input-box">
                <i class="fa-solid fa-graduation-cap"></i>
                <input type="number" min="1" max="3" name="Education"
                       value="{{ request.form.get('Education','') }}" required>
            </div>
        </div>

        <button type="submit">
            <i class="fa-solid fa-chart-line"></i> Predict
        </button>
    </form>

    {% if error %}
        <div class="error">{{ error }}</div>
    {% endif %}

    {% if result %}
        <div class="result">
            <h3>{{ result }}</h3>
            <div class="prob">Probability: {{ prob }}%</div>
        </div>
    {% endif %}
</div>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def predict():
    result = None
    prob = None
    error = None

    if request.method == "POST":
        try:
            Age = float(request.form["Age"])
            Income = float(request.form["Income"])
            CCAvg = float(request.form["CCAvg"])
            CD_Account = int(request.form["CD Account"])
            Mortgage = float(request.form["Mortgage"])
            Education = int(request.form["Education"])

            if Income <= 0:
                raise ValueError("Income must be greater than zero.")

            CCToIncomeRatio = CCAvg / (Income / 12)

            X = pd.DataFrame([{
                "Age": Age,
                "Income": Income,
                "CD Account": CD_Account,
                "Mortgage": Mortgage,
                "Education": Education,
                "CCAvg": CCAvg,
                "CCToIncomeRatio": CCToIncomeRatio
            }])

            pred = model.predict(X)[0]
            pred_prob = model.predict_proba(X)[0][1]

            result = "Will Take Personal Loan ✅" if pred == 1 else "Will NOT Take Personal Loan ❌"
            prob = round(pred_prob * 100, 2)

        except Exception as e:
            error = str(e)

    return render_template_string(
        HTML, result=result, prob=prob, error=error, request=request
    )

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)