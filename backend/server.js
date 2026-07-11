const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Load Environment Variables
dotenv.config();

// 2. Database Connection Call
connectDB();

const app = express();

// 3. Middlewares
app.use(cors()); // Sirf ek baar kaafi hai
app.use(express.json()); 

// Request Logger (Ye humein batayega ki Postman se request aayi ya nahi)
app.use((req, res, next) => {
    console.log(`${req.method} request received at ${req.url}`);
    next();
});

// 4. Routes
app.use('/api/auth', require('./routes/authRoutes'));

// 5. Basic Test Route
app.get('/', (req, res) => {
    res.send("AshFitVerse Backend is Live! 🚀");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
});