const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Create a new queue named 'pdf-extraction'
const pdfQueue = new Queue('pdf-extraction', { connection });

module.exports = { pdfQueue, connection };
