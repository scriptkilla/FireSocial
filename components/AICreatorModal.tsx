


import React, { useState, useRef, useEffect } from 'react';
import { X, Text, Image as ImageIcon, Video, Mic, Code, Bot, Settings, ChevronDown, Sparkles, Wand2, RefreshCw, Download, Copy, ThumbsUp, ThumbsDown, Check, AlertTriangle, KeyRound, UploadCloud, File, Map, Search, BrainCircuit, Play, StopCircle } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Modality, GroundingChunk } from "@google/genai";
// Fix: Imported API_VERSIONS instead of the non-existent AI_MODELS to fix reference errors.
import { API_CONFIG, API_VERSIONS, getModelDeveloper } from '../constants';

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
    selectedModel: AIModel; onModelChange: (model: AIModel) => void;
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
    const { selectedModel, onModelChange, tones, selectedTone, onToneChange, creativity, onCreativityChange, aspectRatios, selectedAspectRatio, onAspectRatioChange, isImagenSelected, useSearch, onUseSearchChange, useMaps, onUseMapsChange, useThinking, onUseThinkingChange, isProModel, cardBg, textColor, textSecondary, borderColor, currentTheme } = props;
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
                        {Object.entries(API_VERSIONS).map(([developer, families]) => (
                            <div key={developer}>
                                <h4 className="px-3 pt-2 pb-1 text-xs font-bold text-gray-400 sticky top-0 bg-inherit">{developer}</h4>
                                <ul>
                                    {families.map(family => (
                                        <React.Fragment key={family.name}>
                                            {families.length > 1 && <h5 className="px-3 pt-1 text-xs font-semibold text-gray-500">{family.name}</h5>}
                                            {family.models.map(m => (
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
        for (const family of Object.values(API_VERSIONS)) {
            for (const category of family) {
                const model = category.models.find(m => m.id === id);
                if (model) return model;
            }
        }
        return API_VERSIONS['Google AI'][0].models[0];
    };
    const [selectedModel, setSelectedModel] = useState<AIModel>(() => findModelById('gemini-2.5-flash'));
    
    useEffect(() => {
        if (show) { 
            const googleApiKey = localStorage.getItem(API_CONFIG['Google AI'].storageKey);
            setApiKeyOk(!!googleApiKey);
        }
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

        const developer = getModelDeveloper(selectedModel.id);
        const isGoogleModel = developer === 'Google AI';

        setIsGenerating(true); setGenerationStatus('Initializing...'); setGenerationResult(null); setError(null);
        
        const apiKey = localStorage.getItem(API_CONFIG['Google AI'].storageKey);

        if (isGoogleModel && !apiKey) {
            setError(`A Google AI API key is required to use the ${selectedModel.name} model. Please add one in Settings.`);
            setIsGenerating(false);
            setApiKeyOk(false);
            return;
        }

        if (!isGoogleModel) {
            setError(`Generation with ${selectedModel.name} (${developer}) is not yet supported. Please select a model from Google AI to proceed.`);
            setIsGenerating(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: apiKey! });
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
                if (b64) setGenerationResult({ type: 'image', content: { url: `data:image/jpeg;base64,${b64}`} });
                else throw new Error("API did not return an image.");
            } else if (modelName.includes('veo')) {
                config = { numberOfVideos: 1, resolution: '720p', aspectRatio: selectedAspectRatio as any };
                const payload: any = { model: modelName, config };
                if (prompt) payload.prompt = prompt;
                if (sourceFile?.type === 'image') payload.image = { imageBytes: sourceFile.base64, mimeType: sourceFile.file.type };

                setGenerationStatus('Submitting video request...');
                let op = await ai.models.generateVideos(payload);
                setGenerationStatus('Generating video... this can take minutes.');
                while (!op.done) {
                    await new Promise(r => setTimeout(r, 10000));
                    op = await ai.operations.getVideosOperation({operation: op});
                }
                const link = op.response?.generatedVideos?.[0]?.video?.uri;
                if (link) {
                    setGenerationStatus('Fetching video file...');
                    const videoResp = await fetch(`${link}&key=${apiKey}`);
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
            if (msg.includes("API key not valid")) { setApiKeyOk(false); setError("API key is invalid. Please add a valid key in Settings."); }
            else if (msg.includes("billing")) { setApiKeyOk(false); setError("This model may require a billed project. Please check your API key's project settings."); }
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
                        <p className={`${textSecondary} mb-6 max-w-md`}>To use the AI Creator Studio, a Google AI API key is required. Please add one in Settings.</p>
                        <button onClick={onClose} className={`px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}>Go to Settings</button>
                    </div> ) : ( <>
                        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
                            <MainWorkspace {...{ prompt, setPrompt, isGenerating, generationStatus, generationResult, error, currentTheme, cardBg, borderColor, textColor, textSecondary, activeTab, mode: creationMode, setMode: setCreationMode, audioMode, setAudioMode, sourceFile, onFileChange: handleFileChange, removeFile: () => setSourceFile(null), isRecording, startRecording, stopRecording }} />
                            <SettingsPanel {...{ selectedModel, onModelChange: setSelectedModel, tones: TONE_OPTIONS, selectedTone, onToneChange: setSelectedTone, creativity, onCreativityChange: setCreativity, aspectRatios: ASPECT_RATIOS, selectedAspectRatio, onAspectRatioChange: setSelectedAspectRatio, isImagenSelected: selectedModel.id.includes('imagen'), useSearch, onUseSearchChange: setUseSearch, useMaps, onUseMapsChange: setUseMaps, useThinking, onUseThinkingChange: setUseThinking, isProModel: selectedModel.id.includes('2.5-pro'), cardBg, textColor, textSecondary, borderColor, currentTheme }} />
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