
setTimeout(() => {

    const splash = document.getElementById("splash");

    splash.style.opacity = "0";

    setTimeout(() => {

        splash.style.display = "none";

        document.getElementById("mainScreen").style.display = "flex";

    }, 1000);

}, 3000);

function showPage(page) {

    const analysis = document.getElementById("analysispage");
    const featureeffect = document.getElementById("featureeffect");
    const predict = document.getElementById("predictionpage");

    const navButtons =
        document.querySelectorAll('.buttons button');

    const activeClasses = ["bg-fuchsia-300/10", "px-2", "py-1", "rounded-lg"];

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
        navButtons[2].classList.add(...activeClasses);
    }
}

function setGauge(value) {

    const gauge =
        document.getElementById("gauge");

    const text =
        document.getElementById("percentageText");

    const degree = (value / 100) * 360;

    let startColor = "";
    let middleColor = "";
    let endColor = "";
    let textGlow = "";

    if (value < 40) {

        startColor = "#ff0055";
        middleColor = "#ff4d4d";
        endColor = "#ff7b00";

        textGlow =
            "0 0 20px rgba(255,0,85,0.8)";
    }

    else if (value < 70) {

        startColor = "#ffb800";
        middleColor = "#ff7b00";
        endColor = "#ff3d77";

        textGlow =
            "0 0 20px rgba(255,184,0,0.8)";
    }

    else {

        startColor = "#00e5ff";
        middleColor = "#00ffae";
        endColor = "#7dff3c";

        textGlow =
            "0 0 25px rgba(0,255,174,0.9)";
    }

    gauge.style.background = `
    conic-gradient(
        from 180deg,

        ${startColor} 0deg,
        ${middleColor} ${degree * 0.6}deg,
        ${endColor} ${degree}deg,

        #1e293b ${degree}deg,
        #1e293b 360deg
    )
`;

    text.innerText = value + "%";

    text.style.background = `
      linear-gradient(
        to right,
        #ffffff,
        #7df9ff
      )
    `;

    text.style.webkitBackgroundClip = "text";

    text.style.webkitTextFillColor =
        "transparent";

    text.style.textShadow = textGlow;
}

setGauge(50);

function renderAnalysis(
    shapData,
    baseValue
) {

    const container =
        document.getElementById(
            "analysisContainer"
        );

    container.innerHTML = "";

    // SORT BIGGEST IMPACT FIRST
    shapData.sort(
        (a, b) =>
            Math.abs(b.shap_value)
            - Math.abs(a.shap_value)
    );

    let runningValue = baseValue;

    shapData.forEach(item => {

        const shapValue = item.shap_value;

        const isPositive =
            shapValue >= 0;

        // SCALE WIDTH
        const widthPercent = Math.max(
            Math.min(Math.abs(shapValue) * 140, 100),
            2
        );

        const gradient = isPositive
            ? "linear-gradient(to right, #ff2d95, #ff1f5a)"
            : "linear-gradient(to right, #00d2ff, #3a86ff)";

        const valueColor = isPositive
            ? "#ff8fc2"
            : "#4fdcff";

        const previousValue = runningValue;

        runningValue += shapValue;

        container.innerHTML += `

        <div style="
            display:flex;
            align-items:center;
            gap:8px;
            min-height:28px;
            width:100%;
        " class="max-sm:flex-col max-sm:items-start">

            <!-- WATERFALL VALUES -->
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

            <!-- FEATURE LABEL -->
            <div style="
                width:120px;
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

            <!-- BAR TRACK -->
            <div style="
                height:14px;
                background:#121c38;
                border-radius:999px;
                overflow:hidden;
                position:relative;
                width:100%;
            ">

                <!-- BAR -->
                <div style="
                    width:${widthPercent}%;
                    height:100%;
                    border-radius:999px;
                    background:${gradient};
                    box-shadow:0 0 16px rgba(255,255,255,0.12);
                    display:block;
                "></div>

            </div>

            <!-- SHAP VALUE -->
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
                ${shapValue.toFixed(2)}

            </div>

        </div>
        `;
    });
}

const predictBtn =
    document.getElementById(
        "predictBtn"
    );

predictBtn.addEventListener(
    "click",
    async () => {

        const age =
            document.getElementById("age").value;

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

            if (data.probability > 0.7) {

                finalScore.classList.remove(
                    "text-red-400",
                    "text-yellow-400"
                );

                finalScore.classList.add(
                    "text-green-400"
                );
            }

            else if (
                data.probability > 0.4
            ) {

                finalScore.classList.remove(
                    "text-red-400",
                    "text-green-400"
                );

                finalScore.classList.add(
                    "text-yellow-400"
                );
            }

            else {

                finalScore.classList.remove(
                    "text-green-400",
                    "text-yellow-400"
                );

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

// Page 3 Meter 

// Feature Effect Page Meter

const featureProgressArc =
    document.getElementById(
        "featureProgressArc"
    );

const featurePercentageText =
    document.getElementById(
        "featurePercentageText"
    );

const featureArcLength =
    featureProgressArc.getTotalLength();

featureProgressArc.style.strokeDasharray =
    featureArcLength;

featureProgressArc.style.strokeDashoffset =
    featureArcLength;

function getFeatureGaugeColor(value) {

    if (value <= 30) {
        return "#ff8c42";
    }

    if (value <= 60) {
        return "#ffd93d";
    }

    if (value <= 80) {
        return "#7dff4d";
    }

    return "#42f5e6";
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


// =========================
// FEATURE EFFECT LIVE MODEL
// =========================

const featureInputs = {

    age:
        document.getElementById("featureAge"),

    income:
        document.getElementById("featureIncome"),

    ccavg:
        document.getElementById("featureCCAvg"),

    education:
        document.getElementById("featureEducation"),

    cd_account:
        document.getElementById("featureCD"),

    mortgage:
        document.getElementById("featureMortgage")
};

async function updateFeatureEffects() {

    if (updateFeatureEffects.loading) return;

    updateFeatureEffects.loading = true;

    // LIVE VALUE TEXT
    document.getElementById("ageValue")
        .innerText = featureInputs.age.value;

    document.getElementById("incomeValue")
        .innerText = featureInputs.income.value;

    document.getElementById("ccavgValue")
        .innerText = featureInputs.ccavg.value;

    document.getElementById("educationValue")
        .innerText = featureInputs.education.value;

    document.getElementById("cdValue")
        .innerText = featureInputs.cd_account.value;

    document.getElementById("mortgageValue")
        .innerText = featureInputs.mortgage.value;

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/predict",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
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

        const data = await response.json();
        console.log("ANALYSIS DATA:", data);

        // =====================
        // GAUGE UPDATE
        // =====================

        const probability =
            Math.round(
                data.probability * 100
            );

        setFeatureGauge(probability);

        // =====================
        // ACCEPT / REJECT
        // =====================

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

        // =====================
        // MODEL CONFIDENCE
        // =====================

        const confidenceElement =
            document.querySelector(
                ".bottomflxxx"
            );

        confidenceElement.innerText =
            data.probability.toFixed(3);

        // REMOVE OLD COLORS
        confidenceElement.classList.remove(
            "text-red-400",
            "text-yellow-400",
            "text-green-400",
            "text-cyan-400"
        );

        // ADD NEW COLORS
        if (data.probability < 0.35) {

            confidenceElement.classList.add(
                "text-red-400"
            );
        }

        else if (data.probability < 0.60) {

            confidenceElement.classList.add(
                "text-yellow-400"
            );
        }

        else if (data.probability < 0.80) {

            confidenceElement.classList.add(
                "text-green-400"
            );
        }

        else {

            confidenceElement.classList.add(
                "text-cyan-400"
            );
        }

        // =====================
        // FEATURE IMPACTS
        // =====================

        data.shap_values.forEach(item => {

            const feature =
                item.feature;

            const shap =
                item.shap_value;

            const width =
                Math.max(
                    8,
                    Math.min(
                        Math.abs(shap) * 1200,
                        100
                    )
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

                // REMOVE OLD COLORS
                impactText.classList.remove(
                    "text-cyan-300",
                    "text-green-300",
                    "text-pink-300",
                    "text-red-400"
                );

                // POSITIVE FEATURES
                if (shap >= 0) {

                    if (shap > 0.08) {

                        impactText.classList.add(
                            "text-cyan-300"
                        );
                    }

                    else {

                        impactText.classList.add(
                            "text-green-300"
                        );
                    }
                }

                // NEGATIVE FEATURES
                else {

                    if (shap < -0.08) {

                        impactText.classList.add(
                            "text-red-400"
                        );
                    }

                    else {

                        impactText.classList.add(
                            "text-pink-300"
                        );
                    }
                }

                const currentBar =
                    document.getElementById(bar);

                if (!currentBar) return;

                currentBar.style.width =
                    width + "%";

                if (shap >= 0) {

                    currentBar.style.background =
                        "linear-gradient(to right,#00e5ff,#00ffae)";
                }

                else {

                    currentBar.style.background =
                        "linear-gradient(to right,#ff2d95,#ff1f5a)";
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

// =========================
// LIVE LISTENERS
// =========================

let featureTimeout;

Object.values(featureInputs)
    .forEach(input => {

        input.addEventListener(
            "input",

            () => {

                clearTimeout(featureTimeout);

                featureTimeout =
                    setTimeout(() => {

                        updateFeatureEffects();

                    }, 120);
            }
        );
    });

// INITIAL LOAD
updateFeatureEffects();

// =========================
// ANALYSIS SLIDER TEXT
// =========================

const analysisIncome =
    document.getElementById(
        "analysisIncome"
    );

const analysisIncomeText =
    document.getElementById(
        "analysisIncomeText"
    );

analysisIncome.addEventListener(
    "input",
    () => {

        analysisIncomeText.innerText =
            analysisIncome.value;
    }
);


const analysisCCAvg =
    document.getElementById(
        "analysisCCAvg"
    );

const analysisCCAvgText =
    document.getElementById(
        "analysisCCAvgText"
    );

analysisCCAvg.addEventListener(
    "input",
    () => {

        analysisCCAvgText.innerText =
            analysisCCAvg.value;
    }
);


const analysisMortgage =
    document.getElementById(
        "analysisMortgage"
    );

const analysisMortgageText =
    document.getElementById(
        "analysisMortgageText"
    );

analysisMortgage.addEventListener(
    "input",
    () => {

        analysisMortgageText.innerText =
            analysisMortgage.value;
    }
);

// =========================
// FILTER BUTTON SELECTION
// =========================

const filterGroups =
    document.querySelectorAll(".filterBtns");

filterGroups.forEach(group => {

    const buttons =
        group.querySelectorAll("button");

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

const showResultsBtn =
    document.querySelector(
        ".showresults button"
    );

showResultsBtn.addEventListener(
    "click",
    async () => {

        try {

            const age =
                document.getElementById("agebox").value;

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
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            age:
                                age === "" ? null : age,

                            income:
                                income == 0 ? null : income,

                            ccavg:
                                ccavg == 0 ? null : ccavg,

                            mortgage:
                                mortgage == 0 ? null : mortgage
                        })
                    }
                );

            const data =
                await response.json();

            console.log(data);

            if (data.error) {

                console.log(data.error);

                alert(data.error);

                return;
            }

            if (!data.table) {

                console.log("No table data");

                return;
            }

            renderAnalysisTable(
                data.table
            );

            updateAnalysisStats(
                data.stats
            );


        }

        catch (error) {

            console.log(error);
        }
    }
);

function renderAnalysisTable(rows) {

    const table =
        document.getElementById(
            "analysisTable"
        );

    // CREATE TABLE ONLY ONCE
    if (!table.querySelector("table")) {

        table.innerHTML = `

        <table class="w-full text-left border-separate border-spacing-y-2">

            <thead>

                <tr class="text-slate-400 text-[12px]">

                    <th>Age</th>
                    <th>Income</th>
                    <th>Family</th>
                    <th>CCAvg</th>
                    <th>Education</th>
                    <th>Mortgage</th>
                    <th>CD</th>
                    <th>Online</th>
                    <th>Loan</th>

                </tr>

            </thead>

            <tbody id="analysisTableBody">

            </tbody>

        </table>
        `;
    }

    const tbody =
        document.getElementById(
            "analysisTableBody"
        );

    tbody.innerHTML = "";

    if (rows.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9"
                    class="text-center p-6 text-slate-500">
                    No matching rows found
                </td>
            </tr>
        `;

        return;
    }

    rows.forEach(row => {

        tbody.innerHTML += `

        <tr class="bg-[#0b1326] text-[12px]">

            <td class="p-3 rounded-l-xl">
                ${row.Age}
            </td>

            <td>${row.Income}</td>

            <td>${row.Family}</td>

            <td>${row.CCAvg}</td>

            <td>${row.Education}</td>

            <td>${row.Mortgage}</td>

            <td>
                ${row["CD Account"]}
            </td>

            <td>${row.Online}</td>

            <td class="rounded-r-xl">

                <span class="
                    px-3 py-1 rounded-full
                    ${row["Personal Loan"] === 1
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"}
                ">

                    ${row["Personal Loan"] === 1
                ? "Approved"
                : "Rejected"}

                </span>

            </td>

        </tr>
        `;
    });
}

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

    // =====================
    // EDUCATION COUNTS
    // =====================

    const total =
        stats.education_counts.edu1 +
        stats.education_counts.edu2 +
        stats.education_counts.edu3;

    const edu1Width =
        (stats.education_counts.edu1 / total) * 100;

    const edu2Width =
        (stats.education_counts.edu2 / total) * 100;

    const edu3Width =
        (stats.education_counts.edu3 / total) * 100;

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
