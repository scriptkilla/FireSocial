
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Smile, BarChart2, MapPin, Globe, Lock, Users, Wand2, Loader2, Sparkles, Camera, Check as CheckIcon } from 'lucide-react';
import { Profile, Theme, MediaItem } from '../types';
import AvatarDisplay from './AvatarDisplay';
import { GoogleGenAI } from "@google/genai";

interface CreatePostModalProps {
    show: boolean;
    onClose: () => void;
    onCreatePost: (content: string, media: MediaItem[], type: 'post' | 'poll', pollOptions?: string[]) => void;
    profile: Profile;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = (props) => {
    const { show, onClose, onCreatePost, profile, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [showPoll, setShowPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
    
    // AI State
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    if (!show) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const type = file.type.startsWith('video') ? 'video' : 'image';
                setMedia([...media, { type, url }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!content.trim() && media.length === 0 && !showPoll) return;
        
        const type = showPoll ? 'poll' : 'post';
        const validPollOptions = pollOptions.filter(o => o.trim() !== '');
        
        if (type === 'poll' && validPollOptions.length < 2) {
            alert('Please provide at least 2 options for the poll.');
            return;
        }

        onCreatePost(content, media, type, showPoll ? validPollOptions : undefined);
        handleClose();
    };

    const handleClose = () => {
        stopCamera();
        setContent('');
        setMedia([]);
        setShowPoll(false);
        setPollOptions(['', '']);
        onClose();
    }

    const updatePollOption = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    // --- Camera Functions ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Camera error", err);
            alert("Could not access camera. Please ensure you have granted permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const url = canvas.toDataURL('image/png');
                setMedia([...media, { type: 'image', url }]);
                stopCamera();
            }
        }
    };


    // --- AI Integration ---
    const handleAiAction = async (action: 'fix' | 'witty' | 'hashtags') => {
        if (!content.trim()) return;
        
        setIsAiLoading(true);
        setShowAiMenu(false);

        try {
            // Robust API Key Retrieval
            const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai');
            
            if (!apiKey) {
                alert("API Key missing. Please add your Google AI API Key in Settings > API Configuration.");
                setIsAiLoading(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            let prompt = "";
            
            if (action === 'fix') {
                prompt = `Fix the grammar and spelling of the following text, keeping the tone natural: "${content}"`;
            } else if (action === 'witty') {
                prompt = `Rewrite the following text to be witty, engaging, and fun for a social media post: "${content}"`;
            } else if (action === 'hashtags') {
                prompt = `Read the following text and append 3-5 relevant, trending hashtags to the end of it. Return the full text with hashtags: "${content}"`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) {
                setContent(response.text.trim());
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Could not connect to AI. Please check your API configuration in Settings.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={handleClose}>
            <div 
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-lg border ${borderColor} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-4 border-b ${borderColor}`}>
                    <h2 className="text-xl font-bold">Create Post</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-4 relative">
                    {isCameraOpen ? (
                        <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            <div className="absolute bottom-4 flex items-center gap-6">
                                <button onClick={stopCamera} className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all">
                                    <X size={24} />
                                </button>
                                <button onClick={capturePhoto} className="p-1 rounded-full border-4 border-white hover:scale-105 transition-all">
                                    <div className="w-12 h-12 bg-white rounded-full"></div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-3 mb-4">
                                <AvatarDisplay avatar={profile.avatar} size="w-12 h-12" />
                                <div className="flex-1">
                                    <p className={`font-bold ${textColor}`}>{profile.name}</p>
                                    <button 
                                        onClick={() => setPrivacy(p => p === 'public' ? 'followers' : p === 'followers' ? 'private' : 'public')}
                                        className={`flex items-center gap-1 text-xs ${textSecondary} hover:${textColor} transition-colors`}
                                    >
                                        {privacy === 'public' && <><Globe size={12} /> Public</>}
                                        {privacy === 'followers' && <><Users size={12} /> Followers</>}
                                        {privacy === 'private' && <><Lock size={12} /> Only Me</>}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className={`w-full bg-transparent ${textColor} placeholder-gray-500 resize-none focus:outline-none text-lg min-h-[120px]`}
                                />
                                {isAiLoading && (
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${cardBg} border ${borderColor} shadow-lg`}>
                                            <Loader2 className={`animate-spin ${currentTheme.text}`} size={16} />
                                            <span className="text-sm font-semibold">AI is writing...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {media.length > 0 && !isCameraOpen && (
                        <div className="flex gap-2 overflow-x-auto py-2 mb-2">
                            {media.map((item, idx) => (
                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-700 group">
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={item.url} className="w-full h-full object-cover" />
                                    )}
                                    <button 
                                        onClick={() => setMedia(media.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isCameraOpen && showPoll && (
                        <div className={`mb-4 p-3 rounded-xl border ${borderColor} bg-black/5`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">Poll Options</span>
                                <button onClick={() => setShowPoll(false)} className="text-red-400 hover:text-red-500"><X size={16}/></button>
                            </div>
                            <div className="space-y-2">
                                {pollOptions.map((option, idx) => (
                                    <input 
                                        key={idx}
                                        type="text"
                                        value={option}
                                        onChange={(e) => updatePollOption(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className={`w-full px-3 py-2 bg-transparent border ${borderColor} rounded-lg focus:outline-none focus:ring-1 ${currentTheme.ring}`}
                                    />
                                ))}
                                {pollOptions.length < 4 && (
                                    <button onClick={addPollOption} className={`text-sm ${currentTheme.text} font-semibold hover:underline`}>+ Add Option</button>
                                )}
                            </div>
                        </div>
                    )}

                    {!isCameraOpen && (
                    <div className={`flex items-center justify-between mt-4 pt-4 border-t ${borderColor}`}>
                        <div className="flex gap-2 text-gray-400">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-green-400" title="Add Media"><ImageIcon size={20} /></button>
                            <button onClick={startCamera} className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-400" title="Use Camera"><Camera size={20} /></button>
                            <button onClick={() => setShowPoll(!showPoll)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-orange-400" title="Create Poll"><BarChart2 size={20} /></button>
                            
                            {/* AI Button */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAiMenu(!showAiMenu)} 
                                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showAiMenu ? currentTheme.text : 'text-purple-400'}`}
                                    title="AI Assist"
                                    disabled={!content.trim()}
                                >
                                    <Wand2 size={20} />
                                </button>
                                {showAiMenu && (
                                    <div className={`absolute bottom-full mb-2 left-0 w-48 ${cardBg} backdrop-blur-xl border ${borderColor} rounded-xl shadow-xl p-1 z-10 flex flex-col animate-in slide-in-from-bottom-2`}>
                                        <button onClick={() => handleAiAction('fix')} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left">
                                            <CheckIcon size={14} /> Fix Grammar
                                        </button>
                                        <button onClick={() => handleAiAction('witty')} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left">
                                            <Sparkles size={14} /> Make it Witty
                                        </button>
                                        <button onClick={() => handleAiAction('hashtags')} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/10 text-left">
                                            <Users size={14} /> Add Hashtags
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-yellow-400"><Smile size={20} /></button>
                        </div>
                        <button 
                            onClick={handleSubmit}
                            disabled={!content.trim() && media.length === 0 && !showPoll}
                            className={`px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Post
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
