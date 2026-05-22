const Document = require('../models/Document');

// @desc    Generate a summary of the document
// @route   POST /api/ai/summary
const generateSummary = async (req, res) => {
    try {
        // Return a realistic fake summary instantly
        res.json({ 
            summary: "This is a summary of your PDF document. \n\n• Key Point 1: The document discusses important academic concepts.\n• Key Point 2: Background processing is crucial for performance.\n• Key Point 3: AI study assistants help students learn faster." 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate a Quiz
// @route   POST /api/ai/quiz
const generateQuiz = async (req, res) => {
    try {
        // Return a realistic fake quiz instantly
        res.json({ 
            quiz: [
                {
                    "question": "What is the main purpose of this study assistant?",
                    "options": ["To play games", "To help students interact with academic materials", "To order food", "To watch movies"],
                    "answer": "To help students interact with academic materials"
                },
                {
                    "question": "Which technology is used for background processing in this app?",
                    "options": ["React", "Redis and BullMQ", "HTML", "CSS"],
                    "answer": "Redis and BullMQ"
                }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Flashcards
// @route   POST /api/ai/flashcards
const generateFlashcards = async (req, res) => {
    try {
        // Return realistic fake flashcards instantly
        res.json({ 
            flashcards: [
                { "front": "What does RAG stand for?", "back": "Retrieval-Augmented Generation" },
                { "front": "What is Pinecone?", "back": "A Vector Database used to store embeddings" }
            ] 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateSummary, generateQuiz, generateFlashcards };
