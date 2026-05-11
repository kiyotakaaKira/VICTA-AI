export const AI_CONFIG = {
  primaryProvider: 'gemini',
  fallbackProvider: 'featherless',
  useMockOnFailure: true,
  providers: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-1.5-pro-latest',
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'anthropic/claude-3-opus',
    },
    featherless: {
      apiKey: process.env.FEATHERLESS_API_KEY || '',
      baseUrl: 'https://api.featherless.ai/v1',
      model: 'meta-llama/llama-3-70b-instruct',
    }
  }
};
