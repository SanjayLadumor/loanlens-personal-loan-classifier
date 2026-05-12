
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
            gap:6px;
            min-height:28px;
            width:100%;
        ">

            <!-- WATERFALL VALUES -->
            <div style="
                width:115px;
                text-align:right;
                font-size:12px;
                color:#94a3b8;
                font-family:monospace;
                flex-shrink:0;
            ">

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
                width:165px;
                text-align:right;
                font-size:12px;
                flex-shrink:0;
            ">

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
                flex:1;
                height:14px;
                background:#121c38;
                border-radius:999px;
                overflow:hidden;
                position:relative;
                min-width:200px;
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

    catch(error) {

        console.log(error);

        alert("Prediction failed");
    }

});
