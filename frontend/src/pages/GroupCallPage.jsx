import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getVideoToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  // CallParticipantsList, // ❌ Đã loại bỏ component này
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// ==========================================
// PHẦN LOGIC KẾT NỐI (GIỮ NGUYÊN Y HỆT BẢN TRƯỚC ĐỂ ĐẢM BẢO HOẠT ĐỘNG)
// ==========================================
const GroupCallPage = () => {
  const { callId } = useParams();
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["videoToken"],
    queryFn: getVideoToken,
    enabled: !!authUser,
  });

  const connectionRef = useRef({ client: null, call: null });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !callId) return;

    const initCall = async () => {
      if (connectionRef.current.client) return;

      try {
        const _client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token: tokenData.token,
        });

        const _call = _client.call("default", callId);
        await _call.join({ create: true });

        connectionRef.current = { client: _client, call: _call };
        setClient(_client);
        setCall(_call);
      } catch (error) {
        console.error("Lỗi Video Call:", error);
        toast.error("Không thể kết nối. Vui lòng F5.");
        navigate("/chat");
      }
    };

    initCall();

    return () => {
      const cleanup = async () => {
        const { client: c, call: cl } = connectionRef.current;
        if (cl) await cl.leave().catch((e) => console.warn(e));
        if (c) await c.disconnectUser().catch((e) => console.warn(e));
        if (window.stream) {
          window.stream.getTracks().forEach((track) => track.stop());
        }
        connectionRef.current = { client: null, call: null };
      };
      cleanup();
    };
  }, [tokenData, authUser, callId, navigate]);

  if (!client || !call) return <PageLoader />;

  return (
    // Đổi màu nền sang đen tuyền cho tập trung
    <div className="h-screen w-full bg-black text-white">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <GroupCallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

// ==========================================
// PHẦN GIAO DIỆN MỚI (ĐƠN GIẢN HÓA)
// ==========================================
const GroupCallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) {
    setTimeout(() => {
      navigate("/chat");
    }, 0);
    return <PageLoader />;
  }

  return (
    <StreamTheme>
      {/* Container chính: full màn hình, relative để chứa nút nổi */}
      <div className="h-full w-full relative bg-black overflow-hidden font-sans">
        
        {/* 1. KHU VỰC VIDEO CHÍNH (Tràn viền) */}
        <div className="h-full w-full flex items-center justify-center p-2 md:p-4">
           {/* SpeakerLayout tự động sắp xếp lưới video đẹp mắt */}
           <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* 2. THANH ĐIỀU KHIỂN NỔI (Floating Controls) */}
        {/* Nằm ở dưới đáy, giữa màn hình, nổi lên trên video */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          {/* Tạo hiệu ứng kính mờ (backdrop-blur) và bo tròn cho thanh điều khiển */}
          <div className="bg-gray-900/60 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-2xl transition-all hover:bg-gray-900/80">
            <CallControls onLeave={() => navigate("/chat")} />
          </div>
        </div>
        
      </div>
    </StreamTheme>
  );
};

export default GroupCallPage;