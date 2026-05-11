import { AI_CONFIG } from '../config';
import { AIProvider, MockProvider } from './mock';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(AI_CONFIG.providers.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: AI_CONFIG.providers.gemini.model });
  }

  async analyze(prompt: string, systemPrompt?: string): Promise<string> {
    if (!AI_CONFIG.providers.gemini.apiKey) {
      throw new Error("Gemini API Key missing");
    }
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const result = await this.model.generateContent(fullPrompt);
    return result.response.text();
  }
}

export class OpenRouterProvider implements AIProvider {
  async analyze(prompt: string, systemPrompt?: string): Promise<string> {
    if (!AI_CONFIG.providers.openrouter.apiKey) throw new Error("OpenRouter API Key missing");
    
    const response = await fetch(`${AI_CONFIG.providers.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.providers.openrouter.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_CONFIG.providers.openrouter.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export class FeatherlessProvider implements AIProvider {
  async analyze(prompt: string, systemPrompt?: string): Promise<string> {
    if (!AI_CONFIG.providers.featherless.apiKey) throw new Error("Featherless API Key missing");
    
    const response = await fetch(`${AI_CONFIG.providers.featherless.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.providers.featherless.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_CONFIG.providers.featherless.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
