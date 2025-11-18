
import React, { useState, useRef, useEffect } from 'react';
import { X, Text, Image as ImageIcon, Video, Mic, Code, Bot, Settings, ChevronDown, Sparkles, Wand2, RefreshCw, Download, Copy, ThumbsUp, ThumbsDown, Check, AlertTriangle, KeyRound, UploadCloud, File, Map, Search, BrainCircuit, Play, StopCircle } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Modality, GroundingChunk } from "@google/genai";

interface AICreatorModalProps {
    show: boolean;
    onClose: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
    
const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


// --- Constants ---
const CREATION_TABS = [
    { name: 'Text', icon: Text },
    { name: 'Image', icon: ImageIcon },
    { name: 'Video', icon: Video },
    { name: 'Audio', icon: Mic },
];

type AIModel = {
    id: string;
    name: string;
    description: string;
};
type AIModelCategory = {
    category: string;
    models: AIModel[];
};
type AIModelFamily = {
    family: string;
    developer: string;
    description: string;
    accessType: string;
    categories: AIModelCategory[];
};

const AI_MODELS: AIModelFamily[] = [
    {
        family: 'Gemini Series',
        developer: 'Google DeepMind',
        description: 'Native multi-modal understanding, massive context windows, strong in reasoning.',
        accessType: 'Proprietary',
        categories: [
            {
                category: 'Text & Chat',
                models: [
                    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable model for complex tasks.' },
                    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient for general use.' },
                ]
            },
            {
                category: 'Image',
                models: [
                    { id: 'imagen-4.0-generate-001', name: 'Imagen 4', description: 'Highest-quality image generation.' },
                    { id: 'gemini-2.5-flash-image', name: 'Nano Banana', description: 'Generate and edit images quickly.' },
                ]
            },
            {
                category: 'Video',
                models: [
                    { id: 'veo-3.1-generate-preview', name: 'Veo 3.1', description: 'High-quality video generation.' },
                    { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 Fast', description: 'Faster video generation.' },
                ]
            },
            {
                category: 'Audio',
                models: [
                    { id: 'gemini-2.5-flash-preview-tts', name: 'TTS', description: 'Text-to-speech generation.' },
                ]
            },
        ]
    },
    {
        family: 'GPT Series',
        developer: 'OpenAI',
        description: 'State-of-the-art performance, strong multi-modal and reasoning abilities.',
        accessType: 'Proprietary',
        categories: [
             {
                category: 'GPT-5.1 Series',
                models: [
                    { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Newest series; conversational, intelligent, with "Instant" & "Thinking" variants.' },
                    { id: 'gpt-5.1-chat', name: 'GPT-5.1 Chat', description: 'Chat-optimized version of the newest GPT-5.1 model.' },
                    { id: 'gpt-5.1-codex', name: 'GPT-5.1 Codex', description: 'Code-optimized version of the newest GPT-5.1 model.' },
                ]
            },
            {
                category: 'GPT-4o Series',
                models: [
                    { id: 'gpt-4o', name: 'GPT-4o', description: 'Balanced multimodal (text/image) model, updated to be more intuitive.' },
                    { id: 'gpt-4o-mini', name: 'GPT-4o mini', description: 'A smaller, faster, and more affordable version of GPT-4o.' },
                ]
            },
            {
                category: 'o-Series (Reasoning)',
                 models: [
                    { id: 'o3-mini', name: 'o3-mini', description: 'Advanced reasoning model for complex STEM and logic problems.' },
                    { id: 'o4-mini', name: 'o4-mini', description: 'Next-gen advanced reasoning model for complex problems.' },
                ]
            },
             {
                category: 'Legacy & Specialized',
                 models: [
                    { id: 'gpt-5', name: 'GPT-5', description: 'Predecessor to the GPT-5.1 series.' },
                    { id: 'gpt-4.5', name: 'GPT-4.5', description: 'Research preview focusing on broad knowledge and natural interaction.' },
                ]
            },
        ]
    },
    {
        family: 'Claude Series',
        developer: 'Anthropic',
        description: 'Focus on safety, reliability, and advanced reasoning; known for long context windows.',
        accessType: 'Proprietary',
        categories: [
             {
                category: 'Text & Chat',
                models: [
                    { id: 'claude-opus-4.1', name: 'Claude Opus 4.1', description: 'Most intelligent for specialized reasoning, high precision. Use cases: Advanced reasoning, real-world coding, complex research.' },
                    { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Best balance of intelligence/speed/cost, top for coding/agents. Use cases: Complex AI agents, code generation, computer use, financial analysis.' },
                    { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', description: 'Fastest model, near-frontier intelligence, cost-effective. Use cases: Live customer chats, content moderation, quick queries.' },
                ]
            },
        ]
    },
    {
        family: 'Llama Series',
        developer: 'Meta',
        description: 'Powerful open models, strong performance for their size, large community.',
        accessType: 'Open License',
        categories: [
             {
                category: 'Llama 4 Series',
                models: [
                    { id: 'llama-4', name: 'Llama 4 🚀', description: 'Scout (17B), Maverick (17B). Powers Meta AI assistant; multimodal (text+images); open weights & cloud APIs.' },
                ]
            },
            {
                category: 'Llama 3 Series',
                models: [
                    { id: 'llama-3.3', name: 'Llama 3.3', description: '70B. High-performance, text-only; efficient for summarization, Q&A.' },
                    { id: 'llama-3.2', name: 'Llama 3.2', description: '1B, 3B, Vision 11B, Vision 90B. Includes first open-weight vision models; small text models for mobile/edge devices.' },
                    { id: 'llama-3.1', name: 'Llama 3.1', description: '8B, 70B, 405B. Large-scale open-weight models; 405B is a frontier-level model for advanced reasoning.' },
                ]
            },
        ]
    },
     {
        family: 'Grok Series',
        developer: 'xAI',
        description: 'Integrated with real-time platform data, features "reasoning" modes.',
        accessType: 'Proprietary',
        categories: [
             {
                category: 'Grok 4 Series',
                models: [
                    { id: 'grok-4', name: 'Grok 4', description: 'Current flagship; native tool use, 256k context, voice mode with live camera.' },
                    { id: 'grok-4-heavy', name: 'Grok 4 Heavy', description: 'Uses multi-agent parallel reasoning for complex tasks.' },
                    { id: 'grok-4-fast', name: 'Grok 4 Fast', description: 'Balances speed and intelligence for quicker responses.' },
                ]
            },
            {
                category: 'Grok 3 Series',
                models: [
                    { id: 'grok-3', name: 'Grok 3', description: '"Reasoning model"; introduced Think mode, DeepSearch, and voice support.' },
                    { id: 'grok-3-mini', name: 'Grok 3 mini', description: 'Faster version of Grok 3.' },
                ]
            },
            {
                category: 'Older Versions',
                models: [
                    { id: 'grok-2', name: 'Grok 2', description: 'Major performance upgrade; image generation; Grok-2 mini for faster responses.' },
                    { id: 'grok-1.5', name: 'Grok 1.5', description: 'Improved reasoning; 128k token context window.' },
                    { id: 'grok-1', name: 'Grok 1', description: 'First version; witty tone; real-time X integration.' },
                ]
            }
        ]
    },
    {
        family: 'DeepSeek Series',
        developer: 'DeepSeek',
        description: 'Competitive open-source reasoning models, strong performance.',
        accessType: 'Open Source (MIT)',
        categories: [
             {
                category: 'Text & Chat',
                models: [
                    { id: 'deepseek-v3.2-exp', name: 'DeepSeek-V3.2-Exp', description: 'Experimental (Sept \'25); Efficient long-context processing. Cost-effective.' },
                    { id: 'deepseek-v3.1', name: 'DeepSeek-V3.1', description: 'Hybrid model (Aug \'25); Faster reasoning and stronger agent/tool use.' },
                    { id: 'deepseek-r1-0528', name: 'DeepSeek-R1-0528', description: 'R1 upgrade (May \'25); Stronger reasoning, less hallucination, supports system prompts.' },
                    { id: 'deepseek-v3-0324', name: 'DeepSeek-V3-0324', description: 'V3 update (March \'25); Surpasses GPT-4.5 in math/coding, better tool use.' },
                    { id: 'deepseek-r1', name: 'DeepSeek-R1', description: 'Specialized "reasoning model" for complex problem-solving and logic.' },
                    { id: 'deepseek-v3', name: 'DeepSeek-V3', description: 'General-purpose model with strong coding/math abilities and 128K context.' },
                ]
            },
        ]
    },
    {
        family: 'Mistral AI',
        developer: 'Mistral AI',
        description: 'High-performance open and optimized models, known for efficiency and customization.',
        accessType: 'Varies (Open & Proprietary)',
        categories: [
            {
                category: 'Reasoning (Magistral)',
                models: [
                    { id: 'magistral-medium-1.2', name: 'Magistral Medium 1.2', description: 'Enterprise reasoning model for advanced tasks.' },
                    { id: 'magistral-small-1.2', name: 'Magistral Small 1.2', description: 'Open-weight counterpart for advanced reasoning.' },
                ]
            },
            {
                category: 'Enterprise & General',
                models: [
                    { id: 'mistral-medium-3', name: 'Mistral Medium 3', description: 'Balances high performance with lower cost; strong in coding & STEM.' },
                    { id: 'mistral-small-3.2', name: 'Mistral Small 3.2', description: 'Leader in small models; some versions have image understanding.' },
                ]
            },
            {
                category: 'Coding',
                models: [
                    { id: 'devstral-medium', name: 'Devstral Medium', description: 'AI model designed for software engineering tasks.' },
                    { id: 'devstral-small-1.1', name: 'Devstral Small 1.1', description: 'Smaller, open-source model for coding.' },
                    { id: 'codestral-2508', name: 'Codestral 2508', description: 'Specialized model for code generation.' },
                ]
            },
            {
                category: 'Audio (Voxtral)',
                models: [
                    { id: 'voxtral-small', name: 'Voxtral Small', description: 'Open-source audio model for chat and transcription.' },
                    { id: 'voxtral-mini', name: 'Voxtral Mini', description: 'A more compact version of Voxtral for audio tasks.' },
                ]
            },
            {
                category: 'Edge (Ministral)',
                models: [
                    { id: 'ministral-8b', name: 'Ministral 8B', description: 'Small model optimized for edge devices like phones.' },
                    { id: 'ministral-3b', name: 'Ministral 3B', description: 'A very compact model for on-device tasks.' },
                ]
            },
            {
                category: 'Multimodal (Pixtral)',
                models: [
                    { id: 'pixtral-large', name: 'Pixtral Large', description: 'Can understand both text and images.' },
                ]
            },
            {
                category: 'Specialized',
                models: [
                    { id: 'mistral-ocr', name: 'Mistral OCR', description: 'Special-purpose model for text recognition in images.' },
                    { id: 'mistral-saba', name: 'Mistral Saba', description: 'A specialized model focused on the Arabic language.' },
                ]
            },
        ]
    },
    {
        family: 'Others',
        developer: 'Various',
        description: 'Includes efficient and specialized models from other leading AI companies.',
        accessType: 'Varies (Open & Proprietary)',
        categories: [
             {
                category: 'Text & Chat',
                models: [
                    { id: 'falcon-3', name: 'Falcon 3', description: 'Next-gen open model from TII.' },
                    { id: 'qwen3', name: 'Qwen3', description: 'Large language model from Alibaba Cloud.' },
                ]
            },
        ]
    },
];

const TONE_OPTIONS = ['Professional', 'Casual', 'Funny', 'Persuasive', 'Witty', 'Bold', 'Empathetic'];
const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

// --- Types ---
type CreationMode = 'generate' | 'edit' | 'analyze';
type AudioMode = 'tts' | 'transcribe';
type SourceFile = { file: File, type: 'image' | 'video' | 'audio', url: string, base64: string };
type GenerationResult = { type: 'text' | 'image' | 'video' | 'audio', content: string | { url: string; sources?: GroundingChunk[] } };

// --- Sub-Components ---
const CreationTabs: React.FC<{ activeTab: string, onTabChange: (tab: string) => void, textColor: string, currentTheme: Theme }> = ({ activeTab, onTabChange, textColor, currentTheme }) => (
    <div className="flex items-center gap-2">
        {CREATION_TABS.map(({ name, icon: Icon }) => (
            <button key={name} onClick={() => onTabChange(name)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === name ? `bg-white/10 ${textColor}` : 'text-gray-400 hover:bg-white/5'}`}>
                <Icon size={16} /> {name}
            </button>
        ))}
    </div>
);

const SettingsPanel: React.FC<{
    models: AIModelFamily[]; selectedModel: AIModel; onModelChange: (model: AIModel) => void;
    tones: string[]; selectedTone: string; onToneChange: (tone: string) => void;
    creativity: number; onCreativityChange: (value: number) => void;
    aspectRatios: string[]; selectedAspectRatio: string; onAspectRatioChange: (ratio: string) => void;
    isImagenSelected: boolean;
    useSearch: boolean; onUseSearchChange: (v: boolean) => void;
    useMaps: boolean; onUseMapsChange: (v: boolean) => void;
    useThinking: boolean; onUseThinkingChange: (v: boolean) => void;
    isProModel: boolean;
    // UI props
    cardBg: string; textColor: string; textSecondary: string; borderColor: string; currentTheme: Theme;
}> = (props) => {
    const { models, selectedModel, onModelChange, tones, selectedTone, onToneChange, creativity, onCreativityChange, aspectRatios, selectedAspectRatio, onAspectRatioChange, isImagenSelected, useSearch, onUseSearchChange, useMaps, onUseMapsChange, useThinking, onUseThinkingChange, isProModel, cardBg, textColor, textSecondary, borderColor, currentTheme } = props;
    const [dropdown, setDropdown] = useState<'model' | 'tone' | null>(null);

    const SettingItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
        <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>{children}</div>
    );
    
    const ToggleItem: React.FC<{ icon: React.ElementType, label: string, checked: boolean, onChange: (c:boolean) => void, disabled?: boolean }> = ({ icon: Icon, label, checked, onChange, disabled=false }) => (
        <label className={`flex items-center justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed': ''}`}>
            <div className="flex items-center gap-2 text-sm"><Icon size={16}/>{label}</div>
            <button onClick={() => !disabled && onChange(!checked)} disabled={disabled} className={`w-10 h-5 rounded-full transition-all ${checked ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
        </label>
    );

    return (
        <aside className={`w-full lg:w-72 flex-shrink-0 p-4 space-y-4 overflow-y-auto rounded-lg bg-black/5 dark:bg-white/5`}>
            <SettingItem label="AI Model">
                 <div className="relative">
                    <button onClick={() => setDropdown(d => d === 'model' ? null : 'model')} className={`w-full flex justify-between items-center p-2 rounded-lg text-left text-sm ${cardBg} border ${borderColor}`}>
                        <span>{selectedModel.name}</span> <ChevronDown size={16} />
                    </button>
                    {dropdown === 'model' && (<div className={`absolute top-full mt-1 w-full ${cardBg} border ${borderColor} rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto`}>
                        {models.map(family => (
                            <div key={family.family}>
                                <h4 className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 sticky top-0 bg-inherit">{family.family}</h4>
                                <ul>
                                    {family.categories.map(category => (
                                        <React.Fragment key={category.category}>
                                            {family.categories.length > 1 && <h5 className="px-3 pt-1 text-xs font-semibold text-gray-500">{category.category}</h5>}
                                            {category.models.map(m => (
                                                <li key={m.id}>
                                                    <button onClick={() => { onModelChange(m); setDropdown(null); }} className={`w-full text-left px-3 py-2 hover:bg-white/10 text-sm`}>
                                                        <p className={selectedModel.id === m.id ? currentTheme.text : textColor}>{m.name}</p>
                                                        <p className="text-xs text-gray-500">{m.description}</p>
                                                    </button>
                                                </li>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>)}
                </div>
            </SettingItem>
            <div className={`p-3 rounded-lg border ${borderColor} bg-black/5 dark:bg-white/5 space-y-2`}>
                 <ToggleItem icon={Search} label="Use Google Search" checked={useSearch} onChange={onUseSearchChange} />
                 <ToggleItem icon={Map} label="Use Google Maps" checked={useMaps} onChange={onUseMapsChange} />
                 <ToggleItem icon={BrainCircuit} label="Thinking Mode" checked={useThinking} onChange={onUseThinkingChange} disabled={!isProModel} />
            </div>
            <SettingItem label="Tone"><div className="relative">
                <button onClick={() => setDropdown(d => d === 'tone' ? null : 'tone')} className={`w-full flex justify-between items-center p-2 rounded-lg text-left text-sm ${cardBg} border ${borderColor}`}>
                    <span>{selectedTone}</span> <ChevronDown size={16} />
                </button>
                {dropdown === 'tone' && (<div className={`absolute top-full mt-1 w-full ${cardBg} border ${borderColor} rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto`}><ul>
                    {tones.map(t => (<li key={t}><button onClick={() => { onToneChange(t); setDropdown(null); }} className={`w-full text-left p-2 hover:bg-white/10 text-sm ${selectedTone === t ? currentTheme.text : textColor}`}>{t}</button></li>))}
                </ul></div>)}
            </div></SettingItem>
            <SettingItem label="Creativity">
                 <input type="range" min="0" max="1" step="0.1" value={creativity} onChange={e => onCreativityChange(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </SettingItem>
            {isImagenSelected && <SettingItem label="Aspect Ratio">
                <div className="grid grid-cols-3 gap-2">{aspectRatios.map(r => (<button key={r} onClick={() => onAspectRatioChange(r)} className={`py-2 rounded-lg text-sm border ${selectedAspectRatio === r ? `${currentTheme.border} ${textColor}` : borderColor}`}>{r}</button>))}</div>
            </SettingItem>}
        </aside>
    );
};

const MainWorkspace: React.FC<{
    prompt: string; setPrompt: (p: string) => void; isGenerating: boolean; generationStatus: string; generationResult: GenerationResult | null;
    error: string | null; currentTheme: Theme; cardBg: string; borderColor: string; textColor: string; textSecondary: string;
    activeTab: string; mode: CreationMode; setMode: (m: CreationMode) => void;
    audioMode: AudioMode; setAudioMode: (m: AudioMode) => void;
    sourceFile: SourceFile | null; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; removeFile: () => void;
    isRecording: boolean; startRecording: () => void; stopRecording: () => void;
}> = (props) => {
    const { prompt, setPrompt, isGenerating, generationStatus, generationResult, error, currentTheme, cardBg, borderColor, textColor, textSecondary, activeTab, mode, setMode, audioMode, setAudioMode, sourceFile, onFileChange, removeFile, isRecording, startRecording, stopRecording } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const renderResult = () => {
        if (!generationResult) return null;
        const content = generationResult.content;
        const url = typeof content === 'string' ? content : content.url;

        return <div className="w-full h-full flex flex-col items-center justify-center">
             {generationResult.type === 'image' && <img src={url} alt="Generated" className="max-w-full max-h-full object-contain mx-auto rounded-lg"/>}
             {generationResult.type === 'video' && <video src={url} controls className="max-w-full max-h-full object-contain mx-auto rounded-lg"/>}
             {generationResult.type === 'audio' && <audio src={url} controls />}
             {generationResult.type === 'text' && <div className="self-start w-full overflow-y-auto"><p className="whitespace-pre-wrap p-2">{typeof content === 'string' ? content : content.url}</p></div>}
        </div>
    };
    
    const renderGroundingSources = () => {
        if (!generationResult || typeof generationResult.content === 'string' || !generationResult.content.sources || generationResult.content.sources.length === 0) return null;
        
        return <div className="mt-2 pt-2 border-t border-gray-700">
            <h4 className="text-sm font-semibold mb-1">Sources:</h4>
            <ul className="text-xs list-disc pl-5 space-y-1">
                {generationResult.content.sources.map((chunk, index) => (
                    chunk.web ? <li key={index}><a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentTheme.text}`}>{chunk.web.title}</a></li> :
                    chunk.maps ? <li key={index}><a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentTheme.text}`}>{chunk.maps.title}</a></li> : null
                ))}
            </ul>
        </div>
    };

    return (
        <main className="flex-1 flex flex-col p-4 gap-4">
            {['Image', 'Video'].includes(activeTab) && <div className="flex-shrink-0">
                <div className="flex items-center gap-2 p-1 bg-black/10 dark:bg-white/10 rounded-lg">
                    <button onClick={() => setMode('generate')} className={`w-full py-1 text-sm rounded ${mode === 'generate' ? `bg-white/20 shadow-sm ${textColor}` : textSecondary}`}>Generate</button>
                    <button onClick={() => setMode('edit')} className={`w-full py-1 text-sm rounded ${mode === 'edit' ? `bg-white/20 shadow-sm ${textColor}` : textSecondary}`}>Edit</button>
                    <button onClick={() => setMode('analyze')} className={`w-full py-1 text-sm rounded ${mode === 'analyze' ? `bg-white/20 shadow-sm ${textColor}` : textSecondary}`}>Analyze</button>
                </div>
            </div>}
            {activeTab === 'Audio' && <div className="flex-shrink-0">
                 <div className="flex items-center gap-2 p-1 bg-black/10 dark:bg-white/10 rounded-lg">
                    <button onClick={() => setAudioMode('tts')} className={`w-full py-1 text-sm rounded ${audioMode === 'tts' ? `bg-white/20 shadow-sm ${textColor}` : textSecondary}`}>Text-to-Speech</button>
                    <button onClick={() => setAudioMode('transcribe')} className={`w-full py-1 text-sm rounded ${audioMode === 'transcribe' ? `bg-white/20 shadow-sm ${textColor}` : textSecondary}`}>Transcribe</button>
                </div>
            </div>}
            
            <div className="relative h-48 lg:flex-1 flex flex-col">
                 <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                        activeTab === 'Image' && mode === 'edit' ? "e.g., 'Add a retro filter'" :
                        activeTab === 'Video' && mode === 'analyze' ? "e.g., 'What is the main subject of this video?'" :
                        audioMode === 'tts' ? "e.g., 'Hello world, I can speak!'" :
                        "Describe what you want to create..."
                    }
                    className={`w-full h-full p-4 pr-12 bg-transparent rounded-2xl border-2 ${borderColor} ${textColor} placeholder:text-gray-500 focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none`}
                />
            </div>

            <div className={`h-72 lg:flex-1 border-2 ${borderColor} rounded-2xl p-4 flex flex-col`}>
                <div className="flex-grow flex items-center justify-center">
                    {isGenerating ? <div className="text-center animate-pulse"><Wand2 size={48} className={`mx-auto ${currentTheme.text}`} /><p className={`mt-4 font-semibold ${textColor}`}>{generationStatus}</p></div>
                    : error ? <div className="text-center text-red-400 p-4"><AlertTriangle size={48} className="mx-auto" /><p className="mt-4 font-semibold">An Error Occurred</p><p className="text-sm mt-1 max-w-md mx-auto">{error}</p></div>
                    : generationResult ? renderResult()
                    : (mode !== 'generate' || audioMode === 'transcribe') ? (
                        sourceFile ? <div className="relative w-full h-full">
                            {sourceFile.type === 'image' && <img src={sourceFile.url} className="w-full h-full object-contain rounded-lg" />}
                            {sourceFile.type === 'video' && <video src={sourceFile.url} controls className="w-full h-full object-contain rounded-lg" />}
                            {sourceFile.type === 'audio' && <audio src={sourceFile.url} controls />}
                            <button onClick={removeFile} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X size={14}/></button>
                        </div>
                        : audioMode === 'transcribe' ? 
                            <button onClick={isRecording ? stopRecording : startRecording} className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${isRecording ? 'bg-red-500 text-white' : `${cardBg} border ${borderColor}`}`}>
                                {isRecording ? <><StopCircle/> Stop Recording</> : <><Mic/> Start Recording</>}
                            </button> :
                        <div className="w-full h-full">
                            <input type="file" ref={fileInputRef} onChange={onFileChange} accept={activeTab === 'Image' ? "image/*" : "video/*"} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className={`w-full h-full border-2 border-dashed ${borderColor} rounded-xl flex flex-col items-center justify-center ${textSecondary} hover:bg-white/5`}>
                                <UploadCloud size={48} /><p className="mt-2 font-semibold">Upload {activeTab}</p>
                            </button>
                        </div>
                    ) : <div className="text-center"><Bot size={48} className={`mx-auto ${textSecondary}`} /><p className={`mt-4 font-semibold ${textColor}`}>Your creation will appear here</p></div>}
                </div>
                 {renderGroundingSources()}
            </div>
        </main>
    );
};


const AICreatorModal: React.FC<AICreatorModalProps> = (props) => {
    const { show, onClose, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    const [activeTab, setActiveTab] = useState('Text');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('Generating...');
    const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0]);
    const [creativity, setCreativity] = useState(0.7);
    const [copied, setCopied] = useState(false);
    const [apiKeyOk, setApiKeyOk] = useState(false);
    
    // Feature-specific state
    const [creationMode, setCreationMode] = useState<CreationMode>('generate');
    const [audioMode, setAudioMode] = useState<AudioMode>('tts');
    const [sourceFile, setSourceFile] = useState<SourceFile | null>(null);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
    const [useSearch, setUseSearch] = useState(false);
    const [useMaps, setUseMaps] = useState(false);
    const [useThinking, setUseThinking] = useState(false);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const findModelById = (id: string) => {
        for (const family of AI_MODELS) {
            for (const category of family.categories) {
                const model = category.models.find(m => m.id === id);
                if (model) return model;
            }
        }
        return AI_MODELS[0].categories[0].models[0];
    };
    const [selectedModel, setSelectedModel] = useState<AIModel>(() => findModelById('gemini-2.5-flash'));
    
    // Fix: Added a helper function to retrieve the developer's name for a given model ID.
    const getModelDeveloper = (modelId: string): string => {
        for (const family of AI_MODELS) {
            for (const category of family.categories) {
                if (category.models.some(m => m.id === modelId)) {
                    return family.developer;
                }
            }
        }
        return 'Unknown';
    };


    useEffect(() => {
        if (show) { (async () => setApiKeyOk(await (window as any).aistudio.hasSelectedApiKey()))(); }
    }, [show]);

    const resetForTabChange = (tab: string) => {
        setPrompt(''); setGenerationResult(null); setError(null); setSourceFile(null);
        let defaultModelId = 'gemini-2.5-flash';
        if (tab === 'Image') defaultModelId = 'imagen-4.0-generate-001';
        if (tab === 'Video') defaultModelId = 'veo-3.1-fast-generate-preview';
        if (tab === 'Audio') defaultModelId = 'gemini-2.5-flash-preview-tts';
        setSelectedModel(findModelById(defaultModelId));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const base64 = await fileToBase64(file);
            const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio';
            setSourceFile({ file, type, url, base64 });
        }
    };
    
    const handleGenerate = async () => {
        if (audioMode === 'transcribe' && !sourceFile) { setError("Please record or upload audio to transcribe."); return; }
        if (!prompt.trim() && !(sourceFile && creationMode !== 'generate')) { setError("A prompt is required."); return; }

        const isGoogleModel = AI_MODELS.find(f => f.developer === 'Google DeepMind')
                                ?.categories.flatMap(c => c.models)
                                .some(m => m.id === selectedModel.id);

        if (!isGoogleModel) {
            // Fix: Replaced `selectedModel.developer` with `getModelDeveloper(selectedModel.id)` to correctly retrieve the developer name, as the `developer` property does not exist on the `AIModel` type.
            setError(`Generation with ${selectedModel.name} (${getModelDeveloper(selectedModel.id)}) is not yet supported in this interface. Please select a model from the Gemini Series to proceed.`);
            return;
        }

        if (selectedModel.id.includes('veo')) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
                const hasKeyAfter = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKeyAfter) { setError("An API key is required for video generation."); return; }
                setApiKeyOk(true);
            }
        }

        setIsGenerating(true); setGenerationStatus('Initializing...'); setGenerationResult(null); setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const modelName = selectedModel.id;
            let config: any = { temperature: creativity };
            let contents: any = prompt;
            
            // --- Build Config ---
            if (useSearch) config.tools = [{googleSearch: {}}];
            if (useMaps) {
                config.tools = [...(config.tools || []), {googleMaps: {}}];
                const pos: GeolocationPosition = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
                config.toolConfig = { retrievalConfig: { latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }}};
            }
            if (useThinking && modelName.includes('2.5-pro')) config.thinkingConfig = { thinkingBudget: 32768 };

            // --- Handle Different Generation Types ---
            if (modelName.includes('imagen')) {
                config.numberOfImages = 1; config.outputMimeType = 'image/jpeg'; config.aspectRatio = selectedAspectRatio;
                const resp = await ai.models.generateImages({ model: modelName, prompt, config });
                const b64 = resp.generatedImages?.[0]?.image?.imageBytes;
                if (b64) setGenerationResult({ type: 'image', content: `data:image/jpeg;base64,${b64}` });
                else throw new Error("API did not return an image.");
            } else if (modelName.includes('veo')) {
                config = { numberOfVideos: 1, resolution: '720p', aspectRatio: selectedAspectRatio as any };
                const payload: any = { model: modelName, config };
                if (prompt) payload.prompt = prompt;
                if (sourceFile?.type === 'image') payload.image = { imageBytes: sourceFile.base64, mimeType: sourceFile.file.type };

                setGenerationStatus('Submitting video request...');
                let op = await (ai.models as any).generateVideos(payload);
                setGenerationStatus('Generating video... this can take minutes.');
                while (!op.done) {
                    await new Promise(r => setTimeout(r, 10000));
                    op = await (ai.operations as any).getVideosOperation({ operation: op });
                }
                const link = op.response?.generatedVideos?.[0]?.video?.uri;
                if (link) {
                    setGenerationStatus('Fetching video file...');
                    const videoResp = await fetch(`${link}&key=${process.env.API_KEY}`);
                    const blob = await videoResp.blob();
                    setGenerationResult({ type: 'video', content: { url: URL.createObjectURL(blob) } });
                } else throw new Error("Video generation failed to return a link.");
            } else if (modelName.includes('tts')) {
                config.responseModalities = [Modality.AUDIO];
                const resp = await ai.models.generateContent({ model: modelName, contents, config });
                const audioB64 = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (audioB64) {
                    const audioContext = new AudioContext({ sampleRate: 24000 });
                    const audioBuffer = await decodeAudioData(decode(audioB64), audioContext);
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.start();
                    setGenerationResult({ type: 'audio', content: { url: `data:audio/wav;base64,${audioB64}` } });
                } else throw new Error("TTS failed to produce audio.");
            } else { // Text or multi-modal text
                if (sourceFile) {
                    contents = { parts: [{ inlineData: { mimeType: sourceFile.file.type, data: sourceFile.base64 } }, { text: prompt }] };
                    if (modelName.includes('flash-image') && creationMode === 'edit') {
                        config.responseModalities = [Modality.IMAGE];
                    }
                }
                const resp = await ai.models.generateContent({ model: modelName, contents, config });
                if (config.responseModalities?.includes(Modality.IMAGE)) {
                    const imgPart = resp.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if(imgPart?.inlineData) setGenerationResult({ type: 'image', content: { url: `data:image/png;base64,${imgPart.inlineData.data}` } });
                    else throw new Error("Model did not return an image.");
                } else {
                    const groundingSources = resp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                    setGenerationResult({ type: 'text', content: { url: resp.text, sources: groundingSources } });
                }
            }
        } catch (e: any) {
            console.error("AI generation error:", e);
            const msg = e.message || "An unknown error occurred.";
            if (msg.includes("API key not valid")) { setApiKeyOk(false); setError("API key is invalid. Please select a valid key."); }
            else if (msg.includes("billing")) { setApiKeyOk(false); setError("This model requires a billed project. Please select a different API key."); }
            else setError(msg);
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- Audio Recording Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                const base64 = await fileToBase64(audioBlob as File);
                setSourceFile({ file: audioBlob as File, type: 'audio', url, base64 });
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) { setError("Microphone access denied or not available."); }
    };
    const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };


    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-0 md:p-4">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-none md:rounded-3xl w-full h-full md:max-w-7xl md:h-[90vh] border ${borderColor} shadow-2xl flex flex-col`}>
                <header className={`flex justify-between items-center p-4 border-b ${borderColor} flex-shrink-0`}>
                     <h2 className="text-xl font-bold flex items-center gap-3"><Bot className={currentTheme.text} /> Create with AI</h2>
                    {apiKeyOk && <CreationTabs activeTab={activeTab} onTabChange={(t) => {setActiveTab(t); resetForTabChange(t);}} textColor={textColor} currentTheme={currentTheme} />}
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </header>
                
                {!apiKeyOk ? ( <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <KeyRound size={48} className={`mx-auto ${currentTheme.text} mb-4`} /><h3 className="text-2xl font-bold mb-2">API Key Required</h3>
                        <p className={`${textSecondary} mb-6 max-w-md`}>To use the AI Creator Studio, select a Google AI API key. Some models may require a key from a billed Google Cloud project.</p>
                        <button onClick={async () => { await (window as any).aistudio.openSelectKey(); setApiKeyOk(true); }} className={`px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}>Select API Key</button>
                        <p className={`text-xs ${textSecondary} mt-4`}>See the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className={`underline ${currentTheme.hoverText}`}>billing documentation</a>.</p>
                    </div> ) : ( <>
                        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
                            <MainWorkspace {...{ prompt, setPrompt, isGenerating, generationStatus, generationResult, error, currentTheme, cardBg, borderColor, textColor, textSecondary, activeTab, mode: creationMode, setMode: setCreationMode, audioMode, setAudioMode, sourceFile, onFileChange: handleFileChange, removeFile: () => setSourceFile(null), isRecording, startRecording, stopRecording }} />
                            <SettingsPanel {...{ models: AI_MODELS, selectedModel, onModelChange: setSelectedModel, tones: TONE_OPTIONS, selectedTone, onToneChange: setSelectedTone, creativity, onCreativityChange: setCreativity, aspectRatios: ASPECT_RATIOS, selectedAspectRatio, onAspectRatioChange: setSelectedAspectRatio, isImagenSelected: selectedModel.id.includes('imagen'), useSearch, onUseSearchChange: setUseSearch, useMaps, onUseMapsChange: setUseMaps, useThinking, onUseThinkingChange: setUseThinking, isProModel: selectedModel.id.includes('2.5-pro'), cardBg, textColor, textSecondary, borderColor, currentTheme }} />
                        </div>
                        <footer className={`flex justify-between items-center p-4 border-t ${borderColor} flex-shrink-0`}>
                            <div className="flex items-center gap-2">
                                {generationResult && (<>
                                    <button onClick={handleGenerate} className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Regenerate"><RefreshCw size={18} /></button>
                                    {generationResult.type === 'text' && (<button onClick={() => {navigator.clipboard.writeText(typeof generationResult.content === 'string' ? generationResult.content : generationResult.content.url); setCopied(true); setTimeout(()=>setCopied(false), 2000)}} className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Copy">{copied ? <Check size={18} className={currentTheme.text}/> : <Copy size={18} />}</button>)}
                                    {['image', 'video', 'audio'].includes(generationResult.type) && (<button onClick={()=>{const link=document.createElement('a'); link.href=typeof generationResult.content === 'string' ? generationResult.content : generationResult.content.url; link.download=`firesocial-ai-${generationResult.type}`; link.click()}} className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Download"><Download size={18} /></button>)}
                                    <div className="w-px h-6 bg-gray-700 mx-2"></div>
                                    <button className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Good"><ThumbsUp size={18} /></button>
                                    <button className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Bad"><ThumbsDown size={18} /></button>
                                </>)}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setPrompt(''); setGenerationResult(null); setError(null); }} className={`px-6 py-2 rounded-lg font-semibold text-sm ${cardBg} border ${borderColor} hover:bg-white/10`}>Reset</button>
                                <button onClick={handleGenerate} disabled={isGenerating} className={`px-6 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white disabled:opacity-50 flex items-center gap-2`}>{isGenerating ? 'Generating...' : 'Create'} <Wand2 size={16}/></button>
                            </div>
                        </footer>
                    </>)}
            </div>
        </div>
    );
};

export default AICreatorModal;
