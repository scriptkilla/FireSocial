
import React, { useState, useRef, useEffect } from 'react';
import { Post, Profile, Theme, Comment, UserListItem } from '../types';
import { X, Send } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import CommentComponent from './CommentComponent';

interface CommentModalProps {
    post: Post;
    profile: Profile;
    onClose: () => void;
    onAddComment: (postId: number, commentText: string, replyToUsername?: string) => void;
    onLikeComment: (postId: number, commentId: number) => void;
    onDeleteComment: (postId: number, commentId: number) => void;
    onEditComment: (postId: number, commentId: number, newText: string) => void;
    allUsers: UserListItem[];
    // UI Props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CommentModal: React.FC<CommentModalProps> = (props) => {
    const { post, profile, onClose, onAddComment, onLikeComment, onDeleteComment, onEditComment, currentTheme, cardBg, textColor, textSecondary, borderColor, allUsers } = props;
    const [commentInput, setCommentInput] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [commentMentionQuery, setCommentMentionQuery] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (replyingTo) {
            inputRef.current?.focus();
            if(!commentInput.startsWith(`@${replyingTo} `)) {
              setCommentInput(`@${replyingTo} `);
            }
        }
    }, [replyingTo]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentInput.trim()) {
            let textToSend = commentInput;
            let replyUsername: string | undefined = undefined;
            if (replyingTo && textToSend.startsWith(`@${replyingTo} `)) {
                textToSend = textToSend.substring(`@${replyingTo} `.length);
                replyUsername = `@${replyingTo}`;
            }
            onAddComment(post.id, textToSend, replyUsername);
            setCommentInput('');
            setReplyingTo(null);
        }
    };

    const handleReply = (username: string) => {
        setReplyingTo(username);
    };

    const handleCommentMentionSelect = (username: string) => {
        const input = inputRef.current;
        if (!input) return;

        const cursorPosition = input.selectionStart ?? commentInput.length;
        const text = commentInput;
        const textUpToCursor = text.substring(0, cursorPosition);
        const lastAt = textUpToCursor.lastIndexOf('@');
        
        if (lastAt !== -1) {
            const preMention = text.substring(0, lastAt);
            const postMention = text.substring(cursorPosition);
            
            const newText = `${preMention}${username} ${postMention}`;
            setCommentInput(newText);
            
            setTimeout(() => {
                input.focus();
                const newCursorPosition = (preMention + username).length + 1;
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
        setCommentMentionQuery(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (replyingTo && !value.startsWith(`@${replyingTo} `)) {
            setReplyingTo(null);
        }
        setCommentInput(value);

        const cursorPosition = e.target.selectionStart;
        const textUpToCursor = value.substring(0, cursorPosition);
        const mentionMatch = textUpToCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setCommentMentionQuery(mentionMatch[1]);
        } else {
            setCommentMentionQuery(null);
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div 
                className={`flex flex-col ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl max-h-[80vh]`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">Comments on {post.user}'s post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-4">
                    {post.commentsData && post.commentsData.length > 0 ? (
                        post.commentsData.map(comment => (
                            <CommentComponent 
                                key={comment.id}
                                comment={comment}
                                profile={profile}
                                onLike={() => onLikeComment(post.id, comment.id)}
                                onDelete={() => onDeleteComment(post.id, comment.id)}
                                onEdit={(newText) => onEditComment(post.id, comment.id, newText)}
                                onReply={handleReply}
                                textColor={textColor}
                                textSecondary={textSecondary}
                                currentTheme={currentTheme}
                            />
                        ))
                    ) : (
                        <p className={`${textSecondary} text-center py-8`}>No comments yet. Be the first to comment!</p>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-white/10 flex-shrink-0 relative">
                    {commentMentionQuery !== null && (
                        <div className={`absolute bottom-full mb-2 w-full max-w-sm ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                            <ul className="max-h-48 overflow-y-auto">
                                {allUsers
                                    .filter(user =>
                                        user.username.toLowerCase().includes(`@${commentMentionQuery.toLowerCase()}`) ||
                                        user.name.toLowerCase().includes(commentMentionQuery.toLowerCase())
                                    )
                                    .slice(0, 5)
                                    .map(user => (
                                    <li key={user.id}>
                                        <button onClick={() => handleCommentMentionSelect(user.username)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10">
                                            <AvatarDisplay avatar={user.avatar} size="w-10 h-10" />
                                            <div>
                                                <p className={textColor}>{user.name}</p>
                                                <p className={`text-sm ${textSecondary}`}>{user.username}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {replyingTo && (
                        <div className="text-sm text-gray-400 mb-2 px-2 flex justify-between items-center">
                            <span>Replying to <span className={currentTheme.text}>@{replyingTo}</span></span>
                            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={14}/></button>
                        </div>
                    )}
                    <div className="flex gap-3 items-center">
                        <AvatarDisplay avatar={profile.avatar} size="w-10 h-10" fontSize="text-xl" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={commentInput}
                            onChange={handleInputChange}
                            placeholder="Add a comment..."
                            className={`flex-1 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                        />
                        <button type="submit" className={`p-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50`} disabled={!commentInput.trim()}>
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;