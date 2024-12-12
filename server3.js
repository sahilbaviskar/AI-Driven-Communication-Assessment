import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
const HF_API_URL = 'https://kshitu-video.hf.space';
const keepAliveInterval = 30000; // 30 seconds
const timeoutConfig = {
    response: 60000, // 1 minute
    deadline: 70000  // 70 seconds
};

app.use((req, res, next) => {
    res.setTimeout(timeoutConfig.response, () => {
        console.log('Request timeout');
    });
    next();
});

// State management
let currentQuestion = 1;
let isRecording = false;

// Enable CORS with specific options
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Accept', 
        'Access-Control-Allow-Origin',
        'Connection',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: [
        'Content-Type',
        'Connection',
        'Cache-Control',
        'Pragma'
    ],
    credentials: true,
    maxAge: 3600
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

// Video feed endpoint with error handling
app.get('/video_feed', async (req, res) => {
    try {
        const response = await fetch(`${HF_API_URL}/video_feed`, {
            headers: {
                'Accept': 'multipart/x-mixed-replace ;boundary=frame',
                'Cache-Control': 'keep-alive',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
                
            },
            timeout: timeoutConfig.response // Add timeout
        });
        
        if (!response.ok) {
            throw new Error('Failed to access camera feed');
        }
        res.writeHead(200, {
            'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        });
        req.on('close', () => {
            console.log('Client closed connection');
        });
        
        

        // Pipe the video stream with error handling
         // Handle stream errors
         response.body.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Video stream error' });
            }
            res.end();
        });

        // Pipe the video stream
        response.body.pipe(res).on('error', (error) => {
            console.error('Pipe error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Video pipe error' });
            }
        });
    } catch (error) {
        console.error('Camera access error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Camera access failed',
                details: error.message
            });
        }
    }
});

// Start recording endpoint with camera check
app.post('/start_recording', async (req, res) => {
    try {
        if (isRecording) {
            return res.status(400).json({ error: 'Already recording' });
        }

        const response = await fetch(`${HF_API_URL}/start_recording`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error ||'Failed to start recording');
        }

        const data = await response.json();
        isRecording = true;
       // res.json(data);
       res.json({
        status: 'Recording started',
        question: currentQuestion,
        ...data
    });
    } catch (error) {
        console.error('Recording error:', error);
        res.status(500).json({ 
            error: 'Recording failed',
            details: error.message
        });
    }
});

// Stop recording endpoint
app.post('/stop_recording', async (req, res) => {
    try {
        if (!isRecording) {
            return res.status(400).json({ error: 'No active recording' });
        }
        
        const pythonResponse = await fetch("https://kshitu-video.hf.space/stop_recording", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        
        const data = await pythonResponse.json();
        isRecording = false;
        res.json({
            status: 'Recording stopped',
            question: currentQuestion,
            ...data
        });
    } catch (error) {
        console.error('Stop recording error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Next question endpoint
app.post('/next_question', async (req, res) => {
    try {
        if (isRecording) {
            return res.status(400).json({ error: 'Stop recording first' });
        }
        
        const pythonResponse = await fetch("https://kshitu-video.hf.space/next_question", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        
        const data = await pythonResponse.json();
        if (currentQuestion < 4) {
            currentQuestion++;
        }
        
        res.json({
            status: 'Moved to next question',
            current_question: currentQuestion,
            ...data
        });
    } catch (error) {
        console.error('Next question error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve recordings
app.get('/recordings/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'recordings', filename));
});

// Error handling middleware
app.use((req, res, next) => {
    if (req.url === '/video_feed') {
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Keep-Alive', `timeout=${keepAliveInterval}`);
    }
    next();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Using Hugging Face API at: ${HF_API_URL}`);
});