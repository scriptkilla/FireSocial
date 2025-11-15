import React from 'react';
import { X } from 'lucide-react';
import { UserListItem, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface FollowListModalProps {
    listType: 'followers' | 'following';
    onClose: () => void;
    followers: UserListItem[];
    following: UserListItem[];
    onFollowToggle: (userId: number, username: string) => void;
    onViewProfile: (username: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ listType, onClose, followers, following, onFollowToggle, onViewProfile, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const list = listType === 'followers' ? followers : following;
    
    const handleViewProfileClick = (username: string) => {
        onClose();
        onViewProfile(username);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-md w-full border ${borderColor} shadow-2xl max-h-[70vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold capitalize">{listType}</h2>
                    <button aria-label="Close" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 -mr-2">
                    {list.map(user => {
                        const isFollowingThisUser = following.some(followedUser => followedUser.id === user.id);
                        return (
                            <div key={user.id} className="flex items-center justify-between">
                                <button onClick={() => handleViewProfileClick(user.username)} className="flex items-center gap-3 text-left">
                                    <AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" />
                                    <div>
                                        <p className={`${textColor} font-semibold`}>{user.name}</p>
                                        <p className={`${textSecondary} text-sm`}>{user.username}</p>
                                    </div>
                                </button>
                                <button onClick={() => onFollowToggle(user.id, user.username)} className={`px-4 py-2 ${isFollowingThisUser ? `${cardBg} ${textColor}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`} rounded-2xl text-sm font-semibold hover:scale-105 transition-all w-28 text-center`}>
                                    {isFollowingThisUser ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default FollowListModal;