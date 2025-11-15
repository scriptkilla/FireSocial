

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Profile, Message, Theme, ChatMessage } from '../types';
import { Send, Video, Mic, MoreHorizontal, Phone, Check, CheckCheck, Clock, AlertCircle, Paperclip, X, Trash2, Copy, Edit, Reply } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

const EMOJI_REACTIONS = ['❤️', '😂', '👍', '😢', '😮', '🔥'];
const MESSAGES_PER_PAGE = 15;

interface ChatWindowProps {
    profile: Profile;
    chatWith: Message;
    history: ChatMessage[];
    onSendMessage: (userId: number, text: string, type: ChatMessage['type'], options?: Partial<ChatMessage>) => void;
    onDeleteMessage: (userId: number, messageId: number) => void;
    onEditMessage: (userId: number, messageId: number, newText: string) => void;
    onReactToMessage: (userId: number, messageId: number, emoji: string) => void;
    onStartCall: (type: 'video' | 'voice') => void;
    currentTheme: Theme;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const StatusIcon: React.FC<{ status: ChatMessage['status'], currentTheme: Theme }> = ({ status, currentTheme }) => {
    switch (status) {
        case 'sending': return <Clock size={16} className="text-gray-400" />;
        case 'sent': return <Check size={16} className="text-gray-400" />;
        case 'delivered': return <CheckCheck size={16} className="text-gray-400" />;
        case 'read': return <CheckCheck size={16} className={currentTheme.text} />;
        case 'failed': return <AlertCircle size={16} className="text-red-500" />;
        default: return null;
    }
};

const ChatMessageBubble: React.FC<{
    message: ChatMessage;
    isOwn: boolean;
    chatWith: Message;
    currentTheme: Theme;
    textColor: string;
    textSecondary: string;
    profile: Profile;
    onReply: (message: ChatMessage) => void;
    onEdit: (message: ChatMessage) => void;
    onDelete: () => void;
    onReact: (emoji: string) => void;
    getRepliedMessage: (id: number) => ChatMessage | undefined;
}> = ({ message, isOwn, chatWith, currentTheme, textColor, textSecondary, profile, onReply, onEdit, onDelete, onReact, getRepliedMessage }) => {
    
    const [showActions, setShowActions] = useState(false);
    const repliedMessage = message.replyTo ? getRepliedMessage(message.replyTo) : null;
    
    const renderMessageContent = () => {
        switch (message.type) {
            case 'image': return <img src={message.url} alt="Uploaded content" className="rounded-2xl max-h-64 cursor-pointer" />;
            case 'voice': return <div className="flex items-center gap-2"><div className="font-bold text-2xl">▶</div><div className="flex items-end gap-0.5 h-8">{message.waveform?.map((h, i) => <div key={i} className={`w-1 rounded-full bg-current`} style={{height: `${h * 100}%`}}></div>)}</div><span className="text-sm font-mono">{message.duration}</span></div>;
            case 'file': return <div className="flex items-center gap-3 p-2 bg-black/10 rounded-lg"><Paperclip size={24} /><div className="text-left"><p className="font-semibold">{message.fileName}</p><p className="text-xs">{message.fileSize}</p></div></div>;
            case 'call': return <div className={`text-sm p-2 rounded-lg flex items-center gap-2 italic ${textSecondary}`}><Phone size={14} /><span>{message.text} {message.callInfo?.duration && `(${message.callInfo.duration})`}</span></div>;
            default: return <p className="whitespace-pre-wrap text-left">{message.text}</p>;
        }
    };

    const messageContainerClass = `px-4 py-3 rounded-2xl ${isOwn ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white` : `bg-black/10 dark:bg-white/10 ${textColor}`}`;
    
    return (
        <div className={`flex items-end gap-2 group ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && <AvatarDisplay avatar={chatWith.avatar} size="w-8 h-8" />}
            <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex ${isOwn ? 'flex-row-reverse' : ''} gap-1 relative`}>
                    <button onClick={() => onReply(message)} title="Reply" className={`p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textSecondary}`}><Reply size={16}/></button>
                    <button onClick={() => setShowActions(s => !s)} title="More" className={`p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${textSecondary}`}><MoreHorizontal size={16}/></button>
                    {showActions && (
                        <div onMouseLeave={() => setShowActions(false)} className={`absolute ${isOwn ? 'right-0' : 'left-0'} bottom-full mb-1 w-48 bg-gray-900 rounded-lg shadow-lg z-10 text-white overflow-hidden`}>
                           <div className="p-1 flex justify-around bg-gray-800">
                                {EMOJI_REACTIONS.map(emoji => (
                                    <button key={emoji} onClick={() => { onReact(emoji); setShowActions(false); }} className="p-1 text-2xl hover:scale-125 transition-transform">{emoji}</button>
                                ))}
                           </div>
                           <button onClick={() => { onReply(message); setShowActions(false); }} className="px-3 py-2 flex items-center gap-2 text-sm w-full hover:bg-gray-700"><Reply size={16} /> Reply</button>
                           {isOwn && <button onClick={() => { onEdit(message); setShowActions(false); }} className="px-3 py-2 flex items-center gap-2 text-sm w-full hover:bg-gray-700"><Edit size={16} /> Edit</button>}
                           <button onClick={() => { navigator.clipboard.writeText(message.text); setShowActions(false); }} className="px-3 py-2 flex items-center gap-2 text-sm w-full hover:bg-gray-700"><Copy size={16} /> Copy Text</button>
                           {isOwn && <button onClick={() => { onDelete(); setShowActions(false); }} className="px-3 py-2 flex items-center gap-2 text-sm w-full hover:bg-gray-700 text-red-400"><Trash2 size={16} /> Delete</button>}
                        </div>
                    )}
                </div>

                <div className={`relative max-w-md my-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {repliedMessage && (
                        <div className={`px-3 pt-2 pb-1 text-sm bg-black/5 dark:bg-white/5 rounded-t-xl border-l-2 ${currentTheme.border} opacity-80`}>
                            <p className="font-semibold">{repliedMessage.sentBy === profile.id ? profile.name : chatWith.user}</p>
                            <p className={`line-clamp-1 opacity-70`}>{repliedMessage.text}</p>
                        </div>
                    )}
                    <div className={`${messageContainerClass} ${repliedMessage ? 'rounded-tl-none' : ''}`}>
                       {renderMessageContent()}
                    </div>
                    <div className={`text-xs mt-1 px-2 ${isOwn ? 'text-right' : 'text-left'} text-gray-400 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {message.isEdited && <span>Edited</span>}
                        <span>{message.time}</span>
                        {isOwn && <StatusIcon status={message.status} currentTheme={currentTheme} />}
                    </div>
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className={`absolute -bottom-3 ${isOwn ? 'right-2' : 'left-2'} flex gap-1`}>
                            {Object.keys(message.reactions).map((emoji) => {
                                const users = message.reactions![emoji];
                                return users.length > 0 && (
                                    <button key={emoji} onClick={() => onReact(emoji)} className={`px-1.5 py-0.5 text-xs rounded-full bg-white dark:bg-gray-700 border dark:border-gray-600 shadow-sm transition-transform hover:scale-110 ${users.includes(profile.username) ? `ring-2 ${currentTheme.ring}` : ''}`}>
                                        {emoji} <span className="text-gray-600 dark:text-gray-300 font-semibold">{users.length}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ profile, chatWith, history, onSendMessage, onDeleteMessage, onEditMessage, onReactToMessage, onStartCall, currentTheme, textColor, textSecondary, borderColor }) => {
    const [messageInput, setMessageInput] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [isRecipientTyping, setIsRecipientTyping] = useState(false);
    
    const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initialMessages = history.slice(-MESSAGES_PER_PAGE);
        setVisibleMessages(initialMessages);
        setHasMore(history.length > MESSAGES_PER_PAGE);
    }, [history]);
    
    useLayoutEffect(() => {
        const scrollEl = scrollContainerRef.current;
        if (!scrollEl) return;

        if (prevScrollHeight !== null) {
            scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
            setPrevScrollHeight(null); 
        } else {
            scrollEl.scrollTop = scrollEl.scrollHeight;
        }
    }, [visibleMessages]);

    const handleLoadMore = () => {
        if(isLoadingMore || !hasMore || !scrollContainerRef.current) return;

        setPrevScrollHeight(scrollContainerRef.current.scrollHeight);
        setIsLoadingMore(true);

        setTimeout(() => { // Simulate network delay
            const currentCount = visibleMessages.length;
            const nextMessages = history.slice(-(currentCount + MESSAGES_PER_PAGE), -currentCount);
            setVisibleMessages(prev => [...nextMessages, ...prev]);
            setHasMore(history.length > currentCount + MESSAGES_PER_PAGE);
            setIsLoadingMore(false);
        }, 500);
    };

    const handleSend = () => {
        if (editingMessage) {
            if (messageInput.trim()) {
                onEditMessage(chatWith.userId, editingMessage.id, messageInput.trim());
                setEditingMessage(null);
                setMessageInput('');
            }
        } else if (messageInput.trim()) {
            onSendMessage(chatWith.userId, messageInput.trim(), 'text', { replyTo: replyingTo?.id });
            setMessageInput('');
            setReplyingTo(null);
            
            // Simulate typing response
            setTimeout(() => setIsRecipientTyping(true), 1000);
            setTimeout(() => {
                setIsRecipientTyping(false);
                const responseText = "Sounds good, thanks for the update!";
                onSendMessage(chatWith.userId, responseText, 'text');
            }, 4000);
        }
    };
    
    const getRepliedMessage = (id: number): ChatMessage | undefined => {
        return history.find(m => m.id === id);
    };

    const handleStartEdit = (message: ChatMessage) => {
        setEditingMessage(message);
        setMessageInput(message.text);
        setReplyingTo(null);
    };

    const cancelEditOrReply = () => {
        setEditingMessage(null);
        setReplyingTo(null);
        setMessageInput('');
    };

    return (
        <div className="h-full flex flex-col p-4">
            <div className={`flex-shrink-0 border-b ${borderColor} pb-4 mb-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <AvatarDisplay avatar={chatWith.avatar} size="w-12 h-12" fontSize="text-2xl" />
                        {chatWith.online && <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800`}></div>}
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${textColor}`}>{chatWith.user}</h2>
                        <p className={`text-sm ${textSecondary} h-5`}>{isRecipientTyping ? <span className="italic animate-pulse">typing...</span> : (chatWith.online ? 'Active now' : 'Offline')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onStartCall('voice')} className={`p-3 bg-black/5 dark:bg-white/5 rounded-full ${textColor} hover:scale-110 transition-all`}><Phone size={20} /></button>
                    <button onClick={() => onStartCall('video')} className={`p-3 bg-black/5 dark:bg-white/5 rounded-full ${textColor} hover:scale-110 transition-all`}><Video size={20} /></button>
                </div>
            </div>
            
            <div ref={scrollContainerRef} className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-1">
                 {hasMore && (
                    <div className="text-center">
                        <button onClick={handleLoadMore} disabled={isLoadingMore} className={`px-4 py-2 text-sm font-semibold rounded-full ${currentTheme.text} hover:bg-black/5`}>
                            {isLoadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
                <div className="space-y-4 pt-2 pb-4">
                    {visibleMessages.map(msg => (
                        <ChatMessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.sentBy === profile.id}
                            chatWith={chatWith}
                            currentTheme={currentTheme} 
                            textColor={textColor}
                            textSecondary={textSecondary}
                            profile={profile}
                            onReply={setReplyingTo}
                            onEdit={handleStartEdit}
                            onDelete={() => onDeleteMessage(chatWith.userId, msg.id)}
                            onReact={(emoji) => onReactToMessage(chatWith.userId, msg.id, emoji)}
                            getRepliedMessage={getRepliedMessage}
                        />
                    ))}
                </div>
                {isRecipientTyping && (
                     <div className="flex items-end gap-2 group justify-start mb-4">
                        <AvatarDisplay avatar={chatWith.avatar} size="w-8 h-8"/>
                        <div className={`px-4 py-3 rounded-2xl bg-black/10 dark:bg-white/10 ${textColor}`}>
                            <div className="flex gap-1 items-center">
                                <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-0"></span>
                                <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 flex flex-col mt-4">
                {(replyingTo || editingMessage) && (
                    <div className={`p-2 mb-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm flex justify-between items-center border-l-4 ${currentTheme.border}`}>
                        <div>
                            <p className={`font-semibold ${currentTheme.text}`}>{editingMessage ? 'Editing Message' : `Replying to ${chatWith.user}`}</p>
                            <p className={`line-clamp-1 ${textSecondary}`}>{editingMessage ? editingMessage.text : replyingTo?.text}</p>
                        </div>
                        <button onClick={cancelEditOrReply} className={`p-1.5 rounded-full hover:bg-black/10 ${textSecondary}`}><X size={16} /></button>
                    </div>
                )}
                 <div className="flex gap-2 items-center">
                    <button className={`p-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} hover:scale-110 transition-all`}><Paperclip size={20} /></button>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                    />
                    <button className={`p-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} hover:scale-110 transition-all`}><Mic size={20} /></button>
                    <button onClick={handleSend} className={`px-6 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`}>
                        {editingMessage ? <Check size={20}/> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;