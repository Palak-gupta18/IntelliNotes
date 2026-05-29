const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to prevent sending massive texts that exceed token limits
const getSafeText = (text, maxLength = 30000) => 
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

// @desc    Generate a summary of the document
// @route   POST /api/ai/summary
const generateSummary = async (req, res) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findById(documentId);
        
        if (!document) return res.status(404).json({ message: 'Document not found' });
        if (!document.extractedText) return res.status(400).json({ message: 'Document text is empty or still processing' });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Please provide a concise, well-structured, and highly informative summary of the following document text:\n\n${getSafeText(document.extractedText)}`;
        
        const result = await model.generateContent(prompt);
        const summaryText = result.response.text();

        res.json({ summary: summaryText });
    } catch (error) {
        console.error("Summary Generation Error:", error);
        res.status(500).json({ message: "Failed to generate summary." });
    }
};

// @desc    Generate a Quiz
// @route   POST /api/ai/quiz
const generateQuiz = async (req, res) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findById(documentId);
        
        if (!document) return res.status(404).json({ message: 'Document not found' });
        if (!document.extractedText) return res.status(400).json({ message: 'Document text is empty' });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Based on the following document text, generate a multiple-choice quiz with exactly 10 questions.
        Return ONLY a valid JSON array of objects, with no markdown formatting like \`\`\`json.
        Each object must have exactly this format:
        {
            "question": "The question text?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": "The correct option exactly as written in options"
        }
        
        Document Text:
        ${getSafeText(document.extractedText, 25000)}`;
        
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        // Clean up markdown block if Gemini includes it
        if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        if (text.startsWith("```")) text = text.replace(/```/g, "").trim();
        
        const quizData = JSON.parse(text);
        res.json({ quiz: quizData });
    } catch (error) {
        console.error("Quiz Generation Error:", error);
        res.status(500).json({ message: "Failed to generate quiz." });
    }
};

// @desc    Generate Flashcards
// @route   POST /api/ai/flashcards
const generateFlashcards = async (req, res) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findById(documentId);
        
        if (!document) return res.status(404).json({ message: 'Document not found' });
        if (!document.extractedText) return res.status(400).json({ message: 'Document text is empty' });
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `Based on the following document text, generate 5 flashcards for studying.
        Return ONLY a valid JSON array of objects, with no markdown formatting like \`\`\`json.
        Each object must have exactly this format:
        {
            "front": "The concept, term, or question",
            "back": "The definition or answer"
        }
        
        Document Text:
        ${getSafeText(document.extractedText, 25000)}`;
        
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        // Clean up markdown block if Gemini includes it
        if (text.startsWith("```json")) text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        if (text.startsWith("```")) text = text.replace(/```/g, "").trim();
        
        const flashcardData = JSON.parse(text);
        res.json({ flashcards: flashcardData });
    } catch (error) {
        console.error("Flashcard Generation Error:", error);
        res.status(500).json({ message: "Failed to generate flashcards." });
    }
};

module.exports = { generateSummary, generateQuiz, generateFlashcards };

