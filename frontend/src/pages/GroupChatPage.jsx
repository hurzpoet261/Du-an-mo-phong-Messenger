import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken, startGroupCall } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import { ArrowLeft, Video, Users } from "lucide-react";
import ManageGroupModal from "../components/ManageGroupModal.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CustomGroupHeader = ({ channel, handleVideoCall, onOpenManageModal, isCallLoading }) => {
  const navigate = useNavigate();
  const handleBack = () => navigate("/chat");
  const groupName = channel.data?.name || "Nhóm Chat";
  const memberCount = Object.keys(channel.state.members || {}).length;

  return (
    <div className="flex items-center justify-between p-3 bg-base-100 border-b shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={handleBack} className="btn btn-ghost btn-circle btn-sm"><ArrowLeft className="size-5" /></button>
        <div className="flex flex-col">
          <span className="font-bold text-lg truncate max-w-[200px]">{groupName}</span>
          <span className="text-xs text-base-content/60">{memberCount} thành viên</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleVideoCall} className={`btn btn-ghost btn-circle ${isCallLoading ? "opacity-50" : "text-primary"}`} disabled={isCallLoading}>
          {isCallLoading ? <span className="loading loading-spinner loading-xs"></span> : <Video className="size-6" />}
        </button>
        <button onClick={onOpenManageModal} className="btn btn-ghost btn-circle"><Users className="size-6" /></button>
      </div>
    </div>
  );
};

const GroupChatPage = () => {
  const { groupId } = useParams();
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token || !groupId) return;
    const initChat = async () => {
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        if (client.userID !== authUser._id) {
           if (client.userID) await client.disconnectUser();
           await client.connectUser({ id: authUser._id, name: authUser.fullName, image: authUser.profilePic }, tokenData.token);
        }
        const currChannel = client.channel("messaging", groupId);
        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Chat Init Error:", error);
      }
    };
    initChat();
  }, [authUser, tokenData, groupId]);

  // Handle Start Call (Sender)
  const handleGroupVideoCall = async () => {
    if (!groupId || isCallLoading) return;
    setIsCallLoading(true);
    try {
      const { callId } = await startGroupCall(groupId);
      navigate(`/group-call/${callId}`); 
    } catch (error) {
      toast.error("Không thể bắt đầu cuộc gọi.");
    } finally {
      setIsCallLoading(false);
    }
  };

  if (!chatClient || !channel) return <ChatLoader />;
  const isGroupAdmin = channel.data?.created_by_id === authUser?._id;

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative h-full flex flex-col">
            <Window>
              <CustomGroupHeader channel={channel} handleVideoCall={handleGroupVideoCall} onOpenManageModal={() => setIsManageModalOpen(true)} isCallLoading={isCallLoading} />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
      {isManageModalOpen && <ManageGroupModal channel={channel} isAdmin={isGroupAdmin} onClose={() => setIsManageModalOpen(false)} />}
    </div>
  );
};

export default GroupChatPage;