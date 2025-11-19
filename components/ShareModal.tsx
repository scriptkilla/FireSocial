
import React, { useState } from 'react';
import { X, Link2, Repeat, Check, Mail, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Post, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface ShareModalProps {
    show: boolean;
    onClose: () => void;
    post: Post;
    onReshare: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ show, onClose, post, onReshare, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const [copied, setCopied] = useState(false);
    const [reshared, setReshared] = useState(false);

    if (!show) return null;

    const postUrl = `https://firesocial.app/post/${post.id}`;
    const shareText = `Check out this post by ${post.user} on FireSocial!`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReshareClick = () => {
        onReshare();
        setReshared(true);
        setTimeout(() => {
            setReshared(false);
            onClose();
        }, 1500);
    };

    const shareLinks = [
        { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, color: 'hover:text-blue-400' },
        { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, color: 'hover:text-blue-600' },
        { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, color: 'hover:text-blue-700' },
        { name: 'Email', icon: Mail, url: `mailto:?subject=${encodeURIComponent("Check out this post")}&body=${encodeURIComponent(shareText + " " + postUrl)}`, color: 'hover:text-red-500' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
             <div 
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-md border ${borderColor} shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Share2 size={20}/> Share Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {/* Post Preview */}
                <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 border ${borderColor} mb-6 flex gap-3`}>
                    <AvatarDisplay avatar={post.avatar} size="w-10 h-10" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm">{post.user}</p>
                        <p className={`text-sm ${textSecondary} truncate`}>{post.content}</p>
                    </div>
                </div>

                {/* Internal Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onClick={handleReshareClick}
                        disabled={reshared}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${reshared ? 'bg-green-500 text-white' : `bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border ${borderColor}`}`}
                    >
                        {reshared ? <Check size={18}/> : <Repeat size={18}/>}
                        {reshared ? 'Reshared' : 'Repost'}
                    </button>
                    <button 
                        onClick={handleCopyLink}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${copied ? 'bg-green-500 text-white' : `bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border ${borderColor}`}`}
                    >
                        {copied ? <Check size={18}/> : <Link2 size={18}/>}
                        {copied ? 'Copied' : 'Copy Link'}
                    </button>
                </div>

                {/* External Shares */}
                <div>
                    <p className={`text-sm font-medium ${textSecondary} mb-3`}>Share to</p>
                    <div className="flex justify-between px-2">
                        {shareLinks.map((link) => (
                            <a 
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex flex-col items-center gap-2 group`}
                            >
                                <div className={`w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border ${borderColor} flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10 ${link.color}`}>
                                    <link.icon size={20} />
                                </div>
                                <span className={`text-xs ${textSecondary}`}>{link.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
