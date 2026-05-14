window.addEventListener("beforeunload", () => {
    console.log("FULL PAGE RELOAD HAPPENING");
});


setTimeout(() => {

    const splash = document.getElementById("splash");

    splash.style.opacity = "0";

    setTimeout(() => {

        splash.style.display = "none";

        document.getElementById("mainScreen").style.display = "flex";

    }, 1000);

}, 3000);

// ========================================
// PAGE NAVIGATION
// ========================================

function showPage(page) {

    const analysis =
        document.getElementById("analysispage");

    const featureeffect =
        document.getElementById("featureeffect");

    const predict =
        document.getElementById("predictionpage");

    const navButtons =
        document.querySelectorAll(".buttons button");

    const activeClasses = [
        "bg-fuchsia-300/10",
        "px-2",
        "py-1",
        "rounded-lg"
    ];

    predict.classList.add("hidden");
    analysis.classList.add("hidden");
    featureeffect.classList.add("hidden");

    navButtons.forEach(btn => {
        btn.classList.remove(...activeClasses);
    });

    if (page === "predict") {

        predict.classList.remove("hidden");

        navButtons[0]
            .classList
            .add(...activeClasses);
    }

    if (page === "analysis") {

        analysis.classList.remove("hidden");

        navButtons[1]
            .classList
            .add(...activeClasses);
    }

    if (page === "featureeffect") {

        featureeffect.classList.remove("hidden");

        navButtons[2]
            .classList
            .add(...activeClasses);
    }
}

// ========================================
// PAGE 1 GAUGE
// ========================================

function setGauge(value) {

    const gauge =
        document.getElementById("gauge");

    const text =
        document.getElementById("percentageText");

    const radius = 90;

    const circumference =
        Math.PI * radius;

    const offset =
        circumference -
        ((value / 100) * circumference);

    gauge.style.strokeDasharray =
        circumference;

    gauge.style.strokeDashoffset =
        offset;

    text.innerText = value + "%";

    text.style.background = `
      linear-gradient(
        to right,
        #ffffff,
        #7df9ff
      )
    `;

    text.style.webkitBackgroundClip =
        "text";

    text.style.webkitTextFillColor =
        "transparent";

    if (value < 40) {

        text.style.textShadow =
            "0 0 20px rgba(96,165,250,0.8)";
    }

    else if (value < 70) {

        text.style.textShadow =
            "0 0 20px rgba(255,184,0,0.8)";
    }

    else {

        text.style.textShadow =
            "0 0 25px rgba(255,45,149,0.9)";
    }
}
setGauge(50);

// ========================================
// SHAP ANALYSIS
// ========================================

function renderAnalysis(
    shapData,
    baseValue
) {

    const container =
        document.getElementById(
            "analysisContainer"
        );

    container.innerHTML = "";

    shapData.sort(
        (a, b) =>
            Math.abs(b.shap_value)
            - Math.abs(a.shap_value)
    );

    let runningValue = baseValue;

    const maxAbsShap =
        Math.max(
            ...shapData.map(
                item => Math.abs(item.shap_value)
            )
        );

    shapData.forEach(item => {

        const shapValue =
            item.shap_value;

        const isPositive =
            shapValue >= 0;

        const widthPercent =
            Math.max(
                (Math.abs(shapValue)
                    / maxAbsShap) * 100,
                3
            );

        const gradient =
            isPositive
                ? "linear-gradient(to right,#ff0055,#ff5ca8)"
                : "linear-gradient(to right,#00d2ff,#3a86ff)";

        const valueColor =
            isPositive
                ? "#ff7eb6"
                : "#5ac8ff";

        const previousValue =
            runningValue;

        runningValue += shapValue;

        container.innerHTML += `

        <div style="
            display:flex;
            align-items:center;
            gap:8px;
            min-height:28px;
            width:100%;
        " class="max-sm:flex-col max-sm:items-start">

            <div style="
                width:90px;
                text-align:right;
                font-size:12px;
                color:#94a3b8;
                font-family:monospace;
                flex-shrink:0;
            " class="max-sm:w-full max-sm:text-left">

                ${previousValue.toFixed(2)}

                <span style="color:#475569; padding:0 4px;">
                    →
                </span>

                <span style="color:${valueColor}; font-weight:bold;">
                    ${runningValue.toFixed(2)}
                </span>

            </div>

            <div style="
                width:140px;
                text-align:right;
                font-size:12px;
                flex-shrink:0;
            " class="max-sm:w-full max-sm:text-left">

                <span style="color:#64748b;">
                    ${item.value}
                </span>

                <span style="color:#475569; padding:0 3px;">
                    =
                </span>

                <span style="color:white; font-weight:700;">
                    ${item.feature}
                </span>

            </div>

            <div style="
                height:14px;
                background:#121c38;
                border-radius:999px;
                overflow:hidden;
                position:relative;
                width:100%;
            ">

                <div style="
                    width:${widthPercent}%;
                    height:100%;
                    border-radius:999px;
                    background:${gradient};
                    box-shadow:0 0 16px rgba(255,255,255,0.12);
                    display:block;
                "></div>

            </div>

            <div style="
                width:58px;
                text-align:right;
                font-size:12px;
                font-weight:700;
                font-family:monospace;
                color:${valueColor};
                flex-shrink:0;
            ">

                ${shapValue > 0 ? "+" : ""}
                ${shapValue.toFixed(3)}

            </div>

        </div>
        `;
    });
}

// ========================================
// PAGE 1 PREDICT
// ========================================

const predictBtn =
    document.getElementById(
        "predictBtn"
    );

predictBtn.addEventListener(
    "click",
    async () => {

        const age =
            document.getElementById("age").value;

        if (age < 18 || age > 100) {

            alert(
                "Age must be between 18 and 100"
            );

            return;
        }

        const income =
            document.getElementById("income").value;

        const ccavg =
            document.getElementById("ccavg").value;

        const cd_account =
            document.getElementById("cdaccount").value;

        const mortgage =
            document.getElementById("mortgage").value;

        const education =
            document.getElementById("education").value;

        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5000/predict",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            age,
                            income,
                            ccavg,
                            cd_account,
                            mortgage,
                            education
                        })

                    });

            const data =
                await response.json();

            if (data.error) {

                alert(data.error);

                return;
            }

            renderAnalysis(
                data.shap_values,
                data.base_value
            );

            const probability =
                Math.round(
                    data.probability * 100
                );

            const finalScore =
                document.getElementById(
                    "finalScore"
                );

            finalScore.innerHTML = `
            <div class="flex flex-col items-end">
                <div>${data.probability.toFixed(2)}</div>

                <div class="text-[10px] text-cyan-300 font-normal mt-1">
                    Base: ${data.base_value.toFixed(2)}
                </div>
            </div>
        `;

            finalScore.classList.remove(
                "text-red-400",
                "text-yellow-400",
                "text-green-400"
            );

            if (data.probability > 0.7) {

                finalScore.classList.add(
                    "text-green-400"
                );
            }

            else if (
                data.probability > 0.4
            ) {

                finalScore.classList.add(
                    "text-yellow-400"
                );
            }

            else {

                finalScore.classList.add(
                    "text-red-400"
                );
            }

            setGauge(probability);

            const resultText =
                document.getElementById(
                    "resultText"
                );

            const resultDescription =
                document.getElementById(
                    "resultDescription"
                );

            if (data.prediction === 1) {

                resultText.innerText =
                    "Accept";

                resultText.classList.remove(
                    "text-red-400"
                );

                resultText.classList.add(
                    "text-green-400"
                );

                resultDescription.innerText =
                    "Customer is highly likely to accept the personal loan offer.";
            }

            else {

                resultText.innerText =
                    "Reject";

                resultText.classList.remove(
                    "text-green-400"
                );

                resultText.classList.add(
                    "text-red-400"
                );

                resultDescription.innerText =
                    "Customer is unlikely to accept the personal loan offer.";
            }

        }

        catch (error) {

            console.log(error);

            alert("Prediction failed");
        }

    });

// ========================================
// PAGE 1 CSV PREDICT ALL
// ========================================

let predictionReady = false;

const importPredictBtn =
    document.querySelector(
        ".btnone button"
    );

importPredictBtn.addEventListener(
    "click",
    async () => {

        const input =
            document.createElement("input");

        input.type = "file";

        input.accept =
            ".csv,.xlsx,.xls";

        input.click();

        input.onchange =
            async (e) => {

                const file =
                    e.target.files[0];

                if (!file) return;

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );

                try {

                    importPredictBtn.innerText =
                        "Processing...";

                    const response =
                        await fetch(
                            "http://127.0.0.1:5000/upload_predict_csv",
                            {

                                method: "POST",

                                body: formData
                            }
                        );

                    const data =
                        await response.json();

                    if (data.error) {

                        alert(
                            data.error
                        );

                        console.log(data);

                        importPredictBtn.innerText =
                            "Import CSV & Predict All";

                        return;
                    }

                    predictionReady = true;

                    alert(
                        `Prediction completed for ${data.rows_processed} rows`
                    );

                    importPredictBtn.innerText =
                        "Prediction Complete";

                }

                catch (error) {

                    console.log(error);

                    alert(
                        "CSV prediction failed"
                    );

                    importPredictBtn.innerText =
                        "Import CSV & Predict All";
                }
            };
    }
);

// ========================================
// DOWNLOAD PREDICTED CSV
// ========================================

const downloadPredictBtn =
    document.querySelector(
        ".btntwo button"
    );

downloadPredictBtn.addEventListener(
    "click",
    () => {

        if (!predictionReady) {

            alert(
                "Please upload and predict CSV first"
            );

            return;
        }

        window.open(
            "http://127.0.0.1:5000/download_predictions_csv",
            "_blank"
        );
    }
);

// ========================================
// FEATURE EFFECT GAUGE
// ========================================

const featureProgressArc =
    document.getElementById(
        "featureProgressArc"
    );

const featurePercentageText =
    document.getElementById(
        "featurePercentageText"
    );

let featureArcLength = 0;

if (featureProgressArc) {

    featureArcLength =
        featureProgressArc.getTotalLength();

    featureProgressArc.style.strokeDasharray =
        featureArcLength;

    featureProgressArc.style.strokeDashoffset =
        featureArcLength;
}

function getFeatureGaugeColor(value) {

    if (value <= 30) {
        return "#3b82f6";
    }

    if (value <= 60) {
        return "#facc15";
    }

    if (value <= 80) {
        return "#fb7185";
    }

    return "#ff0055";
}

function setFeatureGauge(value) {

    value = Math.max(
        0,
        Math.min(100, value)
    );

    const offset =
        featureArcLength -
        (value / 100) *
        featureArcLength;

    featureProgressArc.style.strokeDashoffset =
        offset;

    featureProgressArc.style.stroke =
        getFeatureGaugeColor(value);

    featurePercentageText.textContent =
        value + "%";
}

// ========================================
// PAGE 3 LIVE MODEL
// ========================================

const featureInputs = {

    age:
        document.getElementById(
            "featureAge"
        ),

    income:
        document.getElementById(
            "featureIncome"
        ),

    ccavg:
        document.getElementById(
            "featureCCAvg"
        ),

    education:
        document.getElementById(
            "featureEducation"
        ),

    cd_account:
        document.getElementById(
            "featureCD"
        ),

    mortgage:
        document.getElementById(
            "featureMortgage"
        )
};

async function updateFeatureEffects() {

    if (updateFeatureEffects.loading)
        return;

    updateFeatureEffects.loading = true;

    document.getElementById(
        "ageValue"
    ).innerText =
        featureInputs.age.value;

    document.getElementById(
        "incomeValue"
    ).innerText =
        featureInputs.income.value;

    document.getElementById(
        "ccavgValue"
    ).innerText =
        featureInputs.ccavg.value;

    document.getElementById(
        "educationValue"
    ).innerText =
        featureInputs.education.value;

    document.getElementById(
        "cdValue"
    ).innerText =
        featureInputs.cd_account.value;

    document.getElementById(
        "mortgageValue"
    ).innerText =
        featureInputs.mortgage.value;

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/predict",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        age:
                            featureInputs.age.value,

                        income:
                            featureInputs.income.value,

                        ccavg:
                            featureInputs.ccavg.value,

                        education:
                            featureInputs.education.value,

                        cd_account:
                            featureInputs.cd_account.value,

                        mortgage:
                            featureInputs.mortgage.value
                    })
                }
            );

        const data =
            await response.json();

        const probability =
            Math.round(
                data.probability * 100
            );

        setFeatureGauge(probability);

        const status =
            document.querySelector(
                ".acceptorrejecttxt"
            );

        if (data.prediction === 1) {

            status.innerText = "Accept";

            status.classList.remove(
                "text-red-400"
            );

            status.classList.add(
                "text-green-400"
            );
        }

        else {

            status.innerText = "Reject";

            status.classList.remove(
                "text-green-400"
            );

            status.classList.add(
                "text-red-400"
            );
        }

        const confidenceElement =
            document.querySelector(
                ".bottomflxxx"
            );

        confidenceElement.innerText =
            data.probability.toFixed(3);

        const maxAbsShap =
            Math.max(
                ...data.shap_values.map(
                    item =>
                        Math.abs(
                            item.shap_value
                        )
                )
            );

        data.shap_values.forEach(item => {

            const feature =
                item.feature;

            const shap =
                item.shap_value;

            const width =
                Math.min(
                    Math.max(
                        Math.abs(shap) * 260,
                        4
                    ),
                    100
                );

            let id = "";
            let bar = "";

            if (feature === "Income") {
                id = "impactIncome";
                bar = "barIncome";
            }

            if (feature === "CCAvg") {
                id = "impactCCAvg";
                bar = "barCCAvg";
            }

            if (feature === "Education") {
                id = "impactEducation";
                bar = "barEducation";
            }

            if (feature === "CD Account") {
                id = "impactCD";
                bar = "barCD";
            }

            if (feature === "Mortgage") {
                id = "impactMortgage";
                bar = "barMortgage";
            }

            if (feature === "Age") {
                id = "impactAge";
                bar = "barAge";
            }

            if (id !== "") {

                const impactText =
                    document.getElementById(id);

                impactText.innerText =
                    shap.toFixed(3);

                impactText.classList.remove(
                    "text-cyan-300",
                    "text-red-300",
                    "text-blue-300"
                );

                if (shap >= 0) {

                    impactText.classList.add(
                        "text-red-300"
                    );
                }

                else {

                    impactText.classList.add(
                        "text-blue-300"
                    );
                }

                const currentBar =
                    document.getElementById(bar);

                if (!currentBar) return;

                currentBar.style.width =
                    width + "%";

                if (shap >= 0) {

                    currentBar.style.background =
                        "linear-gradient(to right,#ff0055,#ff5ca8)";
                }

                else {

                    currentBar.style.background =
                        "linear-gradient(to right,#00d2ff,#3a86ff)";
                }
            }

        });

        updateFeatureEffects.loading = false;

    }

    catch (error) {

        console.log(error);

        updateFeatureEffects.loading = false;
    }
}

let featureTimeout;

Object.values(featureInputs)
    .forEach(input => {

        if (!input) return;

        input.addEventListener(
            "input",

            () => {

                clearTimeout(
                    featureTimeout
                );

                featureTimeout =
                    setTimeout(() => {

                        updateFeatureEffects();

                    }, 120);
            }
        );
    });

if (
    document.getElementById("featureIncome")
) {

    updateFeatureEffects();
}

// ========================================
// ANALYSIS SLIDERS
// ========================================

function bindSliderText(
    sliderId,
    textId
) {

    const slider =
        document.getElementById(
            sliderId
        );

    const text =
        document.getElementById(
            textId
        );

    slider.addEventListener(
        "input",
        () => {

            text.innerText =
                slider.value;
        }
    );
}

bindSliderText(
    "analysisIncome",
    "analysisIncomeText"
);

bindSliderText(
    "analysisCCAvg",
    "analysisCCAvgText"
);

bindSliderText(
    "analysisMortgage",
    "analysisMortgageText"
);

// ========================================
// FILTER BUTTONS
// ========================================

const filterGroups =
    document.querySelectorAll(
        ".filterBtns"
    );

filterGroups.forEach(group => {

    const buttons =
        group.querySelectorAll(
            "button"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",

            () => {

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "filter-active"
                    );
                });

                button.classList.add(
                    "filter-active"
                );
            }
        );
    });
});

// ========================================
// PAGE 2 DATASET UPLOAD
// ========================================

const uploadDatasetBtn =
    document.querySelector(
        ".uploadbutton button"
    );

uploadDatasetBtn.addEventListener(
    "click",
    async () => {

        const input =
            document.createElement(
                "input"
            );

        input.type = "file";

        input.accept =
            ".csv,.xlsx,.xls";

        input.click();

        input.onchange =
            async (e) => {

                const file =
                    e.target.files[0];

                if (!file) return;

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );

                try {

                    uploadDatasetBtn.innerText =
                        "Uploading...";

                    const response =
                        await fetch(
                            "http://127.0.0.1:5000/upload_analysis_dataset",
                            {

                                method: "POST",

                                body: formData
                            }
                        );

                    const data =
                        await response.json();

                    if (data.error) {

                        alert(
                            data.error
                        );

                        uploadDatasetBtn.innerText =
                            "Upload Dataset";

                        return;
                    }

                    alert(
                        `Dataset uploaded successfully (${data.rows} rows)`
                    );

                    uploadDatasetBtn.innerText =
                        "Dataset Uploaded";

                }

                catch (error) {

                    console.log(error);

                    alert(
                        "Dataset upload failed"
                    );

                    uploadDatasetBtn.innerText =
                        "Upload Dataset";
                }
            };
    }
);

// ========================================
// ANALYSIS SHOW RESULTS
// ========================================

const showResultsBtn =
    document.querySelector(".showresults button");

if (showResultsBtn) {

    showResultsBtn.type = "button";

    showResultsBtn.addEventListener(
        "click",

        async function (e) {

            e.preventDefault();
            e.stopPropagation();

            try {

                showResultsBtn.disabled = true;

                const age =
                    document.getElementById("agebox").value;

                const experience =
                    document.getElementById("experiencebox").value;

                const zipcode =
                    document.getElementById("zipcode").value;

                const income =
                    document.getElementById("analysisIncome").value;

                const ccavg =
                    document.getElementById("analysisCCAvg").value;

                const mortgage =
                    document.getElementById("analysisMortgage").value;

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/analysis",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                age,
                                experience,
                                zipcode,
                                income,
                                ccavg,
                                mortgage
                            })
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        "Backend response failed"
                    );
                }

                const data =
                    await response.json();

                console.log("ANALYSIS DATA:", data);

                // IMPORTANT FIX
                renderAnalysisTable(data.table);

                updateAnalysisStats(data.stats);

            }

            catch (error) {

                console.log(
                    "ANALYSIS FETCH ERROR:",
                    error
                );

                alert("Analysis request failed");
            }

            finally {

                showResultsBtn.disabled = false;
            }
        }
    );
}

// ========================================
// ANALYSIS TABLE
// ========================================

function renderAnalysisTable(rows) {

    const table =
        document.getElementById(
            "analysisTable"
        );

    if (rows.length === 0) {

        table.innerHTML = `
            <div class="text-center p-6 text-slate-500">
                No matching rows found
            </div>
        `;

        return;
    }

    const columns =
        Object.keys(rows[0]);

    let tableHTML = `
        <div class="overflow-x-auto">
        <table class="w-full text-left border-separate border-spacing-y-2">

        <thead>
        <tr class="text-slate-400 text-[12px]">
    `;

    columns.forEach(col => {

        tableHTML += `
            <th class="px-3">
                ${col}
            </th>
        `;
    });

    tableHTML += `
        </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {

        tableHTML += `
            <tr class="bg-[#0b1326] text-[12px]">
        `;

        columns.forEach((col, index) => {

            let value =
                row[col];

            if (col === "Personal Loan") {

                value =
                    value === 1
                        ? `
                    <span class="px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                        Accepted
                    </span>
                `
                        : `
                    <span class="px-3 py-1 rounded-full bg-red-500/20 text-red-300">
                        Rejected
                    </span>
                `;
            }

            tableHTML += `
                <td class="p-3 ${index === 0 ? "rounded-l-xl" : ""} ${index === columns.length - 1 ? "rounded-r-xl" : ""}">
                    ${value}
                </td>
            `;
        });

        tableHTML += `
            </tr>
        `;
    });

    tableHTML += `
        </tbody>
        </table>
        </div>
    `;

    table.innerHTML =
        tableHTML;
}

// ========================================
// ANALYSIS STATS
// ========================================

function updateAnalysisStats(stats) {

    document.getElementById(
        "totalRows"
    ).innerText =
        stats.total_rows.toLocaleString();

    document.getElementById(
        "avgIncome"
    ).innerText =
        stats.avg_income + "k";

    document.getElementById(
        "loanPercent"
    ).innerText =
        stats.loan_percentage + "%";

    document.getElementById(
        "cdPercent"
    ).innerText =
        stats.cd_percentage + "%";

    const total =
        stats.education_counts.edu1 +
        stats.education_counts.edu2 +
        stats.education_counts.edu3;

    const edu1Width =
        total === 0
            ? 0
            : (
                stats.education_counts.edu1
                / total
            ) * 100;

    const edu2Width =
        total === 0
            ? 0
            : (
                stats.education_counts.edu2
                / total
            ) * 100;

    const edu3Width =
        total === 0
            ? 0
            : (
                stats.education_counts.edu3
                / total
            ) * 100;

    document.getElementById(
        "edu1Count"
    ).innerText =
        stats.education_counts.edu1;

    document.getElementById(
        "edu2Count"
    ).innerText =
        stats.education_counts.edu2;

    document.getElementById(
        "edu3Count"
    ).innerText =
        stats.education_counts.edu3;

    document.getElementById(
        "edu1Bar"
    ).style.width =
        edu1Width + "%";

    document.getElementById(
        "edu2Bar"
    ).style.width =
        edu2Width + "%";

    document.getElementById(
        "edu3Bar"
    ).style.width =
        edu3Width + "%";
}

// ========================================
// EXPORT FILTERED CSV
// ========================================

const exportBtn =
    document.querySelector(
        ".btnhere button"
    );

exportBtn.addEventListener(
    "click",
    () => {

        window.open(
            "http://127.0.0.1:5000/export_filtered_csv",
            "_blank"
        );
    }
);

// ========================================
// ANALYSIS TABLE RENDER
// ========================================

function renderAnalysisTable(rows) {

    const table =
        document.getElementById(
            "analysisTable"
        );

    if (!table) return;

    if (!rows || rows.length === 0) {

        table.innerHTML = `
            <div class="text-center text-slate-400 p-5">
                No matching rows found
            </div>
        `;

        return;
    }

    const columns =
        Object.keys(rows[0]);

    let html = `
        <table class="w-full text-[11px] border-collapse">
            <thead>
                <tr class="bg-[#17274e] text-cyan-300">
    `;

    columns.forEach(col => {

        html += `
            <th class="p-2 border border-[#22345f] whitespace-nowrap">
                ${col}
            </th>
        `;
    });

    html += `
                </tr>
            </thead>
            <tbody>
    `;

    rows.forEach(row => {

        html += `<tr>`;

        columns.forEach(col => {

            html += `
                <td class="p-2 border border-[#1e2d52] whitespace-nowrap text-center">
                    ${row[col]}
                </td>
            `;
        });

        html += `</tr>`;
    });

    html += `
            </tbody>
        </table>
    `;

    table.innerHTML = html;
}

// ========================================
// ANALYSIS STATS UPDATE
// ========================================

function updateAnalysisStats(stats) {

    if (!stats) return;

    document.getElementById(
        "totalRows"
    ).innerText =
        stats.total_rows || 0;

    document.getElementById(
        "avgIncome"
    ).innerText =
        (stats.avg_income || 0) + "K";

    document.getElementById(
        "loanPercent"
    ).innerText =
        (stats.loan_percentage || 0) + "%";

    document.getElementById(
        "cdPercent"
    ).innerText =
        (stats.cd_percentage || 0) + "%";

    const edu =
        stats.education_counts || {};

    const edu1 =
        edu.edu1 || 0;

    const edu2 =
        edu.edu2 || 0;

    const edu3 =
        edu.edu3 || 0;

    const max =
        Math.max(
            edu1,
            edu2,
            edu3,
            1
        );

    document.getElementById(
        "edu1Count"
    ).innerText = edu1;

    document.getElementById(
        "edu2Count"
    ).innerText = edu2;

    document.getElementById(
        "edu3Count"
    ).innerText = edu3;

    document.getElementById(
        "edu1Bar"
    ).style.width =
        (edu1 / max) * 100 + "%";

    document.getElementById(
        "edu2Bar"
    ).style.width =
        (edu2 / max) * 100 + "%";

    document.getElementById(
        "edu3Bar"
    ).style.width =
        (edu3 / max) * 100 + "%";
}
