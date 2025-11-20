import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getVideoToken, startGroupCall } from "../lib/api";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import { ArrowLeft, Video, Settings } from "lucide-react";
import ManageGroupModal from "../components/ManageGroupModal.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// --- HEADER TÙY CHỈNH CHO NHÓM ---
const CustomGroupHeader = ({
  channel,
  handleVideoCall,
  // isAdmin, // 🟢 BỎ: Không cần check admin ở đây để ẩn nút
  onOpenManageModal,
}) => {
  const navigate = useNavigate();
  const { client } = useChatContext();

  const handleBack = () => navigate(-1);

  return (
    <div className="flex items-center gap-3 p-3 bg-base-100 border-b">
      <button onClick={handleBack} className="btn btn-ghost btn-circle">
        <ArrowLeft size={24} />
      </button>
      <div className="avatar">
        <div className="w-10 rounded-full">
          <img
            src={channel.data.image || "/default-group-avatar.png"}
            alt="avatar"
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">
          {channel.data.name || "Group Chat"}
        </h3>
        <p className="text-xs text-gray-500">
          {channel.data.member_count} thành viên
        </p>
      </div>

      {/* Nút gọi video */}
      <button
        onClick={handleVideoCall}
        className="btn btn-ghost btn-circle text-primary"
      >
        <Video size={24} />
      </button>

      {/* 🟢 SỬA LỖI: Nút Quản lý hiển thị cho TẤT CẢ mọi người */}
      <button
        onClick={onOpenManageModal}
        className="btn btn-ghost btn-circle"
      >
        <Settings size={22} />
      </button>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  const { authUser } = useAuthUser();

  const { data: chatToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: videoToken } = useQuery({
    queryKey: ["videoToken"],
    queryFn: getVideoToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let mounted = true;
    let currChannelRef = null;

    const initChat = async () => {
      if (!chatToken?.token || !authUser || !groupId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        if (!client.user) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            chatToken.token
          );
        }

        const currChannel = client.channel("messaging", groupId);
        currChannelRef = currChannel;
        await currChannel.watch();

        if (!mounted) return;

        setChatClient(client);
        setChannel(currChannel);

        // Xác định quyền admin
        const adminId =
          currChannel.state?.created_by?.id ||
          currChannel.data?.created_by_id ||
          currChannel.data?.created_by?.id ||
          null;

        if (adminId && authUser?._id) {
          setIsGroupAdmin(adminId.toString() === authUser._id.toString());
        } else {
          setIsGroupAdmin(false);
        }

        // Lắng nghe sự kiện bắt đầu gọi nhóm
        const onGroupCallStarted = (event) => {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <p className="font-medium">
                {event.user?.name} đã bắt đầu cuộc gọi!
              </p>
              <button
                className="btn btn-sm btn-success"
                onClick={() => navigate(`/call/${event.call_id}`)}
              >
                Tham gia
              </button>
            </div>
          ));
        };
        currChannel.on("group-call-started", onGroupCallStarted);

        // Lắng nghe cập nhật channel
        const onChannelUpdated = () => {
          const updatedAdminId =
            currChannel.state?.created_by?.id ||
            currChannel.data?.created_by_id ||
            currChannel.data?.created_by?.id ||
            null;

          if (updatedAdminId && authUser?._id) {
            setIsGroupAdmin(updatedAdminId.toString() === authUser._id.toString());
          } else {
            setIsGroupAdmin(false);
          }
        };

        currChannel.on("updated", onChannelUpdated);
        currChannel.on("channel.updated", onChannelUpdated);
      } catch (error) {
        console.error("Error initializing group chat:", error);
        toast.error("Không thể kết nối trò chuyện.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      mounted = false;
      if (currChannelRef) {
        try {
          currChannelRef.off("group-call-started");
          currChannelRef.off("updated");
          currChannelRef.off("channel.updated");
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [chatToken, authUser, groupId, navigate]);

  const handleGroupVideoCall = async () => {
    if (!groupId) return;
    try {
      const { callId } = await startGroupCall(groupId);
      navigate(`/call/${callId}`);
    } catch (error) {
      toast.error("Không thể bắt đầu cuộc gọi.");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <Window>
              <CustomGroupHeader
                channel={channel}
                handleVideoCall={handleGroupVideoCall}
                // isAdmin={isGroupAdmin} // 🟢 BỎ: Không truyền prop này để ẩn nút nữa
                onOpenManageModal={() => setIsManageModalOpen(true)}
              />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

      {/* 🟢 SỬA LỖI: Modal hiện với mọi người, chỉ truyền prop isAdmin xuống để Modal tự xử lý nút Xóa */}
      {isManageModalOpen && (
        <ManageGroupModal
          channel={channel}
          isAdmin={isGroupAdmin} // Modal cần biết user có phải admin không để hiện nút xóa
          onClose={() => setIsManageModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GroupChatPage;