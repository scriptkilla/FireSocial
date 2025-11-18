import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, BarChart2, UserPlus, MapPin, Globe, Users } from 'lucide-react';
import { Profile, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface CreatePostModalProps {
    show: boolean;
    onClose: () => void;
    onAddPost: (content: string, media?: { file: File, type: 'image' | 'video' }) => void;
    profile: Profile;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = (props) => {
    const { show, onClose, onAddPost, profile, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<{ file: File, url: string, type: 'image' | 'video' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_CHARS = 280;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const type = file.type.startsWith('image') ? 'image' : 'video';
            setMedia({ file, url, type });
        }
    };

    const handlePost = () => {
        if (!content.trim() && !media) return;
        onAddPost(content, media ? { file: media.file, type: media.type } : undefined);
        setContent('');
        setMedia(null);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex gap-4">
                    <AvatarDisplay avatar={profile.avatar} size="w-12 h-12" />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            className={`w-full bg-transparent text-lg focus:outline-none resize-none placeholder:text-gray-500`}
                            rows={4}
                            maxLength={MAX_CHARS}
                        />
                        {media && (
                            <div className="relative mt-2">
                                <div className="rounded-2xl overflow-hidden max-h-72">
                                {media.type === 'image' ? (
                                    <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <video src={media.url} controls className="w-full h-full object-cover" />
                                )}
                                </div>
                                <button onClick={() => setMedia(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"><X size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>
                
                 <div className="flex justify-between items-center mt-4">
                     <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Globe size={16}/>
                        <span>Everyone can view</span>
                     </div>
                     <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Users size={16}/>
                        <span>Everyone can reply</span>
                     </div>
                 </div>


                <div className={`my-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`}></div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full ${currentTheme.hoverText} hover:bg-white/10`} title="Media"><ImageIcon /></button>
                        <button className={`p-2 rounded-full ${currentTheme.hoverText} hover:bg-white/10`} title="Poll"><BarChart2 /></button>
                        <button className={`p-2 rounded-full ${currentTheme.hoverText} hover:bg-white/10`} title="Tag people"><UserPlus /></button>
                        <button className={`p-2 rounded-full ${currentTheme.hoverText} hover:bg-white/10`} title="Check in"><MapPin /></button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className={`text-sm ${content.length > MAX_CHARS - 20 ? 'text-red-400' : textSecondary}`}>{MAX_CHARS - content.length}</span>
                        <div className={`w-px h-6 bg-white/10`}></div>
                        <button
                            onClick={handlePost}
                            disabled={!content.trim() && !media}
                            className={`px-6 py-2 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
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