const axios = require('axios');

async function generateResponse(prompt) {
  try {
    console.log('Sending Prompt:', prompt);

    const response = await axios.post(
      'https://api.featherless.ai/v1/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional forensic intelligence AI assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FEATHERLESS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(
      'RAW AI RESPONSE:',
      JSON.stringify(response.data, null, 2)
    );

    const text =
      response?.data?.choices?.[0]?.message?.content ||
      'No AI response generated.';

    return text;
  } catch (error) {
    console.error(
      'FEATHERLESS ERROR:',
      error.response?.data || error.message
    );

    // Tactical Simulation Brief (Immersive Fallback)
    const fallbacks = [
      "Signal vector localized. Primary indicator suggests an obfuscated peer-to-peer relay originating from a K-class server farm. Advise immediate deep-packet inspection.",
      "Anomaly detected in behavioral telemetry. Signal density points to a non-standard metabolic peak. Cross-referencing active case archives for secondary correlation.",
      "Forensic hash mismatch identified in current evidence chain. Recommend re-verification of the integrity of the raw laboratory ingest before proceeding.",
      "Digital footprint identified. Vector: Encrypted financial pivot via decentralized node. Secondary indicator: Meta-data scrub attempt detected. Advise escalation."
    ];
    
    return `[ANALYSIS]: ${fallbacks[Math.floor(Math.random() * fallbacks.length)]}`;
  }
}

module.exports = { generateResponse };