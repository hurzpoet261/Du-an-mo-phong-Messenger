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
  Window,
  useChatContext // Hook lấy context của Stream
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import { ArrowLeft, Video } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CustomChannelHeader = ({ channel, handleVideoCall }) => {
    const navigate = useNavigate();
    const { client } = useChatContext();
    const handleBack = () => navigate(-1);

    // 1. Xác định ID của tôi
    const myId = client.userID;

    // 2. Lấy danh sách thành viên
    const members = Object.values(channel.state.members);

    // 3. LOGIC QUAN TRỌNG: Tìm người có ID KHÁC ID của tôi
    // Sử dụng optional chaining (?.) để tránh lỗi nếu dữ liệu chưa load kịp
    const otherMember = members.find((m) => m.user?.id !== myId);

    // 4. Xác định user mục tiêu để hiển thị
    // Nếu tìm thấy người kia -> lấy user đó
    // Nếu không tìm thấy (chat với chính mình) -> lấy user đầu tiên
    const targetUser = otherMember?.user || members[0]?.user || {};

    // 5. Hiển thị
    // Ưu tiên: Tên User -> Tên Kênh (nếu có) -> "Người dùng"
    const displayName = targetUser.name || channel.data?.name || "Người dùng";
    const displayImage = targetUser.image || "/avatar.png";
    const isOnline = targetUser.online;

    return (
        <div className="flex items-center gap-3 p-3 bg-base-100 border-b shadow-sm">
            <button onClick={handleBack} className="btn btn-ghost btn-circle btn-sm">
                <ArrowLeft className="size-5" />
            </button>
            
            <div className="avatar">
                <div className="w-10 rounded-full ring ring-offset-base-100 ring-offset-2 ring-primary/20">
                    <img src={displayImage} alt={displayName} className="object-cover" />
                </div>
            </div>
            
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{displayName}</h3>
                <span className={`text-xs ${isOnline ? "text-green-500 font-medium" : "text-base-content/60"}`}>
                    {isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                </span>
            </div>
            
            <button 
                onClick={handleVideoCall} 
                className="btn btn-ghost btn-circle text-primary"
                title="Gọi Video"
            >
                <Video className="size-6" />
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

  // 1. Khởi tạo Chat
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        // Singleton connect
        if (!client.user || client.userID !== authUser._id) {
            if (client.userID) await client.disconnectUser();
            await client.connectUser(
              { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
              tokenData.token
            );
        }

        // Tạo Channel ID duy nhất dựa trên 2 ID (sort để A-B giống B-A)
        const channelId = [authUser._id, targetUserId].sort().join("-");
        
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Lỗi Chat:", error);
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [tokenData, authUser, targetUserId]);

  // 2. Logic Bắt đầu cuộc gọi (Sender)
  const handleVideoCall = async () => {
    if (!channel) return;
    try {
      const callId = uuidv4(); 
      await channel.sendEvent({
        type: 'call-started',
        call_id: callId,
        user: { id: authUser._id, name: authUser.fullName, image: authUser.profilePic }
      });
      navigate(`/call/${callId}`);
    } catch (error) {
      console.error(error);
      toast.error("Không thể gọi.");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full flex flex-col">
            <Window>
              <CustomChannelHeader channel={channel} handleVideoCall={handleVideoCall} />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;