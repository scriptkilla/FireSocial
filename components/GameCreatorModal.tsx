
import React from 'react';
import { X, Gamepad2, Sparkles, AlertTriangle, KeyRound, Wand2, Play } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI } from '@google/genai';

// Props definition
interface GameCreatorModalProps {
    show: boolean;
    onClose: () => void;
    onDeployGame: (gameIdea: string, previewImage: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const GameCreatorModal: React.FC<GameCreatorModalProps> = (props) => {
    const { show, onClose, onDeployGame, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    const [apiKeyOk, setApiKeyOk] = React.useState(false);
    const [gameIdea, setGameIdea] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (show) {
            (async () => {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                setApiKeyOk(hasKey);
            })();
        } else {
            // Reset state on close
            setGameIdea('');
            setIsGenerating(false);
            setGeneratedImage(null);
            setError(null);
        }
    }, [show]);

    const handleGenerate = async () => {
        if (!gameIdea.trim()) {
            setError("Please enter your game idea.");
            return;
        }

        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
            const hasKeyAfter = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKeyAfter) {
                setError("An API key is required to generate game concepts.");
                return;
            }
            setApiKeyOk(true);
        }

        setIsGenerating(true);
        setGeneratedImage(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const imagePrompt = `Create a visually stunning, high-quality piece of concept art for a video game. The game is about: "${gameIdea}". The art should be in a cinematic, photorealistic style, suitable for a game cover.`;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            });
            
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            if (base64ImageBytes) {
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
            } else {
                throw new Error("The AI did not return an image. Please try again with a different prompt.");
            }
        } catch (e: any) {
            console.error("Game concept generation error:", e);
            const msg = e.message || "An unknown error occurred during generation.";
             if (msg.includes("API key not valid")) {
                setApiKeyOk(false);
                setError("Your API key is invalid. Please select a valid key.");
            } else if (msg.includes("billing")) {
                setApiKeyOk(false);
                setError("This model requires a billed project. Please select a different API key.");
            } else if (msg.includes('Requested entity was not found')) {
                setApiKeyOk(false);
                setError("Invalid API Key. Please select a valid key to use this model.");
            }
            else {
                setError(msg);
            }
        } finally {
            setIsGenerating(false);
        }
    };
    
    if (!show) {
        return null;
    }

    const renderContent = () => {
        if (!apiKeyOk) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <KeyRound size={48} className={`mx-auto ${currentTheme.text} mb-4`} />
                    <h3 className="text-2xl font-bold mb-2">API Key Required</h3>
                    <p className={`${textSecondary} mb-6 max-w-md`}>
                        To use the AI Game Creator, please select a Google AI API key. This feature uses advanced models that may require a key from a billed Google Cloud project.
                    </p>
                    <button
                        onClick={async () => {
                            await (window as any).aistudio.openSelectKey();
                            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                            setApiKeyOk(hasKey);
                        }}
                        className={`px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}
                    >
                        Select API Key
                    </button>
                    <p className={`text-xs ${textSecondary} mt-4`}>
                        See the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className={`underline ${currentTheme.hoverText}`}>billing documentation</a> for more info.
                    </p>
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="flex-grow flex flex-col">
                    <div className="mb-4">
                        <label className={`block mb-2 font-semibold ${textColor}`}>Describe Your Game Idea</label>
                        <textarea
                            value={gameIdea}
                            onChange={(e) => setGameIdea(e.target.value)}
                            placeholder="e.g., A cyberpunk detective game set in a city on Mars where you solve crimes with a robot corgi companion."
                            className={`w-full h-32 p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none`}
                            disabled={isGenerating}
                        />
                    </div>

                    <div className={`flex-grow border-2 border-dashed ${borderColor} rounded-2xl p-4 flex items-center justify-center`}>
                        {isGenerating ? (
                            <div className="text-center animate-pulse">
                                <Wand2 size={48} className={`mx-auto ${currentTheme.text}`} />
                                <p className={`mt-4 font-semibold ${textColor}`}>Generating Concept Art...</p>
                            </div>
                        ) : error ? (
                             <div className="text-center text-red-400 p-4">
                                <AlertTriangle size={48} className="mx-auto" />
                                <p className="mt-4 font-semibold">Generation Failed</p>
                                <p className="text-sm mt-1 max-w-md mx-auto">{error}</p>
                            </div>
                        ) : generatedImage ? (
                            <img src={generatedImage} alt="Generated game concept" className="max-w-full max-h-full object-contain rounded-lg" />
                        ) : (
                            <div className="text-center">
                                <Sparkles size={48} className={`mx-auto ${textSecondary}`} />
                                <p className={`mt-4 font-semibold ${textColor}`}>Your concept art will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <footer className="mt-6 flex-shrink-0 flex items-center justify-between">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !gameIdea.trim()}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white disabled:opacity-50 flex items-center gap-2`}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Concept'} <Wand2 size={16} />
                    </button>
                    <button
                        onClick={() => onDeployGame(gameIdea, generatedImage!)}
                        disabled={!generatedImage || isGenerating}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm bg-green-500 text-white disabled:opacity-50 flex items-center gap-2`}
                    >
                        <Play size={16} /> Deploy to Profile
                    </button>
                </footer>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-3xl h-[85vh] border ${borderColor} shadow-2xl flex flex-col`}>
                <header className={`flex justify-between items-center p-4 border-b ${borderColor} flex-shrink-0`}>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Gamepad2 className={currentTheme.text} /> AI Game Studio
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

export default GameCreatorModal;
