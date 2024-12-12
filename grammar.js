// Function to check grammar by sending a POST request to your API
async function checkGrammar(text) {
    const apiUrl = "https://kshitu-grammer.hf.space/check_grammar";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error while checking grammar:", error);
        return { error: error.message };
    }
}

// Function to handle the grammar check on button click
function checkGrammarHandler() {
    const inputText = document.getElementById("inputText").value;
    if (inputText.trim() === "") {
        alert("Please enter some text to check.");
        return;
    }

    checkGrammar(inputText).then((result) => {
        const resultContainer = document.getElementById("result");
        resultContainer.style.display = "block";

        if (result.error) {
            document.getElementById("correctedText").textContent = "Error: " + result.error;
            document.getElementById("feedback").textContent = "";
            document.getElementById("score").textContent = "";
        } else {
            document.getElementById("correctedText").textContent = result.corrected_text;
            document.getElementById("feedback").textContent = result.feedback;
            document.getElementById("score").textContent = "Score: " + result.score;
        }
    });
}
