const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto"); // Added for generating unique identifiers

const app = express();
const port = process.env.PORT || 4000;
const recordingsFolder = path.join(__dirname, "recordings");

// Ensure the 'recordings' folder exists
if (!fs.existsSync(recordingsFolder)) {
    fs.mkdirSync(recordingsFolder, { recursive: true }); // Create folder if it doesn't exist
}

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Accept"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added to parse form data
app.use(express.static(path.join(__dirname, "static")));

// Set up multer to handle file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, recordingsFolder); // Save to the recordings folder
    },
    filename: function (req, file, cb) {
        // Generate a more robust and unique filename
        const questionNumber = req.body.question || 'unknown';
        const uniqueIdentifier = crypto.randomBytes(8).toString('hex');
        const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
        
        // Sanitize question number to remove any potentially problematic characters
        const sanitizedQuestionNumber = questionNumber.toString()
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .substring(0, 50); // Limit length to prevent extremely long filenames
        
        // Create a comprehensive, unique filename
        const filename = `interview_q${sanitizedQuestionNumber}_${timestamp}_${uniqueIdentifier}.wav`;
        
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow specific audio file types
        const allowedMimeTypes = [
            'audio/wav', 
            'audio/mpeg', 
            'audio/webm', 
            'audio/ogg', 
            'audio/mp4'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported audio file type'), false);
        }
    }
});

// Serve HTML file at root URL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "interview.html")); // or "index.html"
});

// Save recording endpoint
app.post("/upload-audio", upload.single("audio"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file uploaded" });
        }

        const { filename, path: filePath } = req.file;
        const questionNumber = req.body.question || 'unknown';

        console.log(`Audio saved for Question ${questionNumber}: ${filePath}`);

        res.json({ 
            message: `Audio saved for Question ${questionNumber}`, 
            filename: filename,
            filePath: filePath 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: "An error occurred during file upload" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: err.message || "An unexpected error occurred",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});