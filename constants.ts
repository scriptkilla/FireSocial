import { Themes, Reaction, Achievement } from './types';

export const THEMES: Themes = {
  orange: {
    from: 'from-orange-500',
    to: 'to-red-500',
    light: 'from-orange-50 via-red-50 to-pink-50',
    text: 'text-orange-500',
    ring: 'focus:ring-orange-500',
    border: 'border-orange-500',
    hoverText: 'hover:text-orange-500',
  },
  blue: {
    from: 'from-blue-500',
    to: 'to-purple-500',
    light: 'from-blue-50 via-purple-50 to-pink-50',
    text: 'text-blue-500',
    ring: 'focus:ring-blue-500',
    border: 'border-blue-500',
    hoverText: 'hover:text-blue-500',
  },
  green: {
    from: 'from-green-500',
    to: 'to-teal-500',
    light: 'from-green-50 via-teal-50 to-blue-50',
    text: 'text-green-500',
    ring: 'focus:ring-green-500',
    border: 'border-green-500',
    hoverText: 'hover:text-green-500',
  },
  pink: {
    from: 'from-pink-500',
    to: 'to-rose-500',
    light: 'from-pink-50 via-rose-50 to-red-50',
    text: 'text-pink-500',
    ring: 'focus:ring-pink-500',
    border: 'border-pink-500',
    hoverText: 'hover:text-pink-500',
  },
};

export const REACTIONS: Reaction[] = [
  { name: 'like', emoji: '👍', color: 'text-blue-500' },
  { name: 'love', emoji: '❤️', color: 'text-red-500' },
  { name: 'fire', emoji: '🔥', color: 'text-orange-500' },
  { name: 'star', emoji: '⭐', color: 'text-yellow-500' },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_post', icon: '🎯', name: 'First Post', description: 'Created your first post' },
  { id: '10_posts', icon: '✍️', name: 'Prolific Poster', description: 'Made 10 posts' },
  { id: '100_followers', icon: '💯', name: '100 Followers', description: 'Reached 100 followers' },
  { id: '50_following', icon: '🤝', name: 'Social Butterfly', description: 'Followed 50 people' },
  { id: '10_day_streak', icon: '🔥', name: '10 Day Streak', description: 'Posted for 10 days straight' },
  { id: 'popular_post', icon: '⭐', name: 'Popular Post', description: 'Got 100+ likes on a post' }
];
