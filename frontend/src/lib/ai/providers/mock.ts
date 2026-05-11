import { AI_CONFIG } from '../config';

export interface AIProvider {
  analyze(prompt: string, systemPrompt?: string): Promise<string>;
}

export class MockProvider implements AIProvider {
  async analyze(prompt: string, systemPrompt?: string): Promise<string> {
    // Generate believable mock responses
    if (prompt.includes('deepfake')) {
      return JSON.stringify({
        authenticity_score: 42,
        manipulation_type: "Face GAN Injection",
        details: { anomalies: ["Unnatural eye blinking", "Jawline artifacting"] }
      });
    }
    if (prompt.includes('toxicology')) {
      return JSON.stringify({
        lethal_probability: 91,
        findings: { substance: "Tetrodotoxin", levels: "Critical" },
        analysis_summary: "Lethal dosage of paralyzing agent detected."
      });
    }
    if (prompt.includes('predictive') || prompt.includes('prediction')) {
      return JSON.stringify([
        { suggestion: "Cross-reference target's encrypted comms at 08:45:22", confidence: 94 },
        { suggestion: "Dispatch drone to last known cell tower triangulation", confidence: 88 },
        { suggestion: "Analyze financial transfers to offshore accounts", confidence: 76 }
      ]);
    }
    if (prompt.includes('behavioral')) {
      return JSON.stringify({
        pattern_type: "Evasion / Counter-Surveillance",
        description: "Target demonstrates route randomization and burner phone swapping.",
        confidence: 96
      });
    }
    
    // Default fallback mock
    return JSON.stringify({ message: "Mock analysis complete.", confidence: 99 });
  }
}
