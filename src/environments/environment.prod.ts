export const environment = {
    production: true,
    openaiApiKey: process.env['OPENAI_API_KEY'] || '',
    googleApiKey: process.env['GOOGLE_API_KEY'] || '',
    anthropicApiKey: process.env['ANTHROPIC_API_KEY'] || '',
    groqApiKey: process.env['GROQ_API_KEY'] || '',
};