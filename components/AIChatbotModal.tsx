import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, User, Sparkles } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { API_CONFIG, API_VERSIONS, ApiService, AIModelInfo } from '../constants';
import AvatarDisplay from './AvatarDisplay';

interface AIChatbotModalProps {
    show: boolean;
    onClose: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

// --- AI Router Logic (Scoped to this component) ---
const getConfiguredServices = (): ApiService[] => {
    return (Object.keys(API_CONFIG) as ApiService[]).filter(service =>
        localStorage.getItem(API_CONFIG[service].storageKey)
    );
};

const getModelProvider = (modelId: string): ApiService | null => {
    for (const service of Object.keys(API_VERSIONS) as ApiService[]) {
        for (const category of API_VERSIONS[service]) {
            if (category.models.some(m => m.id === modelId)) {
                return service;
            }
        }
    }
    return null;
};

const getBestChatModel = (configuredServices: ApiService[]): AIModelInfo => {
    const CHAT_MODEL_PRIORITY = [
        'gemini-2.5-flash',
        'claude-haiku-4.5',
        'gpt-4o-mini',
        'gemini-2.5-pro',
    ];
    
    for (const modelId of CHAT_MODEL_PRIORITY) {
        const provider = getModelProvider(modelId);
        if (provider && configuredServices.includes(provider)) {
            for (const category of API_VERSIONS[provider]) {
                const model = category.models.find(m => m.id === modelId);
                if (model) return model;
            }
        }
    }
    // Fallback to default Gemini Flash model info
    return { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Default chat model.' };
};

const AIChatbotModal: React.FC<AIChatbotModalProps> = (props) => {
    const { show, onClose, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (show) {
            const configuredServices = getConfiguredServices();
            if (configuredServices.length === 0) {
                setError("No AI API key configured. Please add one in Settings > API Configuration.");
                setHistory([{ role: 'model', text: 'AI Chatbot is offline. Please configure an API key.' }]);
                return;
            }
            
            const bestModel = getBestChatModel(configuredServices);
            const provider = getModelProvider(bestModel.id);

            if (provider !== 'Google AI') {
                setError(`Chat is configured to use ${bestModel.name}, but only Google AI models are supported for execution.`);
                setHistory([{ role: 'model', text: `Hello! I'm ready to chat using ${bestModel.name}. However, I can't send messages with this model in this environment. Please select a Google AI model in your settings to proceed.` }]);
                return;
            }

            try {
                const googleApiKey = localStorage.getItem(API_CONFIG['Google AI'].storageKey);
                if (!googleApiKey) {
                    throw new Error("Google AI API Key not found in settings.");
                }
                const ai = new GoogleGenAI({ apiKey: googleApiKey });
                const chatInstance = ai.chats.create({
                    model: bestModel.id,
                });
                setChat(chatInstance);
                setHistory([{ role: 'model', text: `Hello! I'm using ${bestModel.name}. How can I help you?` }]);
                setError(null);
            } catch (e: any) {
                setError(`Failed to initialize chat: ${e.message}. Please check your Google AI API Key.`);
                setHistory([{ role: 'model', text: 'Could not connect to the AI. Please verify your API key in settings.' }]);
            }

        } else {
            setChat(null);
            setHistory([]);
            setInput('');
            setError(null);
        }
    }, [show]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !chat || error) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', text: result.text };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-2xl h-[80vh] border ${borderColor} shadow-2xl flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                <header className={`flex justify-between items-center p-4 border-b ${borderColor} flex-shrink-0`}>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Bot className={currentTheme.text} />
                        AI Chat
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <AvatarDisplay avatar="🤖" size="w-10 h-10" />}
                            <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white` : `${cardBg} border ${borderColor}`}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.role === 'user' && <AvatarDisplay avatar="👤" size="w-10 h-10" />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <AvatarDisplay avatar="🤖" size="w-10 h-10" />
                            <div className={`max-w-md p-3 rounded-2xl ${cardBg} border ${borderColor} flex items-center gap-2`}>
                                <Sparkles size={16} className={`animate-spin ${currentTheme.text}`} />
                                <span className={textSecondary}>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className={`p-4 border-t ${borderColor} flex-shrink-0`}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={error ? "Chat disabled." : "Ask me anything..."}
                            className={`flex-1 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            disabled={isLoading || !!error}
                        />
                        <button type="submit" disabled={isLoading || !input.trim() || !!error} className={`p-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50`}>
                            <Send size={20} />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default AIChatbotModal;