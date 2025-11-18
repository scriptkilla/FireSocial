


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, Compass, MessageSquare, User, Settings, Sun, Moon, LogOut, BarChart2, Star, Zap, Award, ShoppingBag, Gamepad2, Bot, PlusSquare, Bell, Mail, Plus } from 'lucide-react';

// Types and Constants
import { Post, Profile, Notification, Message, GroupChat, Story, FriendSuggestion, TrendingHashtag, LiveUser, UserListItem, Comment, ScheduledPost, ThemeColor, ChatMessage, ActiveCall, Product, MediaItem } from '../types';
import { THEMES, REACTIONS, ALL_ACHIEVEMENTS } from '../constants';

// Data
import { 
    LOGGED_IN_USER_USERNAME,
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
    INITIAL_MARKETPLACE_PRODUCTS
} from '../data';

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
import SuggestionsModal from './SuggestionsModal';
import NotificationsModal from './NotificationsModal';
import NotificationDetailModal from './NotificationDetailModal';
import MarketplacePage from './MarketplacePage';
import ProductDetailModal from './ProductDetailModal';
import AddProductModal from './AddProductModal';
import AICreatorModal from './AICreatorModal';
import GameCreatorModal from './GameCreatorModal';
import AIChatbotModal from './AIChatbotModal';
import CreatePostModal from './CreatePostModal';


type Page = 'home' | 'explore' | 'notifications' | 'messages' | 'profile' | 'marketplace' | 'achievements' | 'trophies' | 'streaks';
type FollowListType = { type: 'followers' | 'following', user: Profile };

export const FireSocial: React.FC = () => {
    // --- STATE MANAGEMENT ---
    // Data states
    const [profile, setProfile] = useState<Profile>(() => ALL_USERS_DATA.find(u => u.username === LOGGED_IN_USER_USERNAME)!);
    const [allUsers, setAllUsers] = useState<Profile[]>(ALL_USERS_DATA);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [following, setFollowing] = useState<UserListItem[]>(INITIAL_FOLLOWING);
    const [followers, setFollowers] = useState<UserListItem[]>(INITIAL_FOLLOWERS);
    const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
    const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>(INITIAL_MARKETPLACE_PRODUCTS);

    // UI states
    const [activePage, setActivePage] = useState<Page>('home');
    const [themeColor, setThemeColor] = useState<ThemeColor>('orange');
    const [darkMode, setDarkMode] = useState(true);
    const [profileTab, setProfileTab] = useState('posts');
    
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
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showAICreator, setShowAICreator] = useState(false);
    const [showGameCreator, setShowGameCreator] = useState(false);
    const [showAIChatbot, setShowAIChatbot] = useState(false);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);


    // --- DERIVED STATE & MEMOS ---
    const currentTheme = useMemo(() => THEMES[themeColor], [themeColor]);
    const cardBg = useMemo(() => darkMode ? 'bg-gray-800/50' : 'bg-white/50', [darkMode]);
    const textColor = useMemo(() => darkMode ? 'text-white' : 'text-gray-900', [darkMode]);
    const textSecondary = useMemo(() => darkMode ? 'text-gray-400' : 'text-gray-600', [darkMode]);
    const borderColor = useMemo(() => darkMode ? 'border-white/10' : 'border-black/10', [darkMode]);
    const hoverBg = useMemo(() => darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5', [darkMode]);
    
    const allUserListItems: UserListItem[] = useMemo(() => allUsers.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followedByYou: following.some(f => f.id === u.id) })), [allUsers, following]);

    const blockedUserIds = useMemo(() => new Set(profile.blockedAccounts.map(u => u.id)), [profile.blockedAccounts]);
    const filteredPosts = useMemo(() => posts.filter(p => !blockedUserIds.has(p.userId)), [posts, blockedUserIds]);
    const viewingProfile = useMemo(() => allUsers.find(u => u.username === viewingProfileUsername) || profile, [viewingProfileUsername, allUsers, profile]);

    // --- EFFECTS ---
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // --- HANDLERS ---
    
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
    
    const handleAddPost = (content: string, media?: { file: File, type: 'image' | 'video' }) => {
        const newPost: Post = {
            id: Date.now(),
            userId: profile.id,
            user: profile.name,
            username: profile.username,
            avatar: profile.avatar,
            content,
            likes: 0,
            comments: 0,
            shares: 0,
            time: 'Just now',
            reactions: {},
            userReaction: null,
            bookmarked: false,
            views: 0,
            media: media ? [{ type: media.type, url: URL.createObjectURL(media.file) }] : [],
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setShowCreatePostModal(false);
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

    const handleViewProfile = (username: string) => {
        setViewingProfileUsername(username);
        setActivePage('profile');
        setProfileTab('posts');
    };

    const handleHomePageSelect = () => {
        setActivePage('home');
        setViewingProfileUsername(null);
    };
    
    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return <div className="space-y-6">{filteredPosts.map(post => <PostComponent key={post.id} {...postComponentProps} post={post} />)}</div>;
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
        <button onClick={onClick} className={`relative flex flex-col items-center justify-center h-16 w-full transition-colors ${current === page ? currentTheme.text : textSecondary}`}>
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
                        <div className="pl-2 mb-6">
                            <svg width="190" height="48" viewBox="0 0 250 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="fireGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                                        <stop offset="0%" stopColor="#FBBF24" />
                                        <stop offset="50%" stopColor="#F97316" />
                                        <stop offset="100%" stopColor="#EF4444" />
                                    </linearGradient>
                                    <linearGradient id="textGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                                        <stop offset="0%" stopColor="#F97316" />
                                        <stop offset="100%" stopColor="#EF4444" />
                                    </linearGradient>
                                </defs>
                                <g transform="translate(0, 3) scale(1.1)">
                                    <path d="M29.5 2.1c-1.1-1-2.9-1.5-4.5-1.5C14.1.6 5.6 9.3 5.6 20.2c0 8.5 5.5 15.7 13.1 18.3.1-1.3.1-3.1-.1-4.7-1.1-6.1 2.3-11.4 2.3-11.4s1.7-3.4 5-3.4c3.9 0 6.1 2.9 6.1 7.1 0 4.2-2.7 10.6-6.4 10.6-3 0-5.2-2.5-5.2-5.7 0-2.8 1.4-5.8 2.1-7.6.9-2.2.8-3.1-.4-5-2.2-3.4-6-1-6 2.8 0 1.6.6 3.4.6 3.4s-2 8.5-2.5 10.4C9.5 43.8 19.3 55.4 29.5 55.4c11 0 20-8.9 20-20 0-11.1-9-22.2-20-23.3z" fill="url(#fireGradient)" transform="scale(0.9) translate(5,0)"/>
                                </g>
                                <text x="70" y="42" fontFamily="'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif" fontSize="38" fontWeight="bold">
                                    <tspan fill="url(#textGradient)">Fire</tspan>
                                    <tspan fill={darkMode ? "#FFFFFF" : "#1F2937"}>Social</tspan>
                                </text>
                            </svg>
                        </div>
                        <nav className="space-y-2">
                            <NavItem page="home" label="Home" icon={Home} current={activePage} onClick={handleHomePageSelect} />
                            <NavItem page="explore" label="Explore" icon={Compass} current={activePage} onClick={() => setActivePage('explore')} />
                            <NavItem page="notifications" label="Notifications" icon={Bell} current={activePage} onClick={() => setShowNotifications(true)} />
                            <NavItem page="messages" label="Messages" icon={Mail} current={activePage} onClick={() => setActivePage('messages')} />
                            <NavItem page="marketplace" label="Marketplace" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                            <NavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                        </nav>
                         <button onClick={() => setShowCreatePostModal(true)} className={`w-full text-center py-4 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg mt-4`}>
                            Create
                         </button>
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
                        <button className={`p-3 rounded-xl hover:bg-white/10 text-red-500`}><LogOut size={20} /></button>
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
                </aside>
            </div>
            
             <footer className={`lg:hidden fixed bottom-0 left-0 right-0 ${cardBg} backdrop-blur-xl border-t ${borderColor} shadow-t-lg z-50`}>
                <nav className="flex justify-around items-center h-16">
                    <MobileNavItem page="home" label="Home" icon={Home} current={activePage} onClick={handleHomePageSelect} />
                    <MobileNavItem page="explore" label="Explore" icon={Compass} current={activePage} onClick={() => setActivePage('explore')} />
                    
                    <button onClick={() => setShowCreatePostModal(true)} className={`w-16 h-16 -mt-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                        <Plus size={32} />
                    </button>

                    <MobileNavItem page="messages" label="DMs" icon={Mail} current={activePage} onClick={() => setActivePage('messages')} />
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
            {showSuggestions && <SuggestionsModal show={showSuggestions} onClose={() => setShowSuggestions(false)} suggestions={INITIAL_FRIEND_SUGGESTIONS} following={following} onFollowToggle={handleFollowToggle} onDismiss={()=>{}} onViewProfile={handleViewProfile} {...uiProps} />}
            {showNotifications && <NotificationsModal show={showNotifications} onClose={() => setShowNotifications(false)} notifications={INITIAL_NOTIFICATIONS} unreadCount={INITIAL_NOTIFICATIONS.filter(n=>!n.read).length} onMarkAllRead={()=>{}} onMarkOneRead={()=>{}} onViewNotification={(n) => {setShowNotifications(false); setViewingNotification(n);}} {...uiProps} />}
            {viewingNotification && <NotificationDetailModal show={!!viewingNotification} notification={viewingNotification} onClose={() => setViewingNotification(null)} allUsers={allUserListItems} posts={posts} onViewPost={(p)=>{setViewingNotification(null); setViewingPost(p);}} onViewProfile={(u)=>{setViewingNotification(null); handleViewProfile(u);}} {...uiProps} />}
            {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} profile={profile} onViewProfile={handleViewProfile} {...uiProps} />}
            {showAddProductModal && <AddProductModal show={showAddProductModal} onClose={() => setShowAddProductModal(false)} onAddProduct={handleAddNewProduct} {...uiProps} />}
            {showAICreator && <AICreatorModal show={showAICreator} onClose={() => setShowAICreator(false)} {...uiProps} />}
            {showGameCreator && <GameCreatorModal show={showGameCreator} onClose={() => setShowGameCreator(false)} onDeployGame={() => {}} {...uiProps} />}
            {showAIChatbot && <AIChatbotModal show={showAIChatbot} onClose={() => setShowAIChatbot(false)} {...uiProps} />}
            {showCreatePostModal && <CreatePostModal show={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} onAddPost={handleAddPost} profile={profile} {...uiProps} />}
        </div>
    );
};