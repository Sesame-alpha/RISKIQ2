/* =========================================================
   RISK IQ - CUSTOM RISK RULE ENGINE
   ========================================================= */

/*
    DEFAULT RULES

    These are only demo rules.

    A lender can later create their own rules from the UI.
*/

let riskRules = [

    {
        id: crypto.randomUUID(),
        name: "Repayment Behaviour",
        factor: "repayment",
        weight: 30,
        condition: "positive",
        description:
            "Borrowers with strong repayment behaviour receive a better risk score.",
        active: true
    },

    {
        id: crypto.randomUUID(),
        name: "Debt-to-Income Ratio",
        factor: "debt",
        weight: 25,
        condition: "positive",
        description:
            "Lower debt relative to income indicates stronger repayment capacity.",
        active: true
    },

    {
        id: crypto.randomUUID(),
        name: "Previous Loan History",
        factor: "previousLoans",
        weight: 20,
        condition: "positive",
        description:
            "Previous successful loan performance contributes positively to the score.",
        active: true
    },

    {
        id: crypto.randomUUID(),
        name: "Affordability",
        factor: "affordability",
        weight: 15,
        condition: "positive",
        description:
            "Measures whether the borrower can reasonably afford the requested loan.",
        active: true
    },

    {
        id: crypto.randomUUID(),
        name: "Income Stability",
        factor: "income",
        weight: 10,
        condition: "positive",
        description:
            "Stable and predictable income contributes to a stronger risk profile.",
        active: true
    }

];


/* =========================================================
   ELEMENTS
   ========================================================= */

const rulesContainer =
    document.getElementById("rulesContainer");

const emptyState =
    document.getElementById("emptyState");

const ruleCount =
    document.getElementById("ruleCount");

const modal =
    document.getElementById("ruleModal");

const addRuleBtn =
    document.getElementById("addRuleBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelBtn =
    document.getElementById("cancelBtn");

const ruleForm =
    document.getElementById("ruleForm");


/* =========================================================
   LOAD RULES
   ========================================================= */

function loadRules() {

    const savedRules =
        localStorage.getItem("riskiq_rules");

    if (savedRules) {

        try {

            riskRules = JSON.parse(savedRules);

        } catch (error) {

            console.error(
                "Could not load saved rules.",
                error
            );

        }

    }

    renderRules();
}


/* =========================================================
   SAVE RULES
   ========================================================= */

function saveRules() {

    localStorage.setItem(
        "riskiq_rules",
        JSON.stringify(riskRules)
    );

}


/* =========================================================
   RENDER RULES
   ========================================================= */

function renderRules() {

    rulesContainer.innerHTML = "";

    const activeRules =
        riskRules.filter(rule => rule.active);

    ruleCount.textContent =
        activeRules.length;


    if (riskRules.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";


    riskRules.forEach(rule => {

        const card =
            document.createElement("div");

        card.className = "rule-card";


        card.innerHTML = `

            <div class="rule-top">

                <div class="rule-icon">

                    <i class="${getRuleIcon(rule.factor)}"></i>

                </div>

                <div class="rule-actions">

                    <button
                        title="Enable / Disable"
                        onclick="toggleRule('${rule.id}')"
                    >

                        <i class="fa-solid fa-power-off"></i>

                    </button>

                    <button
                        title="Edit"
                        onclick="editRule('${rule.id}')"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        title="Delete"
                        onclick="deleteRule('${rule.id}')"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>


            <h3>
                ${escapeHTML(rule.name)}
            </h3>


            <p>
                ${escapeHTML(rule.description || "No description provided.")}
            </p>


            <div class="rule-meta">

                <div class="rule-weight">

                    ${rule.weight}%

                    <small>
                        weight
                    </small>

                </div>


                <span class="rule-status"
                    style="
                        ${
                            rule.active
                                ? ""
                                : "background:#f7eeee;color:#B84040;"
                        }
                    "
                >

                    ${
                        rule.active
                            ? "ACTIVE"
                            : "DISABLED"
                    }

                </span>

            </div>

        `;


        rulesContainer.appendChild(card);

    });

}


/* =========================================================
   RULE ICONS
   ========================================================= */

function getRuleIcon(factor) {

    const icons = {

        repayment:
            "fa-solid fa-money-check-dollar",

        debt:
            "fa-solid fa-scale-balanced",

        previousLoans:
            "fa-solid fa-clock-rotate-left",

        affordability:
            "fa-solid fa-wallet",

        income:
            "fa-solid fa-chart-line",

        employment:
            "fa-solid fa-briefcase"

    };

    return icons[factor]
        || "fa-solid fa-sliders";

}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openRuleModal() {

    ruleForm.reset();

    ruleForm.dataset.editing =
        "";

    modal.classList.add("active");

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeRuleModal() {

    modal.classList.remove("active");

    ruleForm.reset();

    ruleForm.dataset.editing =
        "";

}


/* =========================================================
   ADD BUTTON
   ========================================================= */

addRuleBtn.addEventListener(
    "click",
    openRuleModal
);

closeModal.addEventListener(
    "click",
    closeRuleModal
);

cancelBtn.addEventListener(
    "click",
    closeRuleModal
);


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

modal.addEventListener(
    "click",
    event => {

        if (
            event.target === modal
        ) {

            closeRuleModal();

        }

    }
);


/* =========================================================
   CREATE / UPDATE RULE
   ========================================================= */

ruleForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document.getElementById(
                "ruleName"
            ).value.trim();


        const factor =
            document.getElementById(
                "ruleFactor"
            ).value;


        const weight =
            Number(
                document.getElementById(
                    "ruleWeight"
                ).value
            );


        const condition =
            document.getElementById(
                "ruleCondition"
            ).value;


        const description =
            document.getElementById(
                "ruleDescription"
            ).value.trim();


        if (!name || !factor || !weight) {

            alert(
                "Please complete all required fields."
            );

            return;

        }


        /*
            IMPORTANT:

            All active rule weights should ideally
            add up to 100%.
        */

        const editingId =
            ruleForm.dataset.editing;


        if (editingId) {

            const rule =
                riskRules.find(
                    r => r.id === editingId
                );


            if (rule) {

                rule.name =
                    name;

                rule.factor =
                    factor;

                rule.weight =
                    weight;

                rule.condition =
                    condition;

                rule.description =
                    description;

            }

        } else {

            riskRules.push({

                id:
                    crypto.randomUUID(),

                name,

                factor,

                weight,

                condition,

                description,

                active: true

            });

        }


        saveRules();

        renderRules();

        closeRuleModal();

    }
);


/* =========================================================
   EDIT RULE
   ========================================================= */

window.editRule = function(id) {

    const rule =
        riskRules.find(
            r => r.id === id
        );

    if (!rule) return;


    document.getElementById(
        "ruleName"
    ).value = rule.name;


    document.getElementById(
        "ruleFactor"
    ).value = rule.factor;


    document.getElementById(
        "ruleWeight"
    ).value = rule.weight;


    document.getElementById(
        "ruleCondition"
    ).value = rule.condition;


    document.getElementById(
        "ruleDescription"
    ).value =
        rule.description || "";


    ruleForm.dataset.editing =
        rule.id;


    modal.classList.add("active");

};


/* =========================================================
   ENABLE / DISABLE
   ========================================================= */

window.toggleRule = function(id) {

    const rule =
        riskRules.find(
            r => r.id === id
        );

    if (!rule) return;


    rule.active =
        !rule.active;


    saveRules();

    renderRules();

};


/* =========================================================
   DELETE
   ========================================================= */

window.deleteRule = function(id) {

    const rule =
        riskRules.find(
            r => r.id === id
        );

    if (!rule) return;


    const confirmed =
        confirm(
            `Delete "${rule.name}"?`
        );


    if (!confirmed) return;


    riskRules =
        riskRules.filter(
            r => r.id !== id
        );


    saveRules();

    renderRules();

};


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   RISK SCORE ENGINE
   =========================================================

   This is the part your Risk Assessment page
   can eventually use.

   It accepts a borrower object and calculates
   a score from 0-100.

   75-100 = LOW RISK
   50-74  = MEDIUM RISK
   0-49   = HIGH RISK
   ========================================================= */

function calculateRiskScore(borrower) {

    let score = 50;

    const activeRules =
        riskRules.filter(
            rule => rule.active
        );


    activeRules.forEach(rule => {

        const result =
            evaluateRule(
                rule,
                borrower
            );


        /*
            Each rule influences the score
            according to its configured weight.
        */

        const influence =
            rule.weight / 100 * 50;


        if (result === true) {

            score += influence;

        } else if (result === false) {

            score -= influence;

        }

    });


    score =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(score)
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

        risk

    };

}


/* =========================================================
   RULE EVALUATION
   ========================================================= */

function evaluateRule(rule, borrower) {

    switch (rule.factor) {

        case "repayment":

            return (
                Number(
                    borrower.latePayments || 0
                ) === 0
            );


        case "debt":

            if (!borrower.monthlyIncome) {
                return null;
            }

            const debtRatio =
                (
                    Number(
                        borrower.monthlyDebt || 0
                    )
                    /
                    Number(
                        borrower.monthlyIncome
                    )
                ) * 100;

            return debtRatio <= 40;


        case "previousLoans":

            return (
                Number(
                    borrower.previousDefaults || 0
                ) === 0
            );


        case "affordability":

            if (!borrower.monthlyIncome) {
                return null;
            }

            const expenses =
                Number(
                    borrower.monthlyExpenses || 0
                );

            const income =
                Number(
                    borrower.monthlyIncome
                );

            return (
                income - expenses > 0
            );


        case "income":

            return (
                borrower.incomeStability ===
                "stable"
            );


        case "employment":

            return (
                Number(
                    borrower.yearsEmployed || 0
                ) >= 2
            );


        default:

            return null;

    }

}


/* =========================================================
   INITIALISE
   ========================================================= */

loadRules();


/*
    Make calculateRiskScore available
    to other JavaScript files.

    Example:

    const result = calculateRiskScore(borrower);

    console.log(result.score);
    console.log(result.risk);
*/

window.calculateRiskScore =
    calculateRiskScore;
