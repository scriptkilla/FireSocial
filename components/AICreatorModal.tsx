





import React, { useState, useRef, useEffect } from 'react';
import { X, Text, Image as ImageIcon, Video, Mic, Code, Bot, Settings, ChevronDown, Sparkles, Wand2, RefreshCw, Download, Copy, ThumbsUp, ThumbsDown, Check, AlertTriangle, KeyRound, UploadCloud, File, Map, Search, BrainCircuit, Play, StopCircle } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

interface AICreatorModalProps {
    show: boolean;
    onClose: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

type GroundingChunk = {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
  };
};

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
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
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
    id: string; name: string; description: string;
};
type AIModelCategory = { category: string; models: AIModel[]; };
const GOOGLE_AI_MODELS: AIModelCategory[] = [
    {
        category: 'Text & Chat', models: [
            { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable model for complex tasks.' },
            { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient for general use.' },
            { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite', description: 'Lightweight and fastest for simple tasks.' },
        ]
    }, {
        category: 'Image', models: [
            { id: 'imagen-4.0-generate-001', name: 'Imagen 4', description: 'Highest-quality image generation.' },
            { id: 'gemini-2.5-flash-image', name: 'Nano Banana', description: 'Generate and edit images quickly.' },
        ]
    }, {
        category: 'Video', models: [
             { id: 'veo-3.1-generate-preview', name: 'Veo 3.1', description: 'High-quality video generation.' },
            { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 Fast', description: 'Faster video generation.' },
        ]
    }, {
        category: 'Audio', models: [
            { id: 'gemini-2.5-flash-preview-tts', name: 'TTS', description: 'Text-to-speech generation.' },
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

const SettingItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>{children}</div>
);

const ToggleItem: React.FC<{ icon: React.ElementType, label: string, checked: boolean, onChange: (c:boolean) => void, disabled?: boolean, currentTheme: Theme }> = ({ icon: Icon, label, checked, onChange, disabled=false, currentTheme }) => (
    <label className={`flex items-center justify-between p-2 rounded-lg hover:bg-white/10 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed': ''}`}>
        <div className="flex items-center gap-2 text-sm"><Icon size={16}/>{label}</div>
        <button onClick={() => !disabled && onChange(!checked)} disabled={disabled} className={`w-10 h-5 rounded-full transition-all ${checked ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-600'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
    </label>
);

const SettingsPanel: React.FC<{
    models: AIModelCategory[]; selectedModel: AIModel; onModelChange: (model: AIModel) => void;
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
    
    return (
        <aside className={`w-full lg:w-72 flex-shrink-0 p-4 space-y-4 overflow-y-auto rounded-lg bg-black/5 dark:bg-white/5`}>
            <SettingItem label="AI Model">
                 <div className="relative">
                    <button onClick={() => setDropdown(d => d === 'model' ? null : 'model')} className={`w-full flex justify-between items-center p-2 rounded-lg text-left text-sm ${cardBg} border ${borderColor}`}>
                        <span>{selectedModel.name}</span> <ChevronDown size={16} />
                    </button>
                    {dropdown === 'model' && (<div className={`absolute top-full mt-1 w-full ${cardBg} border ${borderColor} rounded-lg shadow-xl z-10`}>
                       {models.map(cat => (<div key={cat.category}><h4 className="px-2 pt-2 pb-1 text-xs font-bold text-gray-500">{cat.category}</h4><ul>
                           {cat.models.map(m => (<li key={m.id}><button onClick={() => { onModelChange(m); setDropdown(null); }} className={`w-full text-left p-2 hover:bg-white/10 text-sm`}><p className={selectedModel.id === m.id ? currentTheme.text : textColor}>{m.name}</p></button></li>))}
                       </ul></div>))}
                    </div>)}
                </div>
            </SettingItem>
            <div className={`p-3 rounded-lg border ${borderColor} bg-black/5 dark:bg-white/5 space-y-2`}>
                 <ToggleItem icon={Search} label="Use Google Search" checked={useSearch} onChange={onUseSearchChange} currentTheme={currentTheme} />
                 <ToggleItem icon={Map} label="Use Google Maps" checked={useMaps} onChange={onUseMapsChange} currentTheme={currentTheme} />
                 <ToggleItem icon={BrainCircuit} label="Thinking Mode" checked={useThinking} onChange={onUseThinkingChange} disabled={!isProModel} currentTheme={currentTheme} />
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
        const sources = typeof content === 'object' ? content.sources : [];

        return (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {generationResult.type === 'image' && <img src={url} alt="Generated" className="max-w-full max-h-full object-contain mx-auto rounded-lg"/>}
            {generationResult.type === 'video' && <video src={url} controls className="max-w-full max-h-full object-contain mx-auto rounded-lg"/>}
            {generationResult.type === 'audio' && <audio src={url} controls />}
            {generationResult.type === 'text' && (
              <div className="self-start w-full overflow-y-auto">
                <p className="whitespace-pre-wrap p-2">{url}</p>
                {sources && sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                        <h4 className="text-sm font-semibold mb-1">Sources:</h4>
                        <ul className="text-xs list-disc pl-5 space-y-1">
                            {sources.map((chunk, index) => {
                                if (chunk.web && chunk.web.uri) {
                                    return <li key={index}><a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentTheme.text}`}>{chunk.web.title || chunk.web.uri}</a></li>;
                                }
                                if (chunk.maps && chunk.maps.uri) {
                                    return <li key={index}><a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentTheme.text}`}>{chunk.maps.title || chunk.maps.uri}</a></li>;
                                }
                                return null;
                            })}
                        </ul>
                    </div>
                )}
              </div>
            )}
          </div>
        );
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
                            <button aria-label="Remove file" onClick={removeFile} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X size={14}/></button>
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
    const [selectedModel, setSelectedModel] = useState<AIModel>(GOOGLE_AI_MODELS[0].models[1]);
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

    useEffect(() => {
        if (show) { (async () => setApiKeyOk(await (window as any).aistudio.hasSelectedApiKey()))(); }
    }, [show]);

    const resetForTabChange = (tab: string) => {
        setPrompt(''); setGenerationResult(null); setError(null); setSourceFile(null);
        let defaultModelId = 'gemini-2.5-flash';
        if (tab === 'Image') defaultModelId = 'imagen-4.0-generate-001';
        if (tab === 'Video') defaultModelId = 'veo-3.1-fast-generate-preview';
        if (tab === 'Audio') defaultModelId = 'gemini-2.5-flash-preview-tts';
        for (const cat of GOOGLE_AI_MODELS) { const m = cat.models.find(m => m.id === defaultModelId); if (m) { setSelectedModel(m); break; }}
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
                if (b64) setGenerationResult({ type: 'image', content: { url: `data:image/jpeg;base64,${b64}` }});
                else throw new Error("API did not return an image.");
            } else if (modelName.includes('veo')) {
                config = { numberOfVideos: 1, resolution: '720p', aspectRatio: selectedAspectRatio as any };
                const payload: any = { model: modelName, config };
                if (prompt) payload.prompt = prompt;
                if (sourceFile?.type === 'image') payload.image = { imageBytes: sourceFile.base64, mimeType: sourceFile.file.type };

                setGenerationStatus('Submitting video request...');
                let op = await (ai.models as any).generateVideos(payload);
                while (!op.done) {
                    setGenerationStatus(`Processing video... (${op.progress?.percentage || 0}%)`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    op = await (ai.operations as any).getVideosOperation({ operation: op });
                }
                const videoUrl = op.response?.generatedVideos?.[0]?.video?.uri;
                if (videoUrl) {
                    const videoResp = await fetch(`${videoUrl}&key=${process.env.API_KEY}`);
                    const blob = await videoResp.blob();
                    setGenerationResult({ type: 'video', content: { url: URL.createObjectURL(blob) } });
                } else { throw new Error("Video generation failed to return a valid URL."); }
            } else if (modelName.includes('tts')) {
                config.responseModalities = [Modality.AUDIO];
                config.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } };
                contents = [{ parts: [{ text: `Say with a ${selectedTone.toLowerCase()} tone: ${prompt}` }] }];
                const resp = await ai.models.generateContent({ model: modelName, contents, config });
                const b64 = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (b64) {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                    const audioBuffer = await decodeAudioData(decode(b64), audioContext, 24000, 1);
                    const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
                    setGenerationResult({ type: 'audio', content: { url: URL.createObjectURL(wavBlob) } });
                } else { throw new Error("TTS generation failed."); }
            } else { // Text or multi-modal models
                 if(sourceFile) {
                    const imagePart = { inlineData: { mimeType: sourceFile.file.type, data: sourceFile.base64 }};
                    const textPart = { text: prompt };
                    contents = { parts: [imagePart, textPart]};
                 }
                const resp = await ai.models.generateContent({ model: modelName, contents, config });
                const sources = resp.candidates?.[0]?.groundingMetadata?.groundingChunks;
                setGenerationResult({ type: 'text', content: { url: resp.text, sources: sources }});
            }
        } catch (e: any) {
            console.error("AI generation error:", e);
            const msg = e.message || "An unknown error occurred.";
            if (msg.includes("API key not valid")) {
                setApiKeyOk(false); setError("Your API key is invalid. Please select a valid key.");
            } else if(msg.includes('Requested entity was not found')) {
                setApiKeyOk(false); setError("Invalid API Key. Please select a valid key to use this model.");
            } else { setError(msg); }
        } finally { setIsGenerating(false); }
    };
    
    const bufferToWave = (abuffer: AudioBuffer, len: number) => {
        let numOfChan = abuffer.numberOfChannels,
            length = len * numOfChan * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [], i, sample,
            offset = 0,
            pos = 0;
    
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"
    
        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit
    
        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length
    
        for(i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));
    
        while(pos < length) {
            for(i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
    
        return new Blob([view], {type: 'audio/wav'});
    
        function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
        function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-6xl h-[90vh] border ${borderColor} shadow-2xl flex flex-col`}>
                <header className={`flex justify-between items-center p-4 border-b ${borderColor} flex-shrink-0`}>
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className={currentTheme.text}/>AI Creator Studio</h2>
                        <CreationTabs activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); resetForTabChange(t); }} textColor={textColor} currentTheme={currentTheme} />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
                </header>
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                    <SettingsPanel
                        models={GOOGLE_AI_MODELS.filter(c => c.category.includes(activeTab))}
                        selectedModel={selectedModel} onModelChange={setSelectedModel}
                        tones={TONE_OPTIONS} selectedTone={selectedTone} onToneChange={setSelectedTone}
                        creativity={creativity} onCreativityChange={setCreativity}
                        aspectRatios={ASPECT_RATIOS} selectedAspectRatio={selectedAspectRatio} onAspectRatioChange={setSelectedAspectRatio}
                        isImagenSelected={selectedModel.id.includes('imagen')}
                        useSearch={useSearch} onUseSearchChange={setUseSearch} useMaps={useMaps} onUseMapsChange={setUseMaps}
                        useThinking={useThinking} onUseThinkingChange={setUseThinking} isProModel={selectedModel.id.includes('pro')}
                        {...{ cardBg, textColor, textSecondary, borderColor, currentTheme }}
                    />
                    <MainWorkspace
                        prompt={prompt} setPrompt={setPrompt}
                        isGenerating={isGenerating} generationStatus={generationStatus} generationResult={generationResult} error={error}
                        activeTab={activeTab} mode={creationMode} setMode={setCreationMode}
                        audioMode={audioMode} setAudioMode={setAudioMode}
                        sourceFile={sourceFile} onFileChange={handleFileChange} removeFile={() => setSourceFile(null)}
                        isRecording={isRecording} startRecording={() => {}} stopRecording={() => {}}
                        {...{ currentTheme, cardBg, borderColor, textColor, textSecondary }}
                    />
                </div>
                <footer className={`p-4 border-t ${borderColor} flex-shrink-0 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        {generationResult && <>
                            <button onClick={() => { navigator.clipboard.writeText(typeof generationResult.content === 'string' ? generationResult.content : generationResult.content.url); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-3 py-2 text-sm rounded-lg flex items-center gap-2 bg-black/10 dark:bg-white/10 hover:bg-white/20">
                                {copied ? <><Check size={16}/> Copied</> : <><Copy size={16}/> Copy</>}
                            </button>
                             <button className="px-3 py-2 text-sm rounded-lg flex items-center gap-2 bg-black/10 dark:bg-white/10 hover:bg-white/20"><Download size={16}/> Download</button>
                        </>}
                    </div>
                     <button onClick={handleGenerate} disabled={isGenerating} className={`px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} disabled:opacity-50 flex items-center gap-2`}>
                        {isGenerating ? 'Generating...' : <><Wand2 size={16}/> Generate</>}
                    </button>
                </footer>
            </div>
        </div>
    );
};

// FIX: Add default export for AICreatorModal component.
export default AICreatorModal;