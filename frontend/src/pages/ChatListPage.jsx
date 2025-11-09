import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StreamChat } from 'stream-chat';
import { Chat, ChannelList } from 'stream-chat-react'; 
import { getStreamToken } from '../lib/api'; 
import useAuthUser from '../hooks/useAuthUser.js';
import ChatLoader from '../components/ChatLoader.jsx'; 
import { MessageSquareText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatListPage = () => {
    const { authUser } = useAuthUser();
    const [chatClient, setChatClient] = useState(null);
    const navigate = useNavigate();

    const { data: tokenData } = useQuery({ queryKey: ["streamToken"], queryFn: getStreamToken, enabled: !!authUser });

    useEffect(() => {
        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;
            const client = StreamChat.getInstance(STREAM_API_KEY);
            if (!client.user) { 
                await client.connectUser({ id: authUser._id, name: authUser.fullName, image: authUser.profilePic }, tokenData.token);
            }
            setChatClient(client);
        };
        if (tokenData?.token && authUser) initChat();
    }, [tokenData, authUser]);

    const filters = { type: 'messaging', members: { $in: [authUser?._id] } };
    const sort = { last_message_at: -1 };

    
    const CustomChannelPreview = (props) => {
        const { channel, setActiveChannel } = props;
        const { messages } = channel.state;
        const lastMessage = messages[messages.length - 1];
        
        const otherMember = Object.values(channel.state.members).find(m => m.user_id !== authUser._id);
        const otherUser = otherMember?.user;

        return (
            <button 
                onClick={() => {
                    navigate(`/chat/${otherUser?.id}`);
                }}
                className="flex items-center gap-3 p-3 w-full hover:bg-base-200 transition-colors text-left border-b border-base-200"
            >
                {/* Avatar */}
                <div className="avatar">
                    <div className="w-12 rounded-full">
                        <img src={otherUser?.image || '/default-avatar.png'} alt={otherUser?.name} />
                    </div>
                </div>
                {/* Tên và tin nhắn cuối */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{otherUser?.name || 'Chat'}</h4>
                    <p className="text-sm text-gray-500 truncate">
                        {lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                    </p>
                </div>
            </button>
        );
    };

    if (!chatClient || !authUser) return <ChatLoader />;

    return (
        <div className="flex flex-col h-full"> {/* Bỏ padding ở container chính nếu cần full-width */}
            <div className="flex items-center gap-3 p-4 sm:p-6 lg:p-8 mb-0 shrink-0 border-b">
                <MessageSquareText className="size-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Tin nhắn</h1>
            </div>

            <div className="flex-grow min-h-0 overflow-y-auto"> {/* Thêm overflow-y-auto vào đây */}
                <Chat client={chatClient}>
                    <ChannelList
                        filters={filters}
                        sort={sort}
                        // 🟢 SỬ DỤNG CUSTOM PREVIEW
                        Preview={CustomChannelPreview} 
                    />
                </Chat>
            </div>
        </div>
    );
};

export default ChatListPage;