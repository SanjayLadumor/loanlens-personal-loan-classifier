from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import pandas as pd
import joblib
import shap
import numpy as np
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

CORS(app, resources={r"/*": {"origins": "*"}})

model = joblib.load("final_rfc_model.pkl")

final_model = model.named_steps["RFC Model"]

explainer = shap.TreeExplainer(final_model)

print("Model Loaded Successfully")

# =========================================
# GLOBAL STORAGE
# =========================================

uploaded_analysis_df = None

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

predicted_csv_path = os.path.join(
    BASE_DIR,
    "predicted_output.csv"
)

filtered_csv_path = os.path.join(
    BASE_DIR,
    "filtered_output.csv"
)


# =========================================
# REQUIRED DATASET COLUMNS
# =========================================

required_columns = [
    "Age",
    "Experience",
    "Income",
    "ZIP Code",
    "Family",
    "CCAvg",
    "Education",
    "Mortgage",
    "Securities Account",
    "CD Account",
    "Online",
    "CreditCard"
]

# =========================================
# HELPER FUNCTIONS
# =========================================

def validate_dataset_columns(df):

    missing_columns = [
        col for col in required_columns
        if col not in df.columns
    ]

    return missing_columns


def create_model_features(df):

    df = df.copy()

    df["CCToIncomeRatio"] = np.where(
        df["Income"] != 0,
        df["CCAvg"] / df["Income"],
        0
    )

    return df


def prepare_single_input(data):

    age = float(data["age"])

    if age < 18 or age > 100:
        raise ValueError("Age must be between 18 and 100")

    income = float(data["income"])

    ccavg = float(data["ccavg"])

    if income < 0:
        raise ValueError("Annual Income cannot be negative")

    if ccavg < 0:
        raise ValueError("CCAvg cannot be negative")

    cd_account = float(data["cd_account"])

    if cd_account not in [0, 1]:
        raise ValueError("CD Account must be either 0 or 1")

    mortgage = float(data["mortgage"])

    if mortgage < 0:
        raise ValueError("Mortgage cannot be negative")

    

    education = float(data["education"])

    cc_to_income_ratio = (
        ccavg / income
        if income != 0
        else 0
    )

    input_df = pd.DataFrame([[
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

    return (
        input_df,
        age,
        income,
        ccavg,
        cd_account,
        mortgage,
        education,
        cc_to_income_ratio
    )

# =========================================
# PREDICT SINGLE SAMPLE
# =========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json

        print("Received Data:", data)

        (
            input_data,
            age,
            income,
            ccavg,
            cd_account,
            mortgage,
            education,
            cc_to_income_ratio
        ) = prepare_single_input(data)

        prediction = int(
            final_model.predict(input_data)[0]
        )

        probability = float(
            final_model
            .predict_proba(input_data)[0][1]
        )

        # =====================================
        # SHAP VALUES
        # =====================================

        shap_values = explainer.shap_values(
            input_data
        )

        shap_values = np.array(shap_values)

        class_1_shap = shap_values[0, :, 1]

        expected_value = np.array(
            explainer.expected_value
        )

        base_value = float(
            expected_value[1]
        )

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

        shap_analysis = []

        for feature, value, shap_val in zip(
            feature_names,
            feature_values,
            class_1_shap
        ):

            shap_analysis.append({

                "feature": feature,

                "value": round(
                    float(value),
                    2
                ),

                "shap_value": round(
                    float(shap_val),
                    5
                ),

                "direction": (
                    "positive"
                    if shap_val >= 0
                    else "negative"
                )

            })

        return jsonify({

            "prediction": prediction,

            "probability": round(
                probability,
                4
            ),

            "base_value": round(
                base_value,
                5
            ),

            "shap_values": shap_analysis

        })

    except Exception as e:

        print("PREDICTION ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# CSV PREDICT ALL
# =========================================

@app.route("/upload_predict_csv", methods=["POST"])
def upload_predict_csv():

    global predicted_csv_path

    try:

        if "file" not in request.files:

            return jsonify({
                "error": "No file uploaded"
            }), 400

        file = request.files["file"]

        if file.filename == "":

            return jsonify({
                "error": "Empty filename"
            }), 400

        filename = secure_filename(
            file.filename
        )

        extension = os.path.splitext(
            filename
        )[1].lower()

        # =====================================
        # READ FILE
        # =====================================

        if extension == ".csv":

            df = pd.read_csv(file)

        elif extension in [".xlsx", ".xls"]:

            df = pd.read_excel(file)

        else:

            return jsonify({
                "error":
                "Only CSV or Excel files allowed"
            }), 400

        # =====================================
        # VALIDATE COLUMNS
        # =====================================

        missing_columns = validate_dataset_columns(df)

        if missing_columns:

            return jsonify({

                "error":
                "Missing columns",

                "missing_columns":
                missing_columns

            }), 400

        # =====================================
        # FEATURE ENGINEERING
        # =====================================

        model_df = create_model_features(df)

        model_input = model_df[[
            "Age",
            "Income",
            "CD Account",
            "Mortgage",
            "Education",
            "CCAvg",
            "CCToIncomeRatio"
        ]]

        # =====================================
        # PREDICTIONS
        # =====================================

        predictions = final_model.predict(
            model_input
        )

        probabilities = (
            final_model
            .predict_proba(model_input)[:, 1]
        )

        output_df = df.copy()

        output_df["Personal Loan"] = predictions

        output_df["Loan Probability"] = np.round(
            probabilities,
            4
        )

        output_df.to_csv(
            predicted_csv_path,
            index=False
        )

        return jsonify({

            "message":
            "Predictions completed successfully",

            "rows_processed":
            len(output_df)

        })

    except Exception as e:

        print("CSV PREDICTION ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# DOWNLOAD PREDICTED CSV
# =========================================

@app.route(
    "/download_predictions_csv",
    methods=["GET"]
)
def download_predictions_csv():

    global predicted_csv_path

    try:

        print("PREDICTION CSV DOWNLOAD REQUEST")

        print("PATH:", predicted_csv_path)

        print(
            "FILE EXISTS:",
            os.path.exists(predicted_csv_path)
        )

        if not os.path.isfile(predicted_csv_path):

            return jsonify({
                "error":
                "Prediction CSV not found"
            }), 404

        return send_file(
            predicted_csv_path,
            mimetype="text/csv",
            as_attachment=True,
            download_name="predicted_output.csv"
        )

    except Exception as e:

        print("DOWNLOAD ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500


# =========================================
# DOWNLOAD FILTERED CSV
# =========================================

@app.route(
    "/download_filtered_csv",
    methods=["GET"]
)
def download_filtered_csv():

    global filtered_csv_path

    try:

        print("DOWNLOAD REQUEST RECEIVED")

        print("PATH:", filtered_csv_path)

        print(
            "FILE EXISTS:",
            os.path.exists(filtered_csv_path)
        )

        if not os.path.isfile(filtered_csv_path):

            return jsonify({
                "error":
                "Filtered CSV not found"
            }), 404

        return send_file(
            filtered_csv_path,
            mimetype="text/csv",
            as_attachment=True,
            download_name="filtered_output.csv"
        )

    except Exception as e:

        print("DOWNLOAD ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500
    
    # =========================================
# ANALYSIS DATASET UPLOAD
# =========================================

@app.route(
    "/upload_analysis_dataset",
    methods=["POST"]
)
def upload_analysis_dataset():

    global uploaded_analysis_df

    try:

        if "file" not in request.files:

            return jsonify({
                "error": "No file uploaded"
            }), 400

        file = request.files["file"]

        filename = secure_filename(
            file.filename
        )

        extension = os.path.splitext(
            filename
        )[1].lower()

        if extension == ".csv":

            df = pd.read_csv(file)

        elif extension in [".xlsx", ".xls"]:

            df = pd.read_excel(file)

        else:

            return jsonify({
                "error":
                "Only CSV or Excel files allowed"
            }), 400

        missing_columns = validate_dataset_columns(df)

        if missing_columns:

            return jsonify({

                "error":
                "Missing columns",

                "missing_columns":
                missing_columns

            }), 400

        uploaded_analysis_df = df

        return jsonify({

            "message":
            "Dataset uploaded successfully",

            "rows":
            len(df)

        })

    except Exception as e:

        print("UPLOAD DATASET ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# ANALYSIS FILTERING
# =========================================

@app.route("/analysis", methods=["POST"])
def analysis():

    global uploaded_analysis_df
    global filtered_csv_path

    try:

        data = request.json

        # =====================================
        # DATASET SOURCE
        # =====================================

        if uploaded_analysis_df is not None:

            df = uploaded_analysis_df.copy()

        else:

            df = pd.read_csv(
                "Bank_Personal_Loan_Modelling.csv"
            )

        df = df.fillna(0)

        print("TOTAL DATASET ROWS:", len(df))

        # =====================================
        # FILTER VALUES
        # =====================================

        age = data.get("age")
        experience = data.get("experience")
        zipcode = data.get("zipcode")
        income = data.get("income")
        ccavg = data.get("ccavg")
        mortgage = data.get("mortgage")
        family = data.get("family")
        education = data.get("education")
        securities = data.get(
            "securities_account"
        )
        cd_account = data.get(
            "cd_account"
        )
        online = data.get("online")
        loan = data.get("loan")
        creditcard = data.get(
            "creditcard"
        )

        # =====================================
        # FILTERING
        # =====================================

        if age not in [None, ""]:

            df = df[
                df["Age"] >= int(age)
            ]

        if experience not in [None, ""]:

            df = df[
                df["Experience"] >=
                int(experience)
            ]

        if zipcode not in [None, ""]:

            df = df[
                df["ZIP Code"].astype(str)
                .str.contains(
                    str(zipcode),
                    na=False
                )
            ]

        if income not in [None, "", "0"]:

            df = df[
                df["Income"] >=
                float(income)
            ]

        if ccavg not in [None, "", "0"]:

            df = df[
                df["CCAvg"] >=
                float(ccavg)
            ]

        if mortgage not in [None, "", "0"]:

            df = df[
                df["Mortgage"] >=
                float(mortgage)
            ]

        if family not in [None, ""]:

            df = df[
                df["Family"] ==
                int(family)
            ]

        if education not in [None, ""]:

            df = df[
                df["Education"] ==
                int(education)
            ]

        if loan not in [None,""]:
            if "Personal Loan" in df.columns:
                loan_value=(
                    1
                    if int(loan)==1
                    else 0
                )

                df = df[df["Personal Loan"]==loan_value]    

        if securities not in [None, ""]:

            df = df[
                df["Securities Account"] ==
                int(securities)
            ]

        if cd_account not in [None, ""]:

            df = df[
                df["CD Account"] ==
                int(cd_account)
            ]

        if online not in [None, ""]:

            df = df[
                df["Online"] ==
                int(online)
            ]

        if creditcard not in [None, ""]:

            df = df[
                df["CreditCard"] ==
                int(creditcard)
            ]

        # =====================================
        # SAVE FILTERED CSV
        # =====================================

        try:

            df.to_csv(
                filtered_csv_path,
                index=False
            )

            print("FILTERED CSV SAVED:")
            print(filtered_csv_path)

        except Exception as e:

            print("CSV SAVE ERROR:", e)

        # =====================================
        # EMPTY RESULT
        # =====================================

        if len(df) == 0:

            return jsonify({

                "table": [],

                "stats": {

                    "total_rows": 0,

                    "avg_income": 0,

                    "loan_percentage": 0,

                    "cd_percentage": 0,

                    "education_counts": {

                        "edu1": 0,
                        "edu2": 0,
                        "edu3": 0
                    }
                }
            })

        # =====================================
        # TABLE DATA
        # =====================================

        table_data = df

        # =====================================
        # STATS
        # =====================================

        total_rows = len(df)

        avg_income = round(
            float(df["Income"].mean()),
            1
        )

        loan_percentage = round(
            float(
                df["Personal Loan"].mean()
            ) * 100,
            1
        )

        cd_percentage = round(
            float(
                df["CD Account"].mean()
            ) * 100,
            1
        )

        education_counts = {

            "edu1":
                int(
                    (df["Education"] == 1)
                    .sum()
                ),

            "edu2":
                int(
                    (df["Education"] == 2)
                    .sum()
                ),

            "edu3":
                int(
                    (df["Education"] == 3)
                    .sum()
                )
        }

        return jsonify({

            "table":
            table_data.to_dict(
                orient="records"
            ),

            "stats": {

                "total_rows":
                total_rows,

                "avg_income":
                avg_income,

                "loan_percentage":
                loan_percentage,

                "cd_percentage":
                cd_percentage,

                "education_counts":
                education_counts
            }

        })

    except Exception as e:

        print("ANALYSIS ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# EXPORT FILTERED CSV
# =========================================

@app.route(
    "/export_filtered_csv",
    methods=["GET"]
)
def export_filtered_csv():

    try:

        if not os.path.exists(
            filtered_csv_path
        ):

            return jsonify({
                "error":
                "No filtered CSV available"
            }), 404

        return send_file(
            filtered_csv_path,
            as_attachment=True
        )

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# =========================================
# MAIN
# =========================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )
