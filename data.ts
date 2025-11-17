import { Post, Profile, Notification, Message, GroupChat, Story, FriendSuggestion, TrendingHashtag, LiveUser, UserListItem, Comment, ChatMessage, CreatorMonetization, Product } from './types';

export const LOGGED_IN_USER_USERNAME = '@pimpslap';
const LOGGED_IN_USER_ID = 1001;

export const INITIAL_MARKETPLACE_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Abstract Gradient Pack',
    description: 'A set of 20 high-resolution abstract gradients for backgrounds and branding projects. Includes JPEG and PNG formats.',
    price: 15,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=60', 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=800&q=60'],
    category: 'Digital',
    creatorId: 1002,
    creatorUsername: '@alexrivera',
    creatorAvatar: '🎨',
    stock: -1,
    sales: 125,
    rating: 4.8,
  },
  {
    id: 'prod_2',
    name: 'Minimalist Travel Poster',
    description: 'A beautiful, high-quality print of a minimalist travel poster featuring Bali. Perfect for home decor. Frame not included.',
    price: 35,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1588626242450-496225a02422?auto=format&fit=crop&w=800&q=60'],
    category: 'Art',
    creatorId: 1003,
    creatorUsername: '@jordanlee',
    creatorAvatar: '🚀',
    stock: 50,
    sales: 22,
    rating: 4.9,
  },
  {
    id: 'prod_3',
    name: 'FinTech App UI Kit',
    description: 'A comprehensive UI kit for Figma, designed for modern FinTech applications. Includes 50+ screens and a full design system.',
    price: 79,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=60'],
    category: 'Templates',
    creatorId: 1004,
    creatorUsername: '@taylorkim',
    creatorAvatar: '💼',
    stock: -1,
    sales: 48,
    rating: 5.0,
  },
    {
      id: 'prod_user_1',
      name: 'FireSocial UI Kit',
      description: 'The complete UI Kit for FireSocial, built in Figma. Perfect for designers and developers to kickstart their social media projects.',
      price: 49,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=60'],
      category: 'Templates',
      creatorId: LOGGED_IN_USER_ID,
      creatorUsername: LOGGED_IN_USER_USERNAME,
      creatorAvatar: '👤',
      stock: -1,
      sales: 32,
      rating: 4.9,
    }
];

export const INITIAL_CREATOR_MONETIZATION: CreatorMonetization = {
  enabled: true,
  subscriptionTiers: [
    {
      id: '1', name: 'Supporter', price: 5, currency: 'USD', description: 'Basic support with exclusive content',
      benefits: ['Exclusive posts', 'Behind-the-scenes content', 'Supporter badge'],
      color: 'bg-gradient-to-r from-blue-400 to-cyan-500', subscriberCount: 24
    },
    {
      id: '2', name: 'VIP', price: 15, currency: 'USD', description: 'Premium access with personal interaction',
      benefits: ['All Supporter benefits', 'Monthly Q&A sessions', 'Early access to content', 'Direct messaging'],
      color: 'bg-gradient-to-r from-purple-400 to-pink-500', subscriberCount: 8
    }
  ],
  tipJar: { enabled: true, suggestedAmounts: [3, 5, 10, 25], customAmount: true, totalTips: 245.50, tipCount: 42 },
  paidPosts: [
    // Fix: Removed invalid 'previewText' property.
    { id: 10, price: 3, currency: 'USD', purchaseCount: 28, revenue: 84 }
  ],
  products: [
    INITIAL_MARKETPLACE_PRODUCTS.find(p => p.id === 'prod_user_1')!
  ],
  analytics: {
    totalEarnings: 892.25,
    monthlyEarnings: [245, 312, 178, 157],
    topEarningPosts: [
      // Fix: Removed invalid 'previewText' property.
      { id: 10, price: 3, currency: 'USD', purchaseCount: 28, revenue: 84 }
    ],
    subscriberGrowth: [12, 18, 24, 32],
    tipHistory: [
      { date: '2024-01-15', amount: 10 },
      { date: '2024-01-14', amount: 5 },
      { date: '2024-01-13', amount: 25 },
    ]
  },
  payoutMethod: 'stripe', payoutEmail: 'payout@example.com', minimumPayout: 50, nextPayoutDate: '2024-02-01', balance: 342.75
};

export const ALL_USERS_DATA_BASE: Profile[] = [
    {
        id: LOGGED_IN_USER_ID,
        name: 'THOMAS DARROW',
        username: LOGGED_IN_USER_USERNAME,
        email: 'yourname@example.com',
        bio: 'CREATOR OF FIRESOCIAL',
        avatar: '👤',
        wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        coverPhoto: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        followers: 2,
        following: 2,
        posts: 2,
        badges: ['🏆', '⭐', '🔥'],
        streak: 15,
        online: true,
        verified: true,
        pronouns: 'they/them',
        showPronouns: true,
        links: [
            { id: 1, title: 'My Portfolio', url: 'https://example.com' },
            { id: 2, title: 'GitHub', url: 'https://github.com/scriptkilla' },
            { id: 3, title: 'Twitter', url: 'https://twitter.com/example' },
            { id: 4, title: 'LinkedIn', url: 'https://www.linkedin.com/in/example' },
            { id: 5, title: 'Instagram', url: 'https://www.instagram.com/example' },
            { id: 6, title: 'TikTok', url: 'https://www.tiktok.com/@example' },
            { id: 7, title: 'Facebook', url: 'https://www.facebook.com/example' },
        ],
        location: 'TUCSON ARIZONA',
        website: 'https://firesocial.dev',
        work: 'Lead Designer @ FireCreative',
        education: 'University of Design',
        privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
        notificationSettings: { push: true, email: false },
        contentPreferences: { favoriteTopics: ['#ReactJS', '#WebDev'], hiddenWords: ['politics', 'crypto'], sensitiveContent: 'blur' },
        category: 'Creator',
        featuredHashtags: ['#design', '#development', '#travel'],
        language: 'en-US',
        twoFactorEnabled: false,
        mutedAccounts: [],
        restrictedAccounts: [],
        blockedAccounts: [
            { id: 201, name: 'Blocked User 1', username: '@blocked1', avatar: '🚫', followedByYou: false },
        ],
        unlockedAchievements: ['first_post', '10_day_streak'],
        searchHistory: ['#design', 'ReactJS', '@alexrivera'],
        isCreator: true,
        creatorMonetization: INITIAL_CREATOR_MONETIZATION,
        purchasedPostIds: [],
    },
    {
        id: 1002,
        name: 'Alex Rivera',
        username: '@alexrivera',
        email: 'alex@example.com',
        bio: 'Digital artist & UI/UX designer. Making the web beautiful.',
        avatar: '🎨',
        coverPhoto: 'https://images.unsplash.com/photo-1554189097-90d836021d44?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        followers: 1250,
        following: 300,
        posts: 58,
        badges: ['🎨', '💡'],
        streak: 45,
        online: true,
        verified: false,
        location: 'Miami, FL',
        website: 'https://alexrivera.design',
        privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
        notificationSettings: { push: true, email: true },
        contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'allow' },
        language: 'en-US',
        twoFactorEnabled: false,
        mutedAccounts: [],
        restrictedAccounts: [],
        blockedAccounts: [],
        unlockedAchievements: ['first_post', '10_posts', '100_followers', '50_following', '10_day_streak'],
        searchHistory: [],
        purchasedPostIds: [10],
    },
    {
        id: 1003,
        name: 'Jordan Lee',
        username: '@jordanlee',
        email: 'jordan@example.com',
        bio: 'Exploring the world, one photo at a time. 🚀',
        avatar: '🚀',
        coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        followers: 5400,
        following: 120,
        posts: 210,
        badges: ['✈️', '📸', '🌍'],
        streak: 120,
        online: false,
        verified: true,
        location: 'Bali, Indonesia',
        website: 'https://jordanlee.photo',
        privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
        notificationSettings: { push: true, email: false },
        contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'allow' },
        language: 'en-US',
        twoFactorEnabled: false,
        mutedAccounts: [],
        restrictedAccounts: [],
        blockedAccounts: [],
        unlockedAchievements: ['first_post', '10_posts', '100_followers', '50_following', '10_day_streak', 'popular_post'],
        searchHistory: [],
        purchasedPostIds: [],
    },
    {
        id: 1004,
        name: 'Taylor Kim',
        username: '@taylorkim',
        email: 'taylor@example.com',
        bio: 'Building the future of finance. FinTech enthusiast.',
        avatar: '💼',
        coverPhoto: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        followers: 890,
        following: 550,
        posts: 32,
        badges: ['📈', '💡'],
        streak: 5,
        online: true,
        verified: false,
        location: 'New York, NY',
        privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
        notificationSettings: { push: false, email: true },
        contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'blur' },
        language: 'en-US',
        twoFactorEnabled: false,
        mutedAccounts: [],
        restrictedAccounts: [],
        blockedAccounts: [],
        unlockedAchievements: ['first_post', '10_posts', '100_followers', '50_following'],
        searchHistory: [],
        purchasedPostIds: [],
    },
    {
        id: 1005,
        name: 'Tech Weekly',
        username: '@techweekly',
        email: 'contact@techweekly.com',
        bio: 'The latest in tech news and reviews. Published weekly.',
        avatar: '💡',
        coverPhoto: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        followers: 50000,
        following: 1,
        posts: 150,
        badges: ['📰', '🚀'],
        streak: 365,
        online: true,
        verified: true,
        location: 'Internet',
        website: 'https://techweekly.example.com',
        privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true },
        notificationSettings: { push: true, email: false },
        contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'allow' },
        language: 'en-US',
        twoFactorEnabled: false,
        mutedAccounts: [],
        restrictedAccounts: [],
        blockedAccounts: [],
        unlockedAchievements: ['first_post', '10_posts', '100_followers', '10_day_streak', 'popular_post'],
        searchHistory: [],
        purchasedPostIds: [],
    },
    {
        id: 2001, name: 'Chris Brown', username: '@chrisbrown', avatar: '🎭', email: 'chris@example.com', bio: 'Actor and director.', followers: 1500, following: 200, posts: 45, badges: ['🎬'], streak: 22, online: true, verified: false, privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true }, notificationSettings: { push: true, email: false }, contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'allow' }, language: 'en-US', twoFactorEnabled: false, mutedAccounts: [], restrictedAccounts: [], blockedAccounts: [], unlockedAchievements: ['first_post', '10_posts', '100_followers', '50_following', '10_day_streak'],
        searchHistory: [],
        purchasedPostIds: [],
    },
    {
        id: 2002, name: 'Sam Wilson', username: '@samwilson', avatar: '🎪', email: 'sam@example.com', bio: 'Photographer.', followers: 900, following: 150, posts: 120, badges: ['📸'], streak: 12, online: false, verified: false, privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true }, notificationSettings: { push: true, email: false }, contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'allow' }, language: 'en-US', twoFactorEnabled: false, mutedAccounts: [], restrictedAccounts: [], blockedAccounts: [], unlockedAchievements: ['first_post', '10_posts', '100_followers', '50_following', '10_day_streak'],
        searchHistory: [],
        purchasedPostIds: [],
    },
    {
        id: 2003, name: 'Maya Patel', username: '@mayapatel', avatar: '🎯', email: 'maya@example.com', bio: 'AI researcher.', followers: 3200, following: 80, posts: 25, badges: ['🧠'], streak: 8, online: true, verified: true, privacySettings: { profilePublic: true, showOnlineStatus: true, allowTagging: true, showActivity: true, privateAccount: false, suggestAccount: true, activityStatus: true }, notificationSettings: { push: true, email: false }, contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'allow' }, language: 'en-US', twoFactorEnabled: false, mutedAccounts: [], restrictedAccounts: [], blockedAccounts: [], unlockedAchievements: ['first_post', '10_posts', '100_followers', '50_following'],
        searchHistory: [],
        purchasedPostIds: [],
    },
    {
        id: 201, name: 'Blocked User 1', username: '@blocked1', avatar: '🚫', email: 'blocked@example.com', bio: 'This user is blocked.', followers: 0, following: 0, posts: 0, badges: [], streak: 0, online: false, verified: false, privacySettings: { profilePublic: false, showOnlineStatus: false, allowTagging: false, showActivity: false, privateAccount: true, suggestAccount: false, activityStatus: false }, notificationSettings: { push: false, email: false }, contentPreferences: { favoriteTopics: [], hiddenWords: [], sensitiveContent: 'hide' }, language: 'en-US', twoFactorEnabled: false, mutedAccounts: [], restrictedAccounts: [], blockedAccounts: [], unlockedAchievements: [],
        searchHistory: [],
        purchasedPostIds: [],
    }
];

export const INITIAL_CHAT_HISTORY: Record<number, ChatMessage[]> = {
    1002: [
        ...Array.from({ length: 20 }).map((_, i) => ({
            id: 100 + i,
            type: 'text' as const,
            text: `This is an older message, number ${i + 1}, to test pagination.`,
            sentBy: (i % 2 === 0) ? 1002 : LOGGED_IN_USER_ID,
            time: `${20 - i}h ago`,
            status: 'read' as const,
        })),
        { id: 201, type: 'text', text: 'Hey! Did you see the new design?', sentBy: 1002, time: '2m ago', status: 'read' },
        { id: 202, type: 'text', text: 'Yeah, sending it over now.', sentBy: LOGGED_IN_USER_ID, time: '1m ago', status: 'read' },
        { id: 203, type: 'image', text: '', sentBy: LOGGED_IN_USER_ID, time: '1m ago', url: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=800&q=60', status: 'read' },
        { id: 204, type: 'text', text: 'Wow, that looks amazing! 🚀', sentBy: 1002, time: 'Just now', status: 'read', reactions: { '🚀': [LOGGED_IN_USER_USERNAME] } },
        { id: 205, type: 'text', text: 'Thanks! I was really trying to capture that new vibe we talked about.', sentBy: LOGGED_IN_USER_ID, time: 'Just now', status: 'read', replyTo: 204 },
        { id: 206, type: 'voice', text: '', sentBy: 1002, time: 'Just now', status: 'read', duration: '0:12', waveform: [0.1, 0.3, 0.5, 0.8, 0.6, 0.9, 0.7, 0.5, 0.4, 0.2, 0.3, 0.1, 0.1, 0.4, 0.3, 0.2] },
        { id: 207, type: 'file', text: '', sentBy: LOGGED_IN_USER_ID, time: 'Just now', status: 'delivered', fileName: 'Final_Proposal.pdf', fileSize: '2.3 MB' },

    ],
    1003: [
        { id: 301, type: 'text', text: 'Thanks for the feedback on the travel reel!', sentBy: 1003, time: '1h ago', status: 'read' },
        { id: 302, type: 'text', text: 'No problem, it was great!', sentBy: LOGGED_IN_USER_ID, time: '1h ago', status: 'read' },

    ],
    1004: [
        { id: 401, type: 'text', text: 'Meeting tomorrow at 3?', sentBy: 1004, time: '5h ago', status: 'read' },
        { id: 402, type: 'text', text: 'Sounds good, I\'ll be there.', sentBy: LOGGED_IN_USER_ID, time: '5h ago', status: 'read' },
        { id: 403, type: 'call', text: 'Video call started', sentBy: LOGGED_IN_USER_ID, time: '1h ago', callInfo: { type: 'video', status: 'started' } },
        { id: 404, type: 'call', text: 'Video call ended', sentBy: LOGGED_IN_USER_ID, time: '58m ago', callInfo: { type: 'video', status: 'ended', duration: '2:15' } },
    ],
};


export const INITIAL_COMMENTS: { [postId: number]: Comment[] } = {
    1: [
        { id: 101, userId: 1003, username: '@jordanlee', avatar: '🚀', text: 'Looks amazing, Alex!', time: '1h ago', likes: 5, isLiked: true },
        { id: 102, userId: 1004, username: '@taylorkim', avatar: '💼', text: 'Love the color palette you used. Great job!', time: '45m ago', likes: 2, isLiked: false },
        { id: 103, userId: LOGGED_IN_USER_ID, username: LOGGED_IN_USER_USERNAME, avatar: '👤', text: 'Great job!', time: 'Just now', likes: 0, isLiked: false, replyTo: '@jordanlee' },
    ],
    2: [
        { id: 201, userId: 1002, username: '@alexrivera', avatar: '🎨', text: 'Stunning shot! Where was this taken?', time: '3h ago', likes: 12, isLiked: true },
        { id: 202, userId: LOGGED_IN_USER_ID, username: LOGGED_IN_USER_USERNAME, avatar: '👤', text: 'Wow, incredible view.', time: '2h ago', likes: 8, isLiked: true },
        { id: 203, userId: 1003, username: '@jordanlee', avatar: '🚀', text: 'Thanks! This was in Uluwatu, Bali.', time: '2h ago', likes: 10, isLiked: false, replyTo: '@alexrivera' },
    ],
    3: [
        { id: 301, userId: 1002, username: '@alexrivera', avatar: '🎨', text: 'Welcome to FireSocial! 🎉', time: '23h ago', likes: 3, isLiked: false },
    ]
};

export const INITIAL_POSTS_BASE: Post[] = [
    { id: 1, userId: 1002, user: 'Alex Rivera', username: '@alexrivera', avatar: '🎨', content: 'Just launched my new portfolio! Check it out 🚀 #webdev #design #uidesign', likes: 42, comments: 3, shares: 5, time: '2h ago', reactions: { like: 30, love: 8, fire: 4 }, userReaction: null, bookmarked: false, views: 234, commentsData: INITIAL_COMMENTS[1], category: 'Art', location: 'Miami, FL' },
    { id: 2, userId: 1003, user: 'Jordan Lee', username: '@jordanlee', avatar: '🚀', content: 'Beautiful sunset today! Nature is amazing 🌅 #travel #photography #bali', media: [{type: 'image', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}], likes: 128, comments: 3, shares: 12, time: '4h ago', reactions: { like: 100, love: 20, fire: 8 }, userReaction: 'love', bookmarked: true, views: 892, commentsData: INITIAL_COMMENTS[2], category: 'Photography', location: 'Bali, Indonesia' },
    { id: 8, userId: 1002, user: 'Alex Rivera', username: '@alexrivera', avatar: '🎨', content: 'A few snaps from my recent design sprint. Which one is your favorite? #carousel #designprocess', media: [{type: 'image', url: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=800&q=60'}, {type: 'image', url: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&w=800&q=60'}, {type: 'image', url: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=800&q=60'}], likes: 76, comments: 12, shares: 8, time: '18h ago', reactions: {}, userReaction: null, bookmarked: false, views: 654, category: 'Art' },
    { id: 5, userId: 1005, user: 'Tech Weekly', username: '@techweekly', avatar: '💡', content: 'Our new AI assistant is now in public beta. Automate your workflow like never before! #AI #Tech', time: '5h ago', reactions: {}, userReaction: null, bookmarked: false, views: 1200, likes: 256, comments: 32, shares: 25, isSponsored: true, category: 'Tech'},
    { id: 3, userId: LOGGED_IN_USER_ID, user: 'THOMAS DARROW', username: LOGGED_IN_USER_USERNAME, avatar: '👤', content: 'My first post on FireSocial! 🔥 #newbeginnings', likes: 10, comments: 1, shares: 1, time: '1d ago', reactions: { like: 10 }, userReaction: null, bookmarked: false, views: 150, commentsData: INITIAL_COMMENTS[3], category: 'Lifestyle' },
    { id: 6, userId: LOGGED_IN_USER_ID, user: 'THOMAS DARROW', username: LOGGED_IN_USER_USERNAME, avatar: '👤', content: 'Exploring the new features. Polls are pretty cool!', type: 'poll', pollOptions: [{id: 1, text: 'Agree', votes: 12}, {id: 2, text: 'Disagree', votes: 3}], totalVotes: 15, userVoted: 1, time: '1d ago', reactions: {like: 5}, userReaction: null, bookmarked: true, views: 180, likes: 5, comments: 1, shares: 0, category: 'Tech' },
    { id: 9, userId: 1003, user: 'Jordan Lee', username: '@jordanlee', avatar: '🚀', content: 'Quick clip from today\'s drone flight! Check out that coastline. Thanks @alexrivera for the editing tips! #drone #video #ocean', media: [{type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4'}], postFormat: 'reel', likes: 215, comments: 25, shares: 30, time: '1d ago', reactions: {}, userReaction: null, bookmarked: false, views: 1500, category: 'Photography', location: 'Bali, Indonesia' },
    { id: 4, userId: 1004, user: 'Taylor Kim', username: '@taylorkim', avatar: '💼', content: 'Excited to announce our new project launch! 🎉 Shoutout to the entire team, especially @jordanlee for the amazing launch video.', likes: 89, comments: 22, shares: 18, time: '6h ago', reactions: { like: 60, love: 20, fire: 9 }, userReaction: null, bookmarked: false, views: 567, category: 'Business', location: 'New York, NY' },
    { id: 10, userId: LOGGED_IN_USER_ID, user: 'THOMAS DARROW', username: LOGGED_IN_USER_USERNAME, avatar: '👤', content: 'Here is my exclusive, paid content! This is a deep dive into advanced React patterns that will supercharge your applications. We cover custom hooks, performance optimization with memoization and virtual lists, and state management strategies for large-scale apps.', isPaid: true, paidInfo: { price: 3, currency: 'USD', purchasers: [1002, 1003] }, likes: 55, comments: 12, shares: 8, time: '2d ago', reactions: {}, userReaction: null, bookmarked: false, views: 350, category: 'Tech' },
    { id: 7, userId: 201, user: 'Blocked User 1', username: '@blocked1', avatar: '🚫', content: 'You should not see this post.', likes: 1, comments: 0, shares: 0, time: '1m ago', reactions: {}, userReaction: null, bookmarked: false, views: 1}
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: 1, type: 'like', user: 'Alex Rivera', username: '@alexrivera', content: 'liked your post', time: '5m ago', read: false, postId: 3 },
    { id: 2, type: 'comment', user: 'Jordan Lee', username: '@jordanlee', content: 'commented on your post', time: '1h ago', read: false, postId: 6 },
    { id: 3, type: 'follow', user: 'Taylor Kim', username: '@taylorkim', content: 'started following you', time: '3h ago', read: true },
    { id: 4, type: 'tag', user: 'Alex Rivera', username: '@alexrivera', content: 'tagged you in a post', time: '5h ago', read: false, postId: 1 }
];

export const INITIAL_MESSAGES: Message[] = [
    { id: 1, userId: 1002, user: 'Alex Rivera', username: '@alexrivera', avatar: '🎨', lastMessage: 'Sent a file.', time: 'Just now', unread: true, online: true, lastMessageType: 'file', lastMessageSentByYou: true },
    { id: 2, userId: 1003, user: 'Jordan Lee', username: '@jordanlee', avatar: '🚀', lastMessage: 'No problem, it was great!', time: '1h ago', unread: false, online: false, lastMessageType: 'text', lastMessageSentByYou: true },
    { id: 3, userId: 1004, user: 'Taylor Kim', username: '@taylorkim', avatar: '💼', lastMessage: 'Video call ended', time: '58m ago', unread: true, online: true, lastMessageType: 'call', lastMessageSentByYou: true }
];

export const INITIAL_GROUP_CHATS: GroupChat[] = [
    { id: 1, name: 'Design Team', avatar: '🎨', members: 5, lastMessage: 'New mockups uploaded', time: '10m ago', unread: 2 },
    { id: 2, name: 'Project Alpha', avatar: '🚀', members: 8, lastMessage: 'Meeting notes shared', time: '2h ago', unread: 0 }
];

export const INITIAL_STORIES: Story[] = [
    { 
      id: 1, 
      user: 'You', 
      username: LOGGED_IN_USER_USERNAME, 
      avatar: '👤', 
      media: [],
      isYours: true,
      timestamp: 'Just now',
      views: 124,
    },
    { 
      id: 2, 
      user: 'Alex Rivera', 
      username: '@alexrivera', 
      avatar: '🎨', 
      media: [
        { id: 201, type: 'image', url: 'https://images.unsplash.com/photo-1554189097-90d836021d44?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', duration: 7 },
        { id: 202, type: 'image', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80', duration: 10, poll: {
          question: 'New portfolio vibe?',
          options: [{id: 1, text: 'Clean & Minimal ✨', votes: 28}, {id: 2, text: 'Bold & Colorful 🎨', votes: 45}],
          totalVotes: 73,
          userVoted: null,
        }},
      ],
      isYours: false, 
      viewed: false,
      timestamp: '2h ago',
      isLive: true,
    },
    { 
      id: 3, 
      user: 'Jordan Lee', 
      username: '@jordanlee', 
      avatar: '🚀', 
      media: [
        { id: 301, type: 'image', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', duration: 7, link: 'https://unsplash.com' },
        { id: 302, type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', duration: 10 },
      ], 
      isYours: false, 
      viewed: true,
      timestamp: '5h ago',
    },
    { 
      id: 4, 
      user: 'Taylor Kim', 
      username: '@taylorkim', 
      avatar: '💼', 
      media: [
        { id: 401, type: 'image', url: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', duration: 7 },
      ],
      isYours: false, 
      viewed: true,
      timestamp: '10h ago',
    },
];

export const INITIAL_FRIEND_SUGGESTIONS: FriendSuggestion[] = [
    { id: 2001, name: 'Chris Brown', username: '@chrisbrown', avatar: '🎭', mutualFriends: 5, followed: false },
    { id: 2002, name: 'Sam Wilson', username: '@samwilson', avatar: '🎪', mutualFriends: 3, followed: false },
    { id: 2003, name: 'Maya Patel', username: '@mayapatel', avatar: '🎯', mutualFriends: 8, followed: false },
];

export const INITIAL_TRENDING_HASHTAGS: TrendingHashtag[] = [
    { tag: '#TechInnovation', posts: 125000 },
    { tag: '#DigitalArt', posts: 89000 },
    { tag: '#FutureOfWork', posts: 64000 },
];

export const INITIAL_LIVE_USERS: LiveUser[] = [
    { id: 1002, name: 'Alex Rivera', username: '@alexrivera', avatar: '🎨', viewers: 1200 },
];

export const ALL_USERS_DATA: Profile[] = ALL_USERS_DATA_BASE.map(p => ({...p}));
export const INITIAL_POSTS: Post[] = INITIAL_POSTS_BASE.map(p => ({...p}));

const loggedInUserFollowingIds = new Set([1002, 1003]);
const loggedInUserFollowersIds = new Set([1002, 1003]);

export const INITIAL_FOLLOWING: UserListItem[] = ALL_USERS_DATA
    .filter(u => loggedInUserFollowingIds.has(u.id))
    .map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followedByYou: true }));

export const INITIAL_FOLLOWERS: UserListItem[] = ALL_USERS_DATA
    .filter(u => loggedInUserFollowersIds.has(u.id))
    .map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followedByYou: loggedInUserFollowingIds.has(u.id) }));