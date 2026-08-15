/* =========================================================
   RISK IQ
   RISK ASSESSMENT ENGINE
   ========================================================= */


/* =========================================================
   DEFAULT RULES
   These can later be loaded from your Risk Rules page.
   ========================================================= */

const DEFAULT_RULES = {

    affordability: {
        weight: 25
    },

    debtBehaviour: {
        weight: 20
    },

    repaymentBehaviour: {
        weight: 25
    },

    incomeStability: {
        weight: 15
    },

    employment: {
        weight: 15
    }

};


/* =========================================================
   LOAD RULES
   If the lender has changed rules in the Risk Rules page,
   those rules will eventually be loaded here.
   ========================================================= */

function getRules() {

    try {

        const savedRules =
            localStorage.getItem("riskiq_rules");

        if (savedRules) {

            return {
                ...DEFAULT_RULES,
                ...JSON.parse(savedRules)
            };

        }

    } catch (error) {

        console.error(
            "Could not load Risk IQ rules:",
            error
        );

    }

    return DEFAULT_RULES;
}


/* =========================================================
   HELPERS
   ========================================================= */

function numberValue(id) {

    const element = document.getElementById(id);

    if (!element) {
        return 0;
    }

    return Number(element.value) || 0;
}


function textValue(id) {

    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value || "";

}


/* =========================================================
   AFFORDABILITY
   ========================================================= */

function calculateAffordability(data) {

    if (data.income <= 0) {

        return {
            score: 0,
            message: "No income information supplied.",
            type: "danger"
        };

    }


    const availableIncome =
        data.income -
        data.expenses -
        data.debt;


    const affordabilityRatio =
        availableIncome / data.income;


    let score;


    if (affordabilityRatio >= 0.50) {

        score = 100;

    } else if (affordabilityRatio >= 0.35) {

        score = 85;

    } else if (affordabilityRatio >= 0.20) {

        score = 70;

    } else if (affordabilityRatio >= 0.10) {

        score = 50;

    } else {

        score = 20;

    }


    let type = "good";

    if (score < 75) {
        type = "warning";
    }

    if (score < 50) {
        type = "danger";
    }


    return {
        score,
        message:
            `Disposable income is P${Math.max(
                availableIncome,
                0
            ).toFixed(2)} per month.`,
        type
    };

}


/* =========================================================
   DEBT BEHAVIOUR
   ========================================================= */

function calculateDebtBehaviour(data) {

    if (data.income <= 0) {

        return {
            score: 0,
            message: "Debt-to-income ratio cannot be calculated.",
            type: "danger"
        };

    }


    const debtRatio =
        data.debt / data.income;


    let score;


    if (debtRatio <= 0.20) {

        score = 100;

    } else if (debtRatio <= 0.35) {

        score = 85;

    } else if (debtRatio <= 0.45) {

        score = 70;

    } else if (debtRatio <= 0.60) {

        score = 50;

    } else {

        score = 20;

    }


    let type = "good";

    if (score < 75) {
        type = "warning";
    }

    if (score < 50) {
        type = "danger";
    }


    return {
        score,
        message:
            `Debt-to-income ratio is ${(debtRatio * 100).toFixed(1)}%.`,
        type
    };

}


/* =========================================================
   REPAYMENT BEHAVIOUR
   ========================================================= */

function calculateRepaymentBehaviour(data) {

    let score = 100;


    /* Late payments */

    score -= data.latePayments * 7;


    /* Defaults are more serious */

    score -= data.previousDefaults * 20;


    /* Keep score within 0-100 */

    score = Math.max(
        0,
        Math.min(100, score)
    );


    let type = "good";

    if (score < 75) {
        type = "warning";
    }

    if (score < 50) {
        type = "danger";
    }


    let message;


    if (data.previousDefaults > 0) {

        message =
            `${data.previousDefaults} previous default(s) recorded.`;

    } else if (data.latePayments > 0) {

        message =
            `${data.latePayments} late payment(s) recorded.`;

    } else {

        message =
            "No late payments or defaults reported.";

    }


    return {
        score,
        message,
        type
    };

}


/* =========================================================
   INCOME STABILITY
   ========================================================= */

function calculateIncomeStability(data) {

    let score = 50;


    if (data.incomeStability === "stable") {

        score = 100;

    } else if (data.incomeStability === "moderate") {

        score = 70;

    } else if (data.incomeStability === "unstable") {

        score = 30;

    }


    let type = "warning";

    if (score >= 75) {
        type = "good";
    }

    if (score < 50) {
        type = "danger";
    }


    return {
        score,
        message:
            data.incomeStability
                ? `Income stability classified as ${data.incomeStability}.`
                : "Income stability was not provided.",
        type
    };

}


/* =========================================================
   EMPLOYMENT
   ========================================================= */

function calculateEmployment(data) {

    let score = 50;


    if (data.employmentStatus === "employed") {

        score = 100;

    } else if (
        data.employmentStatus === "self-employed"
    ) {

        score = 85;

    } else if (
        data.employmentStatus === "business-owner"
    ) {

        score = 85;

    } else if (
        data.employmentStatus === "unemployed"
    ) {

        score = 20;

    }


    if (
        data.yearsEmployed >= 5 &&
        score > 0
    ) {

        score = Math.min(
            100,
            score + 5
        );

    }


    let type = "warning";

    if (score >= 75) {
        type = "good";
    }

    if (score < 50) {
        type = "danger";
    }


    return {
        score,
        message:
            data.employmentStatus
                ? `Employment status: ${data.employmentStatus}.`
                : "Employment information was not provided.",
        type
    };

}


/* =========================================================
   FINAL RISK SCORE
   ========================================================= */

function calculateRisk(data) {

    const rules = getRules();


    const affordability =
        calculateAffordability(data);


    const debtBehaviour =
        calculateDebtBehaviour(data);


    const repaymentBehaviour =
        calculateRepaymentBehaviour(data);


    const incomeStability =
        calculateIncomeStability(data);


    const employment =
        calculateEmployment(data);


    const factors = [

        {
            name: "Affordability",
            ...affordability,
            weight: rules.affordability.weight
        },

        {
            name: "Debt Behaviour",
            ...debtBehaviour,
            weight: rules.debtBehaviour.weight
        },

        {
            name: "Repayment Behaviour",
            ...repaymentBehaviour,
            weight: rules.repaymentBehaviour.weight
        },

        {
            name: "Income Stability",
            ...incomeStability,
            weight: rules.incomeStability.weight
        },

        {
            name: "Employment",
            ...employment,
            weight: rules.employment.weight
        }

    ];


    const totalWeight =
        factors.reduce(
            (sum, factor) =>
                sum + Number(factor.weight),
            0
        );


    let weightedScore =
        factors.reduce(
            (sum, factor) => {

                return sum +
                    (
                        factor.score *
                        Number(factor.weight)
                    );

            },
            0
        );


    weightedScore =
        weightedScore / totalWeight;


    const score =
        Math.round(
            Math.max(
                0,
                Math.min(
                    100,
                    weightedScore
                )
            )
        );


    let risk;


    if (score >= 75) {

        risk = "LOW RISK";

    } else if (score >= 50) {

        risk = "MEDIUM RISK";

    } else {

        risk = "HIGH RISK";

    }


    return {
        score,
        risk,
        factors
    };

}


/* =========================================================
   DECISION
   ========================================================= */

function getDecision(score) {

    if (score >= 75) {

        return "APPROVE";

    }

    if (score >= 50) {

        return "REVIEW";

    }

    return "DECLINE";

}


/* =========================================================
   DESCRIPTION
   ========================================================= */

function getDescription(score) {

    if (score >= 75) {

        return "Borrower demonstrates relatively strong repayment capacity and lower observed risk.";

    }

    if (score >= 50) {

        return "Borrower presents moderate risk and should receive additional review before a final decision.";

    }

    return "Borrower presents elevated risk based on the information supplied.";

}


/* =========================================================
   UPDATE SCORE RING
   ========================================================= */

function updateScoreRing(score) {

    const ring =
        document.getElementById("scoreRing");


    if (!ring) {
        return;
    }


    const degrees =
        (score / 100) * 360;


    ring.style.background =
        `conic-gradient(
            #D4AF37 0deg ${degrees}deg,
            #EEE9E9 ${degrees}deg 360deg
        )`;

}


/* =========================================================
   DISPLAY FACTORS
   ========================================================= */

function displayFactors(factors) {

    const container =
        document.getElementById("riskFactors");


    const count =
        document.getElementById("factorCount");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    factors.forEach(factor => {

        const item =
            document.createElement("div");

        item.className =
            "risk-factor";


        item.innerHTML = `

            <span class="factor-indicator ${factor.type}">
            </span>

            <div>

                <strong>
                    ${factor.name}
                </strong>

                <small>
                    ${factor.message}
                </small>

            </div>

            <strong>
                ${Math.round(factor.score)}
            </strong>

        `;


        container.appendChild(item);

    });


    if (count) {

        count.textContent =
            `${factors.length} factors`;

    }

}


/* =========================================================
   GENERATE REASONING
   ========================================================= */

function generateReasoning(result) {

    const positive =
        result.factors.filter(
            factor => factor.score >= 75
        );


    const negative =
        result.factors.filter(
            factor => factor.score < 50
        );


    let reasoning =
        `Risk IQ generated a score of ${result.score}/100. `;


    if (positive.length > 0) {

        reasoning +=
            `Positive indicators include ${positive
                .map(f => f.name.toLowerCase())
                .join(", ")}. `;

    }


    if (negative.length > 0) {

        reasoning +=
            `The main risk concerns are ${negative
                .map(f => f.name.toLowerCase())
                .join(", ")}. `;

    }


    if (
        positive.length === 0 &&
        negative.length === 0
    ) {

        reasoning +=
            "The borrower presents a mixed risk profile requiring further review.";

    }


    return reasoning;

}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(result) {

    const score =
        document.getElementById("riskScore");

    const level =
        document.getElementById("riskLevel");

    const description =
        document.getElementById("riskDescription");

    const decision =
        document.getElementById("loanDecision");

    const reasoning =
        document.getElementById("riskReasoning");


    if (score) {
        score.textContent =
            result.score;
    }


    if (level) {

        level.textContent =
            result.risk;

    }


    if (description) {

        description.textContent =
            getDescription(result.score);

    }


    if (decision) {

        decision.textContent =
            getDecision(result.score);

    }


    if (reasoning) {

        reasoning.textContent =
            generateReasoning(result);

    }


    updateScoreRing(result.score);

    displayFactors(result.factors);


    /* Risk level styling */

    if (level) {

        level.classList.remove(
            "low-risk",
            "medium-risk",
            "high-risk"
        );


        if (result.score >= 75) {

            level.classList.add(
                "low-risk"
            );

        } else if (result.score >= 50) {

            level.classList.add(
                "medium-risk"
            );

        } else {

            level.classList.add(
                "high-risk"
            );

        }

    }

}


/* =========================================================
   COLLECT FORM DATA
   ========================================================= */

function collectData() {

    return {

        fullName:
            textValue("fullName"),

        omang:
            textValue("omang"),

        employmentStatus:
            textValue("employmentStatus"),

        yearsEmployed:
            numberValue("yearsEmployed"),

        income:
            numberValue("monthlyIncome"),

        expenses:
            numberValue("monthlyExpenses"),

        debt:
            numberValue("monthlyDebt"),

        incomeStability:
            textValue("incomeStability"),

        previousLoans:
            numberValue("previousLoans"),

        latePayments:
            numberValue("latePayments"),

        previousDefaults:
            numberValue("previousDefaults"),

        loanAmount:
            numberValue("loanAmount")

    };

}


/* =========================================================
   FORM SUBMISSION
   ========================================================= */

const form =
    document.getElementById(
        "riskAssessmentForm"
    );


if (form) {

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const data =
                collectData();


            if (data.income <= 0) {

                alert(
                    "Please enter the borrower's monthly income."
                );

                return;

            }


            if (data.loanAmount <= 0) {

                alert(
                    "Please enter the requested loan amount."
                );

                return;

            }


            const result =
                calculateRisk(data);


            displayResult(result);

        }
    );

}


/* =========================================================
   SIDEBAR
   ========================================================= */

const sidebarToggle =
    document.getElementById(
        "sidebarToggle"
    );


if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        function() {

            const sidebar =
                document.getElementById(
                    "sidebar"
                );

            const main =
                document.getElementById(
                    "main"
                );


            sidebar.classList.toggle(
                "collapsed"
            );


            main.classList.toggle(
                "collapsed"
            );

        }
    );

}
