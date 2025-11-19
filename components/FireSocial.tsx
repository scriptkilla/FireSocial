
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, Compass, MessageSquare, User, Settings, Sun, Moon, LogOut, BarChart2, Star, Zap, Award, ShoppingBag, Gamepad2, Bot, PlusSquare, Bell, Mail, Plus, TrendingUp, Search, ArrowRight, Loader2, Users, Check, X, GripVertical, Flame, MapPin, CloudSun, CloudRain, Wind, Droplets, Activity, Bitcoin, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Types and Constants
import { Post, Profile, Notification, Message, GroupChat, Story, FriendSuggestion, TrendingHashtag, LiveUser, UserListItem, Comment, ScheduledPost, ThemeColor, ChatMessage, ActiveCall, Product, MediaItem, Community, CommentAttachment, WalletTransaction } from '../types';
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
import CommunitiesModal from './CommunitiesModal';
import CommunityPage from './CommunityPage';
import CartModal from './CartModal';
import ShareModal from './ShareModal';
import TipModal from './TipModal';


type Page = 'home' | 'explore' | 'notifications' | 'messages' | 'profile' | 'marketplace' | 'achievements' | 'trophies' | 'streaks' | 'community';
type FollowListType = { type: 'followers' | 'following', user: Profile };

export const FireSocial: React.FC = () => {
    // --- AUTH CONTEXT ---
    const { user: authUser, logout } = useAuth();

    // --- STATE MANAGEMENT ---
    // Data states
    // Initialize profile with the authenticated user
    const [profile, setProfile] = useState<Profile>(() => {
        const p = authUser!;
        // Ensure messagingSettings exists even for older data
        if (!p.messagingSettings) {
            p.messagingSettings = { allowDirectMessages: 'everyone', readReceipts: true };
        }
        return p;
    }); 
    const [allUsers, setAllUsers] = useState<Profile[]>(ALL_USERS_DATA);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [following, setFollowing] = useState<UserListItem[]>(INITIAL_FOLLOWING);
    const [followers, setFollowers] = useState<UserListItem[]>(INITIAL_FOLLOWERS);
    const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
    const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>(INITIAL_MARKETPLACE_PRODUCTS);
    const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
    const [cart, setCart] = useState<Product[]>([]);

    // UI states
    const [activePage, setActivePage] = useState<Page>('home');
    const [themeColor, setThemeColor] = useState<ThemeColor>('orange');
    const [darkMode, setDarkMode] = useState(true);
    const [profileTab, setProfileTab] = useState('posts');
    const [homeSearchQuery, setHomeSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string } | null>(null);
    const [activeFeedTab, setActiveFeedTab] = useState('Discover');
    const [feedTabs, setFeedTabs] = useState(['Discover', 'Following']);
    
    // Pull to Refresh State
    const [pullStartY, setPullStartY] = useState(0);
    const [pullMoveY, setPullMoveY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pullThreshold = 100;

    // Modal states
    const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);
    const [viewingCommunity, setViewingCommunity] = useState<Community | null>(null);
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
    const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [sharePost, setSharePost] = useState<Post | null>(null);
    const [quotingPost, setQuotingPost] = useState<Post | null>(null);
    const [tipModalRecipient, setTipModalRecipient] = useState<Profile | null>(null);

    // Widget Layout State
    const [widgetOrder, setWidgetOrder] = useState<string[]>(['weather', 'stocks', 'crypto', 'trending', 'suggestions', 'communities']);
    const [dragEnabledIndex, setDragEnabledIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragNode = useRef<HTMLDivElement | null>(null);


    // --- DERIVED STATE & MEMOS ---
    const currentTheme = useMemo(() => THEMES[themeColor], [themeColor]);
    // Increased opacity for light mode to bg-white/80 for better readability against gradients
    const cardBg = useMemo(() => darkMode ? 'bg-gray-800/50' : 'bg-white/80', [darkMode]);
    const textColor = useMemo(() => darkMode ? 'text-white' : 'text-gray-900', [darkMode]);
    const textSecondary = useMemo(() => darkMode ? 'text-gray-400' : 'text-gray-600', [darkMode]);
    const borderColor = useMemo(() => darkMode ? 'border-white/10' : 'border-black/10', [darkMode]);
    const hoverBg = useMemo(() => darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5', [darkMode]);
    
    const allUserListItems: UserListItem[] = useMemo(() => allUsers.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followedByYou: following.some(f => f.id === u.id) })), [allUsers, following]);

    const blockedUserIds = useMemo(() => new Set(profile.blockedAccounts.map(u => u.id)), [profile.blockedAccounts]);
    
    const filteredPosts = useMemo(() => {
        return posts.filter(p => {
            // 1. Blocked Check
            if (blockedUserIds.has(p.userId)) return false;

            // 2. Search Query Check
            if (homeSearchQuery) {
                const query = homeSearchQuery.toLowerCase();
                const matchesSearch = (
                    p.content.toLowerCase().includes(query) ||
                    p.user.toLowerCase().includes(query) ||
                    p.username.toLowerCase().includes(query) ||
                    (p.category && p.category.toLowerCase().includes(query))
                );
                if (!matchesSearch) return false;
            }

            // 3. Tab Filter Check
            if (activeFeedTab === 'Discover') return true;
            if (activeFeedTab === 'Following') {
                return following.some(f => f.id === p.userId) || p.userId === profile.id;
            }
            // Custom tabs act as topic filters
            const tabLower = activeFeedTab.toLowerCase();
            return (
                p.content.toLowerCase().includes(tabLower) ||
                (p.category && p.category.toLowerCase() === tabLower)
            );
        });
    }, [posts, blockedUserIds, homeSearchQuery, activeFeedTab, following, profile.id]);

    const viewingProfile = useMemo(() => allUsers.find(u => u.username === viewingProfileUsername) || profile, [viewingProfileUsername, allUsers, profile]);
    const isFireFollowed = useMemo(() => following.some(u => u.id === viewingProfile.id && u.isFireFollowed), [following, viewingProfile]);
    
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    // --- EFFECTS ---
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    
    // Sync local profile state if auth user changes (though usually we just unmount)
    useEffect(() => {
        if (authUser) setProfile(authUser);
    }, [authUser]);

    // Scroll to top whenever the page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activePage, viewingProfileUsername, viewingCommunity]);

    // --- HANDLERS ---
    
    const showToast = (message: string) => {
        setToast({ message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddTab = () => {
        const newTab = window.prompt("Enter a topic or hashtag for the new tab:");
        if (newTab && !feedTabs.includes(newTab)) {
            setFeedTabs([...feedTabs, newTab]);
            setActiveFeedTab(newTab);
        }
    };

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
        
        // Select a random user (not the current profile)
        const availableUsers = allUsers.filter(u => u.id !== profile.id);
        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        
        const randomContent = [
             "Just spotted this amazing view! 🌅",
             "Who else is working on something cool this weekend?",
             "AI is changing the game rapidly. Thoughts? 🤖",
             "Coffee time! ☕ What's your go-to order?",
             "Just pushed a new update. Check it out! 🚀",
             "Can't believe how fast this week went by! 😅",
             "Exploring some new tech stacks today. #coding #devlife",
             "The community here is absolutely on fire! 🔥"
        ];
        const randomText = randomContent[Math.floor(Math.random() * randomContent.length)];

        const newPost: Post = {
            id: Date.now(),
            userId: randomUser.id,
            user: randomUser.name,
            username: randomUser.username,
            avatar: randomUser.avatar,
            content: randomText,
            likes: 0,
            comments: 0,
            shares: 0,
            time: 'Just now',
            reactions: {},
            userReaction: null,
            bookmarked: false,
            views: 0,
            category: 'Lifestyle'
        };

        setPosts(prev => [newPost, ...prev]);
        
        setIsRefreshing(false);
        setPullMoveY(0);
    };
    
    // Drag and Drop Handlers for Widgets
    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragItem.current = index;
        dragNode.current = e.currentTarget as HTMLDivElement;
        e.dataTransfer.effectAllowed = 'move';
        // Add opacity to the dragged element
        setTimeout(() => {
            if (dragNode.current) dragNode.current.classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        if (dragItem.current === null || dragItem.current === index) return;
        
        const newOrder = [...widgetOrder];
        const draggedItemContent = newOrder[dragItem.current];
        
        // Remove from old position
        newOrder.splice(dragItem.current, 1);
        // Insert at new position
        newOrder.splice(index, 0, draggedItemContent);
        
        dragItem.current = index;
        setWidgetOrder(newOrder);
    };
    
    const handleDragEnd = () => {
        dragItem.current = null;
        if (dragNode.current) dragNode.current.classList.remove('opacity-50');
        dragNode.current = null;
        setDragEnabledIndex(null);
    };


    const handleCreatePost = (content: string, media: MediaItem[], type: 'post' | 'poll', pollOptions?: string[], scheduledTime?: string) => {
        if (scheduledTime) {
            const newScheduledPost: ScheduledPost = {
                scheduledId: Date.now(),
                scheduledTime: scheduledTime,
                postData: {
                    userId: profile.id,
                    user: profile.name,
                    username: profile.username,
                    avatar: profile.avatar,
                    content: content,
                    media: media.length > 0 ? media : undefined,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    reactions: {},
                    userReaction: null,
                    bookmarked: false,
                    views: 0,
                    commentsData: [],
                    type: type,
                    pollOptions: pollOptions ? pollOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })) : undefined,
                    totalVotes: 0,
                    userVoted: null,
                    quotedPost: quotingPost || undefined
                }
            };
            setScheduledPosts(prev => [newScheduledPost, ...prev]);
            // Switch to profile scheduled tab to show the user
            setViewingProfileUsername(profile.username);
            setActivePage('profile');
            setProfileTab('scheduled');
            showToast("Post scheduled!");
        } else {
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
                userVoted: null,
                quotedPost: quotingPost || undefined
            };
            setPosts([newPost, ...posts]);
            setProfile(p => ({ ...p, posts: p.posts + 1 }));
            showToast("Post published!");
        }
        setQuotingPost(null);
    };
    
    const handleDeleteScheduledPost = (scheduledId: number) => {
        setScheduledPosts(prev => prev.filter(p => p.scheduledId !== scheduledId));
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
            if (viewingPost?.id === postId) setViewingPost(null);
        }
    };
    
    const handleReshare = () => {
        if (sharePost) {
            setPosts(prev => prev.map(p => p.id === sharePost.id ? { ...p, shares: p.shares + 1 } : p));
            showToast("Shared successfully!");
            // In a real app, we might create a new post that references this one.
        }
    };

    // New handler for instant repost from the dropdown
    const handleInstantRepost = (postId: number) => {
         setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
         showToast("Reposted to your feed!");
    };
    
    // New handler for quote post from the dropdown
    const handleQuotePost = (post: Post) => {
        setQuotingPost(post);
        setShowCreatePost(true);
    };

    const handleAddComment = (postId: number, commentText: string, replyToUsername?: string, attachment?: CommentAttachment) => {
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
                    replyTo: replyToUsername,
                    attachment: attachment
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
                setFollowing([...following, { id: userId, name: userToFollow.name, username: userToFollow.username, avatar: userToFollow.avatar, followedByYou: true, isFireFollowed: false }]);
            }
        }
    };

    const handleFireFollowToggle = (userId: number) => {
        setFollowing(prev => prev.map(u => 
            u.id === userId ? { ...u, isFireFollowed: !u.isFireFollowed } : u
        ));
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
    
    const handleMessageFromProfile = (user: Profile) => {
        const msgUser: Message = {
            id: Date.now(),
            userId: user.id,
            user: user.name,
            username: user.username,
            avatar: user.avatar,
            lastMessage: '',
            time: 'Now',
            unread: false,
            online: user.online,
            lastMessageType: 'text',
            lastMessageSentByYou: false
        };
        setMessageUser(msgUser);
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

    const handleAddToCart = (product: Product) => {
        setCart(prev => [...prev, product]);
        showToast("Added to cart!");
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(prev => {
            const index = prev.findIndex(item => item.id === productId);
            if (index !== -1) {
                const newCart = [...prev];
                newCart.splice(index, 1);
                return newCart;
            }
            return prev;
        });
    };
    
    const handleBoostPost = (postId: number) => {
        const cost = 50;
        if (profile.emberBalance >= cost) {
             setProfile(prev => ({ ...prev, emberBalance: prev.emberBalance - cost }));
             setPosts(posts.map(p => p.id === postId ? { ...p, isBoosted: true } : p));
             showToast(`Post boosted! Deducted ${cost} Embers.`);
        } else {
            alert("Not enough Embers to boost post!");
        }
    };

    const handleTipCreator = (amount: number) => {
        if (profile.emberBalance >= amount) {
            const newBalance = profile.emberBalance - amount;
            
            // Create sender transaction
            const sentTx: WalletTransaction = {
                id: `tx_${Date.now()}_sent`,
                type: 'tip_sent',
                amount: amount,
                date: new Date().toLocaleDateString(),
                status: 'completed',
                description: `Tip sent to ${viewingProfile.name}`
            };
            
            const updatedSenderMonetization = profile.creatorMonetization ? {
                ...profile.creatorMonetization,
                wallet: {
                    ...profile.creatorMonetization.wallet!,
                    transactions: [sentTx, ...(profile.creatorMonetization.wallet?.transactions || [])]
                }
            } : profile.creatorMonetization;

            setProfile(prev => ({ 
                ...prev, 
                emberBalance: newBalance,
                creatorMonetization: updatedSenderMonetization
            }));

            // Update Recipient (in global state)
            setAllUsers(prevUsers => prevUsers.map(u => {
                if (u.id === viewingProfile.id) {
                    const receivedTx: WalletTransaction = {
                        id: `tx_${Date.now()}_recv`,
                        type: 'tip_received',
                        amount: amount / 10, // Convert Ember to USD equivalent for creator earnings
                        date: new Date().toLocaleDateString(),
                        status: 'completed',
                        description: `Tip from ${profile.username}`
                    };
                    return {
                        ...u,
                        creatorMonetization: {
                            ...u.creatorMonetization!,
                            balance: (u.creatorMonetization?.balance || 0) + (amount / 10),
                            wallet: {
                                ...u.creatorMonetization?.wallet!,
                                transactions: [receivedTx, ...(u.creatorMonetization?.wallet?.transactions || [])]
                            }
                        }
                    };
                }
                return u;
            }));
            
            // Add notification for the user if self-tipping (testing) or simulate push
            const newNotification: Notification = {
                id: Date.now(),
                type: 'tip',
                user: profile.name,
                username: profile.username,
                content: `tipped you ${amount} Embers! 🔥`,
                time: 'Just now',
                read: false
            };

            if(viewingProfile.id === profile.id) {
                setNotifications(prev => [newNotification, ...prev]);
            }

             showToast(`Tipped ${amount} Embers!`);
        } else {
            alert("Not enough Embers!");
        }
    };

    const handlePostTip = (authorId: number) => {
        if (authorId === profile.id) {
            showToast("You can't tip yourself!");
            return;
        }
        
        const author = allUsers.find(u => u.id === authorId);
        if (author) {
            setTipModalRecipient(author);
        }
    };

    const handleConfirmTip = (amount: number) => {
        if (!tipModalRecipient) return;

        if (profile.emberBalance >= amount) {
            // Deduct from sender
            const sentTx: WalletTransaction = {
                id: `tx_${Date.now()}_sent`,
                type: 'tip_sent',
                amount: amount,
                date: new Date().toLocaleDateString(),
                status: 'completed',
                description: `Tip sent to ${tipModalRecipient.name}`
            };

            setProfile(prev => {
                const updatedMonetization = prev.creatorMonetization ? {
                    ...prev.creatorMonetization,
                    wallet: {
                        paymentMethods: prev.creatorMonetization.wallet?.paymentMethods || [],
                        transactions: [sentTx, ...(prev.creatorMonetization.wallet?.transactions || [])]
                    }
                } : prev.creatorMonetization;
                
                return { 
                    ...prev, 
                    emberBalance: prev.emberBalance - amount,
                    creatorMonetization: updatedMonetization
                };
            });
            
            // Add to recipient logic (simplified - updates local view of 'allUsers')
             setAllUsers(prevUsers => prevUsers.map(u => {
                if (u.id === tipModalRecipient.id) {
                    const receivedTx: WalletTransaction = {
                        id: `tx_${Date.now()}_recv`,
                        type: 'tip_received',
                        amount: amount / 10, 
                        date: new Date().toLocaleDateString(),
                        status: 'completed',
                        description: `Tip from ${profile.username}`
                    };
                    return {
                        ...u,
                        creatorMonetization: {
                            ...u.creatorMonetization!,
                            balance: (u.creatorMonetization?.balance || 0) + (amount / 10),
                             wallet: {
                                paymentMethods: u.creatorMonetization?.wallet?.paymentMethods || [],
                                transactions: [receivedTx, ...(u.creatorMonetization?.wallet?.transactions || [])]
                            }
                        }
                    };
                }
                return u;
            }));
            
            // Create notification for the sender (receipt)
            const newNotification: Notification = {
                id: Date.now(),
                type: 'tip',
                user: tipModalRecipient.name,
                username: tipModalRecipient.username,
                content: `received a tip of ${amount} Embers from you.`, // Clearer message
                time: 'Just now',
                read: false
            };
            setNotifications(prev => [newNotification, ...prev]);
            
            showToast(`Tipped ${amount} Embers to ${tipModalRecipient.name}! 💸`);
            setTipModalRecipient(null);
        } else {
            alert(`Not enough Embers. Balance: ${profile.emberBalance}`);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        
        // Calculate total in Ember (Rate: $1 = 10 Embers)
        const totalUSD = cart.reduce((sum, item) => sum + item.price, 0);
        const totalEmbers = totalUSD * 10;

        if (profile.emberBalance >= totalEmbers) {
             setProfile(prev => ({ ...prev, emberBalance: prev.emberBalance - totalEmbers }));
             alert(`Payment successful! Deducted ${totalEmbers.toFixed(0)} Embers.`);
             setCart([]);
             setShowCartModal(false);
        } else {
             alert(`Insufficient Ember balance. You need ${totalEmbers.toFixed(0)} Embers.`);
        }
    };
    
    const toggleJoinCommunity = (communityId: number) => {
        setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, joined: !c.joined } : c));
    };
    
    const handleViewCommunity = (community: Community) => {
        setViewingCommunity(community);
        setActivePage('community');
        setShowCommunitiesModal(false);
        window.scrollTo(0, 0);
    };

    const handleViewProfile = (username: string) => {
        // Close any open modals to ensure we see the profile page
        setCommentModalPost(null);
        setViewingPost(null);
        setViewingNotification(null);
        setViewingProduct(null);
        
        setViewingProfileUsername(username);
        setActivePage('profile');
        setProfileTab('posts');
        window.scrollTo(0, 0);
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
                    <span className={`text-xs font-medium ${textColor} w-20 truncate text-center`}>Your Story</span>
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
    
    // --- Sidebar Widget Rendering ---
    const renderWidget = (widgetId: string, index: number) => {
        const Grip = (
            <div 
                className={`p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing ${textSecondary} transition-colors`}
                onMouseEnter={() => setDragEnabledIndex(index)}
                onMouseLeave={() => setDragEnabledIndex(null)}
                title="Drag to reorder"
            >
                <GripVertical size={20} />
            </div>
        );

        switch(widgetId) {
            case 'weather':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} text-white relative overflow-hidden mb-4`}>
                        {/* Background gradient based on time/weather */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-80 dark:opacity-40"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2"><MapPin size={16}/> San Francisco</h3>
                                    <p className="text-xs opacity-80">California, USA</p>
                                </div>
                                {Grip}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-bold">72°</span>
                                    <span className="text-sm font-medium">Sunny</span>
                                </div>
                                <Sun size={48} className="text-yellow-300 animate-pulse" />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                                <div className="text-center">
                                    <Wind size={16} className="mx-auto mb-1 opacity-80"/>
                                    <span className="text-xs">8 mph</span>
                                </div>
                                <div className="text-center">
                                    <Droplets size={16} className="mx-auto mb-1 opacity-80"/>
                                    <span className="text-xs">42%</span>
                                </div>
                                <div className="text-center">
                                    <CloudRain size={16} className="mx-auto mb-1 opacity-80"/>
                                    <span className="text-xs">0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'stocks':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold flex items-center gap-2"><Activity size={18} /> Live Stocks</h3>
                            {Grip}
                        </div>
                        <div className="space-y-3">
                            {[
                                { sym: 'AAPL', name: 'Apple', price: '182.50', change: '+1.25%', up: true },
                                { sym: 'TSLA', name: 'Tesla', price: '175.30', change: '-2.40%', up: false },
                                { sym: 'NVDA', name: 'Nvidia', price: '890.00', change: '+3.10%', up: true },
                            ].map(stock => (
                                <div key={stock.sym} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${stock.up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {stock.sym}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${textColor}`}>{stock.name}</p>
                                            <p className={`text-xs ${textSecondary}`}>{stock.price}</p>
                                        </div>
                                    </div>
                                    <div className={`text-right ${stock.up ? 'text-green-500' : 'text-red-500'}`}>
                                        <p className="font-bold text-sm">{stock.change}</p>
                                        <p className="text-xs flex items-center justify-end gap-0.5">
                                            {stock.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'crypto':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold flex items-center gap-2"><Bitcoin size={18} /> Crypto</h3>
                            {Grip}
                        </div>
                        <div className="space-y-3">
                            {[
                                { sym: 'BTC', name: 'Bitcoin', price: '68,400', change: '+5.2%', up: true, icon: '₿' },
                                { sym: 'ETH', name: 'Ethereum', price: '3,500', change: '+2.1%', up: true, icon: 'Ξ' },
                                { sym: 'SOL', name: 'Solana', price: '145.20', change: '-0.8%', up: false, icon: '◎' },
                            ].map(coin => (
                                <div key={coin.sym} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br ${coin.sym === 'BTC' ? 'from-orange-400 to-yellow-500' : coin.sym === 'ETH' ? 'from-blue-400 to-purple-500' : 'from-purple-500 to-indigo-600'} text-white`}>
                                            {coin.icon}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${textColor}`}>{coin.name}</p>
                                            <p className={`text-xs ${textSecondary}`}>{coin.sym}</p>
                                        </div>
                                    </div>
                                    <div className={`text-right ${coin.up ? 'text-green-500' : 'text-red-500'}`}>
                                        <p className="font-bold text-sm">${coin.price}</p>
                                        <p className="text-xs flex items-center justify-end gap-0.5">
                                            {coin.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                                            {coin.change}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'trending':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Trending Topics</h3>
                            {Grip}
                        </div>
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
                );
            case 'suggestions':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold">Suggestions</h3>
                             {Grip}
                        </div>
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
                );
            case 'communities':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold flex items-center gap-2"><Users size={18} /> Communities</h3>
                             {Grip}
                        </div>
                        <div className="space-y-4">
                            {communities.slice(0, 3).map(group => (
                                <div key={group.id} 
                                     onClick={() => handleViewCommunity(group)}
                                     className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={group.image} alt={group.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <div>
                                            <p className={`font-semibold text-sm ${textColor} group-hover:${currentTheme.text} transition-colors`}>{group.name}</p>
                                            <p className={`text-xs ${textSecondary}`}>{group.members.toLocaleString()} members</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleJoinCommunity(group.id); }} 
                                        className={`p-2 rounded-full transition-all ${group.joined ? `${cardBg} border ${borderColor} ${textSecondary}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`}`}
                                    >
                                        {group.joined ? <Check size={14} /> : <Plus size={14} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowCommunitiesModal(true)} className={`mt-4 w-full text-center text-sm font-semibold ${currentTheme.text}`}>Explore More</button>
                    </div>
                );
            default: return null;
        }
    };

    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return (
                    <div 
                        className="space-y-6 touch-pan-y overscroll-none min-h-[80vh]"
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
                        
                        {/* Feed Tabs */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-2 no-scrollbar">
                            {feedTabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFeedTab(tab)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                        activeFeedTab === tab
                                            ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-md transform scale-105`
                                            : `${cardBg} border ${borderColor} ${textColor} hover:bg-white/10`
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button 
                                onClick={handleAddTab}
                                className={`p-2 rounded-full ${cardBg} border ${borderColor} ${textSecondary} hover:${textColor} hover:bg-white/10 transition-colors flex-shrink-0`}
                                title="Add Custom Feed"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => <PostComponent key={post.id} {...postComponentProps} post={post} />)
                        ) : (
                            <div className={`text-center py-10 ${textSecondary}`}>
                                <p>No posts found for "{activeFeedTab}"</p>
                            </div>
                        )}
                    </div>
                );
            case 'explore':
                return <ExplorePage posts={posts} profile={profile} allUsers={allUserListItems} trendingHashtags={INITIAL_TRENDING_HASHTAGS} following={following} onViewPost={setViewingPost} onViewProfile={handleViewProfile} onViewHashtag={(tag) => alert(`Viewing hashtag: ${tag}`)} textColor={textColor} textSecondary={textSecondary} cardBg={cardBg} borderColor={borderColor} currentTheme={currentTheme} />;
            case 'messages':
                return <MessagesPage messages={INITIAL_MESSAGES} groupChats={INITIAL_GROUP_CHATS} onViewMessage={setMessageUser} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />;
            case 'marketplace':
                return <MarketplacePage products={marketplaceProducts} onViewProduct={setViewingProduct} onViewProfile={handleViewProfile} onAddToCart={handleAddToCart} onOpenCart={() => setShowCartModal(true)} cartItemCount={cart.length} textColor={textColor} textSecondary={textSecondary} cardBg={cardBg} borderColor={borderColor} currentTheme={currentTheme} />;
            case 'profile':
                return <ProfilePage 
                    profileToDisplay={viewingProfile} 
                    isOwnProfile={viewingProfile.id === profile.id} 
                    posts={posts} 
                    scheduledPosts={scheduledPosts} 
                    onDeleteScheduledPost={handleDeleteScheduledPost} 
                    activeTab={profileTab} 
                    onTabChange={setProfileTab} 
                    onEditProfile={() => setShowEditProfile(true)} 
                    onFollow={handleFollowToggle}
                    onFireFollowToggle={handleFireFollowToggle}
                    isFireFollowed={isFireFollowed}
                    onBlockToggle={handleBlockToggle} 
                    isFollowing={following.some(u => u.id === viewingProfile.id)} 
                    isBlocked={blockedUserIds.has(viewingProfile.id)} 
                    onShowFollowers={() => setShowFollowList({type: 'followers', user: viewingProfile})} 
                    onShowFollowing={() => setShowFollowList({type: 'following', user: viewingProfile})} 
                    onViewPost={setViewingPost} 
                    onViewComments={setCommentModalPost} 
                    onViewHashtag={(tag) => alert(`Viewing hashtag: ${tag}`)} 
                    onViewProfile={handleViewProfile} 
                    onViewAchievements={() => setActivePage('achievements')} 
                    onViewTrophies={() => setActivePage('trophies')} 
                    onViewStreaks={() => setActivePage('streaks')} 
                    allAchievements={ALL_ACHIEVEMENTS} 
                    cardBg={cardBg} 
                    textColor={textColor} 
                    textSecondary={textSecondary} 
                    borderColor={borderColor} 
                    currentTheme={currentTheme} 
                    onPurchasePost={(id)=>alert(`Purchasing post ${id}`)} 
                    onShowAddProductModal={() => setShowAddProductModal(true)} 
                    onUpdateProfileMonetization={(updatedMonetization) => setProfile(prev => ({...prev, creatorMonetization: updatedMonetization}))}
                    onTip={handleTipCreator}
                    onMessage={handleMessageFromProfile}
                />;
            case 'achievements':
                return <AchievementsPage profile={viewingProfile} allAchievements={ALL_ACHIEVEMENTS} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'trophies':
                return <TrophyPage profile={viewingProfile} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'streaks':
                return <StreakPage profile={viewingProfile} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'community':
                return viewingCommunity ? (
                    <CommunityPage 
                        community={viewingCommunity} 
                        onBack={handleHomePageSelect} 
                        onJoinToggle={toggleJoinCommunity} 
                        posts={posts}
                        profile={profile}
                        allUsers={allUserListItems}
                        onReaction={handleReaction}
                        onBookmark={handleBookmark}
                        onDeletePost={handleDeletePost}
                        onViewPost={setViewingPost}
                        onViewComments={setCommentModalPost}
                        onAddComment={handleAddComment}
                        onShare={(post) => setSharePost(post)}
                        onViewProfile={handleViewProfile}
                        onViewHashtag={(tag) => alert(`Viewing ${tag}`)}
                        onRepost={handleInstantRepost}
                        onQuote={handleQuotePost}
                        reactions={REACTIONS}
                        messages={INITIAL_MESSAGES}
                        {...uiProps}
                    />
                ) : <div>Community not found</div>;
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
        onShare: (post: Post) => setSharePost(post),
        onRepost: handleInstantRepost,
        onQuote: handleQuotePost,
        onCopyLink: (id: number) => { navigator.clipboard.writeText(`https://firesocial.app/post/${id}`); showToast("Link copied!"); },
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
            showToast(`Purchased Post ${id}!`);
            setProfile(p => ({...p, purchasedPostIds: [...(p.purchasedPostIds || []), id]}));
        },
        onBoost: handleBoostPost,
        onTip: handlePostTip,
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
            
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                    <div className={`animate-in slide-in-from-top-2 fade-in duration-300 ${cardBg} backdrop-blur-xl border ${borderColor} px-6 py-3 rounded-full shadow-2xl flex items-center gap-3`}>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-1 rounded-full shadow-sm">
                            <Check size={16} strokeWidth={3} />
                        </div>
                        <span className={`font-bold text-sm ${textColor}`}>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="container mx-auto grid grid-cols-12 gap-8 items-start p-2 sm:p-4">
                <aside className="col-span-3 sticky top-4 hidden lg:flex flex-col gap-4">
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor}`}>
                        <div className="pl-2 mb-6 flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} shadow-lg relative overflow-hidden`}>
                                 {/* Glass overlay for logo */}
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-xl"></div>
                                <svg className="relative z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                            <NavItem page="marketplace" label="FireShop" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                            <NavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                        </nav>

                        <div className={`mt-4 p-4 rounded-2xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg`}>
                            <p className="text-xs font-medium opacity-80 mb-1">My Wallet</p>
                            <div className="flex items-center gap-2">
                                <Flame size={24} fill="currentColor" className="animate-pulse" />
                                <span className="text-2xl font-bold">{profile.emberBalance?.toLocaleString() || 0}</span>
                            </div>
                            <p className="text-xs opacity-80 mt-1">Embers Available</p>
                        </div>
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
                        <button onClick={() => setShowNotifications(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary} relative`}>
                            <Bell size={20} />
                            {unreadNotificationsCount > 0 && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></div>}
                        </button>
                        <button onClick={() => setShowSettings(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><Settings size={20} /></button>
                        <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                        <button onClick={() => setShowAnalytics(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><BarChart2 size={20} /></button>
                         <button onClick={() => setShowAIChatbot(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><Bot size={20} /></button>
                        <button onClick={logout} className={`p-3 rounded-xl hover:bg-white/10 text-red-500`} title="Log Out"><LogOut size={20} /></button>
                    </div>

                    {/* Reorderable Widgets */}
                    {widgetOrder.map((widgetId, index) => (
                        <div
                            key={widgetId}
                            draggable={dragEnabledIndex === index}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
                            className={`transition-all duration-200 ${dragItem.current === index ? 'opacity-50' : ''}`}
                        >
                            {renderWidget(widgetId, index)}
                        </div>
                    ))}
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
                    <MobileNavItem page="marketplace" label="FireShop" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                    <MobileNavItem page="ai-creator" label="AI Create" icon={Bot} current={activePage} onClick={() => setShowAICreator(true)} />
                    <MobileNavItem page="game-studio" label="Games" icon={Gamepad2} current={activePage} onClick={() => setShowGameCreator(true)} />
                    <MobileNavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                </nav>
            </footer>

            {/* Modals */}
            {showSettings && <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} profile={profile} setProfile={setProfile} onEditProfile={() => {setShowSettings(false); setShowEditProfile(true);}} setThemeColor={setThemeColor} allUsers={allUserListItems} onBlockToggle={handleBlockToggle} themeColor={themeColor} darkMode={darkMode} {...uiProps} />}
            {showEditProfile && <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} onSave={handleSaveProfile} {...uiProps} />}
            {showFollowList && <FollowListModal listType={showFollowList.type} onClose={() => setShowFollowList(null)} followers={followers} following={following} onFollowToggle={handleFollowToggle} onFireFollowToggle={handleFireFollowToggle} onViewProfile={handleViewProfile} {...uiProps} />}
            
            {/* Viewing Post Modal */}
            {viewingPost && (
                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setViewingPost(null)}>
                    <div className="relative w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setViewingPost(null)} 
                            className="absolute -top-12 right-0 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                        >
                            <X size={24} />
                        </button>
                         <PostComponent 
                            {...postComponentProps} 
                            post={viewingPost}
                            isFollowing={following.some(u => u.id === viewingPost.userId)}
                            isBlocked={blockedUserIds.has(viewingPost.userId)}
                        />
                    </div>
                </div>
            )}

            {commentModalPost && <CommentModal post={commentModalPost} profile={profile} onClose={() => setCommentModalPost(null)} onAddComment={handleAddComment} onLikeComment={()=>{}} onDeleteComment={()=>{}} onEditComment={()=>{}} allUsers={allUserListItems} onViewProfile={handleViewProfile} {...uiProps} />}
            {messageUser && <MessageModal isOpen={!!messageUser} onClose={() => setMessageUser(null)} messageUser={messageUser} profile={profile} chatHistory={chatHistories[messageUser.userId] || []} onSendMessage={handleSendMessage} onDeleteMessage={()=>{}} onEditMessage={()=>{}} onReactToMessage={()=>{}} onStartCall={(user, type) => setActiveCall({ user, type })} {...uiProps} />}
            {activeCall && <CallModal call={activeCall} onEndCall={() => setActiveCall(null)} {...uiProps} />}
            {viewingStory && <StoryViewerModal stories={INITIAL_STORIES} startUser={viewingStory} profile={profile} onClose={() => setViewingStory(null)} onDeleteStory={()=>{}} />}
            {showAnalytics && <AnalyticsModal show={showAnalytics} onClose={() => setShowAnalytics(false)} profile={profile} posts={posts} followers={followers} {...uiProps} />}
            {showCreateStory && <CreateStoryModal show={showCreateStory} onClose={() => setShowCreateStory(false)} onCreate={()=>{}} {...uiProps} />}
            {showCreatePost && <CreatePostModal show={showCreatePost} onClose={() => {setShowCreatePost(false); setQuotingPost(null);}} onCreatePost={handleCreatePost} profile={profile} quotingPost={quotingPost} {...uiProps} />}
            {showSuggestions && <SuggestionsModal show={showSuggestions} onClose={() => setShowSuggestions(false)} suggestions={INITIAL_FRIEND_SUGGESTIONS} following={following} onFollowToggle={handleFollowToggle} onDismiss={()=>{}} onViewProfile={handleViewProfile} {...uiProps} />}
            {showNotifications && <NotificationsModal show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} unreadCount={notifications.filter(n=>!n.read).length} onMarkAllRead={()=>{}} onMarkOneRead={()=>{}} onViewNotification={(n) => {setShowNotifications(false); setViewingNotification(n);}} {...uiProps} />}
            {viewingNotification && <NotificationDetailModal show={!!viewingNotification} notification={viewingNotification} onClose={() => setViewingNotification(null)} allUsers={allUserListItems} posts={posts} onViewPost={(p)=>{setViewingNotification(null); setViewingPost(p);}} onViewProfile={(u)=>{setViewingNotification(null); handleViewProfile(u);}} {...uiProps} />}
            {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} profile={profile} onViewProfile={handleViewProfile} onAddToCart={handleAddToCart} {...uiProps} />}
            {showAddProductModal && <AddProductModal show={showAddProductModal} onClose={() => setShowAddProductModal(false)} onAddProduct={handleAddNewProduct} {...uiProps} />}
            {showAICreator && <AICreatorModal show={showAICreator} onClose={() => setShowAICreator(false)} {...uiProps} />}
            {showGameCreator && <GameCreatorModal show={showGameCreator} onClose={() => setShowGameCreator(false)} onDeployGame={() => {}} {...uiProps} />}
            {showAIChatbot && <AIChatbotModal show={showAIChatbot} onClose={() => setShowAIChatbot(false)} {...uiProps} />}
            {showCommunitiesModal && <CommunitiesModal show={showCommunitiesModal} onClose={() => setShowCommunitiesModal(false)} communities={communities} onJoinToggle={toggleJoinCommunity} onViewCommunity={handleViewCommunity} {...uiProps} />}
            {showCartModal && <CartModal show={showCartModal} onClose={() => setShowCartModal(false)} cartItems={cart} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} {...uiProps} />}
            {sharePost && <ShareModal show={!!sharePost} onClose={() => setSharePost(null)} post={sharePost} onReshare={handleReshare} {...uiProps} />}
            <TipModal show={!!tipModalRecipient} onClose={() => setTipModalRecipient(null)} recipient={tipModalRecipient} onConfirm={handleConfirmTip} balance={profile.emberBalance} {...uiProps} />
        </div>
    );
};
