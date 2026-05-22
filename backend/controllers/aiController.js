const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// We use 1.5-flash for incredibly fast text generation
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// @desc    Generate a summary of the document
// @route   POST /api/ai/summary
const generateSummary = async (req, res) => {
    const { documentId } = req.body;

    try {
        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        const prompt = `
        You are an expert tutor. Summarize the following academic text. 
        Provide a brief overview, followed by 3-5 key bullet points. 
        Only use the information provided in the text.
        
        Text: ${document.extractedText}
        `;

        const result = await model.generateContent(prompt);
        res.json({ summary: result.response.text() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate a Quiz
// @route   POST /api/ai/quiz
const generateQuiz = async (req, res) => {
    const { documentId } = req.body;

    try {
        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        const prompt = `
        Create a 3-question multiple choice quiz based strictly on this text.
        Format your response EXACTLY as a JSON array of objects, like this:
        [
            { "question": "...", "options": ["A", "B", "C", "D"], "answer": "The correct option" }
        ]
        Do not include markdown formatting or backticks, just output pure JSON.
        
        Text: ${document.extractedText}
        `;

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        
        // Remove markdown formatting if Gemini accidentally includes it
        if (rawText.startsWith('```json')) rawText = rawText.replace(/```json/g, '').replace(/```/g, '');
        
        res.json({ quiz: JSON.parse(rawText) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Flashcards
// @route   POST /api/ai/flashcards
const generateFlashcards = async (req, res) => {
    const { documentId } = req.body;

    try {
        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        const prompt = `
        Create 5 flashcards for studying based on this text.
        Format your response EXACTLY as a JSON array of objects, like this:
        [
            { "front": "Concept or Question", "back": "Definition or Answer" }
        ]
        Do not include markdown formatting or backticks, just output pure JSON.
        
        Text: ${document.extractedText}
        `;

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();
        
        if (rawText.startsWith('```json')) rawText = rawText.replace(/```json/g, '').replace(/```/g, '');
        
        res.json({ flashcards: JSON.parse(rawText) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateSummary, generateQuiz, generateFlashcards };
