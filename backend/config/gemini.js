/**
 * config/gemini.js
 * Initializes Google Gemini AI client and exports the model.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('[Gemini] GEMINI_API_KEY is not set.');
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 4096,
  },
});

console.log('[Gemini] Model initialized: gemini-1.5-flash ✓');

module.exports = { genAI, model };
