
// ======================================
// SUPABASE CONNECTION
// ======================================

const SUPABASE_URL = "https://uisixbwpukpyyczwummd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7GUhggQUBgBp1R_QgH3KTg_GMfPwWrT";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ======================================
// GET HTML ELEMENTS
// ======================================

const auditionForm = document.getElementById("auditionForm");
const auditionConfirmation = document.getElementById("auditionConfirmation");
const confirmationSummary = document.getElementById("confirmationSummary");
const submitAnotherBtn = document.getElementById("submitAnotherBtn");


// ======================================
// SUBMIT AUDITION
// ======================================

auditionForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    // Check required fields
    if (!auditionForm.checkValidity()) {
        auditionForm.reportValidity();
        return;
    }

    // Get selected category
    const selectedCategory = document.querySelector(
        'input[name="category"]:checked'
    );

    if (!selectedCategory) {
        alert("Please select an idol category.");
        return;
    }

    // Get selected skills
    const selectedSkills = Array.from(
        document.querySelectorAll('input[name="skills"]:checked')
    ).map(skill => skill.value);

// Collect application information
const application = {
    creator_name: document.getElementById("creatorName").value.trim(),
    creator_email: document.getElementById("creatorEmail").value.trim(),
    oc_name: document.getElementById("ocName").value.trim(),
    age_range: document.getElementById("ageRange").value,
    nationality: document.getElementById("nationality").value.trim(),
    category: selectedCategory.value,
    skills: selectedSkills,
    character_lore: document.getElementById("characterLore").value.trim(),
    reference_link: document.getElementById("referenceLink").value.trim(),
    creator_message: document.getElementById("creatorMessage").value.trim()
};

    // Get submit button
    const submitButton = auditionForm.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    // Prevent duplicate submissions
    if (submitButton && submitButton.disabled) {
        return;
    }

    const originalButtonText = submitButton
        ? (submitButton.tagName === "INPUT"
            ? submitButton.value
            : submitButton.textContent)
        : "";

    if (submitButton) {
        submitButton.disabled = true;

        if (submitButton.tagName === "INPUT") {
            submitButton.value = "Submitting...";
        } else {
            submitButton.textContent = "Submitting...";
        }
    }

    try {

        // Save application to Supabase
        const { error } = await supabaseClient
            .from("audition_applications")
            .insert([application]);

        if (error) {
            throw error;
        }

        // Show confirmation only after successful saving
        confirmationSummary.textContent =
            "Thank you, " + application.creator_name +
            "! Your application for " + application.oc_name +
            " has been successfully received by STARDUST ENTERTAINMENT. " +
            "Our team will review your submission.";

        auditionForm.hidden = true;
        auditionConfirmation.hidden = false;

        auditionConfirmation.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {

        console.error("Supabase submission error:", error);

        alert(
            "Submission Error: " +
            (error.message || "Unknown error") +
            (error.details ? "\nDetails: " + error.details : "") +
            (error.hint ? "\nHint: " + error.hint : "")
        );

    } finally {

        // Restore button
        if (submitButton) {
            submitButton.disabled = false;

            if (submitButton.tagName === "INPUT") {
                submitButton.value = originalButtonText;
            } else {
                submitButton.textContent = originalButtonText;
            }
        }

    }

});


// ======================================
// SUBMIT ANOTHER AUDITION
// ======================================

submitAnotherBtn.addEventListener("click", function() {

    // Reset all form fields
    auditionForm.reset();

    // Hide confirmation
    auditionConfirmation.hidden = true;

    // Show audition form again
    auditionForm.hidden = false;

    // Return to the form
    auditionForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});
