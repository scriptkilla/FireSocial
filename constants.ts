// Fix: Removed ApiService from this import as it's not defined in types.ts. It will be defined and exported in this file.
import { Themes, Reaction, Achievement } from './types';

export const THEMES: Themes = {
  orange: {
    from: 'from-orange-500',
    to: 'to-red-500',
    light: 'from-orange-50 via-red-50 to-pink-50',
    text: 'text-orange-500',
    ring: 'focus:ring-orange-500',
    border: 'border-orange-500',
    hoverText: 'hover:text-orange-500',
  },
  blue: {
    from: 'from-blue-500',
    to: 'to-purple-500',
    light: 'from-blue-50 via-purple-50 to-pink-50',
    text: 'text-blue-500',
    ring: 'focus:ring-blue-500',
    border: 'border-blue-500',
    hoverText: 'hover:text-blue-500',
  },
  green: {
    from: 'from-green-500',
    to: 'to-teal-500',
    light: 'from-green-50 via-teal-50 to-blue-50',
    text: 'text-green-500',
    ring: 'focus:ring-green-500',
    border: 'border-green-500',
    hoverText: 'hover:text-green-500',
  },
  pink: {
    from: 'from-pink-500',
    to: 'to-rose-500',
    light: 'from-pink-50 via-rose-50 to-red-50',
    text: 'text-pink-500',
    ring: 'focus:ring-pink-500',
    border: 'border-pink-500',
    hoverText: 'hover:text-pink-500',
  },
};

export const REACTIONS: Reaction[] = [
  { name: 'like', emoji: '👍', color: 'text-blue-500' },
  { name: 'love', emoji: '❤️', color: 'text-red-500' },
  { name: 'fire', emoji: '🔥', color: 'text-orange-500' },
  { name: 'star', emoji: '⭐', color: 'text-yellow-500' },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_post', icon: '🎯', name: 'First Post', description: 'Created your first post' },
  { id: '10_posts', icon: '✍️', name: 'Prolific Poster', description: 'Made 10 posts' },
  { id: '100_followers', icon: '💯', name: '100 Followers', description: 'Reached 100 followers' },
  { id: '50_following', icon: '🤝', name: 'Social Butterfly', description: 'Followed 50 people' },
  { id: '10_day_streak', icon: '🔥', name: '10 Day Streak', description: 'Posted for 10 days straight' },
  { id: 'popular_post', icon: '⭐', name: 'Popular Post', description: 'Got 100+ likes on a post' }
];

export const API_CONFIG: { [key: string]: { storageKey: string; url: string; baseUrlKey?: string; modelNameKey?: string } } = {
  'Google AI': { storageKey: 'apiKey_google_ai', url: 'https://aistudio.google.com/apikeys' },
  'OpenAI': { storageKey: 'apiKey_openai', url: 'https://platform.openai.com/api-keys' },
  'Anthropic': { storageKey: 'apiKey_anthropic', url: 'https://console.anthropic.com/settings/keys' },
  'Meta (Llama)': { storageKey: 'apiKey_meta', url: 'https://ai.meta.com/resources/models-and-libraries/' },
  'xAI (Grok)': { storageKey: 'apiKey_xai', url: 'https://x.ai/product' },
  'DeepSeek': { storageKey: 'apiKey_deepseek', url: 'https://platform.deepseek.com/api_keys' },
  'Mistral AI': { storageKey: 'apiKey_mistral', url: 'https://console.mistral.ai/api-keys/' },
  'Custom': {
    storageKey: 'apiKey_custom',
    url: '#',
    baseUrlKey: 'baseUrl_custom',
    modelNameKey: 'modelName_custom'
  }
};

// Fix: Defined and exported ApiService type here to be used across components.
export type ApiService = keyof typeof API_CONFIG;

export type AIModelInfo = { id: string; name: string; description: string };
export const API_VERSIONS: Record<string, { name: string; description: string, models: AIModelInfo[] }[]> = {
    'Google AI': [
        { name: 'Gemini Series', description: 'Google\'s flagship multimodal models.', models: [
            { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: "Google's state-of-the-art model for tackling complex tasks, excelling in advanced reasoning, coding, and more with a 1 million token context window." },
            { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Optimized for speed and efficiency, ideal for large-scale processing and low-latency tasks.' },
            { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'The fastest model in the Flash family, optimized for cost-efficiency and high-throughput tasks.' },
            { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', description: 'A specialized variant fine-tuned for high-quality image generation and editing (codename "Nano Banana").' },
            { id: 'gemini-2.5-computer-use', name: 'Gemini 2.5 Computer Use', description: 'Allows AI agents to interact directly with user interfaces to perform tasks like navigating websites.' },
        ]},
        { name: 'Imagen Series', description: 'Advanced image generation models.', models: [
            { id: 'imagen-4.0-generate-001', name: 'Imagen 4', description: 'Highest quality image generation for photorealistic results.' },
        ]},
        { name: 'Veo Series', description: 'High-quality video generation models.', models: [
             { id: 'veo-3.1-generate-preview', name: 'Veo 3.1', description: 'High-quality video generation.' },
             { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 Fast', description: 'Faster video generation.' },
        ]},
        { name: 'Specialized', description: 'Models for specific tasks.', models: [
             { id: 'gemini-2.5-flash-preview-tts', name: 'TTS', description: 'Text-to-speech generation.' },
        ]}
    ],
    'OpenAI': [
        { name: 'GPT-5 Series', description: 'OpenAI\'s latest and most capable models.', models: [
            { id: 'gpt-5.1', name: 'gpt-5.1', description: 'Newest series; conversational, intelligent, with "Instant" & "Thinking" variants.' },
            { id: 'gpt-5.1-chat', name: 'gpt-5.1-chat', description: 'Chat-optimized version of the newest GPT-5.1 model.' },
            { id: 'gpt-5.1-codex', name: 'gpt-5.1-codex', description: 'Code-optimized version of the newest GPT-5.1 model.' },
            { id: 'gpt-5', name: 'gpt-5', description: 'Predecessor to the GPT-5.1 series.' },
            { id: 'gpt-5-mini', name: 'gpt-5-mini', description: 'A smaller, faster version of GPT-5.' },
            { id: 'gpt-5-nano', name: 'gpt-5-nano', description: 'The most compact version of GPT-5 for lightweight tasks.' },
        ]},
        { name: 'GPT-4 Series', description: 'Proven and powerful multimodal models.', models: [
             { id: 'gpt-4.5', name: 'gpt-4.5', description: 'Research preview focusing on broad knowledge and natural interaction.' },
             { id: 'gpt-4o', name: 'gpt-4o', description: 'Balanced multimodal (text/image) model, updated to be more intuitive.' },
             { id: 'gpt-4o-mini', name: 'gpt-4o-mini', description: 'Smaller, faster, and more affordable version of GPT-4o.' },
        ]},
        { name: 'Reasoning Series', description: 'Models specialized for complex logic.', models: [
            { id: 'o3-mini', name: 'o3-mini', description: 'Advanced reasoning model for complex STEM and logic problems.' },
            { id: 'o4-mini', name: 'o4-mini', description: 'Next-gen advanced reasoning model for complex problems.' },
        ]}
    ],
    'Anthropic': [
        { name: 'Claude 4 Series', description: 'Focus on safety, reliability, and advanced reasoning.', models: [
            { id: 'claude-opus-4.1', name: 'Claude Opus 4.1', description: 'Most intelligent for specialized reasoning, high precision. Use cases: Advanced reasoning, real-world coding, complex research.' },
            { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Best balance of intelligence/speed/cost, top for coding/agents. Use cases: Complex AI agents, code generation, computer use, financial analysis.' },
            { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', description: 'Fastest model, near-frontier intelligence, cost-effective. Use cases: Live customer chats, content moderation, quick queries.' },
        ]}
    ],
    'Meta (Llama)': [
        { name: 'Llama Series', description: 'Powerful open models from Meta.', models: [
            { id: 'llama-4', name: 'Llama 4 🚀', description: 'Scout (17B), Maverick (17B). Powers Meta AI assistant; multimodal (text+images); open weights & cloud APIs' },
            { id: 'llama-3.3', name: 'Llama 3.3', description: '70B. High-performance, text-only; efficient for summarization, Q&A' },
            { id: 'llama-3.2', name: 'Llama 3.2', description: '1B, 3B, Vision 11B, Vision 90B. Includes first open-weight vision models; small text models for mobile/edge devices' },
            { id: 'llama-3.1', name: 'Llama 3.1', description: '8B, 70B, 405B. Large-scale open-weight models; 405B is a frontier-level model for advanced reasoning' },
        ]}
    ],
    'xAI (Grok)': [
        { name: 'Grok Series', description: 'Integrated with real-time X platform data.', models: [
            { id: 'grok-4', name: 'Grok 4', description: 'Current flagship; native tool use, 256k context, voice mode with live camera.' },
            { id: 'grok-4-heavy', name: 'Grok 4 Heavy', description: 'Uses multi-agent parallel reasoning for complex tasks.' },
            { id: 'grok-4-fast', name: 'Grok 4 Fast', description: 'Balances speed and intelligence for quicker responses.' },
            { id: 'grok-3', name: 'Grok 3', description: '"Reasoning model"; introduced Think mode, DeepSearch, and voice support.' },
            { id: 'grok-3-mini', name: 'Grok 3 mini', description: 'Faster version of Grok 3.' },
            { id: 'grok-2', name: 'Grok 2', description: 'Major performance upgrade; image generation; Grok-2 mini for faster responses.' },
            { id: 'grok-1.5', name: 'Grok 1.5', description: 'Improved reasoning; 128k token context window.' },
            { id: 'grok-1', name: 'Grok 1', description: 'First version; witty tone; real-time X integration.' },
        ]}
    ],
    'DeepSeek': [
        { name: 'DeepSeek Series', description: 'Competitive open-source reasoning models.', models: [
            { id: 'deepseek-v3.2-exp', name: 'DeepSeek-V3.2-Exp', description: 'Experimental (Sept \'25); "DeepSeek Sparse Attention" for long-context efficiency. Cost-effective.' },
            { id: 'deepseek-v3.1', name: 'DeepSeek-V3.1', description: 'Hybrid model (Aug \'25); one model for thinking & non-thinking modes. Faster reasoning, stronger agent/tool use.' },
            { id: 'deepseek-r1-0528', name: 'DeepSeek-R1-0528', description: 'R1 upgrade (May \'25); stronger reasoning, less hallucination. Supports system prompts.' },
            { id: 'deepseek-v3-0324', name: 'DeepSeek-V3-0324', description: 'V3 update (March \'25); RL techniques from R1. Surpasses GPT-4.5 in math/coding.' },
            { id: 'deepseek-r1', name: 'DeepSeek-R1', description: 'Specialized "reasoning model". Step-by-step CoT; rivals OpenAI o1 in logic/math/coding.' },
            { id: 'deepseek-v3', name: 'DeepSeek-V3', description: 'General-purpose, strong coding/math. 671B parameter MoE (37B activated); 128K context.' },
        ]}
    ],
    'Mistral AI': [
        { name: 'Mistral/Magistral Series', description: 'High-performance open and optimized models.', models: [
            { id: 'magistral-medium-1.2', name: 'Magistral Medium 1.2', description: 'Advanced enterprise reasoning model.' },
            { id: 'magistral-small-1.2', name: 'Magistral Small 1.2', description: 'Open-weight advanced reasoning model.' },
            { id: 'mistral-medium-3', name: 'Mistral Medium 3', description: 'Enterprise-grade model; strong in coding & STEM.' },
            { id: 'mistral-small-3.2', name: 'Mistral Small 3.2', description: 'General-purpose small model; some image understanding.' },
        ]},
        { name: 'Specialized Series', description: 'Models fine-tuned for specific domains.', models: [
            { id: 'devstral-medium', name: 'Devstral Medium', description: 'AI model for software engineering tasks.' },
            { id: 'devstral-small-1.1', name: 'Devstral Small 1.1', description: 'Open-source model for coding.' },
            { id: 'codestral-2508', name: 'Codestral 2508', description: 'Specialized for code generation.' },
            { id: 'voxtral-small', name: 'Voxtral Small', description: 'Open-source AI audio model for chat and transcription.' },
            { id: 'voxtral-mini', name: 'Voxtral Mini', description: 'Compact audio model.' },
            { id: 'ministral-8b', name: 'Ministral 8B', description: 'Small model optimized for edge devices.' },
            { id: 'ministral-3b', name: 'Ministral 3B', description: 'Compact model for on-device tasks.' },
            { id: 'pixtral-large', name: 'Pixtral Large', description: 'Multimodal model for text and images.' },
            { id: 'mistral-ocr', name: 'Mistral OCR', description: 'Special-purpose model for text recognition.' },
            { id: 'mistral-saba', name: 'Mistral Saba', description: 'Specialized model focused on Arabic.' },
        ]}
    ],
    'Custom': [],
};

export const getModelDeveloper = (modelId: string): string => {
    for (const [developer, versions] of Object.entries(API_VERSIONS)) {
         for (const category of versions) {
            if (category.models.some(m => m.id === modelId)) {
                return developer;
            }
        }
    }
    return 'Unknown';
};