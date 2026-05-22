const dotenv = require('dotenv');
dotenv.config();

async function getModels() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await res.json();
        
        if (data.models) {
            console.log("✅ Models you have access to:");
            data.models.forEach(m => {
                if (m.name.includes('flash') || m.name.includes('pro')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("❌ Error getting models:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

getModels();
