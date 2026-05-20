// This splits text roughly into chunks of a specific size (e.g., 1000 characters)
const chunkText = (text, chunkSize = 1000) => {
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split('. '); // Basic split by sentence

  for (let sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + '. ';
    } else {
      currentChunk += sentence + '. ';
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
};

module.exports = { chunkText };
