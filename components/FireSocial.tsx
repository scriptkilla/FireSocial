
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, MessageCircle, Bell, User, Settings, Moon, Sun, Image, X, Search, UserPlus, TrendingUp, Bookmark, BarChart3, Award, Video, Radio, Zap, Send, LogOut, Plus, Eye, Compass, ChevronLeft, CornerDownLeft, Users, FileText, History, Edit2, PlusCircle, Trash2, ArrowLeft, Gamepad2, Bot } from 'lucide-react';
import { THEMES, REACTIONS, ALL_ACHIEVEMENTS } from '../constants';
import { Notification, Message, GroupChat, Post, Story, Profile, FriendSuggestion, TrendingHashtag, LiveUser, ThemeColor, UserListItem, Theme, Comment, Achievement, ChatMessage, ActiveCall, MediaItem, StoryItem } from '../types';
// Fix: Corrected typo in constant name from INITIAL_TRENDING_HASHASHTAGS to INITIAL_TRENDING_HASHTAGS.
import { ALL_USERS_DATA, LOGGED_IN_USER_USERNAME, INITIAL_POSTS, INITIAL_NOTIFICATIONS, INITIAL_MESSAGES, INITIAL_CHAT_HISTORY, INITIAL_GROUP_CHATS, INITIAL_STORIES, INITIAL_FRIEND_SUGGESTIONS, INITIAL_TRENDING_HASHTAGS, INITIAL_LIVE_USERS, INITIAL_FOLLOWERS, INITIAL_FOLLOWING } from '../data';
// Fix: Changed the import to a named import as SettingsModal does not have a default export.
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


const FireSocial: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('feed');
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState<ThemeColor>('orange');
  const [profile, setProfile] = useState<Profile>(ALL_USERS_DATA.find(p => p.username === LOGGED_IN_USER_USERNAME)!);
  
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS.filter(n => !profile.blockedAccounts.some(b => b.username === n.username)));
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES.filter(m => !profile.blockedAccounts.some(b => b.username === m.username)));
  const [groupChats, setGroupChats] = useState<GroupChat[]>(INITIAL_GROUP_CHATS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES.filter(s => !profile.blockedAccounts.some(b => b.username === s.username)));
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
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestion[]>(INITIAL_FRIEND_SUGGESTIONS.filter(fs => !profile.blockedAccounts.some(b => b.id === fs.id)));
  // Fix: Corrected typo in constant name from INITIAL_TRENDING_HASHASHTAGS to INITIAL_TRENDING_HASHTAGS.
  const [trendingHashtags] = useState<TrendingHashtag[]>(INITIAL_TRENDING_HASHTAGS);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [liveUsers] = useState<LiveUser[]>(INITIAL_LIVE_USERS.filter(l => !profile.blockedAccounts.some(b => b.username === l.username)));
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);
  const [activeFeedTab, setActiveFeedTab] = useState('discover');

  // Messaging State
  const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Page State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFollowList, setShowFollowList] = useState<'followers' | 'following' | null>(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('posts');
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [viewingCommentsForPost, setViewingCommentsForPost] = useState<Post | null>(null);
  const [viewingHashtag, setViewingHashtag] = useState<string | null>(null);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [showGameCreator, setShowGameCreator] = useState(false);
  const [showAIChatbot, setShowAIChatbot] = useState(false);


  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ users: UserListItem[], posts: Post[] } | null>(null);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const [followers, setFollowers] = useState<UserListItem[]>(INITIAL_FOLLOWERS);
  const [following, setFollowing] = useState<UserListItem[]>(INITIAL_FOLLOWING);

  const allUsers: UserListItem[] = ALL_USERS_DATA.map(p => ({ id: p.id, name: p.name, username: p.username, avatar: p.avatar, followedByYou: following.some(f => f.id === p.id) }));

  const currentTheme = THEMES[themeColor];
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchHistory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const showAchievementToast = (achievement: Achievement) => {
    setAchievementToast(achievement);
    setTimeout(() => {
      setAchievementToast(null);
    }, 5000);
  };

  const checkAndUnlockAchievements = (userProfile: Profile, userPosts: Post[]) => {
    let newlyUnlocked: string[] = [];
  
    ALL_ACHIEVEMENTS.forEach(achievement => {
      if (!userProfile.unlockedAchievements.includes(achievement.id)) {
        let isUnlocked = false;
        switch (achievement.id) {
          case 'first_post':
            if (userPosts.length >= 1) isUnlocked = true;
            break;
          case '10_posts':
            if (userPosts.length >= 10) isUnlocked = true;
            break;
          case '100_followers':
            if (userProfile.followers >= 100) isUnlocked = true;
            break;
          case '50_following':
            if (userProfile.following >= 50) isUnlocked = true;
            break;
          case '10_day_streak':
            if (userProfile.streak >= 10) isUnlocked = true;
            break;
          case 'popular_post':
            if (userPosts.some(p => p.likes >= 100)) isUnlocked = true;
            break;
        }
  
        if (isUnlocked) {
          newlyUnlocked.push(achievement.id);
          // Only show toast for the logged-in user's achievements
          if (userProfile.id === profile.id) {
            showAchievementToast(achievement);
          }
        }
      }
    });
  
    if (newlyUnlocked.length > 0) {
      return { ...userProfile, unlockedAchievements: [...userProfile.unlockedAchievements, ...newlyUnlocked] };
    }
    return userProfile;
  };
  
  const { posts: profilePostsCount, followers: profileFollowersCount, following: profileFollowingCount, streak: profileStreak, unlockedAchievements } = profile;

  useEffect(() => {
      const userPosts = posts.filter(p => p.username === profile.username);
      const updatedProfile = checkAndUnlockAchievements(profile, userPosts);
      
      if (updatedProfile.unlockedAchievements.length > profile.unlockedAchievements.length) {
          setProfile(updatedProfile);
      }
  }, [posts, profilePostsCount, profileFollowersCount, profileFollowingCount, profileStreak, unlockedAchievements.length]);

  const handleSetCurrentPage = (page: string) => {
    if (page !== 'profile') setViewingProfile(null);
    if (page === 'profile' && viewingProfile?.username === profile.username) setViewingProfile(null);
    setViewingHashtag(null); // Clear hashtag view on page change
    setIsSearching(false); // Exit search on page change
    setCurrentPage(page);
  };

  const handleReaction = (postId: number, reactionType: string) => {
    let updatedPosts: Post[] = [];
    const updatePostReaction = (p: Post) => {
      if (p.id === postId) {
        const newReactions = { ...p.reactions }; let likesAdjustment = 0;
        if (p.userReaction) { newReactions[p.userReaction]--; likesAdjustment = -1; }
        if (p.userReaction === reactionType) { return { ...p, userReaction: null, reactions: newReactions, likes: p.likes + likesAdjustment }; } 
        else { newReactions[reactionType] = (newReactions[reactionType] || 0) + 1; return { ...p, userReaction: reactionType, reactions: newReactions, likes: p.likes + likesAdjustment + 1 }; }
      }
      return p;
    };
    updatedPosts = posts.map(updatePostReaction);
    setPosts(updatedPosts);
    if (viewingPost?.id === postId) { setViewingPost(updatePostReaction(viewingPost)); }
  };

  const handleBookmark = (postId: number) => {
    const updatePostBookmark = (p: Post) => p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p;
    setPosts(posts.map(updatePostBookmark));
    if (viewingPost?.id === postId) { setViewingPost(updatePostBookmark(viewingPost)); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Fix: Explicitly type `file` as `File` to resolve type inference issues where it was treated as `unknown`.
    files.forEach((file: File) => {
        const reader = new FileReader();
        // Fix: Used a type guard to safely handle the FileReader result. This avoids unsafe type assertions and ensures the result is a string.
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target && typeof event.target.result === 'string') {
                const url = event.target.result;
                const type = file.type.startsWith('image') ? 'image' : 'video';
                setNewPostMedia(prev => [...prev, { type, url }]);
            }
        };
        reader.readAsDataURL(file);
    });
    // Reset file input value to allow selecting the same file again
    if (e.target) e.target.value = '';
  };

  const handleRemoveMedia = (index: number) => {
    setNewPostMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    if (newPost.trim() || newPostMedia.length > 0) {
      const post: Post = { id: Date.now(), userId: profile.id, user: profile.name, username: profile.username, avatar: profile.avatar, content: newPost, likes: 0, comments: 0, shares: 0, time: 'Just now', reactions: { like: 0, love: 0, fire: 0 }, userReaction: null, bookmarked: false, views: 0, media: newPostMedia };
      setPosts([post, ...posts]);
      setProfile(p => ({ ...p, posts: p.posts + 1 }));
      setNewPost('');
      setNewPostMedia([]);
    }
  };

  const handleNewPostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewPost(text);

    const cursorPosition = e.target.selectionStart;
    const textUpToCursor = text.substring(0, cursorPosition);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setNewPostMentionQuery(mentionMatch[1]);
    } else {
      setNewPostMentionQuery(null);
    }
  };

  const handleNewPostMentionSelect = (username: string) => {
    const textarea = newPostTextareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const text = newPost;
    const textUpToCursor = text.substring(0, cursorPosition);
    const lastAt = textUpToCursor.lastIndexOf('@');
    
    if (lastAt !== -1) {
        const preMention = text.substring(0, lastAt);
        const postMention = text.substring(cursorPosition);
        
        const newText = `${preMention}${username} ${postMention}`;
        setNewPost(newText);
        
        setTimeout(() => {
            textarea.focus();
            const newCursorPosition = (preMention + username).length + 1;
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }
    setNewPostMentionQuery(null);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
        setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
        setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim());
    if (newPost.trim() && validOptions.length >= 2) {
      const poll: Post = { id: Date.now(), userId: profile.id, user: profile.name, username: profile.username, avatar: profile.avatar, content: newPost, type: 'poll', pollOptions: validOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })), totalVotes: 0, userVoted: null, time: 'Just now', likes: 0, comments: 0, shares: 0, reactions: { like: 0, love: 0, fire: 0 }, userReaction: null, views: 0, bookmarked: false };
      setPosts([poll, ...posts]);
      setProfile(p => ({ ...p, posts: p.posts + 1 }));
      setNewPost('');
      setPollOptions(['', '']);
      setShowCreatePoll(false);
    }
  };

  const handleVotePoll = (postId: number, optionId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.type === 'poll') {
        const newOptions = post.pollOptions?.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
        return { ...post, pollOptions: newOptions, totalVotes: (post.totalVotes ?? 0) + 1, userVoted: optionId };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: number) => {
    const postToDelete = posts.find(p => p.id === postId);
    if(postToDelete?.user === profile.name){ setProfile(p => ({...p, posts: p.posts - 1})); }
    setPosts(posts.filter(p => p.id !== postId));
    if(viewingPost?.id === postId){ setViewingPost(null); }
  };

  const handleCreateStory = (media: StoryItem) => {
    setStories(prev => 
        prev.map(s => 
            s.isYours ? { ...s, media: [...s.media, { ...media, id: Date.now() }] } : s
        )
    );
    setShowCreateStory(false);
  };

  const handleDeleteStory = (storyId: number, mediaId: number) => {
    setStories(prev => prev.map(s => {
        if (s.id === storyId && s.isYours) {
            return { ...s, media: s.media.filter(m => m.id !== mediaId) };
        }
        return s;
    }));
    setViewingStoriesForUser(null);
  };

  const handleStoryClick = (story: Story) => {
    if (story.media.length > 0) {
        setViewingStoriesForUser(story);
    } else if (story.isYours) {
        setShowCreateStory(true);
    } else {
        handleViewProfile(story.username);
    }
  };

  const handleMarkOneNotificationRead = (id: number) => { setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n)); };
  const handleMarkAllNotificationsRead = () => { setNotifications(notifications.map(n => ({...n, read: true}))); };

  const handleMarkChatAsRead = (userId: number) => {
    setMessages(prevMessages => 
        prevMessages.map(msg => 
            msg.userId === userId && msg.unread ? { ...msg, unread: false } : msg
        )
    );
  };

  const addMessageToHistory = (userId: number, message: ChatMessage) => {
    setChatHistories(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), message]
    }));
    // Also update the conversation list view
    setMessages(prev => {
        const otherMessages = prev.filter(m => m.userId !== userId);
        const currentChat = prev.find(m => m.userId === userId);
        if (!currentChat) return prev; // Should not happen
        
        const updatedMessage = {
            ...currentChat,
            lastMessage: message.type === 'image' ? 'Sent an image' : message.type === 'call' ? message.text : message.text,
            lastMessageType: message.type,
            time: message.time,
            lastMessageSentByYou: message.sentBy === profile.id,
            unread: message.sentBy !== profile.id,
        };
        return [updatedMessage, ...otherMessages];
    });
  };

  const updateMessageStatus = (messageId: number, userId: number, status: ChatMessage['status']) => {
    setChatHistories(prev => {
        const userHistory = prev[userId] || [];
        return {
            ...prev,
            [userId]: userHistory.map(msg => msg.id === messageId ? { ...msg, status } : msg)
        };
    });
  };

  const handleSendMessage = (userId: number, text: string, type: ChatMessage['type'], options?: Partial<ChatMessage>) => {
      const newMessage: ChatMessage = {
          id: Date.now(),
          text,
          sentBy: profile.id,
          time: 'Just now',
          status: 'sending',
          type,
          ...options,
      };

      addMessageToHistory(userId, newMessage);

      // Simulate network latency and status updates
      setTimeout(() => updateMessageStatus(newMessage.id, userId, 'sent'), 500);
      setTimeout(() => updateMessageStatus(newMessage.id, userId, 'delivered'), 1500);
      // Simulate recipient reading the message
      setTimeout(() => {
        setChatHistories(prev => ({
          ...prev,
          [userId]: prev[userId].map(msg => ({ ...msg, status: 'read' }))
        }));
      }, 3000);
  };
  
  const handleDeleteMessage = (userId: number, messageId: number) => {
    setChatHistories(prev => ({
        ...prev,
        [userId]: (prev[userId] || []).filter(msg => msg.id !== messageId)
    }));
  };

  const handleEditMessage = (userId: number, messageId: number, newText: string) => {
    setChatHistories(prev => ({
        ...prev,
        [userId]: (prev[userId] || []).map(msg => msg.id === messageId ? { ...msg, text: newText, isEdited: true, time: 'Just now' } : msg)
    }));
  };
  
  const handleReactToMessage = (userId: number, messageId: number, emoji: string) => {
      setChatHistories(prev => {
          const newHistory = (prev[userId] || []).map(msg => {
              if (msg.id === messageId) {
                  const reactions = { ...(msg.reactions || {}) };
                  const reactedUsers = reactions[emoji] || [];
                  if (reactedUsers.includes(profile.username)) {
                      // User is removing their reaction
                      reactions[emoji] = reactedUsers.filter(u => u !== profile.username);
                      if(reactions[emoji].length === 0) delete reactions[emoji];
                  } else {
                      // User is adding a reaction, ensuring they are not already there
                      const otherReactions = { ...reactions };
                      for (const key in otherReactions) {
                        otherReactions[key] = otherReactions[key].filter(u => u !== profile.username);
                        if(otherReactions[key].length === 0) delete otherReactions[key];
                      }
                      otherReactions[emoji] = [...(otherReactions[emoji] || []), profile.username];
                      return { ...msg, reactions: otherReactions };
                  }
                  return { ...msg, reactions };
              }
              return msg;
          });
          return { ...prev, [userId]: newHistory };
      });
  };

  const handleStartCall = (user: Message, type: 'video' | 'voice') => {
    setActiveCall({ type, user });
    const newMessage: ChatMessage = {
        id: Date.now(),
        type: 'call',
        text: `${type.charAt(0).toUpperCase() + type.slice(1)} call started`,
        sentBy: profile.id,
        time: 'Just now',
        callInfo: { type, status: 'started' }
    };
    addMessageToHistory(user.userId, newMessage);
  };
  
  const handleEndCall = (duration: string) => {
    if (activeCall) {
        const newMessage: ChatMessage = {
            id: Date.now(),
            type: 'call',
            text: `${activeCall.type.charAt(0).toUpperCase() + activeCall.type.slice(1)} call ended`,
            sentBy: profile.id,
            time: 'Just now',
            callInfo: { type: activeCall.type, status: 'ended', duration }
        };
        addMessageToHistory(activeCall.user.userId, newMessage);
        setActiveCall(null);
    }
  };

  const handleSaveProfile = (updatedProfile: Profile) => {
    const oldUsername = profile.username;
    setProfile(updatedProfile);
    setPosts(posts.map(p => p.username === oldUsername ? { ...p, user: updatedProfile.name, username: updatedProfile.username, avatar: updatedProfile.avatar } : p));
    setShowEditProfile(false);
  };
  
  const handleFollowToggle = (userIdToToggle: number, usernameToToggle: string) => {
    const isCurrentlyFollowing = following.some(u => u.id === userIdToToggle);
    const userDataSource = allUsers.find(u => u.id === userIdToToggle);

    if (isCurrentlyFollowing) {
        setFollowing(prev => prev.filter(u => u.id !== userIdToToggle));
        setProfile(p => ({ ...p, following: p.following - 1 }));
        setFriendSuggestions(prev => prev.map(s => s.id === userIdToToggle ? { ...s, followed: false } : s));
        setFollowers(prev => prev.map(f => f.id === userIdToToggle ? { ...f, followedByYou: false } : f));
        alert(`Unfollowed ${usernameToToggle}.`);
    } else {
        if (userDataSource) {
            const userToFollow: UserListItem = { ...userDataSource, followedByYou: true };
            setFollowing(prev => [...prev, userToFollow]);
            setProfile(p => ({ ...p, following: p.following + 1 }));
            setFriendSuggestions(prev => prev.map(s => s.id === userIdToToggle ? { ...s, followed: true } : s));
            setFollowers(prev => prev.map(f => f.id === userIdToToggle ? { ...f, followedByYou: true } : f));
        } else {
            console.error(`User with ID ${userIdToToggle} not found in allUsers data source.`);
        }
    }
  };
  
  const handleBlockToggle = (userIdToBlock: number, usernameToBlock: string) => {
    const isCurrentlyBlocked = profile.blockedAccounts.some(u => u.id === userIdToBlock);
    const userDataSource = allUsers.find(u => u.id === userIdToBlock);

    if (isCurrentlyBlocked) {
        setProfile(p => ({...p, blockedAccounts: p.blockedAccounts.filter(u => u.id !== userIdToBlock)}));
        alert(`Unblocked ${usernameToBlock}.`);
    } else {
        if (window.confirm(`Are you sure you want to block ${usernameToBlock}? They will no longer be able to find your profile, posts, or story. FireSocial won't let them know they were blocked.`)) {
            if (userDataSource) {
                setProfile(p => ({...p, blockedAccounts: [...p.blockedAccounts, userDataSource] }));
                if (following.some(u => u.id === userIdToBlock)) {
                    setFollowing(f => f.filter(u => u.id !== userIdToBlock));
                    setProfile(p => ({ ...p, following: p.following - 1 }));
                }
                if (followers.some(u => u.id === userIdToBlock)) {
                    setFollowers(f => f.filter(u => u.id === userIdToBlock));
                    setProfile(p => ({ ...p, followers: p.followers - 1 }));
                }
                alert(`Blocked ${usernameToBlock}.`);
            }
        }
    }
  };

  const handleAddComment = (postId: number, commentText: string, replyToUsername?: string) => {
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
    };

    const updatePostWithComment = (p: Post) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments + 1,
          commentsData: [...(p.commentsData || []), newComment],
        };
      }
      return p;
    };
    
    setPosts(posts.map(updatePostWithComment));
    if (viewingPost?.id === postId) {
      setViewingPost(updatePostWithComment(viewingPost));
    }
    if (viewingCommentsForPost?.id === postId) {
        setViewingCommentsForPost(updatePostWithComment(viewingCommentsForPost));
    }
  };

  const handleLikeComment = (postId: number, commentId: number) => {
    const updateState = (p: Post) => {
        if (p.id === postId) {
            const updatedComments = (p.commentsData || []).map(c => {
                if (c.id === commentId) {
                    return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
                }
                return c;
            });
            return { ...p, commentsData: updatedComments };
        }
        return p;
    };
    setPosts(posts.map(updateState));
    if (viewingPost?.id === postId) setViewingPost(updateState(viewingPost));
    if (viewingCommentsForPost?.id === postId) setViewingCommentsForPost(updateState(viewingCommentsForPost));
  };
  
  const handleDeleteComment = (postId: number, commentId: number) => {
    const updateState = (p: Post) => {
        if (p.id === postId) {
            const updatedComments = (p.commentsData || []).filter(c => c.id !== commentId);
            return { ...p, commentsData: updatedComments, comments: p.comments - 1 };
        }
        return p;
    };
    setPosts(posts.map(updateState));
    if (viewingPost?.id === postId) setViewingPost(updateState(viewingPost));
    if (viewingCommentsForPost?.id === postId) setViewingCommentsForPost(updateState(viewingCommentsForPost));
  };
  
  const handleEditComment = (postId: number, commentId: number, newText: string) => {
    const updateState = (p: Post) => {
        if (p.id === postId) {
            const updatedComments = (p.commentsData || []).map(c => {
                if (c.id === commentId) {
                    return { ...c, text: newText, edited: true, time: 'Just now' };
                }
                return c;
            });
            return { ...p, commentsData: updatedComments };
        }
        return p;
    };
    setPosts(posts.map(updateState));
    if (viewingPost?.id === postId) setViewingPost(updateState(viewingPost));
    if (viewingCommentsForPost?.id === postId) setViewingCommentsForPost(updateState(viewingCommentsForPost));
  };

  const handleViewProfile = (username: string) => {
    if (username === profile.username) {
        setViewingProfile(null);
    } else {
        const userProfile = ALL_USERS_DATA.find(p => p.username === username);
        setViewingProfile(userProfile || null);
    }
    setIsSearching(false);
    setCurrentPage('profile');
  };

  const handleViewHashtag = (tag: string) => {
    setViewingHashtag(tag);
    setIsSearching(false);
    setCurrentPage('feed'); // Ensure we are on the feed page to show this view
  };

  const executeSearch = (query: string) => {
      const lowerCaseQuery = query.toLowerCase();
      
      const searchablePosts = posts.filter(post => 
          !hiddenPostIds.includes(post.id) &&
          !profile.blockedAccounts.some(bu => bu.id === post.userId) &&
          !profile.mutedAccounts.some(mutedUser => mutedUser.name === post.user)
      );
  
      const foundUsers = allUsers.filter(user =>
        !profile.blockedAccounts.some(bu => bu.id === user.id) &&
        (user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.username.toLowerCase().includes(lowerCaseQuery))
      );
  
      const foundPosts = searchablePosts.filter(post =>
        post.content.toLowerCase().includes(lowerCaseQuery) ||
        post.user.toLowerCase().includes(lowerCaseQuery) ||
        post.username.toLowerCase().includes(lowerCaseQuery)
      );
  
      setSearchResults({ users: foundUsers, posts: foundPosts });
      setIsSearching(true);
      setCurrentPage('feed');
      setViewingHashtag(null);
  };
  
  const handleSearchSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmedQuery = searchQuery.trim();
      
      if (!trimmedQuery) {
        setIsSearching(false);
        setSearchResults(null);
        return;
      }
      
      setProfile(p => {
          const existingHistory = (p.searchHistory || []).filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
          const newHistory = [trimmedQuery, ...existingHistory].slice(0, 10); // Limit to 10
          return { ...p, searchHistory: newHistory };
      });
      
      executeSearch(trimmedQuery);
      setShowSearchHistory(false);
  };
  
  const handleSearchFromHistory = (query: string) => {
    setSearchQuery(query);
    executeSearch(query);
    setShowSearchHistory(false);
  };

  const handleRemoveSearchHistoryItem = (itemToRemove: string) => {
      setProfile(p => ({
          ...p,
          searchHistory: (p.searchHistory || []).filter(item => item !== itemToRemove),
      }));
  };

  const handleClearSearchHistory = () => {
      setProfile(p => ({ ...p, searchHistory: [] }));
  };

  const handleEditSearchHistoryItem = (query: string) => {
      setSearchQuery(query);
  };

  const handleDismissSuggestion = (userId: number) => {
    setFriendSuggestions(prev => prev.filter(s => s.id !== userId));
  };

  const handleHidePost = (postId: number) => { setHiddenPostIds(prev => [...prev, postId]); };
  const handleMuteUser = (username: string) => { if (profile.mutedAccounts.some(acc => acc.name === username)) return; const userToMute = allUsers.find(u => u.name === username); if (userToMute) { setProfile(p => ({ ...p, mutedAccounts: [...p.mutedAccounts, userToMute] })); alert(`Muted ${username}. Their posts won't appear in your feed.`); } };
  const handleReportPost = (postId: number) => { alert(`Post ${postId} has been reported for review. Thank you.`); };
  const handleSharePost = async (post: Post) => {
    const shareUrl = `https://firesocial.dev/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out this post from ${post.user} on FireSocial`,
          text: post.content,
          url: shareUrl,
        });
      } else {
        alert('Sharing is not supported on this browser.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  const handleCopyLink = (postId: number) => {
    const postUrl = `https://firesocial.dev/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(
      () => alert('Link copied to clipboard!'),
      () => alert('Failed to copy link.')
    );
  };
  
  const handleDeployGame = (gameIdea: string, previewImage: string) => {
    const newPost: Post = {
      id: Date.now(),
      userId: profile.id,
      user: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      content: `🚀 I just created a new game with the AI Game Studio! It's a game about: "${gameIdea}". Check out the concept art! #AIGameDev #FireSocialCreator`,
      media: [{ type: 'image', url: previewImage }],
      likes: 0,
      comments: 0,
      shares: 0,
      time: 'Just now',
      reactions: {},
      userReaction: null,
      bookmarked: false,
      views: 0,
      category: 'Gaming',
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setProfile(p => ({ ...p, posts: p.posts + 1 }));
    setShowGameCreator(false);
    handleSetCurrentPage('profile');
    setActiveProfileTab('posts');
  };

  const bgClass = darkMode ? 'bg-gray-900' : `bg-gradient-to-br ${currentTheme.light}`;
  const cardBg = darkMode ? 'bg-gray-800/40' : 'bg-white/40';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-gray-700' : 'border-white/20';

  const baseFilteredPosts = useMemo(() => posts.filter(post => {
      if (hiddenPostIds.includes(post.id)) return false;
      if (profile.blockedAccounts.some(bu => bu.id === post.userId)) return false;
      if(profile.mutedAccounts.some(mutedUser => mutedUser.name === post.user)) return false;
      if(profile.contentPreferences.hiddenWords.some(word => post.content.toLowerCase().includes(word.toLowerCase()))) return false;
      return true;
  }), [posts, hiddenPostIds, profile.blockedAccounts, profile.mutedAccounts, profile.contentPreferences.hiddenWords]);

  const feedPosts = useMemo(() => {
    let initialPosts: Post[];
    const followingIds = new Set(following.map(f => f.id));

    switch (activeFeedTab) {
        case 'following':
            initialPosts = baseFilteredPosts.filter(p => followingIds.has(p.userId));
            break;
        case 'trending':
            initialPosts = [...baseFilteredPosts].sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
            break;
        case 'discover':
        default:
            initialPosts = baseFilteredPosts.filter(p => !followingIds.has(p.userId) && p.userId !== profile.id);
            break;
    }

    let sortedAndFilteredPosts = initialPosts.filter(post => {
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

  const hashtagPosts = viewingHashtag ? baseFilteredPosts.filter(p => p.content.toLowerCase().includes(viewingHashtag.toLowerCase())).sort((a,b) => b.id - a.id) : [];
    
  const desktopNavItems = [
    { page: 'feed', icon: Home, label: 'Home', badge: 0, onClick: () => handleSetCurrentPage('feed') },
    { page: 'explore', icon: Compass, label: 'Explore', badge: 0, onClick: () => handleSetCurrentPage('explore') },
    { page: 'ai-creator', icon: Zap, label: 'AI Creator', badge: 0, onClick: () => setShowAICreator(true) },
    { page: 'ai-chatbot', icon: Bot, label: 'AI Chat', badge: 0, onClick: () => setShowAIChatbot(true) },
    { page: 'game-creator', icon: Gamepad2, label: 'Game Creator', badge: 0, onClick: () => setShowGameCreator(true) },
    { page: 'messages', icon: MessageCircle, label: 'Messages', badge: unreadMessages, onClick: () => handleSetCurrentPage('messages') },
    { page: 'notifications', icon: Bell, label: 'Notifications', badge: unreadNotifications, onClick: () => setShowNotifications(true) },
    { page: 'profile', icon: User, label: 'Profile', badge: 0, onClick: () => handleSetCurrentPage('profile') },
  ];
  
  const mobileNavItems = [
      { page: 'feed', icon: Home, label: 'Home', onClick: () => handleSetCurrentPage('feed') },
      { page: 'explore', icon: Compass, label: 'Explore', onClick: () => handleSetCurrentPage('explore') },
      { page: 'create', icon: PlusCircle, label: 'Create', onClick: () => setShowAICreator(true) },
      { page: 'messages', icon: MessageCircle, label: 'Messages', onClick: () => handleSetCurrentPage('messages'), badge: unreadMessages },
      { page: 'profile', icon: User, label: 'Profile', onClick: () => handleSetCurrentPage('profile') }
  ];

  const renderDesktopNavButton = (item: typeof desktopNavItems[0]) => (
    <button
      key={item.page}
      onClick={item.onClick}
      className={`relative flex items-center justify-start gap-4 p-3 rounded-2xl transition-all w-full text-left ${
        currentPage === item.page && !['notifications', 'ai-creator', 'game-creator', 'ai-chatbot'].includes(item.page)
          ? `${currentTheme.text} bg-white/10 font-bold`
          : `${textSecondary} hover:bg-white/10`
      } hover:scale-105`}
    >
      <item.icon size={24} />
      <span>{item.label}</span>
      {item.badge > 0 && (
        <div
          className={`absolute top-2 right-2 w-5 h-5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white text-xs rounded-full flex items-center justify-center`}
        >
          {item.badge}
        </div>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500 font-sans`}>
      <style>{`
        @keyframes pulse-bright {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
        }
        .animate-pulse-bright {
          animation: pulse-bright 2s infinite;
        }
      `}</style>
      {achievementToast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] ${cardBg} backdrop-blur-xl border ${borderColor} rounded-2xl shadow-lg p-4 flex items-center gap-4 animate-fade-in-down`}>
          <div className="text-4xl">{achievementToast.icon}</div>
          <div>
            <p className={`font-bold ${textColor}`}>Achievement Unlocked!</p>
            <p className={`${textSecondary} text-sm`}>{achievementToast.name}</p>
          </div>
          <button onClick={() => setAchievementToast(null)} className="p-1 rounded-full hover:bg-white/10"><X size={16} /></button>
        </div>
      )}
      <aside className={`hidden md:flex flex-col fixed inset-y-0 w-64 ${cardBg} backdrop-blur-xl border-r ${borderColor} p-4 z-50`}>
        <h1 className={`text-2xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent mb-8`}>
            FireSocial
        </h1>
        <div className="space-y-2 flex-grow">{desktopNavItems.map(item => renderDesktopNavButton(item))}</div>
        <div className={`p-4 rounded-2xl ${cardBg} border ${borderColor} mt-4`}>
          <div className="flex items-center gap-3">
            <AvatarDisplay avatar={profile.avatar} size="w-12 h-12" fontSize="text-2xl" />
            <div className="flex-1 overflow-hidden">
                <p className={`font-semibold ${textColor} truncate`}>{profile.name}</p>
                <p className={`${textSecondary} text-sm truncate`}>{profile.username}</p>
            </div>
            <button className={`${textSecondary} hover:${currentTheme.text}`}><LogOut size={20} /></button>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className={`${cardBg} backdrop-blur-xl border-b ${borderColor} sticky top-0 z-40`}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-2xl font-bold capitalize">{currentPage === 'profile' && viewingProfile ? viewingProfile.name : currentPage}</div>
            <div className="flex items-center gap-2">
              <div ref={searchContainerRef} className="relative">
                <form onSubmit={(e) => handleSearchSubmit(e)} className={`relative ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} flex items-center justify-between pl-4 pr-1 py-1`}>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onFocus={() => setShowSearchHistory(true)}
                    className={`bg-transparent ${textColor} placeholder-gray-400 focus:outline-none w-24 md:w-40`} 
                  />
                  <button type="submit" className={`p-1.5 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white hover:scale-105 transition-transform flex-shrink-0`}>
                    <CornerDownLeft size={18} />
                  </button>
                </form>
                {showSearchHistory && profile.searchHistory && profile.searchHistory.length > 0 && (
                  <div className={`absolute top-full mt-2 w-full min-w-[250px] ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                      <div className={`flex justify-between items-center p-3 border-b ${borderColor}`}>
                          <h4 className="font-semibold text-sm">Recent Searches</h4>
                          <button onClick={handleClearSearchHistory} className={`text-xs font-semibold ${currentTheme.text}`}>Clear all</button>
                      </div>
                      <ul className="max-h-60 overflow-y-auto">
                          {(profile.searchHistory || []).map((item, index) => (
                              <li key={index} className="flex items-center justify-between px-3 py-2 hover:bg-white/10 group">
                                  <button onClick={() => handleSearchFromHistory(item)} className="flex items-center gap-3 text-left flex-1 truncate">
                                      <History size={16} className={textSecondary} /> 
                                      <span className="truncate">{item}</span>
                                  </button>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleEditSearchHistoryItem(item)} title="Edit" className={`p-1 rounded-full ${textSecondary} hover:${currentTheme.text}`}>
                                          <Edit2 size={14} />
                                      </button>
                                      <button onClick={() => handleRemoveSearchHistoryItem(item)} title="Remove" className={`p-1 rounded-full ${textSecondary} hover:text-red-500`}>
                                          <X size={14} />
                                      </button>
                                  </div>
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 ${cardBg} backdrop-blur-xl ${textColor} rounded-full hover:scale-110 transition-all duration-300 border ${borderColor}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              <button onClick={() => setShowSettings(true)} className={`p-2.5 ${cardBg} backdrop-blur-xl ${textColor} rounded-full hover:scale-110 transition-all duration-300 border ${borderColor}`}><Settings size={20} /></button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {showSettings && <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} onEditProfile={() => setShowEditProfile(true)} profile={profile} setProfile={setProfile} darkMode={darkMode} themeColor={themeColor} setThemeColor={setThemeColor} allUsers={allUsers} onBlockToggle={handleBlockToggle} />}
          {showNotifications && <NotificationsModal show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} unreadCount={unreadNotifications} onMarkAllRead={handleMarkAllNotificationsRead} onMarkOneRead={handleMarkOneNotificationRead} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
          {showAICreator && <AICreatorModal show={showAICreator} onClose={() => setShowAICreator(false)} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
          {showGameCreator && <GameCreatorModal show={showGameCreator} onClose={() => setShowGameCreator(false)} onDeployGame={handleDeployGame} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
          {showAIChatbot && <AIChatbotModal show={showAIChatbot} onClose={() => setShowAIChatbot(false)} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
          {showAnalytics && <AnalyticsModal show={showAnalytics} onClose={() => setShowAnalytics(false)} profile={profile} posts={posts} followers={followers} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
          {viewingPost && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={() => setViewingPost(null)}><div className={`${cardBg} backdrop-blur-xl rounded-3xl p-0 border ${borderColor} shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}><PostComponent post={viewingPost} profile={profile} currentTheme={currentTheme} cardBg="bg-transparent" textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} reactions={REACTIONS} messages={messages} onReaction={handleReaction} onBookmark={handleBookmark} onDelete={handleDeletePost} onViewPost={() => {}} onViewComments={setViewingCommentsForPost} onHide={handleHidePost} onMute={handleMuteUser} onReport={handleReportPost} onShare={handleSharePost} onCopyLink={handleCopyLink} onFollowToggle={handleFollowToggle} onVotePoll={handleVotePoll} onViewProfile={handleViewProfile} onViewHashtag={handleViewHashtag} isFollowing={following.some(u => u.id === viewingPost.userId)} onBlockToggle={handleBlockToggle} isBlocked={profile.blockedAccounts.some(u => u.id === viewingPost.userId)} onAddComment={handleAddComment} allUsers={allUsers} /></div></div>)}
          {viewingCommentsForPost && <CommentModal post={viewingCommentsForPost} profile={profile} onClose={() => setViewingCommentsForPost(null)} onAddComment={handleAddComment} onLikeComment={handleLikeComment} onDeleteComment={handleDeleteComment} onEditComment={handleEditComment} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} allUsers={allUsers} />}
          {activeCall && <CallModal call={activeCall} onEndCall={handleEndCall} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
          {viewingStoriesForUser && <StoryViewerModal stories={stories} startUser={viewingStoriesForUser} profile={profile} onClose={() => setViewingStoriesForUser(null)} onDeleteStory={handleDeleteStory} />}
          {showCreateStory && <CreateStoryModal 
            show={showCreateStory}
            onClose={() => setShowCreateStory(false)}
            onCreate={handleCreateStory}
            currentTheme={currentTheme}
            cardBg={cardBg}
            textColor={textColor}
            textSecondary={textSecondary}
            borderColor={borderColor}
          />}
          {showSuggestionsModal && <SuggestionsModal
            show={showSuggestionsModal}
            onClose={() => setShowSuggestionsModal(false)}
            suggestions={friendSuggestions}
            following={following}
            onFollowToggle={handleFollowToggle}
            onDismiss={handleDismissSuggestion}
            onViewProfile={handleViewProfile}
            currentTheme={currentTheme}
            cardBg={cardBg}
            textColor={textColor}
            textSecondary={textSecondary}
            borderColor={borderColor}
          />}

          {currentPage === 'feed' && (
            isSearching && searchResults ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className={`p-2 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} ${textColor} hover:scale-105`}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Results for <span className={currentTheme.text}>"{searchQuery}"</span></h2>
                    </div>
                    {searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                        <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-8 border ${borderColor} shadow-lg text-center`}>
                            <p className={`${textColor} font-semibold text-lg`}>No results found</p>
                            <p className={textSecondary}>Try searching for something else.</p>
                        </div>
                    ) : (
                        <>
                           {searchResults.users.length > 0 && (
                                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                                    <h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}><Users size={20} />Users</h3>
                                    <div className="space-y-3">
                                        {searchResults.users.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10">
                                                <button onClick={() => handleViewProfile(user.username)} className="flex items-center gap-3 text-left">
                                                    <AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" />
                                                    <div>
                                                        <p className={`${textColor} font-semibold`}>{user.name}</p>

                                                        <p className={`${textSecondary} text-sm`}>{user.username}</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => handleFollowToggle(user.id, user.username)} className={`px-4 py-2 ${following.some(f => f.id === user.id) ? `${cardBg} ${textColor}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`} rounded-2xl text-sm font-semibold hover:scale-105 transition-all w-28 text-center`}>
                                                    {following.some(f => f.id === user.id) ? 'Following' : 'Follow'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {searchResults.posts.length > 0 && (
                                 <div className="space-y-6">
                                    <h3 className={`font-semibold ${textColor} flex items-center gap-2 text-lg`}><FileText size={20} />Posts</h3>
                                    {searchResults.posts.map(post => (
                                        <PostComponent key={post.id} post={post} profile={profile} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} reactions={REACTIONS} messages={messages} onReaction={handleReaction} onBookmark={handleBookmark} onDelete={handleDeletePost} onViewPost={setViewingPost} onViewComments={setViewingCommentsForPost} onHide={handleHidePost} onMute={handleMuteUser} onReport={handleReportPost} onShare={handleSharePost} onCopyLink={handleCopyLink} onFollowToggle={handleFollowToggle} onVotePoll={handleVotePoll} onViewProfile={handleViewProfile} onViewHashtag={handleViewHashtag} isFollowing={following.some(u => u.id === post.userId)} onBlockToggle={handleBlockToggle} isBlocked={profile.blockedAccounts.some(u => u.id === post.userId)} onAddComment={handleAddComment} allUsers={allUsers} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : viewingHashtag ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setViewingHashtag(null)} className={`p-2 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} ${textColor} hover:scale-105`}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className={`text-2xl font-bold ${textColor}`}>Posts for <span className={currentTheme.text}>{viewingHashtag}</span></h2>
                    </div>
                    {hashtagPosts.map(post => (<PostComponent key={post.id} post={post} profile={profile} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} reactions={REACTIONS} messages={messages} onReaction={handleReaction} onBookmark={handleBookmark} onDelete={handleDeletePost} onViewPost={setViewingPost} onViewComments={setViewingCommentsForPost} onHide={handleHidePost} onMute={handleMuteUser} onReport={handleReportPost} onShare={handleSharePost} onCopyLink={handleCopyLink} onFollowToggle={handleFollowToggle} onVotePoll={handleVotePoll} onViewProfile={handleViewProfile} onViewHashtag={handleViewHashtag} isFollowing={following.some(u => u.id === post.userId)} onBlockToggle={handleBlockToggle} isBlocked={profile.blockedAccounts.some(u => u.id === post.userId)} onAddComment={handleAddComment} allUsers={allUsers} />))}
                </div>
            ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} shadow-lg`}>
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">{stories.map(story => (<div key={story.id} className="flex-shrink-0 text-center"><button onClick={() => handleStoryClick(story)} className={`relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all ${story.media.length > 0 ? `p-1 bg-gradient-to-r ${story.isLive ? 'from-pink-500 via-red-500 to-yellow-500' : `${currentTheme.from} ${currentTheme.to}`}` : `${cardBg} border-2 border-dashed ${borderColor}`} ${story.isLive ? 'animate-pulse-bright' : ''}`}><div className={`w-full h-full rounded-full flex items-center justify-center ${story.media.length > 0 ? (darkMode ? 'bg-gray-900' : 'bg-white') : ''}`}>{story.isYours && story.media.length === 0 ? <Plus size={24} className={textColor} /> : <AvatarDisplay avatar={story.avatar} size="w-full h-full" fontSize="text-4xl"/>}</div>{story.isLive && (<span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-md border-2 ${darkMode ? 'border-gray-900' : 'border-white'}`}>LIVE</span>)}</button><p className={`text-xs ${textColor} mt-1 truncate w-20`}>{story.user}</p></div>))}</div>
                </div>
                {liveUsers.length > 0 && (<div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} shadow-lg`}><h3 className={`font-semibold ${textColor} mb-3 flex items-center gap-2`}><Radio size={20} className="text-red-500" /> Live Now</h3><div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2">{liveUsers.map(user => (<button key={user.id} onClick={() => handleViewProfile(user.username)} className={`${cardBg} backdrop-blur-xl rounded-2xl p-3 border ${borderColor} flex-shrink-0 hover:scale-105 transition-all cursor-pointer text-left`}><AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" className="mb-2" /><p className={`${textColor} font-semibold text-sm`}>{user.name}</p><p className={`${textSecondary} text-xs flex items-center gap-1`}><Eye size={12} /> {user.viewers}</p></button>))}</div></div>)}
                <div className="flex gap-2 items-center">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={activeFeedTab === 'trending'} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}><option value="recent">Recent</option><option value="popular">Popular</option><option value="views">Most Viewed</option></select>
                    <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none`}><option value="all">All Posts</option><option value="bookmarked">Bookmarked</option><option value="liked">Liked</option></select>
                </div>
                
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                    <div className="flex gap-4">
                        <AvatarDisplay avatar={profile.avatar} size="w-16 h-16" fontSize="text-4xl" />
                        <div className="flex-1">
                            <div className="relative">
                                {newPostMentionQuery !== null && (
                                    <div className={`absolute bottom-full mb-2 w-full max-w-sm ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                                        <ul className="max-h-48 overflow-y-auto">
                                            {allUsers
                                                .filter(user =>
                                                    user.username.toLowerCase().includes(`@${newPostMentionQuery.toLowerCase()}`) ||
                                                    user.name.toLowerCase().includes(newPostMentionQuery.toLowerCase())
                                                )
                                                .slice(0, 5)
                                                .map(user => (
                                                <li key={user.id}>
                                                    <button onClick={() => handleNewPostMentionSelect(user.username)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-white/10">
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
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/*,video/*" className="hidden" />
                                <textarea ref={newPostTextareaRef} value={newPost} onChange={handleNewPostChange} placeholder={showCreatePoll ? "Ask a question..." : "What's on your mind? Mention someone with '@'"} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none`} rows={showCreatePoll ? 2 : 3} />
                            </div>
                            
                            {newPostMedia.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-2">
                                    {newPostMedia.map((media, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                            {media.type === 'image' ? <img src={media.url} alt="preview" className="w-full h-full object-cover" /> : <video src={media.url} className="w-full h-full object-cover" />}
                                            <button onClick={() => handleRemoveMedia(index)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showCreatePoll ? (
                                <div className="mt-4 space-y-2">
                                    {pollOptions.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="text" value={option} onChange={(e) => handlePollOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className={`flex-1 px-4 py-2 ${cardBg} backdrop-blur-xl rounded-xl border ${borderColor} ${textColor} focus:outline-none`} />
                                            {pollOptions.length > 2 && <button onClick={() => handleRemovePollOption(index)} className="p-2 text-red-500 hover:bg-white/10 rounded-full"><Trash2 size={16} /></button>}
                                        </div>
                                    ))}
                                    {pollOptions.length < 5 && <button onClick={handleAddPollOption} className={`w-full py-2 mt-2 flex items-center justify-center gap-2 ${cardBg} backdrop-blur-xl rounded-xl border-dashed ${borderColor} ${textSecondary} hover:bg-white/10`}><PlusCircle size={16} /> Add Option</button>}
                                    <div className="flex gap-2 mt-4">
                                        <button className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all`} onClick={handleCreatePoll} disabled={newPost.trim().length === 0 || pollOptions.filter(o => o.trim()).length < 2}>Post Poll</button>
                                        <button className={`py-3 px-4 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:bg-white/10`} onClick={() => setShowCreatePoll(false)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 mt-4">
                                    <button className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`} onClick={handleCreatePost} disabled={!newPost.trim() && newPostMedia.length === 0}>Post</button>
                                    <button onClick={() => fileInputRef.current?.click()} className={`p-3 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:scale-105 transition-all duration-300`}><Image size={20} /></button>
                                    <button onClick={() => fileInputRef.current?.click()} className={`p-3 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:scale-105 transition-all duration-300`}><Video size={20} /></button>
                                    <button onClick={() => { setShowCreatePoll(true); setNewPostMedia([]); }} className={`p-3 ${cardBg} backdrop-blur-xl ${textColor} rounded-2xl border ${borderColor} hover:scale-105 transition-all duration-300`}><BarChart3 size={20} /></button>
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

                {feedPosts.map(post => (<PostComponent key={post.id} post={post} profile={profile} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} reactions={REACTIONS} messages={messages} onReaction={handleReaction} onBookmark={handleBookmark} onDelete={handleDeletePost} onViewPost={setViewingPost} onViewComments={setViewingCommentsForPost} onHide={handleHidePost} onMute={handleMuteUser} onReport={handleReportPost} onShare={handleSharePost} onCopyLink={handleCopyLink} onFollowToggle={handleFollowToggle} onVotePoll={handleVotePoll} onViewProfile={handleViewProfile} onViewHashtag={handleViewHashtag} isFollowing={following.some(u => u.id === post.userId)} onBlockToggle={handleBlockToggle} isBlocked={profile.blockedAccounts.some(u => u.id === post.userId)} onAddComment={handleAddComment} allUsers={allUsers} />))}
              </div>
              <aside className="space-y-6 hidden lg:block">
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}><h3 className={`font-semibold ${textColor} mb-4 flex items-center gap-2`}><TrendingUp size={20} />Trending</h3>{trendingHashtags.map((tag, i) => (<div key={i} className={`p-3 rounded-2xl hover:bg-white/10 cursor-pointer mb-2`}><p className={`${textColor} font-semibold`}>{tag.tag}</p><p className={`${textSecondary} text-sm`}>{tag.posts.toLocaleString()} posts</p></div>))}</div>
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-semibold ${textColor} flex items-center gap-2`}>
                            <UserPlus size={20} />Suggestions
                        </h3>
                        <button onClick={() => setShowSuggestionsModal(true)} className={`text-sm font-semibold ${currentTheme.text}`}>See All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
                        {friendSuggestions.slice(0, 5).map(user => {
                            const userProfile = ALL_USERS_DATA.find(p => p.id === user.id);
                            return (
                                <div key={user.id} className={`relative flex-shrink-0 w-40 h-56 rounded-2xl border ${borderColor} overflow-hidden shadow-md group transition-all duration-300 hover:scale-105`}>
                                    <img src={userProfile?.coverPhoto || `https://source.unsplash.com/random/200x300?sig=${user.id}`} alt={user.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                    
                                    <button onClick={() => handleDismissSuggestion(user.id)} className="absolute top-2 right-2 p-1 bg-black/30 text-white/70 rounded-full opacity-0 group-hover:opacity-100 hover:text-white transition-opacity z-10">
                                        <X size={14} />
                                    </button>
                                    
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center">
                                        <button onClick={() => handleViewProfile(user.username)}>
                                            <AvatarDisplay avatar={user.avatar} size="w-16 h-16" fontSize="text-3xl" className="mx-auto border-2 border-white/50 mb-2" />
                                        </button>
                                        <p className="font-bold text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-white/80">{user.mutualFriends} mutual</p>
                                        <button 
                                            onClick={() => handleFollowToggle(user.id, user.username)} 
                                            className={`w-full mt-2 py-1.5 rounded-lg text-sm font-semibold transition-colors ${user.followed ? 'bg-white/20' : 'bg-white text-black'}`}
                                        >
                                            {user.followed ? 'Following' : 'Follow'}
                                        </button>
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
                    <button onClick={() => setShowAnalytics(true)} className={`w-full p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all flex items-center gap-2`}>
                        <BarChart3 size={18} />View Analytics
                    </button>
                    <button onClick={() => handleSetCurrentPage('achievements')} className={`w-full p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all flex items-center gap-2`}>
                        <Award size={18} />View Badges
                    </button>
                    <button onClick={() => { handleSetCurrentPage('profile'); setActiveProfileTab('bookmarks'); }} className={`w-full p-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all flex items-center gap-2`}>
                        <Bookmark size={18} />Saved Posts
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            )
          )}
          
          {currentPage === 'explore' && (
            <ExplorePage
                posts={posts}
                profile={profile}
                allUsers={allUsers}
                trendingHashtags={trendingHashtags}
                following={following}
                onViewPost={setViewingPost}
                onViewProfile={handleViewProfile}
                onViewHashtag={handleViewHashtag}
                textColor={textColor}
                textSecondary={textSecondary}
                cardBg={cardBg}
                borderColor={borderColor}
                currentTheme={currentTheme}
            />
          )}

          {currentPage === 'messages' && (
             <MessagesPage
                profile={profile}
                messages={messages}
                groupChats={groupChats}
                chatHistories={chatHistories}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
                onReactToMessage={handleReactToMessage}
                onStartCall={handleStartCall}
                onMarkChatAsRead={handleMarkChatAsRead}
                currentTheme={currentTheme}
                cardBg={cardBg}
                textColor={textColor}
                textSecondary={textSecondary}
                borderColor={borderColor}
            />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
                profileToDisplay={viewingProfile || profile}
                isOwnProfile={!viewingProfile || viewingProfile.username === profile.username}
                posts={posts}
                activeTab={activeProfileTab}
                onTabChange={setActiveProfileTab}
                onEditProfile={() => setShowEditProfile(true)}
                onFollow={handleFollowToggle}
                onBlockToggle={handleBlockToggle}
                isFollowing={viewingProfile ? following.some(f => f.username === viewingProfile.username) : false}
                isBlocked={viewingProfile ? profile.blockedAccounts.some(b => b.id === viewingProfile.id) : false}
                onShowFollowers={() => setShowFollowList('followers')}
                onShowFollowing={() => setShowFollowList('following')}
                onViewPost={setViewingPost}
                onViewComments={setViewingCommentsForPost}
                onViewHashtag={handleViewHashtag}
                onViewProfile={handleViewProfile}
                cardBg={cardBg}
                textColor={textColor}
                textSecondary={textSecondary}
                borderColor={borderColor}
                currentTheme={currentTheme}
                allAchievements={ALL_ACHIEVEMENTS}
                onViewAchievements={() => handleSetCurrentPage('achievements')}
                onViewTrophies={() => handleSetCurrentPage('trophies')}
                onViewStreaks={() => handleSetCurrentPage('streaks')}
            />
          )}

          {currentPage === 'achievements' && (
            <AchievementsPage
                profile={profile}
                allAchievements={ALL_ACHIEVEMENTS}
                onBack={() => handleSetCurrentPage('profile')}
                textColor={textColor}
                textSecondary={textSecondary}
                cardBg={cardBg}
                borderColor={borderColor}
                currentTheme={currentTheme}
            />
          )}
          
          {currentPage === 'trophies' && (
            <TrophyPage
                profile={profile}
                onBack={() => handleSetCurrentPage('profile')}
                textColor={textColor}
                textSecondary={textSecondary}
                cardBg={cardBg}
                borderColor={borderColor}
                currentTheme={currentTheme}
            />
          )}

          {currentPage === 'streaks' && (
            <StreakPage
                profile={profile}
                onBack={() => handleSetCurrentPage('profile')}
                textColor={textColor}
                textSecondary={textSecondary}
                cardBg={cardBg}
                borderColor={borderColor}
                currentTheme={currentTheme}
            />
          )}
        </main>
      </div>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${cardBg} backdrop-blur-xl border-t ${borderColor} flex justify-around items-center z-50`}>
        {mobileNavItems.map(item => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={item.onClick}
              className="flex-1 flex flex-col items-center justify-center p-2 h-16 relative"
            >
              {item.page === 'create' ? (
                <div className={`-mt-6 p-3 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg`}>
                    <item.icon size={28} />
                </div>
              ) : (
                <div className={`p-2 rounded-xl transition-colors ${isActive ? `${currentTheme.text} bg-white/10` : textSecondary}`}>
                    <item.icon size={24} />
                </div>
              )}
              <span className={`text-xs mt-1 ${isActive ? currentTheme.text : textSecondary}`}>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <div className={`absolute top-1 right-1/2 translate-x-4 w-4 h-4 text-xs flex items-center justify-center bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full`}>
                  {item.badge}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {showEditProfile && <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} onSave={handleSaveProfile} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}
      {showFollowList && <FollowListModal listType={showFollowList} onClose={() => setShowFollowList(null)} followers={followers} following={following} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />}

    </div>
  );
};

export default FireSocial;
