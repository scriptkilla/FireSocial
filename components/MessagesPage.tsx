
import React, { useState, useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { Profile, Message, GroupChat, Theme, ChatMessage } from '../types';
import ChatWindow from './ChatWindow';
import AvatarDisplay from './AvatarDisplay';

interface MessagesPageProps {
  profile: Profile;
  messages: Message[];
  groupChats: GroupChat[];
  chatHistories: Record<number, ChatMessage[]>;
  onSendMessage: (userId: number, text: string, type: ChatMessage['type'], options?: Partial<ChatMessage>) => void;
  onDeleteMessage: (userId: number, messageId: number) => void;
  onEditMessage: (userId: number, messageId: number, newText: string) => void;
  onReactToMessage: (userId: number, messageId: number, emoji: string) => void;
  onStartCall: (user: Message, type: 'video' | 'voice') => void;
  onMarkChatAsRead: (userId: number) => void;
  // UI Props
  currentTheme: Theme;
  cardBg: string;
  textColor: string;
  textSecondary: string;
  borderColor: string;
}

const MessagesPage: React.FC<MessagesPageProps> = (props) => {
  const { 
    profile, messages, groupChats, chatHistories, 
    onSendMessage, onDeleteMessage, onEditMessage, onReactToMessage,
    onStartCall, onMarkChatAsRead, currentTheme, cardBg, textColor, textSecondary, borderColor 
  } = props;
  
  const [selectedChatId, setSelectedChatId] = useState<number | null>(messages[0]?.id || null);

  const selectedChat = messages.find(m => m.id === selectedChatId) || null;

  const isDarkMode = cardBg.includes('gray');
  const messagesPageBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const searchBarBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  const selectedItemBg = isDarkMode ? 'bg-white/10' : 'bg-black/5';
  const onlineIndicatorBorder = isDarkMode ? 'border-gray-800' : 'border-white';

  useEffect(() => {
    if (selectedChat?.unread) {
      onMarkChatAsRead(selectedChat.userId);
    }
  }, [selectedChat, onMarkChatAsRead]);

  const handleSelectChat = (chat: Message) => {
    if (chat.unread) {
      onMarkChatAsRead(chat.userId);
    }
    setSelectedChatId(chat.id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
        <div className={`${messagesPageBg} rounded-3xl p-4 border ${borderColor} shadow-lg md:col-span-1 flex flex-col`}>
            <div className="mb-4 flex-shrink-0">
                <h2 className={`text-xl font-bold ${textColor} mb-3`}>Messages</h2>
                <div className={`${searchBarBg} rounded-2xl px-4 py-2 border ${borderColor} flex items-center gap-2`}>
                    <Search size={18} className={textSecondary} />
                    <input type="text" placeholder="Search messages..." className={`bg-transparent ${textColor} placeholder-gray-400 focus:outline-none flex-1`} />
                </div>
            </div>
            <div className="overflow-y-auto -mr-2 pr-2">
                <div className="mb-4">
                    <h3 className={`${textSecondary} text-sm mb-2 px-2`}>Direct Messages</h3>
                    {messages.map(msg => (
                        <button key={msg.id} onClick={() => handleSelectChat(msg)} className={`w-full text-left p-3 rounded-2xl mb-2 cursor-pointer transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'} ${selectedChat?.id === msg.id ? selectedItemBg : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <AvatarDisplay avatar={msg.avatar} size="w-12 h-12" fontSize="text-2xl" />
                                    {msg.online && <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${onlineIndicatorBorder}`}></div>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold ${textColor} truncate`}>{msg.user}</h3>
                                        {msg.unread && <div className={`w-2.5 h-2.5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full`}></div>}
                                    </div>
                                    <p className={`text-sm ${msg.unread ? `font-bold ${textColor}` : textSecondary} truncate`}>{msg.lastMessageSentByYou && "You: "}{msg.lastMessage}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <div>
                    <h3 className={`${textSecondary} text-sm mb-2 px-2`}>Group Chats</h3>
                    {groupChats.map(group => (
                        <div key={group.id} className={`p-3 rounded-2xl mb-2 cursor-pointer transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                            <div className="flex items-center gap-3">
                                <AvatarDisplay avatar={group.avatar} size="w-12 h-12" fontSize="text-2xl" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-semibold ${textColor}`}>{group.name}</h3>
                                        {group.unread > 0 && <div className={`px-2 py-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full text-white text-xs`}>{group.unread}</div>}
                                    </div>
                                    <p className={`text-sm ${textSecondary} truncate`}>{group.lastMessage}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className={`${messagesPageBg} rounded-3xl border ${borderColor} shadow-lg md:col-span-2`}>
            {selectedChat ? (
                <ChatWindow
                    key={selectedChat.id}
                    profile={profile}
                    chatWith={selectedChat}
                    history={chatHistories[selectedChat.userId] || []}
                    onSendMessage={onSendMessage}
                    onDeleteMessage={onDeleteMessage}
                    onEditMessage={onEditMessage}
                    onReactToMessage={onReactToMessage}
                    onStartCall={(type) => onStartCall(selectedChat, type)}
                    currentTheme={currentTheme}
                    textColor={textColor}
                    textSecondary={textSecondary}
                    borderColor={borderColor}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <MessageCircle size={64} className={textSecondary} />
                        <p className={`${textSecondary} mt-4`}>Select a conversation to start messaging</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default MessagesPage;
