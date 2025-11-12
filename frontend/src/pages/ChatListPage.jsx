import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StreamChat } from 'stream-chat';
import { Chat, ChannelList } from 'stream-chat-react'; 
import { getStreamToken } from '../lib/api'; 
import useAuthUser from '../hooks/useAuthUser.js';
import ChatLoader from '../components/ChatLoader.jsx'; 
import { MessageSquareText, Users } from 'lucide-react'; // 🟢 Thêm icon Users
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '../components/CreateGroupModal.jsx'; // 🟢 Import Modal

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatListPage = () => {
    const { authUser } = useAuthUser();
    const [chatClient, setChatClient] = useState(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // 🟢 State cho Modal

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

    // 🟢 CẬP NHẬT: Bộ lọc lấy cả 1:1 và Nhóm
    const filters = { 
        type: { $in: ['messaging', 'team'] }, // 'messaging' (1:1), 'team' (nhóm)
        members: { $in: [authUser?._id] } 
    };
    const sort = { last_message_at: -1 };

    
    const CustomChannelPreview = (props) => {
        const { channel, setActiveChannel } = props;
        const { messages } = channel.state;
        const lastMessage = messages[messages.length - 1];
        
        // 🟢 CẬP NHẬT: Logic kiểm tra Nhóm
        const isGroup = channel.data.member_count > 2 || channel.type === 'team';
        
        const otherMember = Object.values(channel.state.members).find(m => m.user_id !== authUser._id);
        const otherUser = otherMember?.user;

        // Xác định Tên và Ảnh đại diện
        const displayName = isGroup ? channel.data.name : otherUser?.name;
        const displayImage = isGroup ? channel.data.image : otherUser?.image;
        
        // 🟢 CẬP NHẬT: Logic Click (Điều hướng)
        const handleSelect = () => {
            if (isGroup) {
                navigate(`/group/${channel.id}`);
            } else {
                navigate(`/chat/${otherUser?.id}`);
            }
        };

        return (
            <button 
                onClick={handleSelect}
                className="flex items-center gap-3 p-3 w-full hover:bg-base-200 transition-colors text-left border-b border-base-200"
            >
                <div className="avatar">
                    <div className="w-12 rounded-full">
                        <img src={displayImage || '/default-avatar.png'} alt={displayName} />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{displayName || 'Chat'}</h4>
                    <p className="text-sm text-gray-500 truncate">
                        {lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                    </p>
                </div>
            </button>
        );
    };

    if (!chatClient || !authUser) return <ChatLoader />;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between gap-3 p-4 sm:p-6 lg:p-8 mb-0 shrink-0 border-b">
                <div className="flex items-center gap-3">
                    <MessageSquareText className="size-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Tin nhắn</h1>
                </div>
                {/* 🟢 NÚT TẠO NHÓM MỚI */}
                <button 
                    className="btn btn-primary btn-sm btn-circle" 
                    onClick={() => setIsModalOpen(true)} 
                    aria-label="Tạo nhóm mới"
                >
                    <Users className="size-5" />
                </button>
            </div>

            <div className="flex-grow min-h-0 overflow-y-auto">
                <Chat client={chatClient}>
                    <ChannelList
                        filters={filters}
                        sort={sort}
                        Preview={CustomChannelPreview} 
                        // ❌ Bỏ onSelect vì CustomChannelPreview đã xử lý
                    />
                </Chat>
            </div>

            {/* 🟢 Render Modal */}
            {isModalOpen && (
                <CreateGroupModal 
                    onClose={() => setIsModalOpen(false)} 
                    onGroupCreated={(groupId) => {
                        setIsModalOpen(false);
                        navigate(`/group/${groupId}`); // Điều hướng đến nhóm vừa tạo
                    }}
                />
            )}
        </div>
    );
};

export default ChatListPage;