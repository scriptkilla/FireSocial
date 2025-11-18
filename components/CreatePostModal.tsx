
import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Smile, BarChart2, MapPin, Globe, Lock, Users } from 'lucide-react';
import { Profile, Theme, Post, MediaItem } from '../types';
import AvatarDisplay from './AvatarDisplay';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        onClose();
        setContent('');
        setMedia([]);
        setShowPoll(false);
        setPollOptions(['', '']);
    };

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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-lg border ${borderColor} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-4 border-b ${borderColor}`}>
                    <h2 className="text-xl font-bold">Create Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-4">
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

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className={`w-full bg-transparent ${textColor} placeholder-gray-500 resize-none focus:outline-none text-lg min-h-[120px]`}
                    />

                    {media.length > 0 && (
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

                    {showPoll && (
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

                    <div className={`flex items-center justify-between mt-4 pt-4 border-t ${borderColor}`}>
                        <div className="flex gap-2 text-gray-400">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-green-400"><ImageIcon size={20} /></button>
                            <button onClick={() => setShowPoll(!showPoll)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-orange-400"><BarChart2 size={20} /></button>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-yellow-400"><Smile size={20} /></button>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400"><MapPin size={20} /></button>
                        </div>
                        <button 
                            onClick={handleSubmit}
                            disabled={!content.trim() && media.length === 0 && !showPoll}
                            className={`px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
