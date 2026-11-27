
// ======================================
// STARDUST ENTERTAINMENT
// ADMIN DASHBOARD
// SUPABASE VERSION
// APPLICATIONS + NEWS + CALENDAR MANAGEMENT
// ======================================

const SUPABASE_URL =
    "https://uisixbwpukpyyczwummd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7GUhggQUBgBp1R_QgH3KTg_GMfPwWrT";

const ADMIN_EMAIL =
    "stardust.entertainmentjpn@gmail.com";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// ======================================
// GET HTML ELEMENTS
// ======================================

const loginSection = document.getElementById("loginSection");
const adminContainer = document.getElementById("adminContainer");
const reviewPage = document.getElementById("reviewPage");

const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

const applicationsList = document.getElementById("applicationsList");
const searchInput = document.getElementById("searchApplications");
const filterStatus = document.getElementById("filterStatus");

const reviewContent = document.getElementById("reviewContent");

const applicationsPanel =
    document.getElementById("applicationsPanel");

const newsPanel =
    document.getElementById("newsPanel");

const calendarPanel =
    document.getElementById("calendarPanel");

const applicationsTab =
    document.getElementById("applicationsTab");

const newsTab =
    document.getElementById("newsTab");

const calendarTab =
    document.getElementById("calendarTab");

// NEWS ELEMENTS

const newsForm =
    document.getElementById("newsForm");

const newsList =
    document.getElementById("newsList");

const newsMessage =
    document.getElementById("newsMessage");

const newsId =
    document.getElementById("newsId");

const newsTitle =
    document.getElementById("newsTitle");

const newsCategory =
    document.getElementById("newsCategory");

const newsPublishDate =
    document.getElementById("newsPublishDate");

const newsContent =
    document.getElementById("newsContent");

const searchNews =
    document.getElementById("searchNews");

const filterNewsStatus =
    document.getElementById("filterNewsStatus");

const newsFormHeading =
    document.getElementById("newsFormHeading");

const saveDraftButton =
    document.getElementById("saveDraftButton");

const publishNewsButton =
    document.getElementById("publishNewsButton");

const cancelNewsEdit =
    document.getElementById("cancelNewsEdit");

// CALENDAR ELEMENTS

const eventForm =
    document.getElementById("eventForm");

const eventsList =
    document.getElementById("eventsList");

const eventMessage =
    document.getElementById("eventMessage");

const eventId =
    document.getElementById("eventId");

const eventTitle =
    document.getElementById("eventTitle");

const eventCategory =
    document.getElementById("eventCategory");

const eventDate =
    document.getElementById("eventDate");

const eventDescription =
    document.getElementById("eventDescription");

const eventFormHeading =
    document.getElementById("eventFormHeading");

const savePendingEvent =
    document.getElementById("savePendingEvent");

const publishEvent =
    document.getElementById("publishEvent");

const cancelEventEdit =
    document.getElementById("cancelEventEdit");

const searchEvents =
    document.getElementById("searchEvents");

const filterEventStatus =
    document.getElementById("filterEventStatus");

// DATA

let applications = [];
let announcements = [];
let calendarEvents = [];

let currentApplicationId = null;


// ======================================
// LOGIN
// ======================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
        document.getElementById("adminEmail").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {

        loginMessage.textContent =
            "This account is not authorized.";

        return;
    }

    loginMessage.textContent = "Logging in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {

        loginMessage.textContent = error.message;

        return;
    }

    if (
        !data.user ||
        data.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
    ) {

        await supabaseClient.auth.signOut();

        loginMessage.textContent =
            "This account is not authorized.";

        return;
    }

    loginMessage.textContent = "";

    await showDashboard();

});


// ======================================
// CHECK EXISTING LOGIN
// ======================================

async function checkAdminLogin() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error || !data.session) {

        showLogin();

        return;
    }

    const email = data.session.user.email;

    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {

        await supabaseClient.auth.signOut();

        showLogin();

        return;
    }

    await showDashboard();

}


// ======================================
// SHOW LOGIN
// ======================================

function showLogin() {

    loginSection.classList.remove("hidden");

    adminContainer.classList.add("hidden");

    reviewPage.classList.add("hidden");

}


// ======================================
// SHOW DASHBOARD
// ======================================

async function showDashboard() {

    loginSection.classList.add("hidden");

    reviewPage.classList.add("hidden");

    adminContainer.classList.remove("hidden");

    showApplicationsPanel();

    await Promise.all([
        loadApplications(),
        loadNews(),
        loadEvents()
    ]);

}


// ======================================
// DASHBOARD NAVIGATION
// ======================================

function showApplicationsPanel() {

    applicationsPanel.classList.remove("hidden");

    newsPanel.classList.add("hidden");

    calendarPanel.classList.add("hidden");

    applicationsTab.classList.add("active");

    newsTab.classList.remove("active");

    calendarTab.classList.remove("active");

}


function showNewsPanel() {

    applicationsPanel.classList.add("hidden");

    newsPanel.classList.remove("hidden");

    calendarPanel.classList.add("hidden");

    applicationsTab.classList.remove("active");

    newsTab.classList.add("active");

    calendarTab.classList.remove("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function showCalendarPanel() {

    applicationsPanel.classList.add("hidden");

    newsPanel.classList.add("hidden");

    calendarPanel.classList.remove("hidden");

    applicationsTab.classList.remove("active");

    newsTab.classList.remove("active");

    calendarTab.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


applicationsTab.addEventListener(
    "click",
    showApplicationsPanel
);

newsTab.addEventListener(
    "click",
    showNewsPanel
);

calendarTab.addEventListener(
    "click",
    showCalendarPanel
);


// ======================================
// LOGOUT
// ======================================

async function logoutAdmin() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {

        alert("Unable to log out: " + error.message);

        return;
    }

    applications = [];

    announcements = [];

    calendarEvents = [];

    currentApplicationId = null;

    applicationsList.replaceChildren();

    reviewContent.replaceChildren();

    newsList.replaceChildren();

    eventsList.replaceChildren();

    resetNewsForm();

    resetEventForm();

    showLogin();

}


document.getElementById("adminLogoutButton")
    .addEventListener("click", logoutAdmin);

document.getElementById("reviewLogoutButton")
    .addEventListener("click", logoutAdmin);


// ======================================
// LOAD APPLICATIONS
// ======================================

async function loadApplications() {

    applicationsList.textContent =
        "Loading applications...";

    const { data, error } = await supabaseClient
        .from("audition_applications")
        .select("*")
        .order("submitted_at", { ascending: false });

    if (error) {

        console.error("Loading error:", error);

        applicationsList.textContent =
            "Unable to load applications: " + error.message;

        return;
    }

    applications = data || [];

    updateStatistics();

    displayApplications();

}


// ======================================
// UPDATE STATISTICS
// ======================================

function updateStatistics() {

    document.getElementById("totalCount").textContent =
        applications.length;

    document.getElementById("pendingCount").textContent =
        applications.filter(app =>
            (app.status || "Pending") === "Pending"
        ).length;

    document.getElementById("acceptedCount").textContent =
        applications.filter(app =>
            app.status === "Accepted"
        ).length;

    document.getElementById("rejectedCount").textContent =
        applications.filter(app =>
            app.status === "Rejected"
        ).length;

}


// ======================================
// CREATE TEXT ELEMENT
// ======================================

function createText(parent, tag, value) {

    const element = document.createElement(tag);

    element.textContent =
        value === null || value === undefined || value === ""
            ? "Not provided"
            : String(value);

    parent.appendChild(element);

    return element;

}


// ======================================
// DISPLAY APPLICATION LIST
// ======================================

function displayApplications() {

    applicationsList.replaceChildren();

    const search =
        searchInput.value.trim().toLowerCase();

    const statusFilter = filterStatus.value;

    const filteredApplications =
        applications.filter(app => {

            const creator =
                String(app.creator_name || "").toLowerCase();

            const character =
                String(app.oc_name || "").toLowerCase();

            const matchesSearch =
                creator.includes(search) ||
                character.includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                (app.status || "Pending") === statusFilter;

            return matchesSearch && matchesStatus;

        });


    if (filteredApplications.length === 0) {

        createText(
            applicationsList,
            "p",
            "No audition applications found."
        ).className = "empty-message";

        return;
    }


    filteredApplications.forEach(app => {

        const card = document.createElement("article");

        card.className = "application-card";

        createText(card, "h2", app.oc_name);

        createText(
            card,
            "p",
            "Creator: " + (app.creator_name || "Not provided")
        );

        createText(
            card,
            "p",
            "Application ID: " + app.id
        ).className = "application-meta";

        createText(
            card,
            "p",
            "Submitted: " +
            (
                app.submitted_at
                    ? new Date(app.submitted_at).toLocaleString()
                    : "Not available"
            )
        );

        const status = document.createElement("span");

        status.className = "status-label";

        status.textContent = app.status || "Pending";

        card.appendChild(status);


        const viewButton = document.createElement("button");

        viewButton.type = "button";

        viewButton.className = "admin-button";

        viewButton.textContent = "VIEW APPLICATION";

        viewButton.style.marginTop = "15px";

        viewButton.addEventListener("click", function() {

            openApplication(app.id);

        });

        card.appendChild(viewButton);

        applicationsList.appendChild(card);

    });

}


// ======================================
// OPEN APPLICATION REVIEW PAGE
// ======================================

function openApplication(id) {

    const app = applications.find(item =>
        String(item.id) === String(id)
    );

    if (!app) {

        alert("Application not found.");

        return;
    }

    currentApplicationId = app.id;

    adminContainer.classList.add("hidden");

    reviewPage.classList.remove("hidden");

    displayApplicationDetails(app);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================
// CREATE REVIEW FIELD
// ======================================

function createReviewField(parent, label, value) {

    const field = document.createElement("div");

    field.className = "review-field";

    const heading = document.createElement("strong");

    heading.textContent = label;

    const content = document.createElement("p");

    if (Array.isArray(value)) {

        content.textContent = value.length
            ? value.join(", ")
            : "Not provided";

    } else {

        content.textContent =
            value === null || value === undefined || value === ""
                ? "Not provided"
                : String(value);

    }

    field.appendChild(heading);

    field.appendChild(content);

    parent.appendChild(field);

}


// ======================================
// CREATE REVIEW SECTION
// ======================================

function createReviewSection(parent, heading) {

    const section = document.createElement("section");

    section.className = "review-section";

    createText(section, "h3", heading);

    parent.appendChild(section);

    return section;

}


// ======================================
// DISPLAY APPLICATION DETAILS
// ======================================

function displayApplicationDetails(app) {

    reviewContent.replaceChildren();

    const card = document.createElement("article");

    card.className = "review-card";

    const title = createText(card, "h2", app.oc_name);

    title.style.color = "#536BB8";

    createReviewField(card, "APPLICATION ID", app.id);

    createReviewField(
        card,
        "SUBMISSION DATE",
        app.submitted_at
            ? new Date(app.submitted_at).toLocaleString()
            : "Not available"
    );


    // CREATOR INFORMATION

    const creatorSection = createReviewSection(
        card,
        "CREATOR INFORMATION"
    );

    createReviewField(
        creatorSection,
        "CREATOR NAME",
        app.creator_name
    );


    // CHARACTER INFORMATION

    const characterSection = createReviewSection(
        card,
        "CHARACTER INFORMATION"
    );

    createReviewField(
        characterSection,
        "CHARACTER NAME",
        app.oc_name
    );

    createReviewField(
        characterSection,
        "AGE",
        app.age_range
    );

    createReviewField(
        characterSection,
        "NATIONALITY",
        app.nationality
    );

    createReviewField(
        characterSection,
        "POSITION / CATEGORY",
        app.category
    );

    createReviewField(
        characterSection,
        "SKILLS",
        app.skills
    );

    createReviewField(
        characterSection,
        "CHARACTER BACKGROUND",
        app.character_lore
    );


    // CREATOR MESSAGE

    const messageSection = createReviewSection(
        card,
        "CREATOR MESSAGE"
    );

    createReviewField(
        messageSection,
        "MESSAGE",
        app.creator_message
    );


    // CHARACTER REFERENCE

    const referenceSection = createReviewSection(
        card,
        "CHARACTER REFERENCE"
    );

    const referenceValue = app.reference_link;

    if (referenceValue) {

        try {

            const url = new URL(referenceValue);

            if (
                url.protocol === "https:" ||
                url.protocol === "http:"
            ) {

                const link = document.createElement("a");

                link.href = url.href;

                link.target = "_blank";

                link.rel = "noopener noreferrer";

                link.textContent = "VIEW CHARACTER REFERENCE";

                referenceSection.appendChild(link);

            } else {

                createReviewField(
                    referenceSection,
                    "REFERENCE",
                    "Invalid reference link"
                );

            }

        } catch (error) {

            createReviewField(
                referenceSection,
                "REFERENCE",
                "No valid reference link"
            );

        }

    } else {

        createReviewField(
            referenceSection,
            "REFERENCE",
            "Not provided"
        );

    }


    // APPLICATION STATUS

    const statusSection = createReviewSection(
        card,
        "APPLICATION STATUS"
    );

    createReviewField(
        statusSection,
        "CURRENT STATUS",
        app.status || "Pending"
    );

    const actions = document.createElement("div");

    actions.className = "review-actions";


    // STATUS SELECT

    const statusSelect = document.createElement("select");

    statusSelect.className = "status-select";

    ["Pending", "Accepted", "Rejected"].forEach(status => {

        const option = document.createElement("option");

        option.value = status;

        option.textContent = status;

        option.selected =
            (app.status || "Pending") === status;

        statusSelect.appendChild(option);

    });


    // UPDATE STATUS BUTTON

    const updateButton = document.createElement("button");

    updateButton.type = "button";

    updateButton.className = "admin-button";

    updateButton.textContent = "UPDATE STATUS";

    updateButton.addEventListener("click", async function() {

        updateButton.disabled = true;

        updateButton.textContent = "UPDATING...";

        const { error } = await supabaseClient
            .from("audition_applications")
            .update({
                status: statusSelect.value
            })
            .eq("id", app.id);

        updateButton.disabled = false;

        updateButton.textContent = "UPDATE STATUS";

        if (error) {

            console.error("Status update error:", error);

            alert("Unable to update status: " + error.message);

            return;
        }

        alert("Application status updated successfully!");

        await loadApplications();

        const updatedApp = applications.find(item =>
            String(item.id) === String(currentApplicationId)
        );

        if (updatedApp) {

            displayApplicationDetails(updatedApp);

        }

    });


    // DELETE APPLICATION BUTTON

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
        "admin-button delete-button";

    deleteButton.textContent = "DELETE APPLICATION";

    deleteButton.addEventListener("click", async function() {

        const confirmed = confirm(
            "Are you sure you want to delete this application? This action cannot be undone."
        );

        if (!confirmed) return;

        deleteButton.disabled = true;

        deleteButton.textContent = "DELETING...";

        const { error } = await supabaseClient
            .from("audition_applications")
            .delete()
            .eq("id", app.id);

        if (error) {

            deleteButton.disabled = false;

            deleteButton.textContent = "DELETE APPLICATION";

            alert("Unable to delete application: " + error.message);

            return;
        }

        alert("Application deleted successfully.");

        currentApplicationId = null;

        reviewContent.replaceChildren();

        reviewPage.classList.add("hidden");

        adminContainer.classList.remove("hidden");

        await loadApplications();

    });


    actions.appendChild(statusSelect);

    actions.appendChild(updateButton);

    actions.appendChild(deleteButton);

    card.appendChild(actions);

    reviewContent.appendChild(card);

}


// ======================================
// BACK TO DASHBOARD
// ======================================

document.getElementById("backToDashboard")
    .addEventListener("click", function() {

        reviewPage.classList.add("hidden");

        adminContainer.classList.remove("hidden");

        showApplicationsPanel();

        currentApplicationId = null;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


// ======================================
// APPLICATION SEARCH AND FILTER
// ======================================

searchInput.addEventListener(
    "input",
    displayApplications
);

filterStatus.addEventListener(
    "change",
    displayApplications
);

document.getElementById("refreshApplications")
    .addEventListener("click", loadApplications);


// ======================================
// GET LOCAL DATE
// ======================================

function getLocalDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ======================================
// NEWS MANAGEMENT
// ======================================


// ======================================
// LOAD NEWS ANNOUNCEMENTS
// ======================================

async function loadNews() {

    newsList.textContent =
        "Loading announcements...";

    const { data, error } = await supabaseClient
        .from("news_announcements")
        .select("*")
        .order("publish_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {

        console.error("News loading error:", error);

        newsList.textContent =
            "Unable to load announcements: " + error.message;

        return;
    }

    announcements = data || [];

    displayNews();

}


// ======================================
// DISPLAY NEWS ANNOUNCEMENTS
// ======================================

function displayNews() {

    newsList.replaceChildren();

    const search =
        searchNews.value.trim().toLowerCase();

    const statusFilter =
        filterNewsStatus.value;

    const filteredNews = announcements.filter(item => {

        const title =
            String(item.title || "").toLowerCase();

        const category =
            String(item.category || "").toLowerCase();

        const content =
            String(item.content || "").toLowerCase();

        const matchesSearch =
            title.includes(search) ||
            category.includes(search) ||
            content.includes(search);

        const matchesStatus =
            statusFilter === "All" ||
            item.status === statusFilter;

        return matchesSearch && matchesStatus;

    });


    if (filteredNews.length === 0) {

        createText(
            newsList,
            "p",
            "No announcements found."
        ).className = "empty-message";

        return;
    }


    filteredNews.forEach(item => {

        const card = document.createElement("article");

        card.className = "news-card";

        createText(card, "h2", item.title);

        createText(
            card,
            "p",
            "Category: " + item.category
        );

        createText(
            card,
            "p",
            "Publication Date: " + item.publish_date
        ).className = "news-meta";


        const status = document.createElement("span");

        status.className =
            "status-label " +
            (
                item.status === "Published"
                    ? "status-published"
                    : "status-draft"
            );

        status.textContent = item.status;

        card.appendChild(status);


        const content = document.createElement("p");

        content.className = "news-card-content";

        content.textContent = item.content;

        card.appendChild(content);


        if (item.created_at) {

            createText(
                card,
                "p",
                "Created: " +
                new Date(item.created_at).toLocaleString()
            ).className = "news-meta";

        }


        const actions = document.createElement("div");

        actions.className = "news-card-actions";


        // EDIT BUTTON

        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.className = "admin-button";

        editButton.textContent = "EDIT";

        editButton.addEventListener("click", function() {

            editNews(item.id);

        });


        // PUBLISH / UNPUBLISH BUTTON

        const statusButton = document.createElement("button");

        statusButton.type = "button";

        statusButton.className = "admin-button";

        statusButton.textContent =
            item.status === "Published"
                ? "UNPUBLISH"
                : "PUBLISH";

        statusButton.addEventListener("click", function() {

            toggleNewsStatus(item.id);

        });


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "admin-button delete-button";

        deleteButton.textContent = "DELETE";

        deleteButton.addEventListener("click", function() {

            deleteNews(item.id);

        });


        actions.appendChild(editButton);

        actions.appendChild(statusButton);

        actions.appendChild(deleteButton);

        card.appendChild(actions);

        newsList.appendChild(card);

    });

}


// ======================================
// RESET NEWS FORM
// ======================================

function resetNewsForm() {

    newsForm.reset();

    newsId.value = "";

    newsPublishDate.value = getLocalDate();

    newsFormHeading.textContent =
        "CREATE ANNOUNCEMENT";

    saveDraftButton.textContent =
        "SAVE AS DRAFT";

    publishNewsButton.textContent =
        "PUBLISH ANNOUNCEMENT";

    cancelNewsEdit.classList.add("hidden");

    newsMessage.textContent = "";

    newsMessage.className = "";

}


// ======================================
// EDIT NEWS ANNOUNCEMENT
// ======================================

function editNews(id) {

    const item = announcements.find(news =>
        String(news.id) === String(id)
    );

    if (!item) {

        alert("Announcement not found.");

        return;
    }

    newsId.value = item.id;

    newsTitle.value = item.title;

    newsCategory.value = item.category;

    newsPublishDate.value = item.publish_date;

    newsContent.value = item.content;

    newsFormHeading.textContent =
        "EDIT ANNOUNCEMENT";

    saveDraftButton.textContent =
        "SAVE AS DRAFT";

    publishNewsButton.textContent =
        "SAVE & PUBLISH";

    cancelNewsEdit.classList.remove("hidden");

    newsMessage.textContent = "";

    showNewsPanel();

    newsForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ======================================
// SAVE NEWS ANNOUNCEMENT
// ======================================

async function saveNews(status) {

    const title = newsTitle.value.trim();

    const category = newsCategory.value;

    const publishDate = newsPublishDate.value;

    const content = newsContent.value.trim();

    const editingId = newsId.value;


    if (!title || !category || !publishDate || !content) {

        newsMessage.textContent =
            "Please complete all announcement fields.";

        return;
    }

    if (!["Draft", "Published"].includes(status)) {

        newsMessage.textContent =
            "Invalid announcement status.";

        return;
    }


    const buttons = [
        saveDraftButton,
        publishNewsButton
    ];

    buttons.forEach(button => {
        button.disabled = true;
    });

    newsMessage.textContent = "Saving announcement...";

    newsMessage.className = "";


    const announcementData = {

        title: title,

        category: category,

        content: content,

        publish_date: publishDate,

        status: status,

        updated_at: new Date().toISOString()

    };


    let result;

    if (editingId) {

        result = await supabaseClient
            .from("news_announcements")
            .update(announcementData)
            .eq("id", editingId);

    } else {

        result = await supabaseClient
            .from("news_announcements")
            .insert(announcementData);

    }


    buttons.forEach(button => {
        button.disabled = false;
    });


    if (result.error) {

        console.error(
            "Announcement saving error:",
            result.error
        );

        newsMessage.textContent =
            "Unable to save announcement: " +
            result.error.message;

        return;
    }


    const successText =
        status === "Published"
            ? "Announcement published successfully!"
            : "Announcement saved as draft successfully!";

    await loadNews();

    resetNewsForm();

    newsMessage.className = "success-message";

    newsMessage.textContent = successText;

    showNewsPanel();

}


// ======================================
// SAVE AS DRAFT
// ======================================

saveDraftButton.addEventListener("click", async function(event) {

    event.preventDefault();

    await saveNews("Draft");

});


// ======================================
// PUBLISH ANNOUNCEMENT
// ======================================

publishNewsButton.addEventListener("click", async function(event) {

    event.preventDefault();

    await saveNews("Published");

});


// ======================================
// CANCEL NEWS EDIT
// ======================================

cancelNewsEdit.addEventListener("click", function(event) {

    event.preventDefault();

    resetNewsForm();

    newsForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


// ======================================
// PUBLISH / UNPUBLISH EXISTING NEWS
// ======================================

async function toggleNewsStatus(id) {

    const item = announcements.find(news =>
        String(news.id) === String(id)
    );

    if (!item) {

        alert("Announcement not found.");

        return;
    }

    const newStatus =
        item.status === "Published"
            ? "Draft"
            : "Published";

    const confirmed = confirm(
        newStatus === "Published"
            ? "Publish this announcement?"
            : "Move this announcement back to Draft?"
    );

    if (!confirmed) return;


    const { error } = await supabaseClient
        .from("news_announcements")
        .update({

            status: newStatus,

            updated_at: new Date().toISOString()

        })
        .eq("id", id);


    if (error) {

        console.error("News status error:", error);

        alert(
            "Unable to update announcement: " +
            error.message
        );

        return;
    }

    alert(
        newStatus === "Published"
            ? "Announcement published successfully!"
            : "Announcement moved to Draft successfully!"
    );

    await loadNews();

}


// ======================================
// DELETE NEWS ANNOUNCEMENT
// ======================================

async function deleteNews(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this announcement? This action cannot be undone."
    );

    if (!confirmed) return;


    const { error } = await supabaseClient
        .from("news_announcements")
        .delete()
        .eq("id", id);


    if (error) {

        console.error("News deletion error:", error);

        alert(
            "Unable to delete announcement: " +
            error.message
        );

        return;
    }

    if (String(newsId.value) === String(id)) {

        resetNewsForm();

    }

    alert("Announcement deleted successfully.");

    await loadNews();

}


// ======================================
// NEWS SEARCH AND FILTER
// ======================================

searchNews.addEventListener(
    "input",
    displayNews
);

filterNewsStatus.addEventListener(
    "change",
    displayNews
);

document.getElementById("refreshNews")
    .addEventListener("click", loadNews);


// ======================================
// CALENDAR MANAGEMENT
// ======================================


// ======================================
// FORMAT EVENT DATE
// ======================================

function formatEventDate(dateValue) {

    if (!dateValue) return "No date";

    // Parse date as local date to avoid timezone shifts.

    const parts = dateValue.split("-");

    if (parts.length !== 3) return dateValue;

    const year = Number(parts[0]);

    const month = Number(parts[1]) - 1;

    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

}


// ======================================
// LOAD CALENDAR EVENTS
// ======================================

async function loadEvents() {

    eventsList.textContent =
        "Loading calendar events...";

    const { data, error } = await supabaseClient
        .from("calendar_events")
        .select("*")
        .order("event_date", { ascending: true });

    if (error) {

        console.error("Calendar loading error:", error);

        eventsList.textContent =
            "Unable to load calendar events: " +
            error.message;

        return;
    }

    calendarEvents = data || [];

    displayEvents();

}


// ======================================
// DISPLAY CALENDAR EVENTS
// ======================================

function displayEvents() {

    eventsList.replaceChildren();

    const search =
        searchEvents.value.trim().toLowerCase();

    const statusFilter =
        filterEventStatus.value;


    const filteredEvents = calendarEvents.filter(item => {

        const title =
            String(item.title || "").toLowerCase();

        const category =
            String(item.category || "").toLowerCase();

        const description =
            String(item.description || "").toLowerCase();

        const matchesSearch =
            title.includes(search) ||
            category.includes(search) ||
            description.includes(search);

        const matchesStatus =
            statusFilter === "All" ||
            item.status === statusFilter;

        return matchesSearch && matchesStatus;

    });


    if (filteredEvents.length === 0) {

        createText(
            eventsList,
            "p",
            "No calendar events found."
        ).className = "empty-message";

        return;
    }


    filteredEvents.forEach(item => {

        const card = document.createElement("article");

        card.className = "event-card";


        // EVENT TITLE

        createText(
            card,
            "h2",
            item.title
        );


        // CATEGORY

        createText(
            card,
            "p",
            "Category: " + (item.category || "EVENT")
        );


        // EVENT DATE

        createText(
            card,
            "p",
            "Event Date: " + formatEventDate(item.event_date)
        ).className = "event-meta";


        // DESCRIPTION

        const description = document.createElement("p");

        description.className = "event-description";

        description.textContent =
            item.description || "No description provided.";

        card.appendChild(description);


        // STATUS

        const status = document.createElement("span");

        status.className =
            "status-label " +
            (
                item.status === "Published"
                    ? "status-published"
                    : "status-draft"
            );

        status.textContent = item.status || "Pending";

        card.appendChild(status);


        // ACTIONS

        const actions = document.createElement("div");

        actions.className = "event-card-actions";


        // EDIT BUTTON

        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.className = "admin-button";

        editButton.textContent = "EDIT";

        editButton.addEventListener("click", function() {

            editEvent(item.id);

        });


        // PUBLISH / UNPUBLISH BUTTON

        const statusButton = document.createElement("button");

        statusButton.type = "button";

        statusButton.className = "admin-button";

        statusButton.textContent =
            item.status === "Published"
                ? "UNPUBLISH"
                : "PUBLISH";

        statusButton.addEventListener("click", function() {

            toggleEventStatus(item.id);

        });


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "admin-button delete-button";

        deleteButton.textContent = "DELETE";

        deleteButton.addEventListener("click", function() {

            deleteEvent(item.id);

        });


        actions.appendChild(editButton);

        actions.appendChild(statusButton);

        actions.appendChild(deleteButton);

        card.appendChild(actions);

        eventsList.appendChild(card);

    });

}


// ======================================
// RESET EVENT FORM
// ======================================

function resetEventForm() {

    eventForm.reset();

    eventId.value = "";

    eventDate.value = getLocalDate();

    eventFormHeading.textContent =
        "CREATE CALENDAR EVENT";

    savePendingEvent.textContent =
        "SAVE AS PENDING";

    publishEvent.textContent =
        "PUBLISH EVENT";

    cancelEventEdit.classList.add("hidden");

    eventMessage.textContent = "";

    eventMessage.className = "";

}


// ======================================
// EDIT CALENDAR EVENT
// ======================================

function editEvent(id) {

    const item = calendarEvents.find(event =>
        String(event.id) === String(id)
    );

    if (!item) {

        alert("Calendar event not found.");

        return;
    }

    eventId.value = item.id;

    eventTitle.value = item.title;

    eventCategory.value = item.category || "EVENT";

    eventDate.value = item.event_date;

    eventDescription.value = item.description || "";

    eventFormHeading.textContent =
        "EDIT CALENDAR EVENT";

    savePendingEvent.textContent =
        "SAVE AS PENDING";

    publishEvent.textContent =
        "SAVE & PUBLISH";

    cancelEventEdit.classList.remove("hidden");

    eventMessage.textContent = "";

    showCalendarPanel();

    eventForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ======================================
// SAVE CALENDAR EVENT
// ======================================

async function saveEvent(status) {

    const title = eventTitle.value.trim();

    const category = eventCategory.value;

    const date = eventDate.value;

    const description = eventDescription.value.trim();

    const editingId = eventId.value;


    // VALIDATION

    if (!title || !category || !date) {

        eventMessage.textContent =
            "Please complete the event title, category, and date.";

        eventMessage.className = "";

        return;
    }

    if (!["Pending", "Published"].includes(status)) {

        eventMessage.textContent =
            "Invalid event status.";

        return;
    }


    // BUTTON STATE

    const buttons = [
        savePendingEvent,
        publishEvent
    ];

    buttons.forEach(button => {
        button.disabled = true;
    });

    eventMessage.textContent = "Saving calendar event...";

    eventMessage.className = "";


    // DATA TO SAVE

    const eventData = {

        title: title,

        category: category,

        event_date: date,

        description: description,

        status: status

    };


    let result;

    if (editingId) {

        // UPDATE EXISTING EVENT

        result = await supabaseClient
            .from("calendar_events")
            .update(eventData)
            .eq("id", editingId);

    } else {

        // CREATE NEW EVENT

        result = await supabaseClient
            .from("calendar_events")
            .insert(eventData);

    }


    buttons.forEach(button => {
        button.disabled = false;
    });


    if (result.error) {

        console.error(
            "Calendar event saving error:",
            result.error
        );

        eventMessage.textContent =
            "Unable to save event: " +
            result.error.message;

        eventMessage.className = "";

        return;
    }


    const successText =
        status === "Published"
            ? "Calendar event published successfully!"
            : "Calendar event saved as pending successfully!";


    await loadEvents();

    resetEventForm();

    eventMessage.className = "success-message";

    eventMessage.textContent = successText;

    showCalendarPanel();

}


// ======================================
// SAVE EVENT AS PENDING
// ======================================

savePendingEvent.addEventListener("click", async function(event) {

    event.preventDefault();

    await saveEvent("Pending");

});


// ======================================
// PUBLISH EVENT
// ======================================

publishEvent.addEventListener("click", async function(event) {

    event.preventDefault();

    await saveEvent("Published");

});


// ======================================
// CANCEL EVENT EDIT
// ======================================

cancelEventEdit.addEventListener("click", function(event) {

    event.preventDefault();

    resetEventForm();

    eventForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});


// ======================================
// PUBLISH / UNPUBLISH EVENT
// ======================================

async function toggleEventStatus(id) {

    const item = calendarEvents.find(event =>
        String(event.id) === String(id)
    );

    if (!item) {

        alert("Calendar event not found.");

        return;
    }

    const newStatus =
        item.status === "Published"
            ? "Pending"
            : "Published";

    const confirmed = confirm(
        newStatus === "Published"
            ? "Publish this calendar event?"
            : "Move this calendar event back to Pending?"
    );

    if (!confirmed) return;


    const { error } = await supabaseClient
        .from("calendar_events")
        .update({
            status: newStatus
        })
        .eq("id", id);


    if (error) {

        console.error("Calendar status error:", error);

        alert(
            "Unable to update calendar event: " +
            error.message
        );

        return;
    }


    alert(
        newStatus === "Published"
            ? "Calendar event published successfully!"
            : "Calendar event moved to Pending successfully!"
    );

    await loadEvents();

}


// ======================================
// DELETE CALENDAR EVENT
// ======================================

async function deleteEvent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this calendar event? This action cannot be undone."
    );

    if (!confirmed) return;


    const { error } = await supabaseClient
        .from("calendar_events")
        .delete()
        .eq("id", id);


    if (error) {

        console.error("Calendar deletion error:", error);

        alert(
            "Unable to delete calendar event: " +
            error.message
        );

        return;
    }


    if (String(eventId.value) === String(id)) {

        resetEventForm();

    }

    alert("Calendar event deleted successfully.");

    await loadEvents();

}


// ======================================
// CALENDAR SEARCH AND FILTER
// ======================================

searchEvents.addEventListener(
    "input",
    displayEvents
);

filterEventStatus.addEventListener(
    "change",
    displayEvents
);

document.getElementById("refreshEvents")
    .addEventListener("click", loadEvents);


// ======================================
// START ADMIN DASHBOARD
// ======================================

resetNewsForm();

resetEventForm();

checkAdminLogin();
