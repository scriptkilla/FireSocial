

import React, { useState } from 'react';
import { Palette, UserMinus, X, ChevronLeft, ChevronRight, Search, User, KeyRound, Bell, Eye, Shield, Lock, Users, MessageSquare, List, Heart, VolumeX, FileText, HelpCircle, AlertTriangle, Info, LogOut, Download, Trash2, Globe, CheckCircle, Circle, PlusCircle } from 'lucide-react';
import { Profile, ThemeColor, Themes, UserListItem, Theme } from '../types';
import { THEMES as ThemeConstants } from '../constants';

// --- HELP CENTER DATA ---
const HELP_ARTICLES = [
  // Getting Started
  { id: 'getting-started-1', category: 'Getting Started', question: 'How do I create an account?', answer: 'To create an account, click the "Sign Up" button on the homepage and follow the on-screen instructions. You will need to provide a valid email address and create a password.' },
  { id: 'getting-started-2', category: 'Getting Started', question: 'How do I complete my profile?', answer: 'Navigate to your profile page and click "Edit Profile". You can add a profile picture, cover photo, bio, location, website, and personal links to make your profile stand out.' },

  // Profile
  { id: 'profile-1', category: 'Profile', question: 'How can I customize my profile?', answer: 'You can edit your profile by navigating to your profile page and clicking the "Edit Profile" button. From there, you can change your avatar, cover photo, bio, links, and more.' },
  { id: 'profile-2', category: 'Profile', question: 'How do I add or remove links from my profile?', answer: 'In the "Edit Profile" screen, scroll down to the "Links" section. You can add a new link by clicking "+ Add Link" or remove an existing one by clicking the trash icon next to it.' },

  // Features
  { id: 'features-1', category: 'Features', question: 'How do I create a post?', answer: 'On the main feed, you will find a "What\'s on your mind?" text box. Simply type your content, add any media using the icons, and click the "Post" button.' },
  { id: 'features-2', category: 'Features', question: 'How do polls work?', answer: 'You can create a poll by clicking the bar chart icon in the "Create Post" box. Add a question and at least two options. Your followers can then vote on the options you provide.' },
  { id: 'features-3', category: 'Features', question: 'How do I delete a post?', answer: 'Find the post you want to delete, click the three-dots icon (...) in the top-right corner of the post, and select "Delete Post". Note that this action cannot be undone.' },

  // Privacy & Security
  { id: 'privacy-1', category: 'Privacy & Security', question: 'How do I make my account private?', answer: 'You can make your account private in the Settings menu. Go to Settings > Privacy and Security, and toggle the "Private Account" option on. When your account is private, only followers you approve can see your content.' },
  { id: 'privacy-2', category: 'Privacy & Security', question: 'How do I block someone?', answer: 'To block a user, go to their profile, click the three-dots icon (...), and select "Block User". You can manage your blocked accounts in Settings > Privacy and Security > Blocked Accounts.' },
  { id: 'privacy-3', category: 'Privacy & Security', question: 'What is Two-Factor Authentication (2FA)?', answer: '2FA adds an extra layer of security to your account. When enabled, you\'ll need to enter a special login code in addition to your password. You can enable it in Settings > Account Settings > Two-Factor Authentication.' },

  // Troubleshooting
  { id: 'troubleshooting-1', category: 'Troubleshooting', question: 'What should I do if the app is not loading?', answer: 'First, try refreshing the page. If that doesn\'t work, check your internet connection. Clearing your browser cache and cookies can also resolve many common issues.' },

  // Support
  { id: 'support-1', category: 'Support', question: 'How do I contact support?', answer: 'If you can\'t find an answer in our Help Center, you can report a problem via Settings > Support and About > Report a Problem. Please provide as much detail as possible.' },
];


// --- HELPER & VIEW COMPONENTS ---
// These are now defined at the top-level of the file to follow React best practices
// and to be used by the new View components.

const AvatarDisplay = ({ avatar, size = 'w-10 h-10', fontSize = 'text-xl', className = '' }: { avatar: string; size?: string; fontSize?: string; className?: string; }) => {
    const isImage = avatar && (avatar.startsWith('data:image') || avatar.startsWith('http'));
    const isEmoji = !isImage && avatar && avatar.length <= 2;

    return (
        <div className={`relative rounded-full flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-700 ${size} ${className}`}>
            {isImage ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : isEmoji ? <span className={fontSize}>{avatar}</span> : <User className="w-1/2 h/2 text-gray-500" />}
        </div>
    );
};

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="px-4 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);

const SettingsItem: React.FC<{ icon: React.ElementType; label: string; onClick?: () => void; hasNav?: boolean, value?: string, hoverBg: string, textSecondary: string }> = ({ icon: Icon, label, onClick, hasNav = true, value, hoverBg, textSecondary }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between text-left p-3 rounded-lg ${hoverBg}`}>
        <div className="flex items-center gap-4"><Icon size={20} /><span>{label}</span></div>
        <div className="flex items-center gap-2">{value && <span className={textSecondary}>{value}</span>}{hasNav && <ChevronRight size={20} className={textSecondary} />}</div>
    </button>
);

const SettingsToggleItem: React.FC<{ icon: React.ElementType; label: string; description?: string; isEnabled: boolean; onToggle: () => void; currentTheme: Theme, darkMode: boolean, textSecondary: string, hoverBg: string }> = ({ icon: Icon, label, description, isEnabled, onToggle, currentTheme, darkMode, textSecondary, hoverBg }) => (
    <div className={`w-full flex items-center justify-between p-3 rounded-lg ${hoverBg}`}>
        <div className="flex items-center gap-4">
            <Icon size={20} />
            <div>
                <span>{label}</span>
                {description && <p className={`text-xs ${textSecondary}`}>{description}</p>}
            </div>
        </div>
        <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${isEnabled ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : (darkMode ? 'bg-gray-600' : 'bg-gray-300')}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const FormInput: React.FC<{label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, currentTheme: Theme, borderColor: string, textColor: string}> = ({ label, type, value, onChange, currentTheme, borderColor, textColor }) => (
    <div>
        <label className="block text-gray-500 dark:text-gray-400 mb-2 text-sm">{label}</label>
        <input type={type} value={value} onChange={onChange} className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} />
    </div>
);


// --- PROPS FOR VIEW COMPONENTS ---
type SettingsView = 'main' | 'account' | 'privacy' | 'notifications' | 'content' | 'support' | 'appearance' | 'blocked' | 'language' | 'changePassword' | 'twoFactor' | 'mutedAccounts' | 'restrictedAccounts' | 'favoriteTopics' | 'hiddenWords' | 'sensitiveContent' | 'reportProblem' | 'helpCenter';

interface ViewProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    setView: (view: SettingsView) => void;
    onClose: () => void;
    onEditProfile: () => void;
    setThemeColor: (color: ThemeColor) => void;
    onBlockToggle: (userId: number, username: string) => void;
    // Theme
    themeColor: ThemeColor;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    hoverBg: string;
    darkMode: boolean;
    // Data
    allUsers: UserListItem[];
}

// --- VIEW COMPONENTS ---
const MainView: React.FC<Pick<ViewProps, 'setView' | 'hoverBg' | 'textSecondary'>> = ({ setView, hoverBg, textSecondary }) => (
    <div className="space-y-6">
        <SettingsItem icon={User} label="Account Settings" onClick={() => setView('account')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Shield} label="Privacy and Security" onClick={() => setView('privacy')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Bell} label="Notifications" onClick={() => setView('notifications')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Palette} label="Appearance" onClick={() => setView('appearance')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={List} label="Content Preferences" onClick={() => setView('content')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={HelpCircle} label="Support and About" onClick={() => setView('support')} hoverBg={hoverBg} textSecondary={textSecondary} />
    </div>
);

const AccountSettingsView: React.FC<Pick<ViewProps, 'setView' | 'onEditProfile' | 'onClose' | 'profile' | 'hoverBg' | 'textSecondary'> & { setShowDeactivateConfirm: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setView, onEditProfile, onClose, profile, hoverBg, textSecondary, setShowDeactivateConfirm }) => {
    return (
        <SettingsSection title="Account Settings">
            <SettingsItem icon={User} label="Edit Profile" onClick={() => { onEditProfile(); onClose(); }} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Globe} label="Language" onClick={() => setView('language')} value={profile.language === 'en-US' ? 'English' : 'Español'} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={KeyRound} label="Change Password" onClick={() => setView('changePassword')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Lock} label="Two-Factor Authentication" onClick={() => setView('twoFactor')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Download} label="Download Data" onClick={() => alert('Request received. We will email you a link to download your data when it is ready.')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={LogOut} label="Deactivate Account" onClick={() => setShowDeactivateConfirm(true)} hasNav={false} hoverBg={hoverBg} textSecondary={textSecondary} />
        </SettingsSection>
    );
};

const PrivacySettingsView: React.FC<Pick<ViewProps, 'profile' | 'setProfile' | 'setView' | 'currentTheme' | 'darkMode' | 'textSecondary' | 'hoverBg'>> = ({ profile, setProfile, setView, ...props }) => {
    const handlePrivacyChange = (setting: keyof Profile['privacySettings'], value: boolean) => {
        setProfile(p => ({ ...p, privacySettings: { ...p.privacySettings, [setting]: value } }));
    };
    return (
        <SettingsSection title="Privacy and Security">
            <SettingsToggleItem icon={Lock} label="Private Account" description="Only approved followers can see your posts." isEnabled={profile.privacySettings.privateAccount} onToggle={() => handlePrivacyChange('privateAccount', !profile.privacySettings.privateAccount)} {...props} />
            <SettingsToggleItem icon={Eye} label="Activity Status" isEnabled={profile.privacySettings.activityStatus} onToggle={() => handlePrivacyChange('activityStatus', !profile.privacySettings.activityStatus)} {...props} />
            <SettingsItem icon={VolumeX} label="Muted Accounts" onClick={() => setView('mutedAccounts')} hoverBg={props.hoverBg} textSecondary={props.textSecondary} />
            <SettingsItem icon={UserMinus} label="Blocked Accounts" onClick={() => setView('blocked')} hoverBg={props.hoverBg} textSecondary={props.textSecondary} />
            <SettingsItem icon={Users} label="Restricted Accounts" onClick={() => setView('restrictedAccounts')} hoverBg={props.hoverBg} textSecondary={props.textSecondary} />
        </SettingsSection>
    );
};

const BlockedAccountsView: React.FC<Pick<ViewProps, 'profile' | 'allUsers' | 'onBlockToggle' | 'currentTheme' | 'borderColor' | 'textColor' | 'textSecondary' | 'cardBg'>> = ({ profile, allUsers, onBlockToggle, ...props }) => {
    const list = profile.blockedAccounts;
    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = userSearch ? allUsers.filter(u => 
        u.id !== profile.id &&
        (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase()))
    ) : [];

    return (
        <div className="space-y-4">
            <p className={`px-4 text-sm ${props.textSecondary}`}>Once you block someone, they will no longer be able to find your profile, posts, or story.</p>
            <div className="px-3"><input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search for users to block..." className={`w-full px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl border ${props.borderColor} ${props.textColor} focus:outline-none focus:ring-1 ${props.currentTheme.ring}`} /></div>
            
            {userSearch ? (
                <SettingsSection title="Search Results">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => {
                        const isBlocked = list.some(u => u.id === user.id);
                        return (<div key={user.id} className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AvatarDisplay avatar={user.avatar} size="w-10 h-10" fontSize="text-xl" />
                                <div><p className={props.textColor}>{user.name}</p><p className={`text-sm ${props.textSecondary}`}>{user.username}</p></div>
                            </div>
                            <button onClick={() => onBlockToggle(user.id, user.username)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${isBlocked ? `${props.cardBg} ${props.textColor}` : `bg-red-500 text-white`}`}>
                                {isBlocked ? `Unblock` : 'Block'}
                            </button>
                        </div>)
                    }) : <p className={`px-4 ${props.textSecondary}`}>No users found.</p>}
                </SettingsSection>
            ) : (
                <SettingsSection title={`Blocked Accounts (${list.length})`}>
                    {list.length > 0 ? list.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AvatarDisplay avatar={user.avatar} size="w-10 h-10" fontSize="text-xl" />
                                <div><p className={props.textColor}>{user.name}</p><p className={`text-sm ${props.textSecondary}`}>{user.username}</p></div>
                            </div>
                            <button onClick={() => onBlockToggle(user.id, user.username)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${props.cardBg} ${props.textColor}`}>
                                Unblock
                            </button>
                        </div>
                    )) : <p className={`px-4 ${props.textSecondary}`}>You haven't blocked any accounts.</p>}
                </SettingsSection>
            )}
        </div>
    );
};


const AppearanceSettingsView: React.FC<Pick<ViewProps, 'themeColor' | 'setThemeColor'>> = ({ themeColor, setThemeColor }) => (
    <SettingsSection title="Theme">
        <div className="grid grid-cols-4 gap-3 p-3">
            {(Object.keys(ThemeConstants) as ThemeColor[]).map(color => (
                <button key={color} onClick={() => setThemeColor(color)} className={`h-16 rounded-2xl bg-gradient-to-r ${ThemeConstants[color].from} ${ThemeConstants[color].to} ${themeColor === color ? 'ring-4 ring-white/80' : ''} hover:scale-105 transition-all`} />
            ))}
        </div>
    </SettingsSection>
);

const NotificationSettingsView: React.FC<Pick<ViewProps, 'profile' | 'setProfile' | 'currentTheme' | 'darkMode' | 'textSecondary' | 'hoverBg'>> = ({ profile, setProfile, ...props }) => {
    const handleNotificationChange = (setting: keyof Profile['notificationSettings'], value: boolean) => {
        setProfile(p => ({ ...p, notificationSettings: { ...p.notificationSettings, [setting]: value } }));
    };
    return (
        <SettingsSection title="Notifications">
            <SettingsToggleItem icon={Bell} label="Push Notifications" isEnabled={profile.notificationSettings.push} onToggle={() => handleNotificationChange('push', !profile.notificationSettings.push)} {...props} />
            <SettingsToggleItem icon={Bell} label="Email Notifications" isEnabled={profile.notificationSettings.email} onToggle={() => handleNotificationChange('email', !profile.notificationSettings.email)} {...props} />
        </SettingsSection>
    );
};

const ContentPreferencesView: React.FC<Pick<ViewProps, 'setView' | 'hoverBg' | 'textSecondary'>> = ({ setView, hoverBg, textSecondary }) => (
    <SettingsSection title="Content Preferences">
        <SettingsItem icon={Heart} label="Favorite Topics" onClick={() => setView('favoriteTopics')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={VolumeX} label="Hidden Words" onClick={() => setView('hiddenWords')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={AlertTriangle} label="Sensitive Content" onClick={() => setView('sensitiveContent')} hoverBg={hoverBg} textSecondary={textSecondary} />
    </SettingsSection>
);

const SupportAndAboutView: React.FC<Pick<ViewProps, 'setView' | 'hoverBg' | 'textSecondary'>> = ({ setView, hoverBg, textSecondary }) => (
    <SettingsSection title="Support and About">
        <SettingsItem icon={HelpCircle} label="Help Center" onClick={() => setView('helpCenter')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={AlertTriangle} label="Report a Problem" onClick={() => setView('reportProblem')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Info} label="App Version" hasNav={false} value="1.0.0" hoverBg={hoverBg} textSecondary={textSecondary} />
    </SettingsSection>
);

const HelpCenterView: React.FC<Pick<ViewProps, 'setView' | 'currentTheme' | 'borderColor' | 'textColor' | 'textSecondary' | 'hoverBg'>> = ({ setView, currentTheme, borderColor, textColor, textSecondary, hoverBg }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<typeof HELP_ARTICLES[0] | null>(null);

    if (selectedArticle) {
        return (
            <div>
                <button onClick={() => setSelectedArticle(null)} className={`flex items-center gap-2 p-2 mb-4 rounded-lg ${hoverBg}`}>
                    <ChevronLeft size={20} /> Back to Help Center
                </button>
                <h3 className={`text-xl font-bold ${textColor} mb-2`}>{selectedArticle.question}</h3>
                <p className={textSecondary}>{selectedArticle.answer}</p>
            </div>
        );
    }

    const filteredArticles = HELP_ARTICLES.filter(
        a => a.question.toLowerCase().includes(searchTerm.toLowerCase()) || a.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = [...new Set(filteredArticles.map(a => a.category))];

    return (
        <div>
            <div className={`relative mb-4`}>
                <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-1 ${currentTheme.ring}`}
                />
            </div>
            {categories.map(category => (
                <div key={category} className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">{category}</h4>
                    <div className="space-y-1">
                        {filteredArticles.filter(a => a.category === category).map(article => (
                            <button key={article.id} onClick={() => setSelectedArticle(article)} className={`w-full text-left p-3 rounded-lg ${hoverBg} flex justify-between items-center`}>
                                <span>{article.question}</span>
                                <ChevronRight size={16} className={textSecondary} />
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- PROPS INTERFACE ---
interface SettingsModalProps {
    show: boolean;
    onClose: () => void;
    onEditProfile: () => void;
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    darkMode: boolean;
    themeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
    allUsers: UserListItem[];
    onBlockToggle: (userId: number, username: string) => void;
}

// --- MAIN MODAL COMPONENT ---
export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
    const { show, onClose, onEditProfile, profile, setProfile, darkMode, themeColor, setThemeColor, allUsers, onBlockToggle } = props;
    const [view, setView] = useState<SettingsView>('main');
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

    const currentTheme = ThemeConstants[themeColor];
    const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white/80';
    const textColor = darkMode ? 'text-white' : 'text-gray-900';
    const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
    const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
    const hoverBg = darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5';

    const viewProps: ViewProps = {
        profile, setProfile, setView, onClose, onEditProfile, setThemeColor, onBlockToggle,
        themeColor, currentTheme, cardBg, textColor, textSecondary, borderColor, hoverBg, darkMode,
        allUsers
    };

    const renderView = () => {
        switch (view) {
            case 'main': return <MainView setView={setView} hoverBg={hoverBg} textSecondary={textSecondary} />;
            case 'account': return <AccountSettingsView {...viewProps} setShowDeactivateConfirm={setShowDeactivateConfirm} />;
            case 'privacy': return <PrivacySettingsView {...viewProps} />;
            case 'blocked': return <BlockedAccountsView {...viewProps} />;
            case 'appearance': return <AppearanceSettingsView {...viewProps} />;
            case 'notifications': return <NotificationSettingsView {...viewProps} />;
            case 'content': return <ContentPreferencesView setView={setView} hoverBg={hoverBg} textSecondary={textSecondary} />;
            case 'support': return <SupportAndAboutView setView={setView} hoverBg={hoverBg} textSecondary={textSecondary} />;
            case 'helpCenter': return <HelpCenterView {...viewProps} />;
            default: return <p>This section is under construction.</p>;
        }
    };

    const getTitle = () => {
        if (view === 'main') return 'Settings';
        const capitalized = view.replace(/([A-Z])/g, ' $1').trim();
        return capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
    };
    
    if (!show) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`overflow-y-auto max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl`}>
                <div className="flex items-center mb-6">
                    {view !== 'main' && <button onClick={() => setView('main')} className="p-2 -ml-2 mr-2 hover:bg-white/10 rounded-full"><ChevronLeft size={20} /></button>}
                    <h2 className="text-2xl font-bold">{getTitle()}</h2>
                    <button onClick={onClose} className="p-2 ml-auto hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                {renderView()}
                {showDeactivateConfirm && (
                    <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center p-4">
                        <div className={`${cardBg} p-6 rounded-2xl max-w-sm w-full text-center border ${borderColor}`}>
                            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                            <h3 className="text-lg font-bold">Deactivate Account?</h3>
                            <p className={`mt-2 text-sm ${textSecondary}`}>This is temporary. Your profile will be hidden until you reactivate by logging back in.</p>
                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setShowDeactivateConfirm(false)} className={`flex-1 py-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30`}>Cancel</button>
                                <button onClick={() => {alert('Account deactivated.'); onClose();}} className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white">Deactivate</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
