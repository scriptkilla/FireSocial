
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, Compass, MessageSquare, User, Settings, Sun, Moon, LogOut, BarChart2, Star, Zap, Award, ShoppingBag, Gamepad2, Bot, PlusSquare, Bell, Mail, Plus, TrendingUp, Search, ArrowRight, Loader2, Users, Check } from 'lucide-react';

// Types and Constants
import { Post, Profile, Notification, Message, GroupChat, Story, FriendSuggestion, TrendingHashtag, LiveUser, UserListItem, Comment, ScheduledPost, ThemeColor, ChatMessage, ActiveCall, Product, MediaItem, Community } from '../types';
import { THEMES, REACTIONS, ALL_ACHIEVEMENTS } from '../constants';

// Data
import { 
    ALL_USERS_DATA,
    INITIAL_POSTS,
    INITIAL_NOTIFICATIONS,
    INITIAL_MESSAGES,
    INITIAL_GROUP_CHATS,
    INITIAL_STORIES,
    INITIAL_FRIEND_SUGGESTIONS,
    INITIAL_TRENDING_HASHTAGS,
    INITIAL_LIVE_USERS,
    INITIAL_FOLLOWING,
    INITIAL_FOLLOWERS,
    INITIAL_CHAT_HISTORY,
    INITIAL_MARKETPLACE_PRODUCTS,
    INITIAL_COMMUNITIES
} from '../data';

// Auth
import { useAuth } from './AuthContext';

// Components
import PostComponent from './PostComponent';
import { SettingsModal } from './SettingsModal';
import EditProfileModal from './EditProfileModal';
import FollowListModal from './FollowListModal';
import ProfilePage from './ProfilePage';
import ExplorePage from './ExplorePage';
import MessagesPage from './MessagesPage';
import CommentModal from './CommentModal';
import MessageModal from './MessageModal';
import CallModal from './CallModal';
import StoryViewerModal from './StoryViewerModal';
import AchievementsPage from './AchievementsPage';
import TrophyPage from './TrophyPage';
import StreakPage from './StreakPage';
import AnalyticsModal from './AnalyticsModal';
import CreateStoryModal from './CreateStoryModal';
import CreatePostModal from './CreatePostModal';
import SuggestionsModal from './SuggestionsModal';
import NotificationsModal from './NotificationsModal';
import NotificationDetailModal from './NotificationDetailModal';
import MarketplacePage from './MarketplacePage';
import ProductDetailModal from './ProductDetailModal';
import AddProductModal from './AddProductModal';
import AICreatorModal from './AICreatorModal';
import GameCreatorModal from './GameCreatorModal';
import AIChatbotModal from './AIChatbotModal';
import AvatarDisplay from './AvatarDisplay';


type Page = 'home' | 'explore' | 'notifications' | 'messages' | 'profile' | 'marketplace' | 'achievements' | 'trophies' | 'streaks';
type FollowListType = { type: 'followers' | 'following', user: Profile };

export const FireSocial: React.FC = () => {
    // --- AUTH CONTEXT ---
    const { user: authUser, logout } = useAuth();

    // --- STATE MANAGEMENT ---
    // Data states
    // Initialize profile with the authenticated user
    const [profile, setProfile] = useState<Profile>(authUser!); 
    const [allUsers, setAllUsers] = useState<Profile[]>(ALL_USERS_DATA);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [following, setFollowing] = useState<UserListItem[]>(INITIAL_FOLLOWING);
    const [followers, setFollowers] = useState<UserListItem[]>(INITIAL_FOLLOWERS);
    const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
    const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>(INITIAL_MARKETPLACE_PRODUCTS);
    const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);

    // UI states
    const [activePage, setActivePage] = useState<Page>('home');
    const [themeColor, setThemeColor] = useState<ThemeColor>('orange');
    const [darkMode, setDarkMode] = useState(true);
    const [profileTab, setProfileTab] = useState('posts');
    const [homeSearchQuery, setHomeSearchQuery] = useState('');
    
    // Pull to Refresh State
    const [pullStartY, setPullStartY] = useState(0);
    const [pullMoveY, setPullMoveY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pullThreshold = 100;

    // Modal states
    const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);
    const [showFollowList, setShowFollowList] = useState<FollowListType | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [commentModalPost, setCommentModalPost] = useState<Post | null>(null);
    const [messageUser, setMessageUser] = useState<Message | null>(null);
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [viewingStory, setViewingStory] = useState<Story | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showAICreator, setShowAICreator] = useState(false);
    const [showGameCreator, setShowGameCreator] = useState(false);
    const [showAIChatbot, setShowAIChatbot] = useState(false);


    // --- DERIVED STATE & MEMOS ---
    const currentTheme = useMemo(() => THEMES[themeColor], [themeColor]);
    const cardBg = useMemo(() => darkMode ? 'bg-gray-800/50' : 'bg-white/50', [darkMode]);
    const textColor = useMemo(() => darkMode ? 'text-white' : 'text-gray-900', [darkMode]);
    const textSecondary = useMemo(() => darkMode ? 'text-gray-400' : 'text-gray-600', [darkMode]);
    const borderColor = useMemo(() => darkMode ? 'border-white/10' : 'border-black/10', [darkMode]);
    const hoverBg = useMemo(() => darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5', [darkMode]);
    
    const allUserListItems: UserListItem[] = useMemo(() => allUsers.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followedByYou: following.some(f => f.id === u.id) })), [allUsers, following]);

    const blockedUserIds = useMemo(() => new Set(profile.blockedAccounts.map(u => u.id)), [profile.blockedAccounts]);
    
    const filteredPosts = useMemo(() => {
        return posts.filter(p => {
            if (blockedUserIds.has(p.userId)) return false;
            if (!homeSearchQuery) return true;
            const query = homeSearchQuery.toLowerCase();
            return (
                p.content.toLowerCase().includes(query) ||
                p.user.toLowerCase().includes(query) ||
                p.username.toLowerCase().includes(query) ||
                (p.category && p.category.toLowerCase().includes(query))
            );
        });
    }, [posts, blockedUserIds, homeSearchQuery]);

    const viewingProfile = useMemo(() => allUsers.find(u => u.username === viewingProfileUsername) || profile, [viewingProfileUsername, allUsers, profile]);

    // --- EFFECTS ---
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    
    // Sync local profile state if auth user changes (though usually we just unmount)
    useEffect(() => {
        if (authUser) setProfile(authUser);
    }, [authUser]);

    // --- HANDLERS ---
    
    // Pull to Refresh Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setPullStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (pullStartY > 0 && window.scrollY === 0) {
            const touchY = e.touches[0].clientY;
            const diff = touchY - pullStartY;
            if (diff > 0) {
                // Add resistance
                setPullMoveY(Math.min(diff * 0.5, 150)); 
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullMoveY > 80 && !isRefreshing) {
            setIsRefreshing(true);
            setPullMoveY(80); // Snap to loading position
            await refreshFeed();
        } else {
            setPullMoveY(0);
        }
        setPullStartY(0);
    };

    const refreshFeed = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Shuffle posts to simulate updates
        setPosts(prev => {
            const shuffled = [...prev];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        });
        
        setIsRefreshing(false);
        setPullMoveY(0);
    };


    const handleCreatePost = (content: string, media: MediaItem[], type: 'post' | 'poll', pollOptions?: string[]) => {
        const newPost: Post = {
            id: Date.now(),
            userId: profile.id,
            user: profile.name,
            username: profile.username,
            avatar: profile.avatar,
            content: content,
            media: media.length > 0 ? media : undefined,
            likes: 0,
            comments: 0,
            shares: 0,
            time: 'Just now',
            reactions: {},
            userReaction: null,
            bookmarked: false,
            views: 0,
            commentsData: [],
            type: type,
            pollOptions: pollOptions ? pollOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })) : undefined,
            totalVotes: 0,
            userVoted: null
        };
        setPosts([newPost, ...posts]);
        setProfile(p => ({ ...p, posts: p.posts + 1 }));
    };

    const handleReaction = (postId: number, reactionType: string) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const isReacting = p.userReaction === reactionType;
                return {
                    ...p,
                    likes: isReacting ? p.likes - 1 : (p.userReaction ? p.likes : p.likes + 1),
                    userReaction: isReacting ? null : reactionType,
                };
            }
            return p;
        }));
    };

    const handleBookmark = (postId: number) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p));
    };

    const handleDeletePost = (postId: number) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(p => p.id !== postId));
        }
    };

    const handleAddComment = (postId: number, commentText: string, replyToUsername?: string) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const newComment: Comment = {
                    id: Date.now(),
                    userId: profile.id,
                    username: profile.username,
                    avatar: profile.avatar,
                    text: commentText,
                    time: 'Just now',
                    likes: 0,
                    isLiked: false,
                    replyTo: replyToUsername
                };
                return {
                    ...p,
                    comments: p.comments + 1,
                    commentsData: [...(p.commentsData || []), newComment]
                };
            }
            return p;
        }));
    };

    const handleSaveProfile = (updatedProfile: Profile) => {
        setProfile(updatedProfile);
        setAllUsers(allUsers.map(u => u.id === updatedProfile.id ? updatedProfile : u));
        setShowEditProfile(false);
    };

    const handleFollowToggle = (userId: number, username: string) => {
        const isFollowing = following.some(u => u.id === userId);
        if (isFollowing) {
            setFollowing(following.filter(u => u.id !== userId));
        } else {
            const userToFollow = allUsers.find(u => u.id === userId);
            if (userToFollow) {
                setFollowing([...following, { id: userId, name: userToFollow.name, username: userToFollow.username, avatar: userToFollow.avatar, followedByYou: true }]);
            }
        }
    };
    
    const handleBlockToggle = (userId: number, username: string) => {
        const isBlocked = profile.blockedAccounts.some(u => u.id === userId);
        const userToToggle = allUserListItems.find(u => u.id === userId);
        if(!userToToggle) return;

        let updatedBlocked = [...profile.blockedAccounts];
        if(isBlocked) {
            updatedBlocked = updatedBlocked.filter(u => u.id !== userId);
            alert(`Unblocked ${username}`);
        } else {
            updatedBlocked.push(userToToggle);
             alert(`Blocked ${username}`);
        }
        setProfile(p => ({ ...p, blockedAccounts: updatedBlocked }));
    };

    const handleSendMessage = (userId: number, text: string, type: ChatMessage['type'], options?: Partial<ChatMessage>) => {
        const newMessage: ChatMessage = {
            id: Date.now(),
            sentBy: profile.id,
            text,
            type,
            time: 'Just now',
            status: 'sent',
            ...options
        };
        setChatHistories(prev => ({
            ...prev,
            [userId]: [...(prev[userId] || []), newMessage]
        }));
    };
    
    const handleAddNewProduct = (productData: Omit<Product, 'id' | 'creatorId' | 'creatorUsername' | 'creatorAvatar' | 'sales' | 'rating'>) => {
        const newProduct: Product = {
            ...productData,
            id: `prod_${Date.now()}`,
            creatorId: profile.id,
            creatorUsername: profile.username,
            creatorAvatar: profile.avatar,
            sales: 0,
            rating: 0,
        };
        
        // Add to global marketplace list
        setMarketplaceProducts(prev => [newProduct, ...prev]);

        // Add to creator's personal product list
        if (profile.creatorMonetization) {
            const updatedMonetization = {
                ...profile.creatorMonetization,
                products: [newProduct, ...profile.creatorMonetization.products],
            };
            setProfile(p => ({ ...p, creatorMonetization: updatedMonetization }));
        }

        setShowAddProductModal(false);
    };
    
    const toggleJoinCommunity = (communityId: number) => {
        setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, joined: !c.joined } : c));
    };

    const handleViewProfile = (username: string) => {
        setViewingProfileUsername(username);
        setActivePage('profile');
        setProfileTab('posts');
    };

    const handleHomePageSelect = () => {
        setActivePage('home');
        setViewingProfileUsername(null);
    };
    
    const renderStoriesBar = () => {
        const userStory = INITIAL_STORIES.find(s => s.isYours);
        const otherStories = INITIAL_STORIES.filter(s => !s.isYours);

        return (
            <div className="flex gap-4 overflow-x-auto pb-4 mb-2 no-scrollbar">
                {/* User Story / Create Story */}
                <button 
                    onClick={() => userStory && userStory.media.length > 0 ? setViewingStory(userStory) : setShowCreateStory(true)}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                    <div className={`relative p-1 rounded-full ${userStory && userStory.media.length > 0 ? `bg-gradient-to-tr ${currentTheme.from} ${currentTheme.to}` : `border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}`}>
                        <div className={`p-0.5 ${cardBg} rounded-full`}>
                             <AvatarDisplay avatar={profile.avatar} size="w-14 h-14" />
                        </div>
                        {(!userStory || userStory.media.length === 0) && (
                            <div className={`absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 ${darkMode ? 'border-gray-900' : 'border-white'}`}>
                                <Plus size={14} />
                            </div>
                        )}
                    </div>
                    <span className={`text-xs font-medium ${textColor}`}>Your Story</span>
                </button>

                {/* Other Stories */}
                {otherStories.map(story => (
                    <button 
                        key={story.id}
                        onClick={() => setViewingStory(story)}
                        className="flex flex-col items-center gap-2 flex-shrink-0"
                    >
                         <div className={`p-1 rounded-full ${story.viewed ? 'bg-gray-600' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
                            <div className={`p-0.5 ${cardBg} rounded-full`}>
                                 <AvatarDisplay avatar={story.avatar} size="w-14 h-14" />
                            </div>
                        </div>
                        <span className={`text-xs font-medium ${textColor} w-16 truncate text-center`}>{story.user}</span>
                    </button>
                ))}
            </div>
        );
    };

    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return (
                    <div 
                        className="space-y-6 touch-pan-y min-h-[80vh]"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                         {/* Pull to Refresh Indicator */}
                        <div 
                            className={`flex justify-center items-center overflow-hidden transition-[height] duration-200 ease-out ${isRefreshing ? 'h-20' : ''}`}
                            style={{ height: isRefreshing ? undefined : `${Math.max(0, pullMoveY)}px` }}
                        >
                             <div className={`p-3 rounded-full ${cardBg} border ${borderColor} shadow-lg transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: !isRefreshing ? `rotate(${pullMoveY * 3}deg)` : undefined }}>
                                <Loader2 className={currentTheme.text} size={24} />
                            </div>
                        </div>

                         {/* Search Bar */}
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search FireSocial..." 
                                value={homeSearchQuery}
                                onChange={(e) => setHomeSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className={`w-full pl-12 pr-14 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-500 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            />
                            {homeSearchQuery && (
                                <button 
                                    onClick={() => {
                                        const activeElement = document.activeElement as HTMLElement;
                                        if (activeElement) activeElement.blur();
                                    }}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg hover:scale-105 transition-transform`}
                                >
                                    <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                        {renderStoriesBar()}
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => <PostComponent key={post.id} {...postComponentProps} post={post} />)
                        ) : (
                            <div className={`text-center py-10 ${textSecondary}`}>
                                <p>No posts found matching "{homeSearchQuery}"</p>
                            </div>
                        )}
                    </div>
                );
            case 'explore':
                return <ExplorePage posts={posts} profile={profile} allUsers={allUserListItems} trendingHashtags={INITIAL_TRENDING_HASHTAGS} following={following} onViewPost={setViewingPost} onViewProfile={handleViewProfile} onViewHashtag={(tag) => alert(`Viewing hashtag: ${tag}`)} textColor={textColor} textSecondary={textSecondary} cardBg={cardBg} borderColor={borderColor} currentTheme={currentTheme} />;
            case 'messages':
                return <MessagesPage messages={INITIAL_MESSAGES} groupChats={INITIAL_GROUP_CHATS} onViewMessage={setMessageUser} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />;
            case 'marketplace':
                return <MarketplacePage products={marketplaceProducts} onViewProduct={setViewingProduct} onViewProfile={handleViewProfile} textColor={textColor} textSecondary={textSecondary} cardBg={cardBg} borderColor={borderColor} currentTheme={currentTheme} />;
            case 'profile':
                return <ProfilePage profileToDisplay={viewingProfile} isOwnProfile={viewingProfile.id === profile.id} posts={posts} scheduledPosts={[]} onDeleteScheduledPost={() => {}} activeTab={profileTab} onTabChange={setProfileTab} onEditProfile={() => setShowEditProfile(true)} onFollow={handleFollowToggle} onBlockToggle={handleBlockToggle} isFollowing={following.some(u => u.id === viewingProfile.id)} isBlocked={blockedUserIds.has(viewingProfile.id)} onShowFollowers={() => setShowFollowList({type: 'followers', user: viewingProfile})} onShowFollowing={() => setShowFollowList({type: 'following', user: viewingProfile})} onViewPost={setViewingPost} onViewComments={setCommentModalPost} onViewHashtag={(tag) => alert(`Viewing hashtag: ${tag}`)} onViewProfile={handleViewProfile} onViewAchievements={() => setActivePage('achievements')} onViewTrophies={() => setActivePage('trophies')} onViewStreaks={() => setActivePage('streaks')} allAchievements={ALL_ACHIEVEMENTS} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} currentTheme={currentTheme} onPurchasePost={(id)=>alert(`Purchasing post ${id}`)} onShowAddProductModal={() => setShowAddProductModal(true)} />;
            case 'achievements':
                return <AchievementsPage profile={viewingProfile} allAchievements={ALL_ACHIEVEMENTS} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'trophies':
                return <TrophyPage profile={viewingProfile} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'streaks':
                return <StreakPage profile={viewingProfile} onBack={() => setActivePage('profile')} {...uiProps} />;
            default: return <div>Not implemented</div>;
        }
    };
    
    const uiProps = { currentTheme, cardBg, textColor, textSecondary, borderColor, hoverBg };

    const postComponentProps = {
        profile: profile,
        reactions: REACTIONS,
        messages: INITIAL_MESSAGES,
        allUsers: allUserListItems,
        ...uiProps,
        onReaction: handleReaction,
        onBookmark: handleBookmark,
        onDelete: handleDeletePost,
        onViewPost: setViewingPost,
        onViewComments: setCommentModalPost,
        onAddComment: handleAddComment,
        onHide: (id: number) => alert(`Hiding post ${id}`),
        onMute: (username: string) => alert(`Muting ${username}`),
        onReport: (id: number) => alert(`Reporting post ${id}`),
        onShare: (post: Post) => alert(`Sharing post ${post.id}`),
        onCopyLink: (id: number) => navigator.clipboard.writeText(`/post/${id}`),
        onFollowToggle: handleFollowToggle,
        onBlockToggle: handleBlockToggle,
        onVotePoll: (postId: number, optionId: number) => {
            setPosts(posts.map(p => {
                if (p.id === postId && p.pollOptions) {
                    return { ...p, userVoted: optionId, totalVotes: (p.totalVotes || 0) + 1, pollOptions: p.pollOptions.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) };
                }
                return p;
            }));
        },
        onViewProfile: handleViewProfile,
        onViewHashtag: (tag: string) => alert(`Viewing ${tag}`),
        onPurchasePost: (id: number) => {
            alert(`Purchased Post ${id}!`);
            setProfile(p => ({...p, purchasedPostIds: [...(p.purchasedPostIds || []), id]}));
        },
        // These need to be calculated per-post
        isFollowing: false, 
        isBlocked: false,
    };


    const NavItem: React.FC<{ page: Page, label: string, icon: React.ElementType, current: Page, onClick: () => void }> = ({ page, label, icon: Icon, current, onClick }) => (
        <button onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${current === page ? `text-white bg-white/10` : `text-gray-400 hover:text-white hover:bg-white/5`}`}>
            <Icon size={24} />
            <span className="font-semibold text-lg">{label}</span>
        </button>
    );
    
    const MobileNavItem: React.FC<{ page: Page | string, label: string, icon: React.ElementType, current: Page, onClick: () => void }> = ({ page, label, icon: Icon, current, onClick }) => (
        <button onClick={onClick} className={`relative flex flex-col items-center gap-1 p-2 rounded-lg w-20 flex-shrink-0 transition-colors ${current === page ? currentTheme.text : textSecondary}`}>
            {current === page && <div className={`absolute -top-px left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`}></div>}
            <Icon size={24} />
            <span className="text-xs font-medium truncate">{label}</span>
        </button>
    );

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.light} dark:from-gray-900 dark:to-black font-sans transition-colors`}>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="container mx-auto grid grid-cols-12 gap-8 items-start p-2 sm:p-4">
                <aside className="col-span-3 sticky top-4 hidden lg:flex flex-col gap-4">
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor}`}>
                        <div className="pl-2 mb-6 flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} shadow-lg`}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3.3.5.5.5.8z"></path>
                                </svg>
                            </div>
                            <span className={`text-2xl font-bold ${textColor} tracking-tight`}>FireSocial</span>
                        </div>
                        <nav className="space-y-2">
                            <NavItem page="home" label="Home" icon={Home} current={activePage} onClick={handleHomePageSelect} />
                            <NavItem page="explore" label="Explore" icon={Compass} current={activePage} onClick={() => setActivePage('explore')} />
                            <NavItem page="notifications" label="Notifications" icon={Bell} current={activePage} onClick={() => setShowNotifications(true)} />
                            <NavItem page="messages" label="Messages" icon={Mail} current={activePage} onClick={() => setActivePage('messages')} />
                            <NavItem page="marketplace" label="Marketplace" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                            <NavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                        </nav>
                    </div>
                     <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} space-y-2`}>
                        <button onClick={() => setShowAICreator(true)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-white/5`}>
                           <Bot size={24} /> <span className="font-semibold text-lg">AI Creator</span>
                        </button>
                         <button onClick={() => setShowGameCreator(true)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-white/5`}>
                           <Gamepad2 size={24} /> <span className="font-semibold text-lg">Game Studio</span>
                        </button>
                    </div>
                </aside>
                
                <main className="col-span-12 lg:col-span-6 pb-24 lg:pb-0">
                    {renderPage()}
                </main>
                
                <aside className="col-span-3 sticky top-4 hidden lg:flex flex-col gap-4">
                     <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} flex justify-between items-center`}>
                        <button onClick={() => setShowSettings(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><Settings size={20} /></button>
                        <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                        <button onClick={() => setShowAnalytics(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><BarChart2 size={20} /></button>
                         <button onClick={() => setShowAIChatbot(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><Bot size={20} /></button>
                        <button onClick={logout} className={`p-3 rounded-xl hover:bg-white/10 text-red-500`} title="Log Out"><LogOut size={20} /></button>
                    </div>

                    {/* Trending Topics Widget */}
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor}`}>
                        <h3 className="font-bold mb-4">Trending Topics</h3>
                        <div className="space-y-4">
                            {INITIAL_TRENDING_HASHTAGS.map(hashtag => (
                                <button key={hashtag.tag} onClick={() => alert(`Viewing ${hashtag.tag}`)} className="w-full flex items-center justify-between group">
                                    <div className="text-left">
                                        <p className={`font-semibold text-sm ${textColor} group-hover:${currentTheme.text} transition-colors`}>{hashtag.tag}</p>
                                        <p className={`text-xs ${textSecondary}`}>{hashtag.posts.toLocaleString()} posts</p>
                                    </div>
                                    <div className={`p-2 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors`}>
                                        <TrendingUp size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor}`}>
                        <h3 className="font-bold mb-4">Suggestions</h3>
                        <div className="space-y-3">
                            {INITIAL_FRIEND_SUGGESTIONS.slice(0, 3).map(s => (
                                <div key={s.id} className="flex items-center justify-between">
                                    <button onClick={() => handleViewProfile(s.username)} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">{s.avatar}</div>
                                        <div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-gray-400">{s.username}</p></div>
                                    </button>
                                    <button className={`px-4 py-1.5 text-sm font-semibold rounded-full bg-white/10 text-white`}>Follow</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowSuggestions(true)} className={`mt-4 w-full text-center text-sm font-semibold ${currentTheme.text}`}>View All</button>
                    </div>
                    
                    {/* Communities Widget */}
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor}`}>
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18} /> Communities</h3>
                        <div className="space-y-4">
                            {communities.map(group => (
                                <div key={group.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <img src={group.image} alt={group.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <div>
                                            <p className={`font-semibold text-sm ${textColor} group-hover:${currentTheme.text} transition-colors`}>{group.name}</p>
                                            <p className={`text-xs ${textSecondary}`}>{group.members.toLocaleString()} members</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleJoinCommunity(group.id)} 
                                        className={`p-2 rounded-full transition-all ${group.joined ? `${cardBg} border ${borderColor} ${textSecondary}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`}`}
                                    >
                                        {group.joined ? <Check size={14} /> : <Plus size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className={`mt-4 w-full text-center text-sm font-semibold ${currentTheme.text}`}>Explore More</button>
                    </div>
                </aside>
            </div>

            {/* Floating Fire Button */}
            <button
                onClick={() => setShowCreatePost(true)}
                className={`fixed bottom-24 right-4 lg:bottom-10 lg:right-10 w-16 h-16 rounded-full shadow-2xl z-50 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white hover:scale-110 transition-transform flex items-center justify-center animate-bounce`}
            >
                <span className="text-3xl">🔥</span>
            </button>
            
            <footer className={`lg:hidden fixed bottom-0 left-0 right-0 ${cardBg} backdrop-blur-xl border-t ${borderColor} shadow-t-lg z-50`}>
                <nav className="flex justify-start items-center p-1 overflow-x-auto no-scrollbar">
                    <MobileNavItem page="home" label="Home" icon={Home} current={activePage} onClick={handleHomePageSelect} />
                    <MobileNavItem page="explore" label="Explore" icon={Compass} current={activePage} onClick={() => setActivePage('explore')} />
                    <MobileNavItem page="notifications" label="Alerts" icon={Bell} current={activePage} onClick={() => setShowNotifications(true)} />
                    <MobileNavItem page="messages" label="DMs" icon={Mail} current={activePage} onClick={() => setActivePage('messages')} />
                    <MobileNavItem page="marketplace" label="Market" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                    <MobileNavItem page="ai-creator" label="AI Create" icon={Bot} current={activePage} onClick={() => setShowAICreator(true)} />
                    <MobileNavItem page="game-studio" label="Games" icon={Gamepad2} current={activePage} onClick={() => setShowGameCreator(true)} />
                    <MobileNavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                </nav>
            </footer>

            {/* Modals */}
            {showSettings && <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} profile={profile} setProfile={setProfile} onEditProfile={() => {setShowSettings(false); setShowEditProfile(true);}} setThemeColor={setThemeColor} allUsers={allUserListItems} onBlockToggle={handleBlockToggle} themeColor={themeColor} darkMode={darkMode} {...uiProps} />}
            {showEditProfile && <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} onSave={handleSaveProfile} {...uiProps} />}
            {showFollowList && <FollowListModal listType={showFollowList.type} onClose={() => setShowFollowList(null)} followers={followers} following={following} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} {...uiProps} />}
            {commentModalPost && <CommentModal post={commentModalPost} profile={profile} onClose={() => setCommentModalPost(null)} onAddComment={handleAddComment} onLikeComment={()=>{}} onDeleteComment={()=>{}} onEditComment={()=>{}} allUsers={allUserListItems} {...uiProps} />}
            {messageUser && <MessageModal isOpen={!!messageUser} onClose={() => setMessageUser(null)} messageUser={messageUser} profile={profile} chatHistory={chatHistories[messageUser.userId] || []} onSendMessage={handleSendMessage} onDeleteMessage={()=>{}} onEditMessage={()=>{}} onReactToMessage={()=>{}} onStartCall={(user, type) => setActiveCall({ user, type })} {...uiProps} />}
            {activeCall && <CallModal call={activeCall} onEndCall={() => setActiveCall(null)} {...uiProps} />}
            {viewingStory && <StoryViewerModal stories={INITIAL_STORIES} startUser={viewingStory} profile={profile} onClose={() => setViewingStory(null)} onDeleteStory={()=>{}} />}
            {showAnalytics && <AnalyticsModal show={showAnalytics} onClose={() => setShowAnalytics(false)} profile={profile} posts={posts} followers={followers} {...uiProps} />}
            {showCreateStory && <CreateStoryModal show={showCreateStory} onClose={() => setShowCreateStory(false)} onCreate={()=>{}} {...uiProps} />}
            {showCreatePost && <CreatePostModal show={showCreatePost} onClose={() => setShowCreatePost(false)} onCreatePost={handleCreatePost} profile={profile} {...uiProps} />}
            {showSuggestions && <SuggestionsModal show={showSuggestions} onClose={() => setShowSuggestions(false)} suggestions={INITIAL_FRIEND_SUGGESTIONS} following={following} onFollowToggle={handleFollowToggle} onDismiss={()=>{}} onViewProfile={handleViewProfile} {...uiProps} />}
            {showNotifications && <NotificationsModal show={showNotifications} onClose={() => setShowNotifications(false)} notifications={INITIAL_NOTIFICATIONS} unreadCount={INITIAL_NOTIFICATIONS.filter(n=>!n.read).length} onMarkAllRead={()=>{}} onMarkOneRead={()=>{}} onViewNotification={(n) => {setShowNotifications(false); setViewingNotification(n);}} {...uiProps} />}
            {viewingNotification && <NotificationDetailModal show={!!viewingNotification} notification={viewingNotification} onClose={() => setViewingNotification(null)} allUsers={allUserListItems} posts={posts} onViewPost={(p)=>{setViewingNotification(null); setViewingPost(p);}} onViewProfile={(u)=>{setViewingNotification(null); handleViewProfile(u);}} {...uiProps} />}
            {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} profile={profile} onViewProfile={handleViewProfile} {...uiProps} />}
            {showAddProductModal && <AddProductModal show={showAddProductModal} onClose={() => setShowAddProductModal(false)} onAddProduct={handleAddNewProduct} {...uiProps} />}
            {showAICreator && <AICreatorModal show={showAICreator} onClose={() => setShowAICreator(false)} {...uiProps} />}
            {showGameCreator && <GameCreatorModal show={showGameCreator} onClose={() => setShowGameCreator(false)} onDeployGame={() => {}} {...uiProps} />}
            {showAIChatbot && <AIChatbotModal show={showAIChatbot} onClose={() => setShowAIChatbot(false)} {...uiProps} />}
        </div>
    );
};
