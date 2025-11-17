import React, { useState } from 'react';
import { Profile, Post, Theme, Achievement, Comment, ScheduledPost, CreatorMonetization, SubscriptionTier, TipJar, Product } from '../types';
// Fix: Imported the 'Users' icon from lucide-react.
import { Edit3, Camera, Zap, Award, Link2, MapPin, Briefcase, GraduationCap, Github, Twitter, Linkedin, Globe, Heart, MessageSquare, MoreHorizontal, UserMinus, AlertTriangle, Instagram, Facebook, Film, Trash2, DollarSign, Settings, Star, Users, Bell } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

// --- SUB-COMPONENTS for Monetization ---

const SubscriptionBadge: React.FC<{ tier: SubscriptionTier, onClick?: () => void }> = ({ tier, onClick }) => (
    <button onClick={onClick} className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-white font-semibold cursor-pointer hover:shadow-lg transition-all ${tier.color}`}>
        <span>⭐</span>
        <span>{tier.name}</span>
        <span>${tier.price}/mo</span>
    </button>
);

const TipJarComponent: React.FC<{ tipJar: TipJar, onTip: (amount: number) => void, currentTheme: Theme, cardBg: string, borderColor: string }> = ({ tipJar, onTip, currentTheme, cardBg, borderColor }) => {
    const [customAmount, setCustomAmount] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    if (!tipJar.enabled) return null;

    const handleTip = (amount: number) => {
        onTip(amount);
        alert(`Thank you for the $${amount} tip! ❤️`);
    };

    return (
        <div className={`bg-gradient-to-br ${currentTheme.light} border ${borderColor} rounded-2xl p-6`}>
            <div className="text-center mb-4">
                <div className="text-4xl mb-2">💝</div>
                <h3 className="font-semibold text-gray-800">Support the Creator</h3>
                <p className="text-gray-600 text-sm">Show your appreciation with a tip</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                {tipJar.suggestedAmounts.map(amount => (
                    <button key={amount} onClick={() => handleTip(amount)} className={`bg-white/50 border ${borderColor} rounded-lg py-3 font-semibold text-gray-800 hover:bg-white/80 transition-all`}>
                        ${amount}
                    </button>
                ))}
            </div>

            {tipJar.customAmount && (
                showCustom ? (
                    <div className="space-y-3">
                        <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Enter custom amount" className={`w-full ${cardBg} border ${borderColor} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${currentTheme.ring}`} min="1" />
                        <div className="flex space-x-2">
                            <button onClick={() => { if (customAmount && Number(customAmount) > 0) { handleTip(Number(customAmount)); setCustomAmount(''); setShowCustom(false); } }} className={`flex-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white py-2 rounded-lg font-semibold transition-all`}>
                                Send Tip
                            </button>
                            <button onClick={() => setShowCustom(false)} className={`px-4 py-2 border ${borderColor} text-gray-700 rounded-lg hover:bg-white/20 transition-all`}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowCustom(true)} className={`w-full border-2 border-dashed ${borderColor} text-gray-600 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all`}>
                        Custom Amount
                    </button>
                )
            )}
        </div>
    );
};


const CreatorMonetizationDashboard: React.FC<{ monetization: CreatorMonetization, onUpdate: (updated: CreatorMonetization) => void, currentTheme: Theme, cardBg: string, borderColor: string, textColor: string, textSecondary: string, onAddNewProductClick: () => void }> = (props) => {
    const { monetization, onUpdate, currentTheme, cardBg, borderColor, textColor, textSecondary, onAddNewProductClick } = props;
    const [activeTab, setActiveTab] = useState('overview');

    if (!monetization.enabled) {
        return (
            <div className="p-12 text-center">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Earning on FireSocial</h3>
                <p className="text-gray-500 mb-6">Unlock subscription tiers, tips, paid posts, and digital products to monetize your content.</p>
                <button onClick={() => onUpdate({ ...monetization, enabled: true })} className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white px-8 py-3 rounded-lg font-semibold transition-all`}>
                    Get Started
                </button>
            </div>
        );
    }
    
    const StatCard: React.FC<{label: string, value: string | number, icon: React.ReactNode}> = ({label, value, icon}) => (
        <div className={`${cardBg} p-4 rounded-xl border ${borderColor}`}>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">{icon} {label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-500/20 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'overview' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary}`}`}>Overview</button>
                <button onClick={() => setActiveTab('subscriptions')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'subscriptions' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary}`}`}>Subscriptions</button>
                <button onClick={() => setActiveTab('tips')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'tips' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary}`}`}>Tip Jar</button>
                <button onClick={() => setActiveTab('products')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'products' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary}`}`}>Products</button>
            </div>
            
            {activeTab === 'overview' && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Available Balance" value={`$${monetization.balance}`} icon={<DollarSign size={16}/>} />
                <StatCard label="This Month" value={`$${monetization.analytics.monthlyEarnings.slice(-1)[0] || 0}`} icon={<DollarSign size={16}/>} />
                <StatCard label="Subscribers" value={monetization.subscriptionTiers.reduce((s, t) => s + t.subscriberCount, 0)} icon={<Users size={16}/>} />
                <StatCard label="Total Tips" value={monetization.tipJar.tipCount} icon={<Heart size={16}/>} />
            </div>}
            
            {activeTab === 'subscriptions' && <div className="space-y-4">
                <h3 className="font-bold text-lg">Your Subscription Tiers</h3>
                {monetization.subscriptionTiers.map(tier => (
                    <div key={tier.id} className={`p-4 rounded-xl border ${borderColor} flex justify-between items-center`}>
                        <div>
                            <p className="font-bold">{tier.name} - ${tier.price}/mo</p>
                            <p className="text-sm text-gray-400">{tier.subscriberCount} subscribers</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-500/50 hover:bg-white/10">Edit</button>
                    </div>
                ))}
                <button className={`w-full p-4 border-2 border-dashed ${borderColor} rounded-xl text-gray-400 hover:border-gray-400`}>+ Add New Tier</button>
            </div>}

            {activeTab === 'tips' && <div className="space-y-4">
                <h3 className="font-bold text-lg">Tip Jar Settings</h3>
                 <div className="flex justify-between items-center p-4 rounded-xl border border-gray-700">
                    <label htmlFor="tip-jar-enabled">Enable Tip Jar</label>
                    <button onClick={() => onUpdate({...monetization, tipJar: {...monetization.tipJar, enabled: !monetization.tipJar.enabled}})} className={`w-12 h-6 rounded-full transition-all ${monetization.tipJar.enabled ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${monetization.tipJar.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                <p>Suggested amounts: {monetization.tipJar.suggestedAmounts.map(a => `$${a}`).join(', ')}</p>
            </div>}

            {activeTab === 'products' && monetization.products && <div className="space-y-4">
                <h3 className="font-bold text-lg">Your Products for Sale</h3>
                {monetization.products.map(product => (
                    <div key={product.id} className={`p-4 rounded-xl border ${borderColor} flex justify-between items-center`}>
                        <div className="flex items-center gap-4">
                            <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                                <p className="font-bold">{product.name}</p>
                                <p className={`text-sm ${textSecondary}`}>${product.price} - {product.sales} sales</p>
                            </div>
                        </div>
                        <button className={`px-4 py-2 text-sm font-semibold rounded-lg border ${borderColor} hover:bg-white/10`}>Manage</button>
                    </div>
                ))}
                <button onClick={onAddNewProductClick} className={`w-full p-4 border-2 border-dashed ${borderColor} rounded-xl ${textSecondary} hover:border-gray-400`}>+ Add New Product</button>
            </div>}
        </div>
    );
};

// --- MAIN PROFILE PAGE ---

interface ProfilePageProps {
    profileToDisplay: Profile;
    isOwnProfile: boolean;
    posts: Post[];
    scheduledPosts: ScheduledPost[];
    onDeleteScheduledPost: (scheduledId: number) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onEditProfile: () => void;
    onFollow: (userId: number, username: string) => void;
    onBlockToggle: (userId: number, username: string) => void;
    isFollowing: boolean;
    isBlocked: boolean;
    onShowFollowers: () => void;
    onShowFollowing: () => void;
    onViewPost: (post: Post) => void;
    onViewComments: (post: Post) => void;
    onViewHashtag: (tag: string) => void;
    onViewProfile: (username: string) => void;
    onViewAchievements: () => void;
    onViewTrophies: () => void;
    onViewStreaks: () => void;
    onPurchasePost: (postId: number) => void;
    onShowAddProductModal: () => void;
    allAchievements: Achievement[];
    // UI Props
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    currentTheme: Theme;
}

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
    const { profileToDisplay, isOwnProfile, posts, scheduledPosts, onDeleteScheduledPost, activeTab, onTabChange, onEditProfile, onFollow, onBlockToggle, isFollowing, isBlocked, onShowFollowers, onShowFollowing, onViewPost, onViewComments, onViewHashtag, onViewProfile, allAchievements, cardBg, textColor, textSecondary, borderColor, currentTheme, onViewAchievements, onViewTrophies, onViewStreaks, onPurchasePost, onShowAddProductModal } = props;
    const [showProfileOptions, setShowProfileOptions] = useState(false);

    const getLinkIcon = (url: string, size: number = 20) => {
        try {
            const domain = new URL(url).hostname.toLowerCase();
            if (domain.includes('github.com')) return <Github size={size} />;
            if (domain.includes('twitter.com') || domain.includes('x.com')) return <Twitter size={size} />;
            if (domain.includes('linkedin.com')) return <Linkedin size={size} />;
            if (domain.includes('instagram.com')) return <Instagram size={size} />;
            if (domain.includes('facebook.com')) return <Facebook size={size} />;
            if (domain.includes('tiktok.com')) return <Film size={size} />; // Using Film as a placeholder for TikTok
            return <Globe size={size} />;
        } catch (e) {
            return <Link2 size={size} />;
        }
    };

    const handleBadgeClick = (badge: string) => {
        switch (badge) {
            case '🏆':
                onViewTrophies();
                break;
            case '⭐':
                onViewAchievements();
                break;
            case '🔥':
                onViewStreaks();
                break;
            default:
                break;
        }
    };
    
    const userPosts = posts.filter(p => p.username === profileToDisplay.username);
    const mediaPosts = userPosts.filter(p => p.media && p.media.length > 0);
    const bookmarkedPosts = posts.filter(p => p.bookmarked);
    const userComments = posts
        .flatMap(post => 
            (post.commentsData || []).map(comment => ({ comment, post }))
        )
        .filter(({ comment }) => comment.username === profileToDisplay.username)
        .sort((a, b) => b.comment.id - a.comment.id);

    const PostGridItem: React.FC<{post: Post}> = ({ post }) => (
        <div 
            className={`group aspect-square ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} hover:scale-105 transition-all cursor-pointer relative overflow-hidden`}
        >
            {post.media && post.media.length > 0 ? (
                post.media[0].type === 'image' ? (
                  <img src={post.media[0].url} alt="post media" className="w-full h-full object-cover" />
                ) : (
                  <video src={post.media[0].url} className="w-full h-full object-cover" />
                )
            ) : (
                <p className={`${textColor} text-sm line-clamp-4 p-4`}>{post.content}</p>
            )}

            <div 
                onClick={() => onViewPost(post)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-4"
            >
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><Heart size={16} /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={16} /> {post.comments}</span>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewComments(post);
                    }}
                    className="mt-4 bg-white/20 px-3 py-1 rounded-full text-xs"
                >
                    View Comments
                </button>
            </div>
        </div>
    );

    const CommentActivityItem: React.FC<{ comment: Comment; post: Post }> = ({ comment, post }) => (
        <div className={`p-4 rounded-2xl border ${borderColor} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
            <p className={`${textSecondary} text-sm mb-2`}>
                Commented on a post by <button onClick={() => onViewProfile(post.username)} className={`font-semibold ${textColor} hover:underline`}>{post.user}</button>
            </p>
            <div className={`p-3 rounded-xl border-l-4 ${borderColor} cursor-pointer bg-black/5 dark:bg-white/5`} onClick={() => onViewPost(post)}>
                <p className={`${textSecondary} text-sm line-clamp-2`}>{post.content}</p>
            </div>
            <div className="mt-3 flex gap-3">
                <AvatarDisplay avatar={comment.avatar} size="w-10 h-10" fontSize="text-xl" />
                <div className="flex-1 bg-black/5 dark:bg-white/10 p-3 rounded-xl">
                     <div className="flex items-center justify-between text-xs mb-1">
                        <p className={`font-semibold ${textColor}`}>{comment.username}</p>
                        <p className={textSecondary}>{comment.time}</p>
                     </div>
                    <p className={`${textColor} text-sm whitespace-pre-wrap`}>
                        {comment.replyTo && <span className={`font-semibold ${currentTheme.text} mr-1`}>{comment.replyTo}</span>}
                        {comment.text}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl overflow-hidden border ${borderColor} shadow-lg`}>
                <div className="h-48 relative bg-gray-500 dark:bg-gray-800">
                    {profileToDisplay.coverPhoto ? (
                        <img src={profileToDisplay.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full" style={{ background: profileToDisplay.wallpaper }}></div>
                    )}
                    {isOwnProfile && <button onClick={onEditProfile} className="absolute top-4 right-4 p-3 bg-black/30 backdrop-blur-sm rounded-full hover:scale-110 transition-all"><Camera size={20} className="text-white" /></button>}
                </div>
                <div className="p-6 -mt-16">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-4">
                        <div className="flex items-end gap-4">
                            <div className="relative">
                                <AvatarDisplay avatar={profileToDisplay.avatar} size="w-32 h-32" fontSize="text-7xl" className="bg-white/20 backdrop-blur-xl !rounded-3xl p-1 border-4 border-white shadow-xl" />
                                {profileToDisplay.online && <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>}
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1"><h2 className={`text-3xl font-bold ${textColor}`}>{profileToDisplay.name}</h2>{profileToDisplay.verified && <span className="text-blue-500 text-2xl">✓</span>}</div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className={textSecondary}>{profileToDisplay.username}</p>
                                    {profileToDisplay.showPronouns && profileToDisplay.pronouns && (<><span className={`${textSecondary} text-xs`}>•</span><p className={textSecondary}>{profileToDisplay.pronouns}</p></>)}
                                    {profileToDisplay.category && (<><span className={`${textSecondary} text-xs`}>•</span><p className={`${currentTheme.text} font-semibold text-sm`}>{profileToDisplay.category}</p></>)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                        {isOwnProfile ? (
                            <button onClick={onEditProfile} className={`px-6 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2`}><Edit3 size={18} />Edit Profile</button>
                        ) : (
                           <>
                            <button onClick={() => onFollow(profileToDisplay.id, profileToDisplay.username)} className={`px-8 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg ${isFollowing ? `${cardBg} ${textColor} border ${borderColor}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`}`}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <div className="relative">
                                <button onClick={() => setShowProfileOptions(s => !s)} className={`p-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg ${cardBg} ${textColor} border ${borderColor}`}>
                                    <MoreHorizontal size={20} />
                                </button>
                                {showProfileOptions && (
                                    <div className={`absolute right-0 mt-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-xl w-48 z-10 overflow-hidden`}>
                                        <button onClick={() => { onBlockToggle(profileToDisplay.id, profileToDisplay.username); setShowProfileOptions(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 text-red-500`}>
                                            <UserMinus size={16} />
                                            <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                                        </button>
                                        <button onClick={() => { alert('Reported'); setShowProfileOptions(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/10`}>
                                            <AlertTriangle size={16} />
                                            <span>Report</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                           </>
                        )}
                        </div>
                    </div>
                    <p className={`${textColor} mb-4`}>{profileToDisplay.bio}</p>

                    {profileToDisplay.isCreator && !isOwnProfile && profileToDisplay.creatorMonetization?.subscriptionTiers && (
                        <div className="mb-4">
                            <h3 className={`font-semibold ${textSecondary} mb-2 text-sm`}>Support {profileToDisplay.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {profileToDisplay.creatorMonetization.subscriptionTiers.map(tier => <SubscriptionBadge key={tier.id} tier={tier} />)}
                            </div>
                        </div>
                    )}
                    
                    {profileToDisplay.featuredHashtags && profileToDisplay.featuredHashtags.length > 0 && (<div className="flex flex-wrap gap-2 mb-4">{profileToDisplay.featuredHashtags.map(tag => (<button onClick={() => onViewHashtag(tag)} key={tag} className={`px-3 py-1 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} ${textSecondary} text-sm hover:bg-white/10`}>{tag}</button>))}</div>)}
                    {profileToDisplay.links && profileToDisplay.links.length > 0 && (<div className="flex items-center gap-4 mb-4">{profileToDisplay.links.map(link => (<a href={link.url} target="_blank" rel="noopener noreferrer" key={link.id} title={link.title} className={`${textSecondary} hover:scale-125 ${currentTheme.hoverText} transition-transform duration-200`}>{getLinkIcon(link.url, 24)}</a>))}</div>)}

                    <div className={`flex flex-wrap gap-x-6 gap-y-2 mb-6 ${textSecondary} text-sm`}>
                        {profileToDisplay.location && <div className="flex items-center gap-2"><MapPin size={16} /><span>{profileToDisplay.location}</span></div>}
                        {profileToDisplay.website && <a href={profileToDisplay.website} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 hover:underline ${currentTheme.hoverText}`}><Link2 size={16} /><span>{profileToDisplay.website.replace(/https?:\/\//, '')}</span></a>}
                        {profileToDisplay.work && <div className="flex items-center gap-2"><Briefcase size={16} /><span>{profileToDisplay.work}</span></div>}
                        {profileToDisplay.education && <div className="flex items-center gap-2"><GraduationCap size={16} /><span>{profileToDisplay.education}</span></div>}
                    </div>

                    <div className="flex gap-2 mb-6">
                        {profileToDisplay.badges.map((badge, i) => (
                            <button key={i} onClick={() => handleBadgeClick(badge)} className={`text-3xl p-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} hover:scale-110 transition-all cursor-pointer`}>
                                {badge}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                        <div><p className={`text-2xl font-bold ${textColor}`}>{profileToDisplay.posts}</p><p className={textSecondary}>Posts</p></div>
                        <button onClick={onShowFollowers} className="text-left cursor-pointer hover:scale-105 transition-all"><p className={`text-2xl font-bold ${textColor}`}>{profileToDisplay.followers.toLocaleString()}</p><p className={textSecondary}>Followers</p></button>
                        <button onClick={onShowFollowing} className="text-left cursor-pointer hover:scale-105 transition-all"><p className={`text-2xl font-bold ${textColor}`}>{profileToDisplay.following.toLocaleString()}</p><p className={textSecondary}>Following</p></button>
                        <div className="cursor-pointer hover:scale-105 transition-all"><p className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent flex items-center gap-1`}>{profileToDisplay.streak} <Zap size={20} /></p><p className={textSecondary}>Day Streak</p></div>
                    </div>
                     {!isOwnProfile && profileToDisplay.creatorMonetization?.tipJar && (
                        <TipJarComponent tipJar={profileToDisplay.creatorMonetization.tipJar} onTip={() => {}} currentTheme={currentTheme} cardBg={cardBg} borderColor={borderColor} />
                    )}
                </div>
            </div>
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <div className="flex gap-4 mb-6 border-b border-gray-500/20 overflow-x-auto">
                    <button onClick={() => onTabChange('posts')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'posts' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary} hover:${textColor}`}`}>Posts</button>
                    <button onClick={() => onTabChange('comments')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'comments' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary} hover:${textColor}`}`}>Comments</button>
                    <button onClick={() => onTabChange('media')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'media' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary} hover:${textColor}`}`}>Media</button>
                    {isOwnProfile && <button onClick={() => onTabChange('bookmarks')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'bookmarks' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary} hover:${textColor}`}`}>Bookmarks</button>}
                    {isOwnProfile && <button onClick={() => onTabChange('scheduled')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'scheduled' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary} hover:${textColor}`}`}>Scheduled</button>}
                    {isOwnProfile && profileToDisplay.isCreator && <button onClick={() => onTabChange('monetization')} className={`flex-shrink-0 pb-3 px-4 border-b-2 font-semibold ${activeTab === 'monetization' ? `${currentTheme.border} ${textColor}` : `border-transparent ${textSecondary} hover:${textColor}`}`}>Monetization</button>}
                </div>
                <div>
                    {activeTab === 'posts' && (userPosts.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{userPosts.map((post) => (<PostGridItem key={post.id} post={post} />))}</div> : <p className={`${textSecondary} text-center py-8`}>No posts yet.</p>)}
                    {activeTab === 'comments' && (userComments.length > 0 ? <div className="space-y-4">{userComments.map(({ comment, post }) => (<CommentActivityItem key={comment.id} comment={comment} post={post} />))}</div> : <p className={`${textSecondary} text-center py-8`}>No comments yet.</p>)}
                    {activeTab === 'media' && (mediaPosts.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{mediaPosts.map((post) => (<PostGridItem key={post.id} post={post} />))}</div> : <p className={`${textSecondary} text-center py-8`}>No media yet.</p>)}
                    {activeTab === 'bookmarks' && isOwnProfile && (bookmarkedPosts.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{bookmarkedPosts.map((post) => (<PostGridItem key={post.id} post={post} />))}</div> : <p className={`${textSecondary} text-center py-8`}>No bookmarked posts.</p>)}
                    {activeTab === 'scheduled' && isOwnProfile && (scheduledPosts.length > 0 ? (
                        <div className="space-y-4">
                            {scheduledPosts.map((sp) => (
                                <div key={sp.scheduledId} className={`p-4 rounded-2xl border ${borderColor} flex justify-between items-start`}>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold ${textSecondary}`}>Scheduled for: <span className={textColor}>{new Date(sp.scheduledTime).toLocaleString()}</span></p>
                                        <p className={`${textColor} mt-2 line-clamp-3`}>{sp.postData.content}</p>
                                    </div>
                                    <button onClick={() => onDeleteScheduledPost(sp.scheduledId)} className={`p-2 ml-2 ${textSecondary} hover:text-red-500 rounded-full hover:bg-red-500/10`}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : <p className={`${textSecondary} text-center py-8`}>You have no scheduled posts.</p>)}
                    {activeTab === 'monetization' && isOwnProfile && profileToDisplay.creatorMonetization && (
                        <CreatorMonetizationDashboard monetization={profileToDisplay.creatorMonetization} onUpdate={() => {}} currentTheme={currentTheme} cardBg={cardBg} borderColor={borderColor} textColor={textColor} textSecondary={textSecondary} onAddNewProductClick={onShowAddProductModal} />
                    )}
                </div>
            </div>
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <button onClick={onViewAchievements} className={`w-full text-left text-xl font-bold ${textColor} mb-4 flex items-center gap-2 rounded-lg -ml-2 p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}>
                    <Award size={24} /> Achievements
                </button>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allAchievements.map((achievement) => {
                        const isUnlocked = profileToDisplay.unlockedAchievements.includes(achievement.id);
                        return (
                            <div key={achievement.id} className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${borderColor} text-center hover:scale-105 transition-all cursor-pointer ${!isUnlocked ? 'opacity-40' : ''}`}>
                                <div className="text-4xl mb-2">{isUnlocked ? achievement.icon : '🔒'}</div>
                                <p className={`${textColor} font-semibold text-sm`}>{achievement.name}</p>
                                <p className={`${textSecondary} text-xs mt-1`}>{achievement.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;