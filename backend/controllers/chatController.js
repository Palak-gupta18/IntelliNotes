const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');
const Document = require('../models/Document');

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// @desc    Chat with the PDF using RAG (Retrieval-Augmented Generation)
// @route   POST /api/chat
const chatWithPdf = async (req, res) => {
    const { documentId, message } = req.body;

    try {
        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: 'Document not found' });

        // 1. Embed the user's message using the same model we used for the PDF
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await embeddingModel.embedContent(message);
        
        // Ensure the vector fits your 768-dimension Pinecone index
        const queryVector = Array.from(result.embedding.values).slice(0, 768);

        // 2. Query Pinecone to find the top 3 most relevant chunks from this specific PDF
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 3,
            includeMetadata: true,
            filter: { documentId: documentId.toString() } // Only search within this PDF!
        });

        // 3. Extract the text from the Pinecone results to build our "Context"
        const relevantContext = queryResponse.matches
            .map(match => match.metadata.text)
            .join('\n\n---\n\n');

        // 4. REAL AI RESPONSE using the context retrieved from Pinecone
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `You are a highly intelligent study assistant. Answer the user's question based strictly on the provided context extracted from their document. If the context does not contain the answer, politely say that you cannot find the answer in the document. Do not invent information.

Context from Document:
${relevantContext}

User Question: ${message}`;

        const chatResult = await model.generateContent(prompt);
        const aiResponse = chatResult.response.text();

        res.json({ 
            reply: aiResponse,
            vectorMatches: queryResponse.matches.length 
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "Failed to generate chat response." });
    }
};

module.exports = { chatWithPdf };
