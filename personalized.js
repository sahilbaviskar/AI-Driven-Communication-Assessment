// script.js
let mediaRecorder;
let recordedBlobs = [];

// Start Recording
async function startRecording() {
  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  video.srcObject = stream;

  recordedBlobs = [];
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };

  mediaRecorder.start();
  document.getElementById("startBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("analyzeBtn").disabled = true;
}

// Stop Recording
function stopRecording() {
  mediaRecorder.stop();
  const video = document.getElementById("video");
  video.srcObject.getTracks().forEach((track) => track.stop());

  document.getElementById("startBtn").disabled = false;
  document.getElementById("stopBtn").disabled = true;
  document.getElementById("analyzeBtn").disabled = false;
}

// Analyze Body Language
function analyzeBodyLanguage() {
  // Mock Analysis Data
  const analysisResults = {
    posture: Math.random() > 0.5 ? "Good" : "Needs Improvement",
    gestures: Math.random() > 0.5 ? "Expressive" : "Minimal",
    eyeContact: Math.random() > 0.5 ? "Consistent" : "Inconsistent",
    overallScore: (Math.random() * 100).toFixed(2) + "%",
  };

  // Display Results
  document.getElementById("posture-result").textContent = analysisResults.posture;
  document.getElementById("gesture-result").textContent = analysisResults.gestures;
  document.getElementById("eye-contact-result").textContent = analysisResults.eyeContact;
  document.getElementById("overall-score").textContent = analysisResults.overallScore;

  document.getElementById("results-section").style.display = "block";
}
