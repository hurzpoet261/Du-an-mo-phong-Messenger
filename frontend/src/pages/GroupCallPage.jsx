import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getVideoToken } from "../lib/api"; // Dùng hàm getVideoToken

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  CallParticipantsList, // 🟢 Thêm cái này cho nhóm
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupCallPage = () => {
  const { callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const { authUser } = useAuthUser();

  // Lấy Video Token
  const { data: tokenData } = useQuery({
    queryKey: ["videoToken"], // Key khác với chat
    queryFn: getVideoToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !callId) return;

    const initCall = async () => {
      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Lỗi tham gia cuộc gọi nhóm:", error);
        toast.error("Không thể tham gia cuộc gọi.");
      }
    };

    initCall();

    // Cleanup
    return () => {
        if (client) client.disconnectUser();
        if (call) call.leave();
    };
  }, [tokenData, authUser, callId]);

  if (!client || !call) return <PageLoader />;

  return (
    <div className="h-screen w-full bg-gray-900 text-white">
      <StreamVideo client={client}>
        <StreamCall call={call}>
           <GroupCallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const GroupCallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // Khi rời cuộc gọi, quay lại trang trước (Trang chat nhóm)
  if (callingState === CallingState.LEFT) {
      navigate(-1);
      return null;
  }

  return (
    <StreamTheme>
      <div className="flex h-full w-full flex-col">
        {/* Khu vực Video */}
        <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1">
                <SpeakerLayout participantsBarPosition="bottom" />
            </div>
            {/* Danh sách người tham gia (ẩn trên mobile nếu cần) */}
            <div className="hidden md:block w-72 border-l border-gray-700 bg-gray-800 p-4">
                 <h3 className="font-bold mb-4">Thành viên</h3>
                 <CallParticipantsList onClose={() => {}} />
            </div>
        </div>

        {/* Thanh điều khiển */}
        <div className="p-4 flex justify-center bg-gray-800">
            <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default GroupCallPage;