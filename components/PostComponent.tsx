import React, { useState, useRef } from 'react';
import { Post, Profile, Reaction, Theme, Message, UserListItem } from '../types';
import { MoreHorizontal, Edit, Trash2, Bookmark, UserMinus, EyeOff, VolumeX, AlertTriangle, Share2, Link as LinkIcon, UserCheck, Heart, MessageSquare, Send, Eye, Lock } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import PostMedia from './PostMedia';

interface PostComponentProps {
    post: Post;
    profile: Profile;
    currentTheme: Theme;
    // UI props
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    // Data
    reactions: Reaction[];
    messages: Message[];
    allUsers: UserListItem[];
    // Handlers
    onReaction: (postId: number, reactionType: string | null) => void;
    onBookmark: (postId: number) => void;
    onDelete: (postId: number) => void;
    onViewPost: (post: Post) => void;
    onViewComments: (post: Post) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onHide: (postId: number) => void;
    onMute: (username: string) => void;
    onReport: (postId: number) => void;
    onShare: (post: Post) => void;
    onCopyLink: (postId: number) => void;
    onFollowToggle: (userId: number, username: string) => void;
    onBlockToggle: (userId: number, username: string) => void;
    onVotePoll: (postId: number, optionId: number) => void;
    onViewProfile: (username: string) => void;
    onViewHashtag: (tag: string) => void;
    onPurchasePost: (postId: number) => void;
    isFollowing: boolean;
    isBlocked: boolean;
}

const MenuItem: React.FC<{icon: React.ElementType, label: string, onClick: (e: React.MouseEvent) => void, className?: string}> = ({ icon: Icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 ${className}`}>
        <Icon size={16} />
        <span>{label}</span>
    </button>
);

const ParsedContent: React.FC<{content: string, textColor: string, currentTheme: Theme, onViewProfile: (username: string) => void, onViewHashtag: (tag: string) => void}> = ({ content, textColor, currentTheme, onViewProfile, onViewHashtag }) => {
    const parts = content.split(/(\s+)/);
    const hashtagRegex = /^#[\w_]+$/;
    const mentionRegex = /^@[\w_]+$/;

    return (
        <p className={`${textColor} mb-4 whitespace-pre-wrap`}>
            {parts.map((part, index) => {
                if (hashtagRegex.test(part)) {
                    return <button key={index} onClick={() => onViewHashtag(part)} className={`font-semibold ${currentTheme.text} ${currentTheme.hoverText}`}>{part}</button>;
                }
                if (mentionRegex.test(part)) {
                    return <button key={index} onClick={() => onViewProfile(part)} className={`font-semibold ${currentTheme.text} ${currentTheme.hoverText}`}>{part}</button>;
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};


const PostComponent: React.FC<PostComponentProps> = (props) => {
    const { post, profile, currentTheme, cardBg, textColor, textSecondary, borderColor, reactions, messages, onReaction, onBookmark, onDelete, onViewPost, onViewComments, onAddComment, onHide, onMute, onReport, onShare, onCopyLink, onFollowToggle, onBlockToggle, onVotePoll, onViewProfile, onViewHashtag, isFollowing, isBlocked, allUsers, onPurchasePost } = props;
    const [showPostOptions, setShowPostOptions] = useState(false);
    const [inlineComment, setInlineComment] = useState('');
    const [inlineCommentMentionQuery, setInlineCommentMentionQuery] = useState<string | null>(null);
    const inlineCommentInputRef = useRef<HTMLInputElement>(null);

    const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setShowPostOptions(false);
    };

    const handleAddInlineComment = () => {
        if (inlineComment.trim()) {
            onAddComment(post.id, inlineComment.trim());
            setInlineComment('');
        }
    };
    
    const handleInlineCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInlineComment(text);

        const cursorPosition = e.target.selectionStart ?? 0;
        const textUpToCursor = text.substring(0, cursorPosition);
        const mentionMatch = textUpToCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setInlineCommentMentionQuery(mentionMatch[1]);
        } else {
            setInlineCommentMentionQuery(null);
        }
    };

    const handleInlineMentionSelect = (username: string) => {
        const input = inlineCommentInputRef.current;
        if (!input) return;

        const cursorPosition = input.selectionStart ?? inlineComment.length;
        const text = inlineComment;
        const textUpToCursor = text.substring(0, cursorPosition);
        const lastAt = textUpToCursor.lastIndexOf('@');
        
        if (lastAt !== -1) {
            const preMention = text.substring(0, lastAt);
            const postMention = text.substring(cursorPosition);
            
            const newText = `${preMention}${username} ${postMention}`;
            setInlineComment(newText);
            
            setTimeout(() => {
                input.focus();
                const newCursorPosition = (preMention + username).length + 1;
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
        setInlineCommentMentionQuery(null);
    };

    const isOwnPost = post.userId === profile.id;
    const hasPurchased = profile.purchasedPostIds?.includes(post.id);
    const isLocked = post.isPaid && !isOwnPost && !hasPurchased;
    const userReactionData = post.userReaction ? reactions.find(r => r.name === post.userReaction) : null;

    return (
        <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => onViewProfile(post.username)} className="relative hover:scale-105 transition-transform">
                        <AvatarDisplay avatar={post.avatar} size="w-12 h-12" fontSize="text-2xl" />
                        {messages.find(m => m.user === post.user)?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
                    </button>
                    <div>
                        <button onClick={() => onViewProfile(post.username)} className={`font-semibold ${textColor} flex items-center gap-1 hover:underline`}>
                            {post.user}
                            {post.username === profile.username && profile.verified && <span className="text-blue-500 text-lg">✓</span>}
                        </button>
                        <div className={`text-sm ${textSecondary} flex items-center gap-2`}>
                            <span>{post.time}</span>
                            {post.isSponsored && <><span>•</span><span className="font-semibold">Sponsored</span></>}
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowPostOptions(prev => !prev); }} className={`p-2 ${textSecondary} hover:bg-white/10 rounded-full`}>
                        <MoreHorizontal size={20} />
                    </button>
                    {showPostOptions && (
                        <div className={`absolute right-0 mt-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-xl w-52 z-10 overflow-hidden`}>
                            {isOwnPost ? (
                                <>
                                    <MenuItem icon={Edit} label="Edit Post" onClick={(e) => handleMenuClick(e, () => alert('Edit functionality not implemented yet.'))} className="rounded-t-2xl" />
                                    <MenuItem icon={Trash2} label="Delete Post" onClick={(e) => handleMenuClick(e, () => onDelete(post.id))} className="text-red-500" />
                                </>
                            ) : (
                                <>
                                    {!isFollowing && <MenuItem icon={UserCheck} label={`Follow ${post.username}`} onClick={(e) => handleMenuClick(e, () => onFollowToggle(post.userId, post.username))} className="rounded-t-2xl" />}
                                    <MenuItem icon={VolumeX} label={`Mute ${post.username}`} onClick={(e) => handleMenuClick(e, () => onMute(post.username))} />
                                    <MenuItem icon={EyeOff} label="Hide post" onClick={(e) => handleMenuClick(e, () => onHide(post.id))} />
                                </>
                            )}
                            <MenuItem icon={Bookmark} label={post.bookmarked ? 'Unsave' : 'Save'} onClick={(e) => handleMenuClick(e, () => onBookmark(post.id))} />
                            <MenuItem icon={Share2} label="Share to..." onClick={(e) => handleMenuClick(e, () => onShare(post))} />
                            <MenuItem icon={LinkIcon} label="Copy link" onClick={(e) => handleMenuClick(e, () => onCopyLink(post.id))} />
                            {!isOwnPost && (
                                <>
                                    <MenuItem icon={UserMinus} label={isBlocked ? 'Unblock' : 'Block'} onClick={(e) => handleMenuClick(e, () => onBlockToggle(post.userId, post.username))} className="text-red-500" />
                                    <MenuItem icon={AlertTriangle} label="Report post" onClick={(e) => handleMenuClick(e, () => onReport(post.id))} className="text-red-500 rounded-b-2xl" />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {isLocked ? (
                <div className={`text-center p-8 rounded-2xl border-2 border-dashed ${borderColor} ${cardBg} backdrop-blur-sm`}>
                    <Lock size={48} className={`mx-auto ${currentTheme.text} mb-4`} />
                    <h3 className={`font-bold text-xl ${textColor}`}>Unlock this exclusive post</h3>
                    <p className={`mt-2 mb-6 ${textSecondary}`}>
                        This content is available for purchase. Unlock it now to view the full post.
                    </p>
                    <button 
                        onClick={() => onPurchasePost(post.id)}
                        className={`w-full py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`}
                    >
                        Unlock for ${post.paidInfo?.price}
                    </button>
                </div>
            ) : (
                <>
                    {/* Post Body */}
                    <div onClick={() => onViewPost(post)} className="cursor-pointer">
                        {post.media && post.media.length > 0 && <PostMedia media={post.media} postFormat={post.postFormat} currentTheme={currentTheme} />}
                        <ParsedContent content={post.content} textColor={textColor} currentTheme={currentTheme} onViewHashtag={onViewHashtag} onViewProfile={onViewProfile} />
                    </div>
                    
                    {/* Poll */}
                    {post.type === 'poll' && post.pollOptions && (
                    <div className="mb-4 space-y-2">
                        {post.pollOptions.map(option => {
                        const percentage = (post.totalVotes ?? 0) > 0 ? (option.votes / (post.totalVotes ?? 1) * 100).toFixed(0) : 0;
                        const isSelected = post.userVoted === option.id;
                        return (
                            <button key={option.id} onClick={() => post.userVoted === null && onVotePoll(post.id, option.id)} disabled={post.userVoted !== null} className={`w-full p-3 rounded-2xl border ${borderColor} ${isSelected ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white` : `${cardBg} ${textColor}`} hover:bg-white/10 transition-all relative overflow-hidden text-left`}>
                            <div className={`absolute left-0 top-0 h-full ${isSelected ? 'bg-white/20' : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} opacity-20`} transition-all`} style={{ width: `${percentage}%` }} />
                            <div className="relative flex justify-between items-center"><span>{option.text}</span>{post.userVoted !== null && <span>{percentage}%</span>}</div>
                            </button>
                        );
                        })}
                        <p className={`text-sm ${textSecondary} text-center`}>{post.totalVotes} votes</p>
                    </div>
                    )}
                    
                    {/* Post Stats */}
                    <div className={`flex items-center gap-2 mb-4 ${textSecondary} text-sm`}><Eye size={16} /><span>{post.views} views</span></div>
                    
                    {/* Post Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex"> {/* Container for left-side actions */}
                            
                            {/* Like/Reaction Button Group */}
                            <div className="relative group">
                                {/* Picker that appears on hover */}
                                <div className={`absolute bottom-full mb-2 -ml-2 p-1.5 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} shadow-xl flex gap-1 transition-all duration-300 scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto`}>
                                    {reactions.map(reaction => (
                                    <button 
                                        key={reaction.name} 
                                        onClick={() => onReaction(post.id, reaction.name)} 
                                        className="text-3xl p-1 rounded-full hover:bg-white/10 transition-transform hover:scale-125"
                                        title={reaction.name}
                                    >
                                        {reaction.emoji}
                                    </button>
                                    ))}
                                </div>

                                {/* Main Like Button */}
                                <button 
                                    onClick={() => onReaction(post.id, 'like')}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ease-in-out active:scale-95 ${userReactionData ? userReactionData.color : textSecondary} hover:bg-red-500/10`}
                                >
                                    {userReactionData ? (
                                    <span className="text-xl -ml-1 -mr-1">{userReactionData.emoji}</span>
                                    ) : (
                                    <Heart size={20} />
                                    )}
                                    <span className="font-semibold text-sm">{post.likes}</span>
                                </button>
                            </div>

                            {/* Comment Button */}
                            <button 
                                onClick={() => onViewComments(post)} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ease-in-out active:scale-95 ${textSecondary} hover:text-blue-500 hover:bg-blue-500/10`}
                            >
                                <MessageSquare size={20} />
                                <span className="font-semibold text-sm">{post.comments}</span>
                            </button>

                            {/* Share Button */}
                            <button 
                                onClick={() => onShare(post)} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ease-in-out active:scale-95 ${textSecondary} hover:text-green-500 hover:bg-green-500/10`}
                            >
                                <Share2 size={20} />
                                <span className="font-semibold text-sm">{post.shares}</span>
                            </button>
                        </div>

                        {/* Bookmark Button */}
                        <button 
                            onClick={() => onBookmark(post.id)} 
                            className={`p-3 rounded-full transition-all duration-200 ease-in-out active:scale-95 ${post.bookmarked ? 'text-yellow-500' : textSecondary} hover:bg-yellow-500/10`}
                        >
                            <Bookmark size={20} fill={post.bookmarked ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                    
                    {/* Comment Section */}
                    <div className={`mt-4 pt-4 border-t ${borderColor} space-y-3`}>
                        {post.commentsData && post.commentsData.length > 0 && (
                            <div className="space-y-2">
                                {post.commentsData.slice(0, 2).map(comment => (
                                    <div key={comment.id} className="flex items-start gap-2 text-sm px-2">
                                        <button onClick={() => onViewProfile(comment.username)}>
                                            <AvatarDisplay avatar={comment.avatar} size="w-8 h-8" fontSize="text-base" />
                                        </button>
                                        <div className="flex-1">
                                            <p>
                                                <button onClick={() => onViewProfile(comment.username)} className={`font-semibold ${textColor} mr-2 hover:underline`}>{comment.username}</button>
                                                <span className={textColor}>
                                                    {comment.replyTo && <span className={`font-semibold ${currentTheme.text} mr-1`}>{comment.replyTo}</span>}
                                                    {comment.text}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {post.comments > 2 && (
                            <button onClick={() => onViewComments(post)} className={`text-sm ${textSecondary} font-semibold px-2 hover:underline`}>
                                View all {post.comments} comments
                            </button>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <AvatarDisplay avatar={profile.avatar} size="w-8 h-8" fontSize="text-base" />
                            <form onSubmit={(e) => { e.preventDefault(); handleAddInlineComment(); }} className="flex-1 flex gap-2 items-center relative">
                                {inlineCommentMentionQuery !== null && (
                                    <div className={`absolute bottom-full mb-2 w-full max-w-sm ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                                        <ul className="max-h-48 overflow-y-auto">
                                        {allUsers
                                                .filter(user =>
                                                    user.username.toLowerCase().includes(`@${inlineCommentMentionQuery.toLowerCase()}`) ||
                                                    user.name.toLowerCase().includes(inlineCommentMentionQuery.toLowerCase())
                                                )
                                                .slice(0, 5)
                                                .map(user => (
                                                <li key={user.id}>
                                                    <button onClick={() => handleInlineMentionSelect(user.username)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10">
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
                                <input 
                                    ref={inlineCommentInputRef}
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={inlineComment}
                                    onChange={handleInlineCommentChange}
                                    className={`flex-1 px-4 py-2 text-sm bg-black/5 dark:bg-white/5 rounded-full border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-1 ${currentTheme.ring}`}
                                />
                                <button type="submit" className={`${textSecondary} hover:${currentTheme.text} p-2 rounded-full disabled:opacity-50`} disabled={!inlineComment.trim()}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PostComponent;