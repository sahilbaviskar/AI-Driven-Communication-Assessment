// Handle Signup
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("signupUsername").value;
    const password = document.getElementById("signupPassword").value;

    const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    alert(result.message);
    if (response.ok) {
        window.location.href = "/";
    }
});

// Handle Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    alert(result.message);
    if (!response.ok && result.redirectTo) {
        window.location.href = result.redirectTo;
    }
});

function changeStatus() {
    const status = document.getElementById("status").value;
    alert("Profile status changed to: " + status);
}
// Open the edit profile modal
function editProfile() {
    document.getElementById("edit-profile-modal").style.display = "block";
}

// Close the edit profile modal
function closeModal() {
    document.getElementById("edit-profile-modal").style.display = "none";
}

// Save the changes made in the edit profile modal
function saveProfile() {
    // const newPhoto = document.getElementById("new-photo").value;
    const newName = document.getElementById("new-name").value;
    const newAge = document.getElementById("new-age").value;
    const newSex = document.getElementById("new-sex").value;
    const newDesignation = document.getElementById("new-designation").value;

    // Update profile info
    // if (newPhoto) document.getElementById("profile-photo").src = newPhoto;
    if (newName) document.getElementById("profile-name").textContent = newName;
    if (newAge) document.getElementById("profile-age").textContent = "Age: " + newAge;
    if (newSex) document.getElementById("profile-sex").textContent = "Sex: " + newSex;
    if (newDesignation) document.getElementById("profile-designation").textContent = "Designation: " + newDesignation;

    // Close modal after saving
    closeModal();
}

// Optional: close modal if user clicks outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById("edit-profile-modal")) {
        closeModal();
    }
}
function redirectToQuiz() {
    window.location.href = "quiz.html"; // Replace 'quiz.html' with the correct path to your quiz page
}
function redirectToBLA(){
    window.location.href = "personalized.html";
}
function redirectTOSpeechAna(){
    window.location.href = "pronounciation.html";
}
function redirectTOGrammar(){
    window.location.href = "grammar.html";
}
function logout() {
    // Redirect to the logout page or perform logout logic
    alert("You have been logged out.");
    window.location.href = "index.html"; // Redirect to the login page
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
    // Get the Spell Checker button by its ID
    const spellCheckerButton = document.getElementById("spell-checker-button");
    const interviewpagebutton = document.getElementById("Interview-page-button");
    // Add a click event listener to redirect to spell_checker.html
    spellCheckerButton.addEventListener("click", function () {
        window.location.href = "spellchecker.html"; // Redirect to the Spell Checker page
    });

    interviewpagebutton.addEventListener("click", function () {
        window.location.href = "interview.html"; // Redirect to the Spell Checker page
    });
});
