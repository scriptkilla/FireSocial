import React, { useState } from 'react';
import { Comment, Theme, Profile } from '../types';
import { Heart, Edit, Trash2 } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface CommentComponentProps {
    comment: Comment;
    profile: Profile;
    onLike: () => void;
    onDelete: () => void;
    onEdit: (newText: string) => void;
    onReply: (username: string) => void;
    textColor: string;
    textSecondary: string;
    currentTheme: Theme;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment, profile, onLike, onDelete, onEdit, onReply, textColor, textSecondary, currentTheme }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);

    const handleSaveEdit = () => {
        if (editText.trim() && editText.trim() !== comment.text) {
            onEdit(editText.trim());
        }
        setIsEditing(false);
    };

    const isOwnComment = comment.userId === profile.id;

    return (
        <div className="flex items-start gap-3">
            <AvatarDisplay avatar={comment.avatar} size="w-10 h-10" fontSize="text-xl" />
            <div className="flex-1">
                <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <p className={`font-semibold text-sm ${textColor}`}>{comment.username}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {comment.time}
                          {comment.edited && <span className="italic"> (edited)</span>}
                        </p>
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className={`w-full mt-2 p-2 text-sm bg-white/10 rounded-lg focus:ring-1 ${currentTheme.ring} focus:outline-none resize-none`}
                            rows={3}
                            autoFocus
                        />
                    ) : (
                        <p className={`text-sm ${textColor} mt-1 whitespace-pre-wrap`}>
                            {comment.replyTo && <span className={`font-semibold ${currentTheme.text} mr-1`}>{comment.replyTo}</span>}
                            {comment.text}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-1 px-2 text-xs font-semibold">
                    {isEditing ? (
                        <>
                           <button onClick={handleSaveEdit} className={`${currentTheme.text} font-bold`}>Save</button>
                           <button onClick={() => setIsEditing(false)} className={`${textSecondary}`}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button aria-label={comment.isLiked ? 'Unlike' : 'Like'} onClick={onLike} className={`flex items-center gap-1 transition-colors ${comment.isLiked ? currentTheme.text : textSecondary} ${currentTheme.hoverText}`}>
                                <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
                                {comment.likes > 0 && <span>{comment.likes}</span>}
                            </button>
                            <button onClick={() => onReply(comment.username)} className={`${textSecondary} ${currentTheme.hoverText}`}>
                                Reply
                            </button>
                            {isOwnComment && (
                                <>
                                    <button onClick={() => { setIsEditing(true); setEditText(comment.text); }} className={`${textSecondary} ${currentTheme.hoverText}`}>
                                        Edit
                                    </button>
                                    <button onClick={onDelete} className="text-red-500/80 hover:text-red-500">
                                        Delete
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentComponent;