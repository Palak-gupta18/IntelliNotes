const { Worker } = require('bullmq');
const { connection } = require('./pdfQueue');
const Document = require('../models/Document');
const pdfParse = require('pdf-parse');
const axios = require('axios'); // We need axios to download the PDF from Cloudinary

const worker = new Worker('pdf-extraction', async (job) => {
    const { documentId, fileUrl } = job.data;
    
    // Update status to processing
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    try {
        console.log(`Starting extraction for document ${documentId}`);
        
        // 1. Download PDF from Cloudinary as a buffer
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const dataBuffer = Buffer.from(response.data);

        // 2. Parse the PDF
        const pdfData = await pdfParse(dataBuffer);
        
        // 3. Save extracted text to database
        await Document.findByIdAndUpdate(documentId, {
            extractedText: pdfData.text,
            status: 'completed'
        });

        console.log(`Finished extraction for document ${documentId}`);
        return { success: true };
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
        throw error; // This tells BullMQ the job failed
    }
}, { connection });

// Handle worker errors
worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

module.exports = worker;
