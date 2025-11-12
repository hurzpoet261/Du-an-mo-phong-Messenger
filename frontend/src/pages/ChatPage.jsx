import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  // 🟢 Import hook này để lấy thông tin user
  useChatContext 
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
// 🔴 Không cần CallButton riêng lẻ nữa
// import CallButton from "../components/CallButton"; 
import { ArrowLeft, Video } from "lucide-react"; // 🟢 Import icon Video

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// 🟢 TẠO CUSTOM HEADER MỚI CHO CHAT 1:1
const CustomChannelHeader = ({ channel, handleVideoCall }) => {
    const navigate = useNavigate();
    const { client } = useChatContext(); // Lấy client từ context
    const handleBack = () => navigate(-1); // Quay lại trang trước

    // Tìm thành viên còn lại (người bạn đang chat cùng)
    const otherMember = Object.values(channel.state.members).find(
        (m) => m.user_id !== client.user?.id
    );

    return (
        <div className="flex items-center gap-3 p-3 bg-base-100 border-b">
            <button onClick={handleBack} className="btn btn-ghost btn-circle"><ArrowLeft size={24} /></button>
            
            <div className="avatar">
                <div className="w-10 rounded-full">
                    <img src={otherMember?.user?.image || '/default-group-avatar.png'} alt="avatar" />
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{otherMember?.user?.name || 'Chat'}</h3>
                <p className="text-xs text-gray-500">{channel.data.member_count} thành viên</p>
            </div>
            
            <button onClick={handleVideoCall} className="btn btn-ghost btn-circle text-primary">
                <Video size={24} />
            </button>
        </div>
    );
};


const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, 
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        if (!client.user) {
            await client.connectUser(
              { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
              tokenData.token
            );
        }

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
           <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            
            {/* 🔴 Đã xóa các nút trôi nổi (floating buttons) */}
            
            <Window>
              {/* 🟢 SỬ DỤNG CUSTOM HEADER MỚI */}
              <CustomChannelHeader channel={channel} handleVideoCall={handleVideoCall} />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;