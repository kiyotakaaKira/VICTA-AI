/**
 * backend/services/geminiService.js
 * Hardened Gemini 1.5 Flash Integration with zero-empty-response guarantee.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are SENTINEL/AI, an advanced forensic intelligence engine.
Analyze evidence, telemetry, behavioral anomalies, and threat patterns professionally.
Tone: Professional, analytical, tactical.
Directives:
- Provide concise, actionable intelligence.
- Use tactical terminology (Signal Vector, Forensic Hash, Metabolic Peak).
- Focus on identifying next-best-actions for digital investigations.`;

/**
 * Exponential backoff wrapper
 */
async function withRetry(fn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (err.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`[Gemini] Rate limited. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Fallback synthetic intelligence when API fails or returns empty
 */
function getFallbackResponse(prompt) {
  const fallbacks = [
    "Preliminary signal analysis suggests a high-density correlation with previously cataloged APT patterns. Recommend escalating network deep-packet inspection.",
    "Anomaly detected in behavioral telemetry. Signal vectors point to a non-standard metabolic peak. Cross-referencing with active case archives...",
    "Digital footprint localized. Primary vector: Encrypted peer-to-peer relay. Secondary vector: Obfuscated financial pivot. Advise immediate subpoena of related IMEI records.",
    "Forensic hash mismatch identified in current evidence chain. Recommend re-verification of the integrity of the raw laboratory ingest."
  ];
  return `[SIMULATION MODE] ${fallbacks[Math.floor(Math.random() * fallbacks.length)]}`;
}

/**
 * Generate standard chat response with hardened parsing
 */
async function generateResponse(message, history = []) {
  console.log('>>> OUTGOING PROMPT:', message);
  try {
    return await withRetry(async () => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Acknowledged. SENTINEL/AI online.' }] },
          ...history
        ],
      });

      const result = await chat.sendMessage(message);
      console.log('>>> RAW GEMINI RESPONSE:', JSON.stringify(result, null, 2));

      const response = await result.response;
      
      // Hardened Extraction
      let text = '';
      try {
        text = response.text();
      } catch (e) {
        text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      console.log('>>> PARSED TEXT:', text);

      if (!text || text.trim() === '') {
        console.warn('>>> EMPTY RESPONSE DETECTED, TRIGGERING FALLBACK');
        return { text: getFallbackResponse(message), tokens: 0, isFallback: true };
      }

      return {
        text: text,
        tokens: response.usageMetadata?.totalTokenCount || 0
      };
    });
  } catch (error) {
    console.error('[Gemini Service] Critical Failure:', error);
    return {
      text: getFallbackResponse(message),
      isFallback: true,
      error: error.message
    };
  }
}

/**
 * Stream response from Gemini
 */
async function* streamResponse(message, history = []) {
  console.log('>>> OUTGOING STREAM PROMPT:', message);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Acknowledged. SENTINEL/AI online.' }] },
        ...history
      ],
    });

    const result = await chat.sendMessageStream(message);
    let chunkCount = 0;
    for await (const chunk of result.stream) {
      chunkCount++;
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
    
    if (chunkCount === 0) {
      yield getFallbackResponse(message);
    }
  } catch (error) {
    console.error('[Gemini Service] Streaming Failure:', error);
    yield `[SIMULATION MODE] Neural baseline saturated. Primary vector: ${error.message}`;
  }
}

module.exports = {
  generateResponse,
  streamResponse
};
