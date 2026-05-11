import { AI_CONFIG } from '../config';
import { MockProvider } from '../providers/mock';
import { GeminiProvider, OpenRouterProvider, FeatherlessProvider } from '../providers/llm';

export class AIService {
  private static async executeWithFallback(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      if (AI_CONFIG.primaryProvider === 'gemini' && AI_CONFIG.providers.gemini.apiKey) {
        return await new GeminiProvider().analyze(prompt, systemPrompt);
      }
      throw new Error("Primary provider failed or unconfigured");
    } catch (e) {
      console.warn("Falling back to secondary provider...");
      try {
        if (AI_CONFIG.providers.featherless.apiKey) {
          return await new FeatherlessProvider().analyze(prompt, systemPrompt);
        }
      } catch (e2) {
        console.warn("Falling back to mock provider...");
      }
      
      if (AI_CONFIG.useMockOnFailure) {
        return await new MockProvider().analyze(prompt, systemPrompt);
      }
      throw new Error("All AI providers failed.");
    }
  }

  static async analyzeEvidence(evidenceData: any) {
    const prompt = `Analyze this evidence: ${JSON.stringify(evidenceData)}`;
    const res = await this.executeWithFallback(prompt);
    try { return JSON.parse(res); } catch { return res; }
  }

  static async generateInsights(caseData: any) {
    const prompt = `Generate insights for case: ${JSON.stringify(caseData)}`;
    const res = await this.executeWithFallback(prompt);
    try { return JSON.parse(res); } catch { return res; }
  }

  static async predictInvestigation(context: any) {
    const prompt = `Generate predictive investigation steps for: ${JSON.stringify(context)}`;
    const res = await this.executeWithFallback(prompt);
    try { return JSON.parse(res); } catch { return res; }
  }

  static async analyzeDeepfake(mediaData: any) {
    const prompt = `Perform deepfake analysis on: ${JSON.stringify(mediaData)}`;
    const res = await this.executeWithFallback(prompt);
    try { return JSON.parse(res); } catch { return res; }
  }

  static async behavioralAnalysis(subjectData: any) {
    const prompt = `Perform behavioral analysis on: ${JSON.stringify(subjectData)}`;
    const res = await this.executeWithFallback(prompt);
    try { return JSON.parse(res); } catch { return res; }
  }

  static async toxicologyPrediction(toxData: any) {
    const prompt = `Perform toxicology prediction on: ${JSON.stringify(toxData)}`;
    const res = await this.executeWithFallback(prompt);
    try { return JSON.parse(res); } catch { return res; }
  }
}
