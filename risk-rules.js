import { supabase } from "./supabase.js";


/* =====================================================
   RISKIQ RISK MODEL
   ===================================================== */

const DEFAULT_RULES = {

    repayment_weight: 30,

    previous_loan_weight: 20,

    debt_weight: 25,

    affordability_weight: 15,

    income_stability_weight: 10,

    maximum_dti: 60,

    minimum_approval_score: 75

};


/* =====================================================
   ELEMENTS
   ===================================================== */

const repayment =
    document.getElementById("repaymentWeight");

const previousLoan =
    document.getElementById("previousLoanWeight");

const debt =
    document.getElementById("debtWeight");

const affordability =
    document.getElementById("affordabilityWeight");

const income =
    document.getElementById("incomeStabilityWeight");

const maximumDti =
    document.getElementById("maximumDti");

const minimumScore =
    document.getElementById("minimumApprovalScore");

const total =
    document.getElementById("totalWeight");

const message =
    document.getElementById("weightMessage");

const saveButton =
    document.getElementById("saveButton");

const resetButton =
    document.getElementById("resetButton");

const saveMessage =
    document.getElementById("saveMessage");


/* =====================================================
   PROGRESS BARS
   ===================================================== */

function updateBars() {

    document.getElementById("repaymentBar")
        .style.width = `${repayment.value}%`;

    document.getElementById("previousLoanBar")
        .style.width = `${previousLoan.value}%`;

    document.getElementById("debtBar")
        .style.width = `${debt.value}%`;

    document.getElementById("affordabilityBar")
        .style.width = `${affordability.value}%`;

    document.getElementById("incomeBar")
        .style.width = `${income.value}%`;
}


/* =====================================================
   VALIDATE WEIGHTS
   ===================================================== */

function validateWeights() {

    const weightTotal =

        Number(repayment.value) +

        Number(previousLoan.value) +

        Number(debt.value) +

        Number(affordability.value) +

        Number(income.value);


    total.textContent =
        `${weightTotal}%`;


    if (weightTotal === 100) {

        message.textContent =
            "✓ Risk model is correctly balanced.";

        message.style.color =
            "#2E7D5B";

        saveButton.disabled = false;

    } else {

        message.textContent =
            `Risk weights must equal 100%. Current total: ${weightTotal}%`;

        message.style.color =
            "#B84040";

        saveButton.disabled = true;

    }

    updateBars();

    return weightTotal;
}


/* =====================================================
   GET CURRENT RULES
   ===================================================== */

function getRules() {

    return {

        repayment_weight:
            Number(repayment.value),

        previous_loan_weight:
            Number(previousLoan.value),

        debt_weight:
            Number(debt.value),

        affordability_weight:
            Number(affordability.value),

        income_stability_weight:
            Number(income.value),

        maximum_dti:
            Number(maximumDti.value),

        minimum_approval_score:
            Number(minimumScore.value)

    };

}


/* =====================================================
   LOAD RULES FROM SUPABASE
   ===================================================== */

async function loadRules() {

    saveMessage.textContent =
        "Loading your risk model...";


    /*
       For the demo we use the newest rule record.

       Later, when authentication and organizations
       are connected, this query will use:

       organization_id = loggedInOrganization
    */

    const { data, error } = await supabase

        .from("risk_rules")

        .select("*")

        .order("created_at", {
            ascending: false
        })

        .limit(1)
        .maybeSingle();


    if (error) {

        console.error(
            "Could not load risk rules:",
            error
        );

        saveMessage.textContent =
            "Using default RISKIQ rules.";

        return;

    }


    if (!data) {

        saveMessage.textContent =
            "Default RISKIQ model active.";

        return;

    }


    repayment.value =
        data.repayment_weight;

    previousLoan.value =
        data.previous_loan_weight;

    debt.value =
        data.debt_weight;

    affordability.value =
        data.affordability_weight;

    income.value =
        data.income_stability_weight;

    maximumDti.value =
        data.maximum_dti;

    minimumScore.value =
        data.minimum_approval_score;


    validateWeights();


    saveMessage.textContent =
        "✓ Current risk model loaded.";

}


/* =====================================================
   SAVE RULES
   ===================================================== */

async function saveRules() {

    const weightTotal =
        validateWeights();


    if (weightTotal !== 100) {

        return;

    }


    saveButton.disabled = true;

    saveMessage.textContent =
        "Saving risk model...";


    const rules =
        getRules();


    const { error } = await supabase

        .from("risk_rules")

        .insert([rules]);


    if (error) {

        console.error(error);

        saveMessage.textContent =
            "Unable to save risk rules.";

        saveButton.disabled = false;

        return;

    }


    saveMessage.textContent =
        "✓ Risk model saved successfully.";

    saveButton.disabled = false;


    console.log(
        "RISKIQ rules updated:",
        rules
    );

}


/* =====================================================
   RESET
   ===================================================== */

function resetRules() {

    repayment.value =
        DEFAULT_RULES.repayment_weight;

    previousLoan.value =
        DEFAULT_RULES.previous_loan_weight;

    debt.value =
        DEFAULT_RULES.debt_weight;

    affordability.value =
        DEFAULT_RULES.affordability_weight;

    income.value =
        DEFAULT_RULES.income_stability_weight;

    maximumDti.value =
        DEFAULT_RULES.maximum_dti;

    minimumScore.value =
        DEFAULT_RULES.minimum_approval_score;


    validateWeights();


    saveMessage.textContent =
        "Default RISKIQ model restored.";

}


/* =====================================================
   EVENTS
   ===================================================== */

[
    repayment,
    previousLoan,
    debt,
    affordability,
    income
].forEach(input => {

    input.addEventListener(
        "input",
        validateWeights
    );

});


saveButton.addEventListener(
    "click",
    saveRules
);


resetButton.addEventListener(
    "click",
    resetRules
);


/* =====================================================
   START
   ===================================================== */

validateWeights();

loadRules();
