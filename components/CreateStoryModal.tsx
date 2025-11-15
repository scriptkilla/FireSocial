import React, { useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { Theme, StoryItem } from '../types';

interface CreateStoryModalProps {
    show: boolean;
    onClose: () => void;
    onCreate: (media: StoryItem) => void;
    // UI props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = (props) => {
    const { show, onClose, onCreate, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [media, setMedia] = useState<Omit<StoryItem, 'id'> | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!show) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const type = file.type.startsWith('image') ? 'image' : 'video';
                setMedia({ type, url });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostStory = () => {
        if (media) {
            onCreate({ ...media, id: Date.now() });
            handleClose();
        }
    };
    
    const handleClose = () => {
        setMedia(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`overflow-hidden max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create Story</h2>
                    <button aria-label="Close" onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="flex-grow flex items-center justify-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
                    {!media ? (
                        <button onClick={() => fileInputRef.current?.click()} className={`w-full h-64 border-2 border-dashed ${borderColor} rounded-2xl flex flex-col items-center justify-center text-center ${textSecondary} hover:bg-white/5`}>
                            <UploadCloud size={48} className="mb-4" />
                            <p className="font-semibold">Click to upload</p>
                            <p className="text-sm">Image or Video</p>
                        </button>
                    ) : (
                        <div className="w-full aspect-[9/16] max-h-[60vh] rounded-2xl overflow-hidden relative bg-black">
                             {media.type === 'image' ? (
                                <img src={media.url} alt="Story preview" className="w-full h-full object-contain" />
                             ) : (
                                <video src={media.url} controls className="w-full h-full object-contain" />
                             )}
                             <button aria-label="Remove media" onClick={() => setMedia(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/80"><X size={16} /></button>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-2">
                    <button onClick={handleClose} className={`flex-1 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} hover:bg-white/10`}>
                        Cancel
                    </button>
                    <button onClick={handlePostStory} disabled={!media || isUploading} className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {isUploading ? 'Uploading...' : 'Post to Story'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStoryModal;