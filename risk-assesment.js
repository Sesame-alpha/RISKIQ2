/* =========================================================
   RISK IQ
   BORROWER RISK ENGINE
   ========================================================= */


/* ================= SIDEBAR ================= */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("collapsed");

    document
        .querySelector(".main")
        .classList.toggle("collapsed");

}


/* =========================================================
   RISK IQ RULES

   Total = 100 points

   1. Repayment Behaviour = 25
   2. Debt Behaviour = 20
   3. Previous Loan History = 20
   4. Affordability = 20
   5. Income Stability = 15

   TOTAL = 100
   ========================================================= */


/* ================= MAIN ASSESSMENT ================= */

document
    .getElementById("riskForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        calculateRisk();

    });


function calculateRisk() {


    /* ================= GET VALUES ================= */

    const income =
        Number(
            document.getElementById("income").value
        );

    const expenses =
        Number(
            document.getElementById("expenses").value
        );

    const debt =
        Number(
            document.getElementById("debt").value
        );

    const previousLoans =
        Number(
            document.getElementById("previousLoans").value
        );

    const latePayments =
        Number(
            document.getElementById("latePayments").value
        );

    const defaults =
        Number(
            document.getElementById("defaults").value
        );

    const loanAmount =
        Number(
            document.getElementById("loanAmount").value
        );

    const incomeStability =
        document.getElementById(
            "incomeStability"
        ).value;

    const employment =
        document.getElementById(
            "employmentStatus"
        ).value;


    /* ================= VALIDATION ================= */

    if (
        income <= 0 ||
        loanAmount <= 0
    ) {

        alert(
            "Please enter a valid income and loan amount."
        );

        return;

    }


    /* =====================================================
       1. REPAYMENT BEHAVIOUR
       MAXIMUM = 25
       ===================================================== */

    let repaymentScore = 25;

    const repaymentReasons = [];


    if (latePayments === 0) {

        repaymentScore = 25;

        repaymentReasons.push(
            "No late payments were recorded, indicating strong repayment behaviour."
        );

    }

    else if (latePayments <= 2) {

        repaymentScore = 18;

        repaymentReasons.push(
            "The borrower has a small number of late payments."
        );

    }

    else if (latePayments <= 5) {

        repaymentScore = 10;

        repaymentReasons.push(
            "Several late payments increase repayment risk."
        );

    }

    else {

        repaymentScore = 4;

        repaymentReasons.push(
            "Frequent late payments indicate elevated repayment risk."
        );

    }


    /* =====================================================
       2. DEBT BEHAVIOUR
       MAXIMUM = 20
       ===================================================== */

    let debtScore = 20;

    const debtReasons = [];


    const debtRatio =
        debt / income;


    if (debtRatio <= 0.20) {

        debtScore = 20;

        debtReasons.push(
            "Existing debt obligations are relatively low compared with income."
        );

    }

    else if (debtRatio <= 0.35) {

        debtScore = 15;

        debtReasons.push(
            "Debt obligations are moderate relative to income."
        );

    }

    else if (debtRatio <= 0.50) {

        debtScore = 9;

        debtReasons.push(
            "Debt obligations are becoming significant relative to income."
        );

    }

    else {

        debtScore = 3;

        debtReasons.push(
            "High existing debt obligations increase financial pressure."
        );

    }


    /* =====================================================
       3. PREVIOUS LOAN HISTORY
       MAXIMUM = 20
       ===================================================== */

    let historyScore = 20;

    const historyReasons = [];


    if (defaults > 0) {

        historyScore -=
            Math.min(defaults * 7, 17);

        historyReasons.push(
            `${defaults} previous default(s) negatively affect the borrower's history.`
        );

    }

    else if (previousLoans > 0) {

        historyScore = 18;

        historyReasons.push(
            "The borrower has previous loan experience without recorded defaults."
        );

    }

    else {

        historyScore = 15;

        historyReasons.push(
            "The borrower has limited or no previous loan history."
        );

    }


    if (historyScore < 0) {
        historyScore = 0;
    }


    /* =====================================================
       4. AFFORDABILITY
       MAXIMUM = 20
       ===================================================== */

    let affordabilityScore = 20;

    const affordabilityReasons = [];


    const disposableIncome =
        income - expenses - debt;


    const estimatedLoanBurden =
        loanAmount / income;


    if (
        disposableIncome > 0 &&
        estimatedLoanBurden <= 1
    ) {

        affordabilityScore = 20;

        affordabilityReasons.push(
            "The borrower's income appears sufficient to support the requested loan."
        );

    }

    else if (
        disposableIncome > 0 &&
        estimatedLoanBurden <= 2
    ) {

        affordabilityScore = 15;

        affordabilityReasons.push(
            "The loan appears potentially affordable but should be monitored."
        );

    }

    else if (disposableIncome > 0) {

        affordabilityScore = 9;

        affordabilityReasons.push(
            "The requested loan is relatively large compared with the borrower's income."
        );

    }

    else {

        affordabilityScore = 3;

        affordabilityReasons.push(
            "Current expenses and debt obligations exceed available income."
        );

    }


    /* =====================================================
       5. INCOME STABILITY
       MAXIMUM = 15
       ===================================================== */

    let incomeScore = 0;

    const incomeReasons = [];


    if (incomeStability === "stable") {

        incomeScore = 15;

        incomeReasons.push(
            "Stable income provides stronger repayment capacity."
        );

    }

    else if (incomeStability === "moderate") {

        incomeScore = 10;

        incomeReasons.push(
            "Moderate income stability introduces some repayment uncertainty."
        );

    }

    else if (incomeStability === "unstable") {

        incomeScore = 5;

        incomeReasons.push(
            "Unstable income increases repayment uncertainty."
        );

    }

    else {

        incomeScore = 5;

        incomeReasons.push(
            "Income stability information is limited."
        );

    }


    /* =====================================================
       FINAL SCORE
       ===================================================== */

    let totalScore =
        repaymentScore +
        debtScore +
        historyScore +
        affordabilityScore +
        incomeScore;


    /* Keep score between 0 and 100 */

    totalScore =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(totalScore)
            )
        );


    /* =====================================================
       RISK CATEGORY
       ===================================================== */

    let risk;
    let recommendation;


    if (totalScore >= 75) {

        risk = "LOW RISK";

        recommendation =
            "Recommended for consideration, subject to lender policy and verification.";

    }

    else if (totalScore >= 50) {

        risk = "MEDIUM RISK";

        recommendation =
            "Consider with additional review, verification or appropriate lending controls.";

    }

    else {

        risk = "HIGH RISK";

        recommendation =
            "Further review is recommended before making a lending decision.";

    }


    /* =====================================================
       UPDATE SCORE
       ===================================================== */

    updateScore(
        totalScore,
        risk,
        recommendation
    );


    /* =====================================================
       UPDATE BREAKDOWN
       ===================================================== */

    updateFactor(
        "repaymentScore",
        "repaymentBar",
        repaymentScore,
        25
    );


    updateFactor(
        "debtScore",
        "debtBar",
        debtScore,
        20
    );


    updateFactor(
        "historyScore",
        "historyBar",
        historyScore,
        20
    );


    updateFactor(
        "affordabilityScore",
        "affordabilityBar",
        affordabilityScore,
        20
    );


    updateFactor(
        "incomeScore",
        "incomeBar",
        incomeScore,
        15
    );


    /* =====================================================
       REASONING
       ===================================================== */

    const allReasons = [

        ...repaymentReasons,
        ...debtReasons,
        ...historyReasons,
        ...affordabilityReasons,
        ...incomeReasons

    ];


    displayReasoning(
        allReasons
    );


}


/* =========================================================
   SCORE DISPLAY
   ========================================================= */

function updateScore(
    score,
    risk,
    recommendation
) {


    document
        .getElementById("riskScore")
        .textContent = score;


    const status =
        document.getElementById(
            "riskStatus"
        );


    status.textContent = risk;


    const recommendationBox =
        document.getElementById(
            "recommendation"
        );


    recommendationBox.innerHTML = `

        <i class="fa-solid fa-lightbulb"></i>

        <div>

            <strong>
                ${risk}
            </strong>

            <p>
                ${recommendation}
            </p>

        </div>

    `;


    /* Score circle */

    const circle =
        document.querySelector(
            ".score-circle"
        );


    const degrees =
        (score / 100) * 360;


    circle.style.background = `
        conic-gradient(
            var(--gold) 0deg,
            var(--burgundy) ${degrees}deg,
            #eee ${degrees}deg
        )
    `;


    /* Status styling */

    if (score >= 75) {

        status.style.background =
            "#edf7f1";

        status.style.color =
            "var(--green)";

    }

    else if (score >= 50) {

        status.style.background =
            "#faf5dc";

        status.style.color =
            "#9a7a00";

    }

    else {

        status.style.background =
            "#faeeee";

        status.style.color =
            "var(--red)";

    }

}


/* =========================================================
   FACTOR DISPLAY
   ========================================================= */

function updateFactor(
    scoreId,
    barId,
    score,
    maximum
) {


    const percentage =
        Math.round(
            (score / maximum) * 100
        );


    document
        .getElementById(scoreId)
        .textContent =
        `${score}/${maximum}`;


    document
        .getElementById(barId)
        .style.width =
        `${percentage}%`;

}


/* =========================================================
   RISK REASONING
   ========================================================= */

function displayReasoning(
    reasons
) {


    const container =
        document.getElementById(
            "reasoning"
        );


    container.innerHTML = "";


    reasons.forEach(
        function(reason) {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "reasoning-item";


            item.innerHTML = `

                <i class="fa-solid fa-circle-check"></i>

                <p>
                    ${reason}
                </p>

            `;


            container.appendChild(
                item
            );

        }
    );

}
