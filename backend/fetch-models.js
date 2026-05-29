const axios = require('axios');
require('dotenv').config();

async function getAvailableModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        console.log("=== YOUR AVAILABLE MODELS ===");
        const models = response.data.models.map(m => m.name);
        console.log(models.join('\n'));
        
    } catch (error) {
        console.error("Failed to fetch models:", error.response ? error.response.data : error.message);
    }
}

getAvailableModels();
