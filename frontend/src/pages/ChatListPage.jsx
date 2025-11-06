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

    // 1. Lấy Stream Token
    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    // 2. Khởi tạo Stream Client
    useEffect(() => {
        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;
            const client = StreamChat.getInstance(STREAM_API_KEY);

            if (!client.user) { 
                try {
                    await client.connectUser(
                        {
                            id: authUser._id,
                            name: authUser.fullName,
                            image: authUser.profilePic,
                        },
                        tokenData.token
                    );
                    setChatClient(client);
                } catch (error) {
                    console.error("Lỗi kết nối Stream Client:", error);
                }
            } else {
                setChatClient(client); 
            }
        };

        if (tokenData?.token && authUser) {
            initChat();
        }
    }, [tokenData, authUser]);

    // 3. Bộ lọc: Chỉ lấy 1:1 chat (messaging)
    const filters = {
        type: 'messaging',
        members: { $in: [authUser?._id] },
    };
    
    // 4. Sắp xếp: Tin nhắn mới nhất lên đầu
    const sort = { last_message_at: -1 };

    if (!chatClient || !authUser) {
        return <ChatLoader />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full">
            
            <div className="flex items-center gap-3 mb-6 shrink-0">
                <MessageSquareText className="size-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Tin nhắn</h1>
            </div>

            <div className="flex-grow min-h-0">
                <Chat client={chatClient}>
                    <ChannelList
                        filters={filters}
                        sort={sort}
                        
                        // 🟢 ĐÂY LÀ NƠI XỬ LÝ VIỆC CLICK VÀ ĐIỀU HƯỚNG
                        onSelect={(channel) => {
                            if (!authUser?._id) {
                                console.error("AuthUser ID không tồn tại.");
                                return;
                            }

                            // 1. Lấy danh sách ID của tất cả thành viên
                            const memberIDs = Object.keys(channel.state.members);
                            
                            // 2. Lọc ra ID của người còn lại (không phải bạn)
                            const otherUserId = memberIDs.find(
                                (id) => id !== authUser._id
                            );

                            if (otherUserId) {
                                // 3. Điều hướng đến trang chat chi tiết
                                navigate(`/chat/${otherUserId}`);
                            } else {
                                console.error("Không tìm thấy ID người nhận trong kênh này.");
                            }
                        }}
                    />
                </Chat>
            </div>
        </div>
    );
};

export default ChatListPage;