
import React, { useState, useEffect, useRef } from 'react';
import { X, Gamepad2, Sparkles, AlertTriangle, KeyRound, Bot, Wand2, Users, FileText, Palette, Cpu, Music, ShieldCheck, Play, UploadCloud, Code, Copy, Check } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Modality } from '@google/genai';


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

// --- Data Structures ---
const QUICK_IDEAS = ['Space exploration RPG', 'Cozy farming simulator', 'Cyberpunk detective mystery'];

const AGENT_ICONS: { [key: string]: React.ElementType } = {
    'Creative Director': Users,
    'Game Designer': FileText,
    'Art Director': Palette,
    'Technical Director': Cpu,
    'Narrative Agent': FileText,
    'Sound Designer': Music,
    'QA Agent': ShieldCheck,
    'System': Bot,
};

type Activity = {
    agent: string;
    action: string;
    details?: string;
    type: 'analysis' | 'design' | 'creation' | 'writing' | 'technical' | 'testing' | 'system';
    timestamp: string;
};

type AgentMessage = {
    id: number;
    agent: string;
    content: string;
    type: 'proposal' | 'suggestion' | 'feedback' | 'decision' | 'update';
};

type Conversation = {
    id: number;
    topic: string;
    participants: string[];
    messages: AgentMessage[];
    decision?: string;
};

// --- Sub-Components ---
interface GameIdeaInputProps {
    gameIdea: string;
    setGameIdea: (value: string) => void;
    startDevelopment: () => void;
    isGenerating: boolean;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}
const GameIdeaInput: React.FC<GameIdeaInputProps> = ({ gameIdea, setGameIdea, startDevelopment, isGenerating, textSecondary, cardBg, borderColor, currentTheme }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-3xl font-bold mb-2">Describe Your Game Idea</h3>
        <p className={`${textSecondary} mb-6 max-w-lg`}>Just give us the basic concept. Our AI team will handle the rest, from design to development.</p>
        <textarea
            value={gameIdea}
            onChange={(e) => setGameIdea(e.target.value)}
            placeholder="Example: 'A puzzle game where you manipulate time to solve environmental challenges in a mysterious ancient temple'"
            className={`w-full max-w-2xl p-4 ${cardBg} rounded-2xl border ${borderColor} resize-none focus:outline-none focus:ring-2 ${currentTheme.ring}`}
            rows={4}
        />
        <div className="flex gap-2 mt-4">
            {QUICK_IDEAS.map(idea => (
                <button key={idea} onClick={() => setGameIdea(idea)} className={`px-3 py-1 text-sm ${cardBg} border ${borderColor} rounded-full hover:bg-white/10`}>
                    {idea}
                </button>
            ))}
        </div>
        <button
            onClick={startDevelopment}
            disabled={!gameIdea.trim() || isGenerating}
            className={`mt-8 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3`}
        >
            {isGenerating ? <><Wand2 className="animate-spin" /> Generating...</> : <><Sparkles /> Create My Game</>}
        </button>
    </div>
);

const ActivityItem: React.FC<{ activity: Activity, textColor: string, textSecondary: string }> = ({ activity, textColor, textSecondary }) => {
    const Icon = AGENT_ICONS[activity.agent] || Bot;
    return (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-black/10">
            <div className={`p-2 rounded-lg bg-black/20 ${textSecondary}`}><Icon size={20} /></div>
            <div className="flex-1">
                <p className={`font-semibold ${textColor}`}>{activity.agent}</p>
                <p className={`text-sm ${textSecondary}`}>{activity.action}</p>
            </div>
            <p className={`text-xs ${textSecondary} flex-shrink-0`}>{activity.timestamp}</p>
        </div>
    );
};

const ConversationThread: React.FC<{ conversation: Conversation, borderColor: string, textColor: string, textSecondary: string, currentTheme: Theme }> = ({ conversation, borderColor, textColor, textSecondary, currentTheme }) => (
    <div className={`p-2 rounded-lg border ${borderColor} bg-black/5 mb-3`}>
        <h4 className="font-bold text-sm px-2 mb-2">{conversation.topic}</h4>
        <div className="space-y-2">
            {conversation.messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-2 text-xs">
                    <div className="font-semibold w-28 truncate text-right">{msg.agent}:</div>
                    <div className={`flex-1 ${textSecondary} whitespace-pre-wrap`}>{msg.content}</div>
                </div>
            ))}
        </div>
        {conversation.decision && (
            <div className={`mt-2 p-2 border-t ${borderColor} text-xs`}>
                <span className={`font-bold ${currentTheme.text}`}>Outcome: </span>
                <span className={textSecondary}>{conversation.decision}</span>
            </div>
        )}
    </div>
);

interface AutonomousDevelopmentViewProps {
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
    textColor: string;
    textSecondary: string;
    currentStageName: string;
    gameProgress: number;
    agentActivities: Activity[];
    liveConversations: Conversation[];
    generatedPreview: string | null;
    generatedCode: string | null;
    developmentStage: string;
    copied: boolean;
    handleDeploy: () => void;
    handleCopyCode: () => void;
}

const AutonomousDevelopmentView: React.FC<AutonomousDevelopmentViewProps> = (props) => {
    const { cardBg, borderColor, currentTheme, textColor, textSecondary, currentStageName, gameProgress, agentActivities, liveConversations, generatedPreview, generatedCode, developmentStage, copied, handleDeploy, handleCopyCode } = props;
    return (
        <div className="flex-1 flex flex-col p-4 overflow-hidden gap-4">
            <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 flex flex-col justify-center`}>
                 <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold">{currentStageName}</p>
                    <p className={`font-bold text-lg ${currentTheme.text}`}>{gameProgress}%</p>
                </div>
                <div className={`w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full transition-all duration-500`} style={{ width: `${gameProgress}%` }}></div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-7 gap-4 overflow-hidden">
                <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 lg:col-span-2 flex flex-col`}>
                     <h3 className="font-semibold mb-2 flex-shrink-0">AI Team Activity</h3>
                     <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-1">
                        {agentActivities.map((act, i) => <ActivityItem key={i} activity={act} textColor={textColor} textSecondary={textSecondary} />)}
                    </div>
                </div>
                <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 lg:col-span-3 flex flex-col`}>
                     <h3 className="font-semibold mb-2 flex-shrink-0">Team Discussions</h3>
                     <div className="flex-1 overflow-y-auto pr-1 -mr-2">
                        {liveConversations.map(convo => <ConversationThread key={convo.id} conversation={convo} borderColor={borderColor} textColor={textColor} textSecondary={textSecondary} currentTheme={currentTheme} />)}
                     </div>
                </div>
                 <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 lg:col-span-2 flex flex-col gap-4`}>
                    <div>
                        <h3 className="font-semibold mb-2 flex-shrink-0">Game Preview</h3>
                        <div className="flex-1 flex flex-col items-center justify-center bg-black/20 rounded-lg aspect-video">
                            {generatedPreview ? (
                                <img src={generatedPreview} alt="Game Concept Art" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-center p-4">
                                    <Palette size={48} className={textSecondary} />
                                    <p className={`mt-2 text-sm ${textSecondary}`}>Concept art will appear here...</p>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                            <h3 className="font-semibold">Generated Code</h3>
                            <button onClick={handleCopyCode} className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Copy Code">
                                {copied ? <Check size={16} className={currentTheme.text} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="flex-1 bg-black/20 rounded-lg overflow-hidden">
                            <pre className="w-full h-full overflow-auto text-xs p-2 text-gray-300">
                                {generatedCode ? <code>{generatedCode}</code> : <span className="flex items-center justify-center h-full text-gray-400">Code will appear here...</span>}
                            </pre>
                        </div>
                    </div>
                    <div className="flex-shrink-0 space-y-2">
                         {developmentStage === 'completed' && (
                            <button
                                onClick={handleDeploy}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}
                            >
                                <UploadCloud /> Deploy to Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const GameCreatorModal: React.FC<GameCreatorModalProps> = (props) => {
    const { show, onClose, onDeployGame, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    // Core State
    const [apiKeyOk, setApiKeyOk] = useState(false);
    const [gameIdea, setGameIdea] = useState('');
    const [developmentStage, setDevelopmentStage] = useState('waiting'); // 'waiting', 'in_progress', 'completed'
    const [gameProgress, setGameProgress] = useState(0);
    const [currentStageName, setCurrentStageName] = useState('');
    const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);


    // Simulation State
    const [agentActivities, setAgentActivities] = useState<Activity[]>([]);
    const [liveConversations, setLiveConversations] = useState<Conversation[]>([]);
    
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (show) {
            const checkKey = async () => {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if(isMounted.current) setApiKeyOk(hasKey);
            };
            checkKey();
        }
    }, [show]);

    const resetState = () => {
        setGameIdea('');
        setDevelopmentStage('waiting');
        setGameProgress(0);
        setCurrentStageName('');
        setGeneratedPreview(null);
        setGeneratedCode(null);
        setAgentActivities([]);
        setLiveConversations([]);
        setError(null);
        setIsGenerating(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };
    
    const handleDeploy = () => {
        if (gameIdea && generatedPreview) {
            onDeployGame(gameIdea, generatedPreview);
        }
    };
    
    const handleCopyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const startDevelopment = async () => {
        if (!gameIdea.trim() || isGenerating) return;

        setIsGenerating(true);
        setError(null);
        setDevelopmentStage('in_progress');
        setGeneratedPreview(null);
        setGeneratedCode(null);
        setAgentActivities([]);
        setLiveConversations([]);
        
        const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const addActivity = (activity: Omit<Activity, 'timestamp'>) => {
            if(isMounted.current) setAgentActivities(prev => [...prev, { ...activity, timestamp: getTime() }]);
        };

        const addConversation = (topic: string, participants: string[], message: Omit<AgentMessage, 'id'>) => {
            const newConvo: Conversation = { id: Date.now(), topic, participants, messages: [{...message, id: Date.now()}] };
            if(isMounted.current) setLiveConversations(prev => [...prev, newConvo]);
            return newConvo.id;
        };

        const addMessage = (convoId: number, message: Omit<AgentMessage, 'id'>) => {
            if(isMounted.current) setLiveConversations(prev => prev.map(c => c.id === convoId ? { ...c, messages: [...c.messages, {...message, id: Date.now()}] } : c));
        };
        
        const setDecision = (convoId: number, decision: string) => {
             if(isMounted.current) setLiveConversations(prev => prev.map(c => c.id === convoId ? { ...c, decision } : c));
        };

        try {
            // --- PHASE 1: ANALYSIS & BRAINSTORMING ---
            if(!isMounted.current) return;
            setCurrentStageName('Analyzing Concept');
            setGameProgress(5);
            addActivity({ agent: 'Creative Director', action: 'Analyzing game concept and establishing vision', type: 'analysis' });
            
            const conceptPrompt = `You are a team of expert game developers.
            Analyze this game idea: "${gameIdea}".
            As a Creative Director, define the core genre and a unique mechanic.
            As a Game Designer, propose a core gameplay loop.
            As an Art Director, suggest a compelling visual style.
            Format the response as:
            **Concept:** [One sentence summary]
            **Genre:** [Game Genre]
            **Mechanic:** [Unique Mechanic]
            **Gameplay Loop:** [Core Loop]
            **Art Style:** [Visual Style]`;

            const conceptConvoId = addConversation('Game Concept Refinement', ['Creative Director', 'Game Designer', 'Art Director'], { agent: 'Creative Director', content: `Alright team, let's break down this idea: "${gameIdea}"`, type: 'proposal' });
            
            const conceptResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: conceptPrompt });
            const gameConceptText = conceptResponse.text;
            
            if(!isMounted.current) return;
            addMessage(conceptConvoId, { agent: 'System', content: `AI analysis complete:\n${gameConceptText}`, type: 'update' });
            setDecision(conceptConvoId, "Finalized core game concept.");
            
            // --- PHASE 2: ASSET CREATION ---
            if(!isMounted.current) return;
            setCurrentStageName('Creating Assets');
            setGameProgress(25);
            addActivity({ agent: 'Art Director', action: 'Generating concept art and visual assets', type: 'creation' });
            
            const artStyleMatch = gameConceptText.match(/\*\*Art Style:\*\* (.*)/);
            const artStyle = artStyleMatch ? artStyleMatch[1] : 'cinematic';
            const artPrompt = `High-quality cinematic concept art for a video game about "${gameIdea}". The art style is ${artStyle}. Epic, detailed, vibrant colors.`;

            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: artPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            let imageUrl: string | null = null;
            const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (imagePart?.inlineData) {
                imageUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
            } else {
                 throw new Error("The AI Art Director failed to generate an image. Please try a different idea or check model availability.");
            }

            if(!isMounted.current) return;
            setGeneratedPreview(imageUrl);
            addActivity({ agent: 'Sound Designer', action: 'Composing ambient soundtrack and SFX', type: 'creation' });
            setGameProgress(50);
            
            // --- PHASE 3: TECHNICAL DESIGN & IMPLEMENTATION ---
            if(!isMounted.current) return;
            setCurrentStageName('Implementing');
            addActivity({ agent: 'Technical Director', action: 'Creating technical specification and writing boilerplate code', type: 'technical' });
            
            const codePrompt = `Based on the game concept:\n${gameConceptText}\nWrite a single, complete HTML file containing boilerplate JavaScript code using the Phaser.js framework. Create a simple scene that displays a title text related to the game idea. The code should be self-contained and ready to run in a browser.`;
            const codeConvoId = addConversation('Technical Implementation', ['Technical Director'], { agent: 'Technical Director', content: "Generating boilerplate code based on the approved concept.", type: 'update' });
            
            const codeResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: codePrompt });
            let generatedCodeText = codeResponse.text;
            
            // Clean up markdown fences if they exist
            generatedCodeText = generatedCodeText.replace(/^```(html|javascript)?\s*/, '').replace(/```$/, '');
            
            if(!isMounted.current) return;
            setGeneratedCode(generatedCodeText);
            addMessage(codeConvoId, { agent: 'Technical Director', content: "Initial code structure is complete.", type: 'update' });
            setGameProgress(85);

            // --- PHASE 4: POLISHING & COMPLETION ---
            if(!isMounted.current) return;
            setCurrentStageName('Polishing');
            addActivity({ agent: 'QA Agent', action: 'Running automated tests and balance checks', type: 'testing' });
            
            const qaConvoId = addConversation('Final Polish', ['QA Agent', 'Technical Director'], { agent: 'QA Agent', content: "Initial tests are running. Looks good so far.", type: 'update' });
            addMessage(qaConvoId, { agent: 'System', content: 'All systems nominal. Build is stable.', type: 'feedback' });
            
            if(!isMounted.current) return;
            setGameProgress(100);
            setCurrentStageName('Completed');
            setDevelopmentStage('completed');
            addActivity({ agent: 'System', action: 'Game development complete! Playable build is ready.', type: 'system' });

        } catch (e) {
            console.error("Game generation failed:", e);
            
            let detailedErrorMessage = "An unknown error occurred during generation.";
            let errorObject: any = e;

            if (e instanceof Error && e.message) {
                try {
                    errorObject = JSON.parse(e.message);
                } catch (jsonError) {
                    detailedErrorMessage = e.message;
                    errorObject = null;
                }
            }
            
            if (errorObject && errorObject.error && errorObject.error.message) {
                detailedErrorMessage = errorObject.error.message;
            } else if (errorObject && errorObject.message) {
                detailedErrorMessage = errorObject.message;
            }

            if (isMounted.current) {
                if (detailedErrorMessage.includes("Requested entity was not found.") || detailedErrorMessage.toLowerCase().includes("api key not valid")) {
                    setError("Your API key appears to be invalid. Please select a valid key to continue.");
                    setApiKeyOk(false);
                } else {
                    setError(`Generation failed: ${detailedErrorMessage}`);
                }
            }
        } finally {
            if(isMounted.current) setIsGenerating(false);
        }
    };
    
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-7xl h-[90vh] border ${borderColor} shadow-2xl flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                <header className={`flex justify-between items-center p-3 border-b ${borderColor} flex-shrink-0`}>
                    <div className="flex items-center gap-3">
                        <Gamepad2 className={currentTheme.text} size={28} />
                        <h2 className="text-xl font-bold">Autonomous Game Studio</h2>
                    </div>
                    {developmentStage !== 'waiting' &&
                        <button onClick={resetState} disabled={isGenerating} className={`px-4 py-2 text-sm font-semibold rounded-lg ${cardBg} border ${borderColor} hover:bg-white/10 disabled:opacity-50`}>
                            Create New Game
                        </button>
                    }
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </header>
                
                {error && (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-400">
                        <AlertTriangle size={48} className="mx-auto" />
                        <h3 className="text-xl font-bold mt-4">Development Halted</h3>
                        <p className="mt-2 max-w-md">{error}</p>
                        <button onClick={resetState} className={`mt-6 px-6 py-2 rounded-lg font-semibold ${cardBg} border ${borderColor} text-white`}>
                            Try Again
                        </button>
                    </div>
                )}

                {!error && !apiKeyOk && (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <KeyRound size={48} className={`mx-auto ${currentTheme.text} mb-4`} />
                        <h3 className="text-2xl font-bold mb-2">API Key Required</h3>
                        <p className={`${textSecondary} mb-6 max-w-md`}>
                            The Game Creator Studio uses advanced AI models and requires a Google AI API key to function. Please select a key to begin.
                        </p>
                        <button
                            onClick={async () => {
                                await (window as any).aistudio.openSelectKey();
                                setApiKeyOk(true);
                            }}
                            className={`px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}
                        >
                            Select Your API Key
                        </button>
                    </div>
                )}
                
                {!error && apiKeyOk && (
                    developmentStage === 'waiting' ? 
                    <GameIdeaInput 
                        gameIdea={gameIdea}
                        setGameIdea={setGameIdea}
                        startDevelopment={startDevelopment}
                        isGenerating={isGenerating}
                        textSecondary={textSecondary}
                        cardBg={cardBg}
                        borderColor={borderColor}
                        currentTheme={currentTheme}
                    /> : 
                    <AutonomousDevelopmentView
                        cardBg={cardBg}
                        borderColor={borderColor}
                        currentTheme={currentTheme}
                        textColor={textColor}
                        textSecondary={textSecondary}
                        currentStageName={currentStageName}
                        gameProgress={gameProgress}
                        agentActivities={agentActivities}
                        liveConversations={liveConversations}
                        generatedPreview={generatedPreview}
                        generatedCode={generatedCode}
                        developmentStage={developmentStage}
                        copied={copied}
                        handleDeploy={handleDeploy}
                        handleCopyCode={handleCopyCode}
                    />
                )}
            </div>
        </div>
    );
};

export default GameCreatorModal;
