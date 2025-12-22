import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StreamChat } from 'stream-chat';
import { Chat, ChannelList } from 'stream-chat-react'; 
import { getStreamToken } from '../lib/api'; 
import useAuthUser from '../hooks/useAuthUser.js';
import ChatLoader from '../components/ChatLoader.jsx'; 
// 🟢 1. Thêm icon Trash2
import { MessageSquareText, Users, Trash2 } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import CreateGroupModal from '../components/CreateGroupModal.jsx';
import toast from 'react-hot-toast'; // 🟢 Import toast

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatListPage = () => {
    const { authUser } = useAuthUser();
    const [chatClient, setChatClient] = useState(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tokenData } = useQuery({ queryKey: ["streamToken"], queryFn: getStreamToken, enabled: !!authUser });

    useEffect(() => {
        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;
            const client = StreamChat.getInstance(STREAM_API_KEY);
            if (!client.user || client.userID !== authUser._id) { 
                if (client.userID) await client.disconnectUser();
                await client.connectUser({ id: authUser._id, name: authUser.fullName, image: authUser.profilePic }, tokenData.token);
            }
            setChatClient(client);
        };
        if (tokenData?.token && authUser) initChat();
    }, [tokenData, authUser]);

    const filters = { 
        type: { $in: ['messaging', 'team'] }, 
        members: { $in: [authUser?._id] } 
    };
    const sort = { last_message_at: -1 };

    // --- COMPONENT CUSTOM PREVIEW (CÓ NÚT XÓA) ---
    const CustomChannelPreview = (props) => {
        const { channel } = props;
        const { messages } = channel.state;
        const lastMessage = messages[messages.length - 1];
        
        const isGroup = channel.type === 'team' || channel.data.member_count > 2;
        const otherMember = Object.values(channel.state.members).find(
            m => m.user?.id !== authUser._id
        );
        const otherUser = otherMember?.user;

        const displayName = isGroup ? (channel.data.name || "Nhóm Chat") : (otherUser?.name || "Người dùng");
        const displayImage = isGroup ? (channel.data.image || "/default-group-avatar.png") : (otherUser?.image || "/avatar.png");
        
        const handleSelect = () => {
            if (isGroup) {
                navigate(`/group/${channel.id}`);
            } else {
                const targetId = otherUser?.id || authUser._id;
                navigate(`/chat/${targetId}`);
            }
        };

        // 🟢 2. LOGIC XÓA ĐOẠN CHAT
        const handleDeleteChat = async (e) => {
            // Ngăn không cho sự kiện click lan ra ngoài (để không bị nhảy vào trang chat)
            e.stopPropagation();

            const confirm = window.confirm(`Bạn có chắc muốn xóa cuộc trò chuyện với "${displayName}" không? Hành động này không thể hoàn tác.`);
            
            if (confirm) {
                try {
                    await channel.delete(); // Xóa vĩnh viễn
                    toast.success("Đã xóa cuộc trò chuyện");
                } catch (error) {
                    console.error("Lỗi xóa chat:", error);
                    toast.error("Không thể xóa (Bạn không phải Admin hoặc có lỗi xảy ra)");
                }
            }
        };

        return (
            <div 
                onClick={handleSelect}
                className="group flex items-center gap-3 p-3 w-full hover:bg-base-200 transition-colors cursor-pointer border-b border-base-200 relative"
            >
                <div className="avatar">
                    <div className="w-12 rounded-full ring ring-offset-base-100 ring-offset-1 ring-base-300">
                        <img src={displayImage} alt={displayName} className="object-cover"/>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate pr-8">{displayName}</h4>
                    <p className="text-sm text-gray-500 truncate">
                        {lastMessage 
                            ? `${lastMessage.user?.id === authUser._id ? 'Bạn: ' : ''}${lastMessage.text || 'Đã gửi một tệp'}` 
                            : 'Bắt đầu cuộc trò chuyện'}
                    </p>
                </div>

                {/* 🟢 3. NÚT XÓA (Chỉ hiện khi hover vào dòng chat) */}
                <button 
                    onClick={handleDeleteChat}
                    className="btn btn-ghost btn-xs btn-circle absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-error"
                    title="Xóa cuộc trò chuyện"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
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
                <button 
                    className="btn btn-primary btn-sm btn-circle" 
                    onClick={() => setIsModalOpen(true)} 
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
                    />
                </Chat>
            </div>

            {isModalOpen && (
                <CreateGroupModal 
                    onClose={() => setIsModalOpen(false)} 
                    onGroupCreated={(groupId) => {
                        setIsModalOpen(false);
                        navigate(`/group/${groupId}`);
                    }}
                />
            )}
        </div>
    );
};

export default ChatListPage;