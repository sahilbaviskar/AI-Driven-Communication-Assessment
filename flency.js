async function analyzeSpeech() {
    const fileInput = document.getElementById('audioFile');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    
    if (!fileInput.files.length) {
        alert('Please select an audio file');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        loadingDiv.style.display = 'block';
        resultsDiv.style.display = 'none';

        const response = await fetch('https://kshitu-fluency2211.hf.space/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Display results
        resultsDiv.innerHTML = `
            <h3>Analysis Results:</h3>
            <p><strong>Confidence:</strong> ${data.data.confidence.toFixed(2)}</p>
            <p><strong>Unique Words:</strong> ${data.data.unique_words}</p>
            <p><strong>Speaking Rate:</strong> ${data.data.speaking_rate.toFixed(1)} words/min</p>
            <p><strong>Filler Word Percentage:</strong> ${data.data.filler_percentage.toFixed(1)}%</p>
            <p><strong>Transcription:</strong> ${data.data.transcription}</p>
        `;
        resultsDiv.style.display = 'block';
    } catch (error) {
        resultsDiv.innerHTML = <p class="error">Error: ${error.message}</p>;
        resultsDiv.style.display = 'block';
    } finally {
        loadingDiv.style.display = 'none';
    }
}