const { Worker } = require('bullmq');
const { connection } = require('./pdfQueue');
const Document = require('../models/Document');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const { chunkText } = require('../utils/chunkText');

// Setup Gemini and Pinecone
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pinecone } = require('@pinecone-database/pinecone');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

const worker = new Worker('pdf-extraction', async (job) => {
    const { documentId, fileUrl } = job.data;
    
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    try {
        console.log(`1. Downloading PDF...`);
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const dataBuffer = Buffer.from(response.data);

        console.log(`2. Parsing PDF...`);
        const pdfData = await pdfParse(dataBuffer);
        const extractedText = pdfData.text || '';
        
        console.log(`3. Chunking Text... (Found ${extractedText.length} characters)`);
        
        // If the PDF had no text (e.g. it was just images), stop here.
        if (extractedText.trim().length === 0) {
            console.log('No text found in PDF. Skipping embeddings.');
            await Document.findByIdAndUpdate(documentId, { status: 'completed' });
            return { success: true };
        }

       // const chunks = chunkText(extractedText);
          const chunks = chunkText(extractedText).filter(chunk => chunk.trim().length > 0);
        console.log(` -> Split into ${chunks.length} chunks.`);

        console.log(`4. Generating Embeddings & Saving to Pinecone...`);
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001"});
        
        const vectors = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const result = await embeddingModel.embedContent(chunk);
            
            // Slice the 3072 array down to 768 for your Pinecone index
           const embeddingValues = Array.from(result.embedding.values).slice(0, 768);


            vectors.push({
                id: `${documentId}-chunk-${i}`,
                values: embeddingValues,
                metadata: {
                    documentId: documentId.toString(),
                    text: chunk
                }
            });
        }

        console.log(` -> Sending ${vectors.length} vectors to Pinecone.`);

        // Only upsert if we actually have vectors
               if (vectors.length > 0) {
            console.log("Sample vector being sent:", JSON.stringify(vectors[0]).substring(0, 150) + "...");
            try {
                await index.upsert(vectors);
            } catch (err) {
                // Fallback for some Pinecone SDK versions
                await index.upsert({ records: vectors });
            }
        }


        console.log(`5. Finishing up...`);
        await Document.findByIdAndUpdate(documentId, {
            extractedText: extractedText,
            status: 'completed'
        });

        console.log(`Successfully completed RAG Pipeline for document ${documentId}`);
        return { success: true };
    } catch (error) {
        console.error(`Error in RAG pipeline:`, error);
        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
        throw error; 
    }
}, { connection });

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = worker;
