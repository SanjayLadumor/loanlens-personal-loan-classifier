from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)

# Enable CORS properly
CORS(app, resources={r"/*": {"origins": "*"}})

# Load model
model = joblib.load("final_rfc_model.pkl")
print(model.feature_names_in_)

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        print("Received Data:", data)

        age = float(data["age"])
        income = float(data["income"])
        ccavg = float(data["ccavg"])
        cd_account = float(data["cd_account"])
        mortgage = float(data["mortgage"])
        education = float(data["education"])

        cc_to_income_ratio = ccavg / income

        input_data = pd.DataFrame([[
            age,
            income,
            cd_account,
            mortgage,
            education,
            ccavg,
            cc_to_income_ratio
        ]], columns=[
            "Age",
            "Income",
            "CD Account",
            "Mortgage",
            "Education",
            "CCAvg",
            "CCToIncomeRatio"
        ])

        print(input_data)

        prediction = model.predict(input_data)[0]

        probability = model.predict_proba(input_data)[0][1]

        feature_names = [
            "Age",
            "Income",
            "CD Account",
            "Mortgage",
            "Education",
            "CCAvg",
            "CCToIncomeRatio"
        ]

        feature_values = [
            age,
            income,
            cd_account,
            mortgage,
            education,
            ccavg,
            cc_to_income_ratio
        ]

        final_model = model.steps[-1][1]
        print(final_model)
        importances = final_model.feature_importances_

        analysis_data = []

        for feature, value, importance in zip(
            feature_names,
            feature_values,
            importances
        ):

            contribution = importance * probability

            analysis_data.append({
                "feature": feature,
                "value": round(value, 2),
                "impact": round(contribution, 3)
            })

        return jsonify({
            "prediction": int(prediction),
            "probability": round(float(probability), 2),
            "analysis": analysis_data
        })

    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)