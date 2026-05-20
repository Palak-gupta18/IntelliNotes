const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  console.log("Fetching models...");
  try {
    const models = await genAI.listModels();
    models.forEach(model => {
      if (model.name.includes("embed")) {
          console.log(model.name);
      }
    });
  } catch(e) {
    console.error(e);
  }
}
listModels();
