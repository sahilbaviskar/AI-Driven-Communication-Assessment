const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files (HTML, JS, CSS)

// MongoDB connection
const connectionString = "mongodb+srv://krishna:krishna123@login.k91sh.mongodb.net/db?retryWrites=true&w=majority";

mongoose
    .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection failed:", err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Routes for serving HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "profile.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ message: "Signup successful!" });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "Username already exists!" });
        } else {
            res.status(500).json({ message: "Error signing up!" });
        }
    }
});

// Login route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ message: "Login successful!", redirectTo: "/profile" });
        } else {
            res.status(400).json({ message: "Invalid username or password! Please sign up." });
        }
    } catch (err) {
        res.status(500).json({ message: "Error logging in!" });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));





// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");
// const multer = require("multer");
// const crypto = require("crypto"); // Added for generating unique identifiers
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");

// const app = express();
// const port = process.env.PORT || 4000;
// const recordingsFolder = path.join(__dirname, "recordings");

// // MongoDB connection
// const connectionString = "mongodb+srv://krishna:krishna123@login.k91sh.mongodb.net/db?retryWrites=true&w=majority";
// mongoose
//   .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection failed:", err));

// // Ensure the 'recordings' folder exists
// if (!fs.existsSync(recordingsFolder)) {
//     fs.mkdirSync(recordingsFolder, { recursive: true }); // Create folder if it doesn't exist
// }

// // Middleware
// app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Accept"], credentials: true }));
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "static")));

// // User Schema
// const userSchema = new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
// });
// const User = mongoose.model("User", userSchema);

// // Set up multer to handle file uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, recordingsFolder); // Save to the recordings folder
//     },
//     filename: function (req, file, cb) {
//         const questionNumber = req.body.question || 'unknown';
//         const uniqueIdentifier = crypto.randomBytes(8).toString('hex');
//         const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
//         const sanitizedQuestionNumber = questionNumber.toString()
//             .replace(/[^a-zA-Z0-9_-]/g, '_')
//             .substring(0, 50);
//         const filename = `interview_q${sanitizedQuestionNumber}_${timestamp}_${uniqueIdentifier}.wav`;
//         cb(null, filename);
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     limits: {
//         fileSize: 50 * 1024 * 1024 // 50 MB file size limit
//     },
//     fileFilter: (req, file, cb) => {
//         const allowedMimeTypes = ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/mp4'];
//         if (allowedMimeTypes.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error('Unsupported audio file type'), false);
//         }
//     }
// });

// // Routes for serving HTML pages
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "login.html"));
// });

// app.get("/signup", (req, res) => {
//     res.sendFile(path.join(__dirname, "index.html"));
// });

// app.get("/profile", (req, res) => {
//     res.sendFile(path.join(__dirname, "profile.html"));
// });

// app.get("/interview", (req, res) => {
//     res.sendFile(path.join(__dirname, "interview.html"));
// });

// // Signup route
// app.post("/signup", async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const newUser = new User({ username, password });
//         await newUser.save();
//         res.json({ message: "Signup successful!" });
//     } catch (err) {
//         if (err.code === 11000) {
//             res.status(400).json({ message: "Username already exists!" });
//         } else {
//             res.status(500).json({ message: "Error signing up!" });
//         }
//     }
// });

// // Login route
// app.post("/login", async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const user = await User.findOne({ username, password });
//         if (user) {
//             res.json({ message: "Login successful!", redirectTo: "/profile" });
//         } else {
//             res.status(400).json({ message: "Invalid username or password! Please sign up." });
//         }
//     } catch (err) {
//         res.status(500).json({ message: "Error logging in!" });
//     }
// });

// // Save recording endpoint
// app.post("/upload-audio", upload.single("audio"), (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No audio file uploaded" });
//         }

//         const { filename, path: filePath } = req.file;
//         const questionNumber = req.body.question || 'unknown';

//         console.log(`Audio saved for Question ${questionNumber}: ${filePath}`);

//         res.json({ 
//             message: `Audio saved for Question ${questionNumber}`, 
//             filename: filename,
//             filePath: filePath 
//         });
//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({ error: "An error occurred during file upload" });
//     }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ 
//         error: err.message || "An unexpected error occurred",
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });






