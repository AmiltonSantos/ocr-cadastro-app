import { Injectable } from '@angular/core';
import { generateText, LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGroq } from '@ai-sdk/groq';
import { environment } from '../../environments/environment';

export type AiProvider = 'openai' | 'google' | 'anthropic' | 'groq';

export interface AiModelConfig {
    provider: AiProvider;
    model: string;
    apiKey: string;
}

@Injectable({ providedIn: 'root' })
export class AiModelsService {

    private configs: Record<AiProvider, AiModelConfig> = {
        openai: {
            provider: 'openai',
            model: 'gpt-4o-mini',
            apiKey: environment.openaiApiKey
        },
        google: {
            provider: 'google',
            model: 'gemini-2.5-flash',
            apiKey: environment.googleApiKey
        },
        anthropic: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-5',
            apiKey: environment.anthropicApiKey
        },
        groq: {
            provider: 'groq',
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            apiKey: environment.groqApiKey
        }
    };

    private activeProvider: AiProvider = 'google';

    getModel(): LanguageModel {
        const config = this.configs[this.activeProvider];

        switch (this.activeProvider) {
            case 'openai':
                return createOpenAI({ apiKey: config.apiKey })(config.model);

            case 'google':
                return createGoogleGenerativeAI({ apiKey: config.apiKey })(config.model);

            case 'anthropic':
                return createAnthropic({ apiKey: config.apiKey })(config.model);

            case 'groq':
                return createGroq({ apiKey: config.apiKey })(config.model);
        }
    }

    setProvider(provider: AiProvider): void {
        this.activeProvider = provider;
    }

    getActiveProvider(): AiProvider {
        return this.activeProvider;
    }

    updateApiKey(provider: AiProvider, apiKey: string): void {
        this.configs[provider].apiKey = apiKey;
    }

    updateModel(provider: AiProvider, model: string): void {
        this.configs[provider].model = model;
    }

    async generate(prompt: string, imageBase64?: string): Promise<string> {
        const content: any[] = [];

        if (imageBase64) {
            content.push({
                type: 'image',
                image: imageBase64.includes('base64,')
                    ? imageBase64
                    : `data:image/jpeg;base64,${imageBase64}`
            });
        }

        content.push({ type: 'text', text: prompt });

        const { text } = await generateText({
            model: this.getModel(),
            messages: [{ role: 'user', content }]
        });

        return text.replace(/```json|```/g, '').trim();
    }
}