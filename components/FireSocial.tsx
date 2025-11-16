

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Home, MessageCircle, Bell, User, Settings, Moon, Sun, Image, X, Search, UserPlus, TrendingUp, Bookmark, BarChart3, Award, Video, Radio, Zap, Send, LogOut, Plus, Eye, Compass, ChevronLeft, CornerDownLeft, Users, FileText, History, Edit2, PlusCircle, Trash2, ArrowLeft, Gamepad2, Bot } from 'lucide-react';
import { THEMES, REACTIONS, ALL_ACHIEVEMENTS } from '../constants';
import { Notification, Message, GroupChat, Post, Story, Profile, FriendSuggestion, TrendingHashtag, LiveUser, ThemeColor, UserListItem, Theme, Comment, Achievement, ChatMessage, ActiveCall, MediaItem, StoryItem } from '../types';
import { ALL_USERS_DATA, LOGGED_IN_USER_USERNAME, INITIAL_POSTS, INITIAL_NOTIFICATIONS, INITIAL_MESSAGES, INITIAL_CHAT_HISTORY, INITIAL_GROUP_CHATS, INITIAL_STORIES, INITIAL_FRIEND_SUGGESTIONS, INITIAL_TRENDING_HASHTAGS, INITIAL_LIVE_USERS, INITIAL_FOLLOWERS, INITIAL_FOLLOWING } from '../data';
import { SettingsModal } from './SettingsModal';
import PostComponent from './PostComponent';
import ProfilePage from './ProfilePage';
import EditProfileModal from './EditProfileModal';
import FollowListModal from './FollowListModal';
import AvatarDisplay from './AvatarDisplay';
import CommentModal from './CommentModal';
import ExplorePage from './ExplorePage';
import MessagesPage from './MessagesPage';
import CallModal from './CallModal';
import StoryViewerModal from './StoryViewerModal';
import AchievementsPage from './AchievementsPage';
import TrophyPage from './TrophyPage';
import StreakPage from './StreakPage';
import AnalyticsModal from './AnalyticsModal';
import CreateStoryModal from './CreateStoryModal';
import SuggestionsModal from './SuggestionsModal';
import NotificationsModal from './NotificationsModal';
import AICreatorModal from './AICreatorModal';
import GameCreatorModal from './GameCreatorModal';
import AIChatbotModal from './AIChatbotModal';
import LoginPage from './LoginPage';

// --- Page Components (Moved outside FireSocial component) ---
const FeedPage: React.FC<any> = ({ profile, posts, stories, liveUsers, following, friendSuggestions, trendingHashtags, messages, ...props }) => {
    const { cardBg, textColor, textSecondary, borderColor, currentTheme } = props.ui;
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('all');
    const [activeFeedTab, setActiveFeedTab] = useState('discover');

    const baseFilteredPosts = useMemo(() => posts.filter((post: Post) => {
      if (props.hiddenPostIds.includes(post.id)) return false;
      if (profile.blockedAccounts.some((bu: UserListItem) => bu.id === post.userId)) return false;
      if(profile.mutedAccounts.some((mutedUser: UserListItem) => mutedUser.name === post.user)) return false;
      if(profile.contentPreferences.hiddenWords.some((word: string) => post.content.toLowerCase().includes(word.toLowerCase()))) return false;
      return true;
  }), [posts, props.hiddenPostIds, profile]);

  const feedPosts = useMemo(() => {
    let initialPosts: Post[];
    const followingIds = new Set(following.map((f: UserListItem) => f.id));

    switch (activeFeedTab) {
        case 'following':
            initialPosts = baseFilteredPosts.filter((p:Post) => followingIds.has(p.userId));
            break;
        case 'trending':
            initialPosts = [...baseFilteredPosts].sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
            break;
        case 'discover':
        default:
            initialPosts = baseFilteredPosts.filter((p:Post) => !followingIds.has(p.userId) && p.userId !== profile.id);
            break;
    }

    let sortedAndFilteredPosts = initialPosts.filter((post:Post) => {
      if (filterBy === 'bookmarked') return post.bookmarked;
      if (filterBy === 'liked') return post.userReaction !== null;
      return true;
    });

    if (activeFeedTab !== 'trending') {
        sortedAndFilteredPosts = sortedAndFilteredPosts.sort((a, b) => {
            if (sortBy === 'popular') return b.likes - a.likes; 
            if (sortBy === 'views') return b.views - a.views; 
            return b.id - a.id; // recent
        });
    }
    
    return sortedAndFilteredPosts;
  }, [activeFeedTab, baseFilteredPosts, following, profile.id, filterBy, sortBy]);

  const newPostMentionFilteredUsers = props.allUsers
    .filter((user: UserListItem) =>
        props.newPostMentionQuery && (user.username.toLowerCase().includes(`@${props.newPostMentionQuery.toLowerCase()}`) ||
        user.name.toLowerCase().includes(props.newPostMentionQuery.toLowerCase()))
    ).slice(0, 5);
  
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} shadow-lg`}>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">{stories.map((story: Story) => (<div key={story.id} className="flex-shrink-0 text-center"><button onClick={() => props.handleStoryClick(story)} aria-label={story.isYours && story.media.length === 0 ? 'Create a new story' : `View ${story.user}'s story`} className={`relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all ${story.media.length > 0 ? `p-1 bg-gradient-to-r ${story.isLive ? 'from-pink-500 via-red-500 to-yellow-500' : `${currentTheme.from} ${currentTheme.to}`}` : `${cardBg} border-2 border-dashed ${borderColor}`} ${story.isLive ? 'animate-pulse-bright' : ''}`}><div className={`w-full h-full rounded-full flex items-center justify-center ${story.media.length > 0 ? (props.darkMode ? 'bg-gray-900' : 'bg-white') : ''}`}>{story.isYours && story.media.length === 0 ? <Plus size={24} className={textColor} /> : <AvatarDisplay avatar={story.avatar} size="w-full h-full" fontSize="text-4xl"/>}</div>{story.isLive && (<span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-md border-2 ${props.darkMode ? 'border-gray-900' : 'border-white'}`}>LIVE</span>)}</button><p className={`text-xs ${textColor} mt-1 truncate w-20`}>{story.user}</p></div>))}</div>
                </div>
                {liveUsers.length > 0 && (<div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} shadow-lg`}><h3 className={`font-semibold ${textColor} mb-3 flex items-center gap-2`}><Radio size={20} className="text-red-500" /> Live Now</h3><div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2">{liveUsers.map((user: LiveUser) => (<button key={user.id} onClick={() => props.handleViewProfile(user.username)} className={`${cardBg} backdrop-blur-xl rounded-2xl p-3 border ${borderColor} flex-shrink-0 hover:scale-105 transition-all cursor-pointer text-left`}><AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" className="mb-2" /><p className={`${textColor} font-semibold text-sm`}>{user.name}</p><p className={`${textSecondary} text-xs flex items-center gap-1`}><Eye size={12} /> {user.viewers}</p></button>))}</div></div>)}
                <div className="flex gap-2 items-center">
                    <select aria-label="Sort posts" value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={activeFeedTab === 'trending'} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}><option value="recent">Recent</option><option value="popular">Popular</option><option value="views">Most Viewed</option></select>
                    <select aria-label="Filter posts" value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none`}><option value="all">All Posts</option><option value="bookmarked">Bookmarked</option><option value="liked">Liked</option></select>
                </div>
                
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                    <div className="flex gap-4">
                        <AvatarDisplay avatar={profile.avatar} size="w-16 h-16" fontSize="text-4xl" />
                        <div className="flex-1">
                            <div className="relative">
                                {props.newPostMentionQuery !== null && newPostMentionFilteredUsers.length > 0 && (
                                    <div className={`absolute bottom-full mb-2 w-full max-w-sm ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                                        <ul className="max-h-48 overflow-y-auto">
                                            {newPostMentionFilteredUsers.map((user: UserListItem) => (
                                                <li key={user.id}>
                                                    <button onClick={() => props.handleNewPostMentionSelect(user.username)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10">
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
                                <input type="file" ref={props.fileInputRef} onChange={props.handleFileSelect} multiple accept="image/*,video/*" className="hidden" />
                                <textarea ref={props.newPostTextareaRef} value={props.newPost} onChange={props.handleNewPostChange} placeholder={props.showCreatePoll ? "Ask a question..." : "What's on your mind? Mention someone with '@'"} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none`} rows={props.showCreatePoll ? 2 : 3} />
                            </div>
                            
                            {props.newPostMedia.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {props.newPostMedia.map((media: MediaItem, index: number) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            {media.type === 'image' ? <img src={media.url} alt="preview" className="w-full h-full object-cover" /> : <video src={media.url} className="w-full h-full object-cover" />}
                                            <button aria-label="Remove media" onClick={() => props.handleRemoveMedia(index)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {props.showCreatePoll ? (
                                <div className="mt-4 space-y-2">
                                    {props.pollOptions.map((option: string, index: number) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={option} onChange={(e) => props.handlePollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className={`flex-1 px-4 py-2 ${cardBg} backdrop-blur-xl rounded-xl border ${borderColor} ${textColor} focus:outline-none`} />
                                            {props.pollOptions.length > 2 && <button aria-label="Remove poll option" onClick={() => props.handleRemovePollOption(index)} className="p-2 text-red-500 hover:bg-white/10 rounded-full"><Trash2 size={16} /></button>}
                                        </div>
                                    ))}
                                    {props.pollOptions.length < 5 && <button onClick={props.handleAddPollOption} className={`w-full py-2 mt-2 flex items-center justify-center gap-2 ${cardBg} backdrop-blur-xl rounded-xl border-dashed ${borderColor} ${textSecondary} hover:bg-white/10`}><PlusCircle size={16} /> Add Option</button>}
                                    <div className="flex gap-2 mt-4">
                                        <button className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all`} onClick={props.handleCreatePoll} disabled={props.newPost.trim().length === 0 || props.pollOptions.filter((o:string) => o.trim()).length < 2}>Post Poll</button>
                                        <button className={`py-3 px-4 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:bg-white/10`} onClick={() => props.setShowCreatePoll(false)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 mt-4">
                                    <button className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`} onClick={props.handleCreatePost} disabled={!props.newPost.trim() && props.newPostMedia.length === 0}>Post</button>
                                    <button aria-label="Add image" onClick={() => props.fileInputRef.current?.click()} className={`p-3 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:scale-105 transition-all duration-300`}><Image size={20} /></button>
                                    <button aria-label="Add video" onClick={() => props.fileInputRef.current?.click()} className={`p-3 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:scale-105 transition-all duration-300`}><Video size={20} /></button>
                                    <button aria-label="Create a poll" onClick={() => { props.setShowCreatePoll(true); props.setNewPostMedia([]); }} className={`p-3 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:scale-105 transition-all duration-300`}><BarChart3 size={20} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`flex items-center justify-center p-1 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-inner`}>
                    <button onClick={() => setActiveFeedTab('discover')} className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${activeFeedTab === 'discover' ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-md` : `${textColor} hover:bg-white/10`}`}>Discover</button>
                    <button onClick={() => setActiveFeedTab('following')} className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${activeFeedTab === 'following' ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-md` : `${textColor} hover:bg-white/10`}`}>Following</button>
                    <button onClick={() => setActiveFeedTab('trending')} className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${activeFeedTab === 'trending' ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-md` : `${textColor} hover:bg-white/10`}`}>Trending</button>
                </div>

                {feedPosts.map((post: Post) => (<PostComponent key={post.id} post={post} profile={profile} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} reactions={REACTIONS} messages={messages} onReaction={props.handleReaction} onBookmark={props.handleBookmark} onDelete={props.handleDeletePost} onViewPost={props.setViewingPost} onViewComments={props.setViewingCommentsForPost} onHide={props.handleHidePost} onMute={props.handleMuteUser} onReport={props.handleReportPost} onShare={props.handleSharePost} onCopyLink={props.handleCopyLink} onFollowToggle={props.handleFollowToggle} onVotePoll={props.handleVotePoll} onViewProfile={props.handleViewProfile} onViewHashtag={props.handleViewHashtag} isFollowing={following.some((u: UserListItem) => u.id === post.userId)} onBlockToggle={props.handleBlockToggle} isBlocked={profile.blockedAccounts.some((u:UserListItem) => u.id === post.userId)} onAddComment={props.handleAddComment} allUsers={props.allUsers} />))}
            </div>
            <aside className="space-y-6 hidden lg:block">
              <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}><h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}><TrendingUp size={20} />Trending</h3>{trendingHashtags.map((tag: TrendingHashtag, i: number) => (<div key={i} className={`p-3 rounded-2xl hover:bg-white/10 cursor-pointer mb-2`}><p className={`${textColor} font-semibold`}>{tag.tag}</p><p className={`${textSecondary} text-sm`}>{tag.posts.toLocaleString()} posts</p></div>))}</div>
              <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className={`font-semibold ${textColor} flex items-center gap-2`}><UserPlus size={20} />Suggestions</h3>
                      <button onClick={() => props.setShowSuggestionsModal(true)} className={`text-sm font-semibold ${currentTheme.text}`}>See All</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
                      {friendSuggestions.slice(0, 5).map((user: FriendSuggestion) => {
                          const userProfile = ALL_USERS_DATA.find(p => p.id === user.id);
                          return (
                              <div key={user.id} className={`relative flex-shrink-0 w-40 h-56 rounded-2xl border ${borderColor} overflow-hidden shadow-md group transition-all duration-300 hover:scale-105`}>
                                  <img src={userProfile?.coverPhoto || `https://source.unsplash.com/random/200x300?sig=${user.id}`} alt={user.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                  <button aria-label="Dismiss suggestion" onClick={() => props.handleDismissSuggestion(user.id)} className="absolute top-2 right-2 p-1 bg-black/30 text-white/70 rounded-full opacity-0 group-hover:opacity-100 hover:text-white transition-opacity z-10"><X size={14} /></button>
                                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center">
                                      <button onClick={() => props.handleViewProfile(user.username)}><AvatarDisplay avatar={user.avatar} size="w-16 h-16" fontSize="text-3xl" className="mx-auto border-2 border-white/50 mb-2" /></button>
                                      <p className="font-bold text-sm truncate">{user.name}</p>
                                      <p className="text-xs text-white/80">{user.mutualFriends} mutual</p>
                                      <button onClick={() => props.handleFollowToggle(user.id, user.username)} className={`w-full mt-2 py-1.5 rounded-lg text-sm font-semibold transition-colors ${user.followed ? 'bg-white/20' : 'bg-white text-black'}`}>{user.followed ? 'Following' : 'Follow'}</button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
              <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}><div className="flex items-center justify-between mb-3"><h3 className={`font-semibold ${textColor} flex items-center gap-2`}><Zap size={20} className="text-yellow-500" />Your Streak</h3><p className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>{profile.streak} 🔥</p></div><p className={textSecondary}>Keep posting daily to maintain your streak!</p></div>
              <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <h3 className={`font-semibold ${textColor} mb-4`}>Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => props.setShowAnalytics(true)} className={`w-full p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all flex items-center gap-2`}><BarChart3 size={18} />View Analytics</button>
                  <Link to="/achievements" className={`w-full p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all flex items-center gap-2`}><Award size={18} />View Badges</Link>
                  <button onClick={() => props.handleBookmarkLinkClick()} className={`w-full p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all flex items-center gap-2`}><Bookmark size={18} />Saved Posts</button>
                </div>
              </div>
            </aside>
        </div>
    );
};

const ProfileWrapper: React.FC<any> = (props) => {
    const { username } = useParams();
    const profileToDisplay = username ? ALL_USERS_DATA.find(p => p.username === `@${username}`) : props.profile;

    if (!profileToDisplay) {
        return <div className="text-center p-8">User not found.</div>;
    }
    
    return <ProfilePage 
        {...props} 
        profileToDisplay={profileToDisplay} 
        isOwnProfile={!username || profileToDisplay.id === props.profile.id}
        isFollowing={props.following.some((f:UserListItem) => f.username === profileToDisplay.username)}
        isBlocked={props.profile.blockedAccounts.some((b:UserListItem) => b.id === profileToDisplay.id)}
        onBack={() => props.navigate('/profile')}
    />;
};

const AchievementsWrapper: React.FC<any> = (props) => <AchievementsPage {...props} onBack={() => props.navigate('/profile')} />;
const TrophyWrapper: React.FC<any> = (props) => <TrophyPage {...props} onBack={() => props.navigate('/profile')} />;
const StreakWrapper: React.FC<any> = (props) => <StreakPage {...props} onBack={() => props.navigate('/profile')} />;

const HashtagPage: React.FC<any> = (props) => {
    const { tag } = useParams();
    const { ui, posts, profile } = props;
    const hashtag = `#${tag}`;
    const hashtagPosts = posts.filter((p:Post) => p.content.toLowerCase().includes(hashtag.toLowerCase())).sort((a:Post, b:Post) => b.id - a.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Link to="/" aria-label="Back to feed" className={`p-2 ${ui.cardBg} backdrop-blur-xl rounded-full border ${ui.borderColor} ${ui.textColor} hover:scale-105`}><ChevronLeft size={20} /></Link>
                <h2 className={`text-2xl font-bold ${ui.textColor}`}>Posts for <span className={ui.currentTheme.text}>{hashtag}</span></h2>
            </div>
            {hashtagPosts.map((post: Post) => (<PostComponent key={post.id} {...props} {...ui} post={post} isFollowing={props.following.some((u:UserListItem) => u.id === post.userId)} isBlocked={profile.blockedAccounts.some((u:UserListItem) => u.id === post.userId)} />))}
        </div>
    );
};

const SearchPage: React.FC<any> = (props) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const { ui, allUsers, posts, hiddenPostIds, profile, following } = props;
    
    const searchResults = useMemo(() => {
        if (!query) return null;
        const lowerCaseQuery = query.toLowerCase();
        
        const searchablePosts = posts.filter((post:Post) => 
            !hiddenPostIds.includes(post.id) &&
            !profile.blockedAccounts.some((bu:UserListItem) => bu.id === post.userId) &&
            !profile.mutedAccounts.some((mutedUser:UserListItem) => mutedUser.name === post.user)
        );
    
        const foundUsers = allUsers.filter((user:UserListItem) =>
            !profile.blockedAccounts.some((bu:UserListItem) => bu.id === user.id) &&
            (user.name.toLowerCase().includes(lowerCaseQuery) || user.username.toLowerCase().includes(lowerCaseQuery))
        );
    
        const foundPosts = searchablePosts.filter((post:Post) =>
            post.content.toLowerCase().includes(lowerCaseQuery) ||
            post.user.toLowerCase().includes(lowerCaseQuery) ||
            post.username.toLowerCase().includes(lowerCaseQuery)
        );
        return { users: foundUsers, posts: foundPosts };
    }, [query, posts, allUsers, profile, hiddenPostIds]);

    if (!searchResults) {
        return <div className="text-center p-8">Perform a search to see results.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Link to="/" aria-label="Back to feed" className={`p-2 ${ui.cardBg} backdrop-blur-xl rounded-full border ${ui.borderColor} ${ui.textColor} hover:scale-105`}><ChevronLeft size={20} /></Link>
                <h2 className={`text-2xl font-bold ${ui.textColor}`}>Results for <span className={ui.currentTheme.text}>"{query}"</span></h2>
            </div>
            {searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                <div className={`${ui.cardBg} backdrop-blur-xl rounded-3xl p-8 border ${ui.borderColor} shadow-lg text-center`}>
                    <p className={`${ui.textColor} font-semibold text-lg`}>No results found</p>
                    <p className={ui.textSecondary}>Try searching for something else.</p>
                </div>
            ) : (
                <>
                   {searchResults.users.length > 0 && (
                        <div className={`${ui.cardBg} backdrop-blur-xl rounded-3xl p-6 border ${ui.borderColor} shadow-lg`}>
                            <h3 className={`font-semibold ${ui.textColor} mb-4 flex items-center gap-2`}><Users size={20} />Users</h3>
                            <div className="space-y-3">
                                {searchResults.users.map((user: UserListItem) => (
                                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10">
                                        <button onClick={() => props.handleViewProfile(user.username)} className="flex items-center gap-3 text-left"><AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" /><div><p className={`${ui.textColor} font-semibold`}>{user.name}</p><p className={`${ui.textSecondary} text-sm`}>{user.username}</p></div></button>
                                        <button onClick={() => props.handleFollowToggle(user.id, user.username)} className={`px-4 py-2 ${following.some((f:UserListItem) => f.id === user.id) ? `${ui.cardBg} ${ui.textColor}` : `bg-gradient-to-r ${ui.currentTheme.from} ${ui.currentTheme.to} text-white`} rounded-2xl text-sm font-semibold hover:scale-105 transition-all w-28 text-center`}>{following.some((f:UserListItem) => f.id === user.id) ? 'Following' : 'Follow'}</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {searchResults.posts.length > 0 && (
                         <div className="space-y-6">
                            <h3 className={`font-semibold ${ui.textColor} flex items-center gap-2 text-lg`}><FileText size={20} />Posts</h3>
                            {searchResults.posts.map((post:Post) => (
                                <PostComponent key={post.id} {...props} {...ui} post={post} isFollowing={following.some((u:UserListItem) => u.id === post.userId)} isBlocked={profile.blockedAccounts.some((u:UserListItem) => u.id === post.userId)}/>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const AppLayout: React.FC<any> = ({ profile, ...props }) => {
    const { darkMode, currentTheme, unreadNotifications, unreadMessages } = props;
    const { cardBg, textColor, textSecondary, borderColor, bgClass } = props.ui;
    const location = useLocation();
    const params = useParams();

    const getHeaderTitle = () => {
        const { pathname } = location;
        if (pathname === '/') return 'Feed';
        if (pathname === '/explore') return 'Explore';
        if (pathname === '/messages') return 'Messages';
        if (pathname.startsWith('/profile')) {
            const username = params.username;
            if (username) {
                const user = props.allUsers.find((u: UserListItem) => u.username === `@${username}`);
                return user ? user.name : 'Profile';
            }
            return profile.name;
        }
        if (pathname.startsWith('/hashtag/')) return `#${params.tag}`;
        if (pathname.startsWith('/search')) return 'Search Results';
        const pageName = pathname.substring(1);
        return pageName.charAt(0).toUpperCase() + pageName.slice(1);
    }
    
    const desktopNavItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/explore', icon: Compass, label: 'Explore' },
        { path: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadMessages },
        { path: '/profile', icon: User, label: 'Profile' },
    ];
    
    const actionNavItems = [
        { key: 'ai-creator', icon: Zap, label: 'AI Creator', onClick: () => props.setShowAICreator(true) },
        { key: 'ai-chatbot', icon: Bot, label: 'AI Chat', onClick: () => props.setShowAIChatbot(true) },
        { key: 'game-creator', icon: Gamepad2, label: 'Game Creator', onClick: () => props.setShowGameCreator(true) },
        { key: 'notifications', icon: Bell, label: 'Notifications', badge: unreadNotifications, onClick: () => props.setShowNotifications(true) },
    ];

    const mobileNavItems = [
      { path: '/', icon: Home, label: 'Home' },
      { path: '/explore', icon: Compass, label: 'Explore' },
      { key: 'create', icon: PlusCircle, label: 'Create', onClick: () => props.setShowAICreator(true) },
      { path: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadMessages },
      { path: '/profile', icon: User, label: 'Profile' }
    ];

    const { pathname } = location;
    const isLinkActive = (path: string) => {
        if (path === '/') return pathname === '/';
        if (path === '/profile') return pathname.startsWith('/profile');
        return pathname.startsWith(path);
    };

    return (
        <div className={`min-h-screen ${bgClass} transition-all duration-500 font-sans`}>
            {/* ... Toast and other global elements ... */}
            <aside className={`hidden md:flex flex-col fixed inset-y-0 w-64 ${cardBg} backdrop-blur-xl border-r ${borderColor} p-4 z-50`}>
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent mb-8`}>FireSocial</h1>
                <div className="space-y-2 flex-grow">
                    {desktopNavItems.map(item => (
                        <Link key={item.path} to={item.path} className={`relative flex items-center justify-start gap-4 p-3 rounded-2xl transition-all w-full text-left ${isLinkActive(item.path) ? `${currentTheme.text} bg-white/10 font-bold` : `${textSecondary} hover:bg-white/10`} hover:scale-105`}>
                            <item.icon size={24} /><span>{item.label}</span>
                            {item.badge && item.badge > 0 && (<div className={`absolute top-2 right-2 w-5 h-5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white text-xs rounded-full flex items-center justify-center`}>{item.badge}</div>)}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-700/50">
                        {actionNavItems.map(item => (
                            <button key={item.key} onClick={item.onClick} className={`relative flex items-center justify-start gap-4 p-3 rounded-2xl transition-all w-full text-left ${textSecondary} hover:bg-white/10 hover:scale-105`}>
                                <item.icon size={24} /><span>{item.label}</span>
                                {item.badge && item.badge > 0 && (<div className={`absolute top-2 right-2 w-5 h-5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white text-xs rounded-full flex items-center justify-center`}>{item.badge}</div>)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={`p-4 rounded-2xl ${cardBg} border ${borderColor} mt-4`}>
                    <div className="flex items-center gap-3">
                        <AvatarDisplay avatar={profile.avatar} size="w-12 h-12" fontSize="text-2xl" />
                        <div className="flex-1 overflow-hidden"><p className={`font-semibold ${textColor} truncate`}>{profile.name}</p><p className={`${textSecondary} text-sm truncate`}>{profile.username}</p></div>
                        <button aria-label="Log out" className={`${textSecondary} hover:${currentTheme.text}`}><LogOut size={20} /></button>
                    </div>
                </div>
            </aside>
            <div className="md:pl-64">
                <header className={`${cardBg} backdrop-blur-xl border-b ${borderColor} sticky top-0 z-40`}>
                    <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="text-2xl font-bold">{getHeaderTitle()}</div>
                        <div className="flex items-center gap-2">
                            <div ref={props.searchContainerRef} className="relative">
                                <form onSubmit={(e) => props.handleSearchSubmit(e)} className={`relative ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} flex items-center justify-between pl-4 pr-1 py-1`}>
                                    <input type="text" placeholder="Search..." value={props.searchQuery} onChange={(e) => props.setSearchQuery(e.target.value)} onFocus={() => props.setShowSearchHistory(true)} className={`bg-transparent ${textColor} placeholder-gray-400 focus:outline-none w-24 md:w-40`} />
                                    <button type="submit" aria-label="Submit search" className={`p-1.5 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white hover:scale-105 transition-transform flex-shrink-0`}><CornerDownLeft size={18} /></button>
                                </form>
                                {props.showSearchHistory && profile.searchHistory && profile.searchHistory.length > 0 && (
                                    <div className={`absolute top-full mt-2 w-full min-w-[250px] ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                                        <div className={`flex justify-between items-center p-3 border-b ${borderColor}`}><h4 className="font-semibold text-sm">Recent Searches</h4><button onClick={props.handleClearSearchHistory} className={`text-xs font-semibold ${currentTheme.text}`}>Clear all</button></div>
                                        <ul className="max-h-60 overflow-y-auto">
                                            {(profile.searchHistory || []).map((item:string, index:number) => (<li key={index} className="flex items-center justify-between px-3 py-2 hover:bg-white/10 group"><button onClick={() => props.handleSearchFromHistory(item)} className="flex items-center gap-3 text-left flex-1 truncate"><History size={16} className={textSecondary} /><span className="truncate">{item}</span></button><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => props.handleEditSearchHistoryItem(item)} title="Edit" className={`p-1 rounded-full ${textSecondary} hover:${currentTheme.text}`}><Edit2 size={14} /></button><button onClick={() => props.handleRemoveSearchHistoryItem(item)} title="Remove" className={`p-1 rounded-full ${textSecondary} hover:text-red-500`}><X size={14} /></button></div></li>))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <button aria-label="Toggle dark mode" onClick={() => props.setDarkMode(!props.darkMode)} className={`p-2.5 ${cardBg} backdrop-blur-xl ${textColor} rounded-full hover:scale-110 transition-all duration-300 border ${borderColor}`}>{props.darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                            <button aria-label="Open settings" onClick={() => props.setShowSettings(true)} className={`p-2.5 ${cardBg} backdrop-blur-xl ${textColor} rounded-full hover:scale-110 transition-all duration-300 border ${borderColor}`}><Settings size={20} /></button>
                        </div>
                    </div>
                </header>
                <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
                    <Outlet />
                </main>
            </div>
             <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${cardBg} backdrop-blur-xl border-t ${borderColor} flex justify-around items-center z-50`}>
                {mobileNavItems.map(item => {
                    const isActive = item.path ? isLinkActive(item.path) : false;
                    const content = item.key === 'create' ? (
                        <button aria-label="Create" onClick={item.onClick} className="flex-1 flex flex-col items-center justify-center p-2 h-16 relative">
                            <div className={`-mt-6 p-3 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg`}><item.icon size={28} /></div>
                            <span className={`text-xs mt-1 ${textSecondary}`}>{item.label}</span>
                        </button>
                    ) : (
                        <Link to={item.path!} className="flex-1 flex flex-col items-center justify-center p-2 h-16 relative">
                            <div className={`p-2 rounded-xl transition-colors ${isActive ? `${currentTheme.text} bg-white/10` : textSecondary}`}><item.icon size={24} /></div>
                            <span className={`text-xs mt-1 ${isActive ? currentTheme.text : textSecondary}`}>{item.label}</span>
                            {item.badge && item.badge > 0 && (<div className={`absolute top-1 right-1/2 translate-x-4 w-4 h-4 text-xs flex items-center justify-center bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full`}>{item.badge}</div>)}
                        </Link>
                    );
                    return <React.Fragment key={item.key || item.path}>{content}</React.Fragment>;
                })}
            </nav>
        </div>
    );
};


const FireSocial: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>('orange');
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  
  const [groupChats, setGroupChats] = useState<GroupChat[]>(INITIAL_GROUP_CHATS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<MediaItem[]>([]);
  const [newPostMentionQuery, setNewPostMentionQuery] = useState<string | null>(null);
  const newPostTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [viewingStoriesForUser, setViewingStoriesForUser] = useState<Story | null>(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [trendingHashtags] = useState<TrendingHashtag[]>(INITIAL_TRENDING_HASHTAGS);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);

  // Messaging State
  const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Modal/Page State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowList, setShowFollowList] = useState<'followers' | 'following' | null>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('posts');
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [viewingCommentsForPost, setViewingCommentsForPost] = useState<Post | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [showGameCreator, setShowGameCreator] = useState(false);
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const [followers, setFollowers] = useState<UserListItem[]>(INITIAL_FOLLOWERS);
  const [following, setFollowing] = useState<UserListItem[]>(INITIAL_FOLLOWING);

  useEffect(() => {
    // Safely load profile on component mount
    const userProfile = ALL_USERS_DATA.find(p => p.username === LOGGED_IN_USER_USERNAME);
    if (userProfile) {
        setProfile(userProfile);
    }

    // Simulate login after 3 seconds for development
    const timer = setTimeout(() => {
      setIsLoggedIn(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile) {
      setNotifications(INITIAL_NOTIFICATIONS.filter(n => !profile.blockedAccounts.some(b => b.username === n.username)));
      setMessages(INITIAL_MESSAGES.filter(m => !profile.blockedAccounts.some(b => b.username === m.username)));
      setStories(INITIAL_STORIES.filter(s => !profile.blockedAccounts.some(b => b.username === s.username)));
      setFriendSuggestions(INITIAL_FRIEND_SUGGESTIONS.filter(fs => !profile.blockedAccounts.some(b => b.id === fs.id)));
      setLiveUsers(INITIAL_LIVE_USERS.filter(l => !profile.blockedAccounts.some(b => b.username === l.username)));
    }
  }, [profile]);

  const allUsers: UserListItem[] = ALL_USERS_DATA.map(p => ({ id: p.id, name: p.name, username: p.username, avatar: p.avatar, followedByYou: following.some(f => f.id === p.id) }));

  const currentTheme = THEMES[themeColor];
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [searchContainerRef]);

    const showAchievementToast = (achievement: Achievement) => { setAchievementToast(achievement); setTimeout(() => { setAchievementToast(null); }, 5000); };
    const checkAndUnlockAchievements = (userProfile: Profile, userPosts: Post[]) => { let newlyUnlocked: string[] = []; ALL_ACHIEVEMENTS.forEach(achievement => { if (!userProfile.unlockedAchievements.includes(achievement.id)) { let isUnlocked = false; switch (achievement.id) { case 'first_post': if (userPosts.length >= 1) isUnlocked = true; break; case '10_posts': if (userPosts.length >= 10) isUnlocked = true; break; case '100_followers': if (userProfile.followers >= 100) isUnlocked = true; break; case '50_following': if (userProfile.following >= 50) isUnlocked = true; break; case '10_day_streak': if (userProfile.streak >= 10) isUnlocked = true; break; case 'popular_post': if (userPosts.some(p => p.likes >= 100)) isUnlocked = true; break; } if (isUnlocked) { newlyUnlocked.push(achievement.id); if (userProfile.id === profile?.id) { showAchievementToast(achievement); } } } }); if (newlyUnlocked.length > 0) { return { ...userProfile, unlockedAchievements: [...userProfile.unlockedAchievements, ...newlyUnlocked] }; } return userProfile; };

    useEffect(() => {
      if (profile) {
        const userPosts = posts.filter(p => p.username === profile.username);
        const updatedProfile = checkAndUnlockAchievements(profile, userPosts);
        if (updatedProfile.unlockedAchievements.length > profile.unlockedAchievements.length) {
          setProfile(updatedProfile);
        }
      }
    }, [posts, profile]);

    const handleReaction = (postId: number, reactionType: string) => { let updatedPosts: Post[] = []; const updatePostReaction = (p: Post) => { if (p.id === postId) { const newReactions = { ...p.reactions }; let likesAdjustment = 0; if (p.userReaction) { newReactions[p.userReaction]--; likesAdjustment = -1; } if (p.userReaction === reactionType) { return { ...p, userReaction: null, reactions: newReactions, likes: p.likes + likesAdjustment }; } else { newReactions[reactionType] = (newReactions[reactionType] || 0) + 1; return { ...p, userReaction: reactionType, reactions: newReactions, likes: p.likes + likesAdjustment + 1 }; } } return p; }; updatedPosts = posts.map(updatePostReaction); setPosts(updatedPosts); if (viewingPost?.id === postId) { setViewingPost(updatePostReaction(viewingPost)); } };
    const handleBookmark = (postId: number) => { const updatePostBookmark = (p: Post) => p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p; setPosts(posts.map(updatePostBookmark)); if (viewingPost?.id === postId) { setViewingPost(updatePostBookmark(viewingPost)); } };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files || []); files.forEach((file: File) => { const reader = new FileReader(); reader.onload = (event: ProgressEvent<FileReader>) => { if (event.target && typeof event.target.result === 'string') { const url = event.target.result; const type = file.type.startsWith('image') ? 'image' : 'video'; setNewPostMedia(prev => [...prev, { type, url }]); } }; reader.readAsDataURL(file); }); if (e.target) e.target.value = ''; };
    const handleRemoveMedia = (index: number) => { setNewPostMedia(prev => prev.filter((_, i) => i !== index)); };
    const handleCreatePost = () => { if (profile && (newPost.trim() || newPostMedia.length > 0)) { const post: Post = { id: Date.now(), userId: profile.id, user: profile.name, username: profile.username, avatar: profile.avatar, content: newPost, likes: 0, comments: 0, shares: 0, time: 'Just now', reactions: { like: 0, love: 0, fire: 0 }, userReaction: null, bookmarked: false, views: 0, media: newPostMedia }; setPosts([post, ...posts]); setProfile(p => p ? ({ ...p, posts: p.posts + 1 }) : p); setNewPost(''); setNewPostMedia([]); } };
    const handleNewPostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { const text = e.target.value; setNewPost(text); const cursorPosition = e.target.selectionStart; const textUpToCursor = text.substring(0, cursorPosition); const mentionMatch = textUpToCursor.match(/@(\w*)$/); if (mentionMatch) { setNewPostMentionQuery(mentionMatch[1]); } else { setNewPostMentionQuery(null); } };
    const handleNewPostMentionSelect = (username: string) => { const textarea = newPostTextareaRef.current; if (!textarea) return; const cursorPosition = textarea.selectionStart; const text = newPost; const textUpToCursor = text.substring(0, cursorPosition); const lastAt = textUpToCursor.lastIndexOf('@'); if (lastAt !== -1) { const preMention = text.substring(0, lastAt); const postMention = text.substring(cursorPosition); const newText = `${preMention}${username} ${postMention}`; setNewPost(newText); setTimeout(() => { textarea.focus(); const newCursorPosition = (preMention + username).length + 1; textarea.setSelectionRange(newCursorPosition, newCursorPosition); }, 0); } setNewPostMentionQuery(null); };
    const handlePollOptionChange = (index: number, value: string) => { const newOptions = [...pollOptions]; newOptions[index] = value; setPollOptions(newOptions); };
    const handleAddPollOption = () => { if (pollOptions.length < 5) { setPollOptions([...pollOptions, '']); } };
    const handleRemovePollOption = (index: number) => { if (pollOptions.length > 2) { setPollOptions(pollOptions.filter((_, i) => i !== index)); } };
    const handleCreatePoll = () => { const validOptions = pollOptions.filter(opt => opt.trim()); if (profile && newPost.trim() && validOptions.length >= 2) { const poll: Post = { id: Date.now(), userId: profile.id, user: profile.name, username: profile.username, avatar: profile.avatar, content: newPost, type: 'poll', pollOptions: validOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })), totalVotes: 0, userVoted: null, time: 'Just now', likes: 0, comments: 0, shares: 0, reactions: { like: 0, love: 0, fire: 0 }, userReaction: null, views: 0, bookmarked: false }; setPosts([poll, ...posts]); setProfile(p => p ? ({ ...p, posts: p.posts + 1 }) : p); setNewPost(''); setPollOptions(['', '']); setShowCreatePoll(false); } };
    const handleVotePoll = (postId: number, optionId: number) => { setPosts(posts.map(post => { if (post.id === postId && post.type === 'poll') { const newOptions = post.pollOptions?.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt); return { ...post, pollOptions: newOptions, totalVotes: (post.totalVotes ?? 0) + 1, userVoted: optionId }; } return post; })); };
    const handleDeletePost = (postId: number) => { const postToDelete = posts.find(p => p.id === postId); if(profile && postToDelete?.user === profile.name){ setProfile(p => p ? ({...p, posts: p.posts - 1}) : p); } setPosts(posts.filter(p => p.id !== postId)); if(viewingPost?.id === postId){ setViewingPost(null); } };
    const handleCreateStory = (media: StoryItem) => { setStories(prev => prev.map(s => s.isYours ? { ...s, media: [...s.media, { ...media, id: Date.now() }] } : s)); setShowCreateStory(false); };
    const handleDeleteStory = (storyId: number, mediaId: number) => { setStories(prev => prev.map(s => { if (s.id === storyId && s.isYours) { return { ...s, media: s.media.filter(m => m.id !== mediaId) }; } return s; })); setViewingStoriesForUser(null); };
    const handleStoryClick = (story: Story) => { if (story.media.length > 0) { setViewingStoriesForUser(story); } else if (story.isYours) { setShowCreateStory(true); } else { handleViewProfile(story.username); } };
    const handleMarkOneNotificationRead = (id: number) => { setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n)); }; const handleMarkAllNotificationsRead = () => { setNotifications(notifications.map(n => ({...n, read: true}))); };
    const handleMarkChatAsRead = (userId: number) => { setMessages(prevMessages => prevMessages.map(msg => msg.userId === userId && msg.unread ? { ...msg, unread: false } : msg)); };
    const addMessageToHistory = (userId: number, message: ChatMessage) => { if (!profile) return; setChatHistories(prev => ({ ...prev, [userId]: [...(prev[userId] || []), message] })); setMessages(prev => { const otherMessages = prev.filter(m => m.userId !== userId); const currentChat = prev.find(m => m.userId === userId); if (!currentChat) return prev; const updatedMessage = { ...currentChat, lastMessage: message.type === 'image' ? 'Sent an image' : message.type === 'call' ? message.text : message.text, lastMessageType: message.type, time: message.time, lastMessageSentByYou: message.sentBy === profile.id, unread: message.sentBy !== profile.id, }; return [updatedMessage, ...otherMessages]; }); };
    const updateMessageStatus = (messageId: number, userId: number, status: ChatMessage['status']) => { setChatHistories(prev => { const userHistory = prev[userId] || []; return { ...prev, [userId]: userHistory.map(msg => msg.id === messageId ? { ...msg, status } : msg) }; }); };
    const handleSendMessage = (userId: number, text: string, type: ChatMessage['type'], options?: Partial<ChatMessage>) => { if (!profile) return; const newMessage: ChatMessage = { id: Date.now(), text, sentBy: profile.id, time: 'Just now', status: 'sending', type, ...options, }; addMessageToHistory(userId, newMessage); setTimeout(() => updateMessageStatus(newMessage.id, userId, 'sent'), 500); setTimeout(() => updateMessageStatus(newMessage.id, userId, 'delivered'), 1500); setTimeout(() => { setChatHistories(prev => ({ ...prev, [userId]: prev[userId].map(msg => ({ ...msg, status: 'read' })) })); }, 3000); };
    const handleDeleteMessage = (userId: number, messageId: number) => { setChatHistories(prev => ({ ...prev, [userId]: (prev[userId] || []).filter(msg => msg.id !== messageId) })); };
    const handleEditMessage = (userId: number, messageId: number, newText: string) => { setChatHistories(prev => ({ ...prev, [userId]: (prev[userId] || []).map(msg => msg.id === messageId ? { ...msg, text: newText, isEdited: true, time: 'Just now' } : msg) })); };
    const handleReactToMessage = (userId: number, messageId: number, emoji: string) => { if (!profile) return; setChatHistories(prev => { const newHistory = (prev[userId] || []).map(msg => { if (msg.id === messageId) { const reactions = { ...(msg.reactions || {}) }; const reactedUsers = reactions[emoji] || []; if (reactedUsers.includes(profile.username)) { reactions[emoji] = reactedUsers.filter(u => u !== profile.username); if(reactions[emoji].length === 0) delete reactions[emoji]; } else { const otherReactions = { ...reactions }; for (const key in otherReactions) { otherReactions[key] = otherReactions[key].filter(u => u !== profile.username); if(otherReactions[key].length === 0) delete otherReactions[key]; } otherReactions[emoji] = [...(otherReactions[emoji] || []), profile.username]; return { ...msg, reactions: otherReactions }; } return { ...msg, reactions }; } return msg; }); return { ...prev, [userId]: newHistory }; }); };
    const handleStartCall = (user: Message, type: 'video' | 'voice') => { if (!profile) return; setActiveCall({ type, user }); const newMessage: ChatMessage = { id: Date.now(), type: 'call', text: `${type.charAt(0).toUpperCase() + type.slice(1)} call started`, sentBy: profile.id, time: 'Just now', callInfo: { type, status: 'started' } }; addMessageToHistory(user.userId, newMessage); };
    const handleEndCall = (duration: string) => { if (activeCall) { if (!profile) return; const newMessage: ChatMessage = { id: Date.now(), type: 'call', text: `${activeCall.type.charAt(0).toUpperCase() + activeCall.type.slice(1)} call ended`, sentBy: profile.id, time: 'Just now', callInfo: { type: activeCall.type, status: 'ended', duration } }; addMessageToHistory(activeCall.user.userId, newMessage); setActiveCall(null); } };
    const handleSaveProfile = (updatedProfile: Profile) => { const oldUsername = profile?.username; setProfile(updatedProfile); setPosts(posts.map(p => p.username === oldUsername ? { ...p, user: updatedProfile.name, username: updatedProfile.username, avatar: updatedProfile.avatar } : p)); setShowEditProfile(false); };
    const handleFollowToggle = (userIdToToggle: number, usernameToToggle: string) => { const isCurrentlyFollowing = following.some(u => u.id === userIdToToggle); const userDataSource = allUsers.find(u => u.id === userIdToToggle); if (isCurrentlyFollowing) { setFollowing(prev => prev.filter(u => u.id !== userIdToToggle)); setProfile(p => p ? ({ ...p, following: p.following - 1 }) : p); setFriendSuggestions(prev => prev.map(s => s.id === userIdToToggle ? { ...s, followed: false } : s)); setFollowers(prev => prev.map(f => f.id === userIdToToggle ? { ...f, followedByYou: false } : f)); alert(`Unfollowed ${usernameToToggle}.`); } else { if (userDataSource) { const userToFollow: UserListItem = { ...userDataSource, followedByYou: true }; setFollowing(prev => [...prev, userToFollow]); setProfile(p => p ? ({ ...p, following: p.following + 1 }) : p); setFriendSuggestions(prev => prev.map(s => s.id === userIdToToggle ? { ...s, followed: true } : s)); setFollowers(prev => prev.map(f => f.id === userIdToToggle ? { ...f, followedByYou: true } : f)); } else { console.error(`User with ID ${userIdToToggle} not found in allUsers data source.`); } } };
    const handleBlockToggle = (userIdToBlock: number, usernameToBlock: string) => { if (!profile) return; const isCurrentlyBlocked = profile.blockedAccounts.some(u => u.id === userIdToBlock); const userDataSource = allUsers.find(u => u.id === userIdToBlock); if (isCurrentlyBlocked) { setProfile(p => p ? ({...p, blockedAccounts: p.blockedAccounts.filter(u => u.id !== userIdToBlock)}) : p); alert(`Unblocked ${usernameToBlock}.`); } else { if (window.confirm(`Are you sure you want to block ${usernameToBlock}? They will no longer be able to find your profile, posts, or story. FireSocial won't let them know they were blocked.`)) { if (userDataSource) { setProfile(p => p ? ({...p, blockedAccounts: [...p.blockedAccounts, userDataSource] }) : p); if (following.some(u => u.id === userIdToBlock)) { setFollowing(f => f.filter(u => u.id !== userIdToBlock)); setProfile(p => p ? ({ ...p, following: p.following - 1 }) : p); } if (followers.some(u => u.id === userIdToBlock)) { setFollowers(f => f.filter(u => u.id === userIdToBlock)); setProfile(p => p ? ({ ...p, followers: p.followers - 1 }) : p); } alert(`Blocked ${usernameToBlock}.`); } } } };
    const handleAddComment = (postId: number, commentText: string, replyToUsername?: string) => { if (!profile) return; const newComment: Comment = { id: Date.now(), userId: profile.id, username: profile.username, avatar: profile.avatar, text: commentText, time: 'Just now', likes: 0, isLiked: false, replyTo: replyToUsername, }; const updatePostWithComment = (p: Post) => { if (p.id === postId) { return { ...p, comments: p.comments + 1, commentsData: [...(p.commentsData || []), newComment], }; } return p; }; setPosts(posts.map(updatePostWithComment)); if (viewingPost?.id === postId) { setViewingPost(updatePostWithComment(viewingPost)); } if (viewingCommentsForPost?.id === postId) { setViewingCommentsForPost(updatePostWithComment(viewingCommentsForPost)); } };
    const handleLikeComment = (postId: number, commentId: number) => { const updateState = (p: Post) => { if (p.id === postId) { const updatedComments = (p.commentsData || []).map(c => { if (c.id === commentId) { return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }; } return c; }); return { ...p, commentsData: updatedComments }; } return p; }; setPosts(posts.map(updateState)); if (viewingPost?.id === postId) setViewingPost(updateState(viewingPost)); if (viewingCommentsForPost?.id === postId) setViewingCommentsForPost(updateState(viewingCommentsForPost)); };
    const handleDeleteComment = (postId: number, commentId: number) => { const updateState = (p: Post) => { if (p.id === postId) { const updatedComments = (p.commentsData || []).filter(c => c.id !== commentId); return { ...p, commentsData: updatedComments, comments: p.comments - 1 }; } return p; }; setPosts(posts.map(updateState)); if (viewingPost?.id === postId) setViewingPost(updateState(viewingPost)); if (viewingCommentsForPost?.id === postId) setViewingCommentsForPost(updateState(viewingCommentsForPost)); };
    const handleEditComment = (postId: number, commentId: number, newText: string) => { const updateState = (p: Post) => { if (p.id === postId) { const updatedComments = (p.commentsData || []).map(c => { if (c.id === commentId) { return { ...c, text: newText, edited: true, time: 'Just now' }; } return c; }); return { ...p, commentsData: updatedComments }; } return p; }; setPosts(posts.map(updateState)); if (viewingPost?.id === postId) setViewingPost(updateState(viewingPost)); if (viewingCommentsForPost?.id === postId) setViewingCommentsForPost(updateState(viewingCommentsForPost)); };
    const handleRemoveSearchHistoryItem = (itemToRemove: string) => { setProfile(p => p ? ({ ...p, searchHistory: (p.searchHistory || []).filter(item => item !== itemToRemove), }) : p); };
    const handleClearSearchHistory = () => { setProfile(p => p ? ({ ...p, searchHistory: [] }) : p); };
    const handleEditSearchHistoryItem = (query: string) => { setSearchQuery(query); };
    const handleDismissSuggestion = (userId: number) => { setFriendSuggestions(prev => prev.filter(s => s.id !== userId)); };
    const handleHidePost = (postId: number) => { setHiddenPostIds(prev => [...prev, postId]); };
    const handleMuteUser = (username: string) => { if (!profile || profile.mutedAccounts.some(acc => acc.name === username)) return; const userToMute = allUsers.find(u => u.name === username); if (userToMute) { setProfile(p => p ? ({ ...p, mutedAccounts: [...p.mutedAccounts, userToMute] }) : p); alert(`Muted ${username}. Their posts won't appear in your feed.`); } };
    const handleReportPost = (postId: number) => { alert(`Post ${postId} has been reported for review. Thank you.`); };
    const handleSharePost = async (post: Post) => { const shareUrl = `https://firesocial.dev/post/${post.id}`; try { if (navigator.share) { await navigator.share({ title: `Check out this post from ${post.user} on FireSocial`, text: post.content, url: shareUrl, }); } else { alert('Sharing is not supported on this browser.'); } } catch (error) { console.error('Error sharing:', error); } };
    const handleCopyLink = (postId: number) => { const postUrl = `https://firesocial.dev/post/${postId}`; navigator.clipboard.writeText(postUrl).then( () => alert('Link copied to clipboard!'), () => alert('Failed to copy link.') ); };
    const handleDeployGame = (gameIdea: string, previewImage: string) => { if (!profile) return; const newPost: Post = { id: Date.now(), userId: profile.id, user: profile.name, username: profile.username, avatar: profile.avatar, content: `🚀 I just created a new game with the AI Game Studio! It's a game about: "${gameIdea}". Check out the concept art! #AIGameDev #FireSocialCreator`, media: [{ type: 'image', url: previewImage }], likes: 0, comments: 0, shares: 0, time: 'Just now', reactions: {}, userReaction: null, bookmarked: false, views: 0, category: 'Gaming', }; setPosts(prevPosts => [newPost, ...prevPosts]); setProfile(p => p ? ({ ...p, posts: p.posts + 1 }) : p); setShowGameCreator(false); navigate('/profile'); setActiveProfileTab('posts'); };


    // --- New Navigation Handlers ---
    const handleViewProfile = (usernameWithAt: string) => {
        if (!profile) return;
        const username = usernameWithAt.startsWith('@') ? usernameWithAt.substring(1) : usernameWithAt;
        const profileUsername = profile.username.startsWith('@') ? profile.username.substring(1) : profile.username;

        if (username === profileUsername) {
            navigate('/profile');
        } else {
            navigate(`/profile/${username}`);
        }
    };

    const handleViewHashtag = (tagWithHash: string) => {
        const tag = tagWithHash.startsWith('#') ? tagWithHash.substring(1) : tagWithHash;
        navigate(`/hashtag/${tag}`);
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmedQuery = searchQuery.trim();
        
        if (!trimmedQuery) {
            navigate('/');
            return;
        }
        
        setProfile(p => {
            if (!p) return p;
            const existingHistory = (p.searchHistory || []).filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
            const newHistory = [trimmedQuery, ...existingHistory].slice(0, 10);
            return { ...p, searchHistory: newHistory };
        });
        
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        setShowSearchHistory(false);
    };

    const handleSearchFromHistory = (query: string) => {
        setSearchQuery(query);
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setShowSearchHistory(false);
    };

    const handleBookmarkLinkClick = () => {
        navigate('/profile');
        setActiveProfileTab('bookmarks');
    }

    if (!isLoggedIn) {
        return <LoginPage />;
    }

    if (!profile) {
        return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">Loading Profile...</div>;
    }

    // --- UI Props ---
    const uiProps = {
      bgClass: darkMode ? 'bg-gray-900' : `bg-gradient-to-br ${currentTheme.light}`,
      cardBg: darkMode ? 'bg-gray-800/40' : 'bg-white/40',
      textColor: darkMode ? 'text-white' : 'text-gray-800',
      textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
      borderColor: darkMode ? 'border-gray-700' : 'border-white/20',
      currentTheme,
      darkMode
    };

    const allProps = {
        profile, setProfile, darkMode, setDarkMode, themeColor, setThemeColor, notifications, setNotifications, messages, setMessages, groupChats, setGroupChats, posts, setPosts, stories, setStories, newPost, setNewPost, newPostMedia, setNewPostMedia, newPostMentionQuery, setNewPostMentionQuery, newPostTextareaRef, fileInputRef, showSettings, setShowSettings, searchQuery, setSearchQuery, showCreateStory, setShowCreateStory, viewingStoriesForUser, setViewingStoriesForUser, showCreatePoll, setShowCreatePoll, pollOptions, setPollOptions, friendSuggestions, setFriendSuggestions, trendingHashtags, showAnalytics, setShowAnalytics, liveUsers, hiddenPostIds, setHiddenPostIds, chatHistories, setChatHistories, activeCall, setActiveCall, showEditProfile, setShowEditProfile, showFollowList, setShowFollowList, showSuggestionsModal, setShowSuggestionsModal, activeTab: activeProfileTab, onTabChange: setActiveProfileTab, viewingPost, setViewingPost, viewingCommentsForPost, setViewingCommentsForPost, achievementToast, setAchievementToast, showNotifications, setShowNotifications, showAICreator, setShowAICreator, showGameCreator, setShowGameCreator, showAIChatbot, setShowAIChatbot, showSearchHistory, setShowSearchHistory, searchContainerRef, followers, setFollowers, following, setFollowing, allUsers, allAchievements: ALL_ACHIEVEMENTS, currentTheme, unreadNotifications, unreadMessages, ui: uiProps, navigate,
        handleReaction, handleBookmark, handleFileSelect, handleRemoveMedia, handleCreatePost, handleNewPostChange, handleNewPostMentionSelect, handlePollOptionChange, handleAddPollOption, handleRemovePollOption, handleCreatePoll, handleVotePoll, handleDeletePost, handleCreateStory, handleDeleteStory, handleStoryClick, handleMarkOneNotificationRead, handleMarkAllNotificationsRead, handleMarkChatAsRead, handleSendMessage, handleDeleteMessage, handleEditMessage, handleReactToMessage, handleStartCall, handleEndCall, handleSaveProfile, handleFollowToggle, handleBlockToggle, handleAddComment, handleLikeComment, handleDeleteComment, handleEditComment, handleViewProfile, handleViewHashtag, handleSearchSubmit, handleSearchFromHistory, handleRemoveSearchHistoryItem, handleClearSearchHistory, handleEditSearchHistoryItem, handleDismissSuggestion, handleHidePost, handleMuteUser, handleReportPost, handleSharePost, handleCopyLink, handleDeployGame, handleBookmarkLinkClick
    };

    return (
        <>
            {showSettings && <SettingsModal {...allProps} show={showSettings} onClose={() => setShowSettings(false)} onEditProfile={() => setShowEditProfile(true)} onBlockToggle={handleBlockToggle} />}
            {showNotifications && <NotificationsModal {...allProps} {...uiProps} show={showNotifications} onClose={() => setShowNotifications(false)} unreadCount={unreadNotifications} onMarkAllRead={handleMarkAllNotificationsRead} onMarkOneRead={handleMarkOneNotificationRead} />}
            {showAICreator && <AICreatorModal {...allProps} {...uiProps} show={showAICreator} onClose={() => setShowAICreator(false)} />}
            {showGameCreator && <GameCreatorModal {...allProps} {...uiProps} show={showGameCreator} onClose={() => setShowGameCreator(false)} onDeployGame={handleDeployGame} />}
            {showAIChatbot && <AIChatbotModal {...allProps} {...uiProps} show={showAIChatbot} onClose={() => setShowAIChatbot(false)} />}
            {showAnalytics && <AnalyticsModal {...allProps} {...uiProps} show={showAnalytics} onClose={() => setShowAnalytics(false)} />}
            {viewingPost && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={() => setViewingPost(null)}><div className={`${uiProps.cardBg} backdrop-blur-xl rounded-3xl p-0 border ${uiProps.borderColor} shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}><PostComponent post={viewingPost} profile={profile} currentTheme={currentTheme} cardBg="bg-transparent" textColor={uiProps.textColor} textSecondary={uiProps.textSecondary} borderColor={uiProps.borderColor} reactions={REACTIONS} messages={messages} allUsers={allUsers} onReaction={handleReaction} onBookmark={handleBookmark} onDelete={handleDeletePost} onViewPost={setViewingPost} onViewComments={setViewingCommentsForPost} onAddComment={handleAddComment} onHide={handleHidePost} onMute={handleMuteUser} onReport={handleReportPost} onShare={handleSharePost} onCopyLink={handleCopyLink} onFollowToggle={handleFollowToggle} onBlockToggle={handleBlockToggle} onVotePoll={handleVotePoll} onViewProfile={handleViewProfile} onViewHashtag={handleViewHashtag} isFollowing={following.some(u => u.id === viewingPost.userId)} isBlocked={profile.blockedAccounts.some(u => u.id === viewingPost.userId)} /></div></div>)}
            {viewingCommentsForPost && <CommentModal post={viewingCommentsForPost} {...allProps} {...uiProps} onClose={() => setViewingCommentsForPost(null)} onAddComment={handleAddComment} onLikeComment={handleLikeComment} onDeleteComment={handleDeleteComment} onEditComment={handleEditComment} />}
            {activeCall && <CallModal call={activeCall} onEndCall={handleEndCall} {...allProps} {...uiProps} />}
            {viewingStoriesForUser && <StoryViewerModal stories={stories} startUser={viewingStoriesForUser} profile={profile} onClose={() => setViewingStoriesForUser(null)} onDeleteStory={handleDeleteStory} />}
            {showCreateStory && <CreateStoryModal show={showCreateStory} {...allProps} {...uiProps} onClose={() => setShowCreateStory(false)} onCreate={handleCreateStory} />}
            {showSuggestionsModal && <SuggestionsModal {...allProps} {...uiProps} show={showSuggestionsModal} suggestions={friendSuggestions} onClose={() => setShowSuggestionsModal(false)} onFollowToggle={handleFollowToggle} onDismiss={handleDismissSuggestion} onViewProfile={handleViewProfile} />}
            {showEditProfile && <EditProfileModal {...allProps} {...uiProps} onClose={() => setShowEditProfile(false)} onSave={handleSaveProfile} />}
            {showFollowList && <FollowListModal listType={showFollowList} onClose={() => setShowFollowList(null)} {...allProps} {...uiProps} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} />}
             
            <Routes>
                <Route path="/" element={<AppLayout {...allProps} />}>
                    <Route index element={<FeedPage {...allProps} />} />
                    <Route path="explore" element={<ExplorePage {...allProps} {...uiProps} onViewPost={setViewingPost} onViewProfile={handleViewProfile} onViewHashtag={handleViewHashtag} />} />
                    <Route path="messages" element={<MessagesPage {...allProps} {...uiProps} onSendMessage={handleSendMessage} onDeleteMessage={handleDeleteMessage} onEditMessage={handleEditMessage} onReactToMessage={handleReactToMessage} onStartCall={handleStartCall} onMarkChatAsRead={handleMarkChatAsRead} />} />
                    <Route path="profile">
                        <Route index element={<ProfileWrapper {...allProps} />} />
                        <Route path=":username" element={<ProfileWrapper {...allProps} />} />
                    </Route>
                    <Route path="achievements" element={<AchievementsWrapper {...allProps} {...uiProps} />} />
                    <Route path="trophies" element={<TrophyWrapper {...allProps} {...uiProps} />} />
                    <Route path="streaks" element={<StreakWrapper {...allProps} {...uiProps} />} />
                    <Route path="hashtag/:tag" element={<HashtagPage {...allProps} />} />
                    <Route path="search" element={<SearchPage {...allProps} />} />
                </Route>
            </Routes>
        </>
    );
};

export default FireSocial;