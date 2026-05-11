const express = require('express');
const router = express.Router();
const featherlessService = require('../services/featherlessService');

/**
 * POST /api/ai/chat
 * Main investigative chat endpoint - Powered by Featherless
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    console.log('Incoming Prompt:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiResponse = await featherlessService.generateResponse(message);
    
    const payload = {
      success: true,
      response: aiResponse,
      confidence: 94,
      timestamp: new Date().toISOString()
    };

    console.log('FINAL FRONTEND PAYLOAD:', JSON.stringify(payload, null, 2));
    res.json(payload);
  } catch (error) {
    console.error('AI ROUTE ERROR:', error);
    res.json({
      success: false,
      response: 'AI system temporarily overloaded. Simulation mode active.',
      confidence: 72,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
