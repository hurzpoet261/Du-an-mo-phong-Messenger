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
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams(); // Lấy callId từ URL
  const { authUser } = useAuthUser();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  // Lấy Token
  const { data: tokenData } = useQuery({
    queryKey: ["videoToken"],
    queryFn: getVideoToken,
    enabled: !!authUser,
  });

  // 🛡️ Singleton Ref: Giữ kết nối ổn định, tránh tạo lại nhiều lần
  const connectionRef = useRef({ client: null, call: null });

  useEffect(() => {
    if (!tokenData?.token || !authUser || !callId) return;

    const initCall = async () => {
      // Nếu đã có kết nối thì không tạo lại
      if (connectionRef.current.client) return;

      try {
        console.log("📞 Đang khởi tạo cuộc gọi 1-1...");

        // 1. Tạo Client
        const _client = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token: tokenData.token,
        });

        // 2. Tạo Call Instance
        const _call = _client.call("default", callId);

        // 3. Join
        await _call.join({ create: true });

        // Lưu Ref và State
        connectionRef.current = { client: _client, call: _call };
        setClient(_client);
        setCall(_call);

      } catch (error) {
        console.error("Lỗi Call:", error);
        toast.error("Không thể kết nối cuộc gọi.");
        navigate("/"); // Quay về trang chủ nếu lỗi
      }
    };

    initCall();

    // Cleanup: Dọn dẹp khi rời trang
    return () => {
      const cleanup = async () => {
        const { client: c, call: cl } = connectionRef.current;
        if (cl) await cl.leave().catch(e => console.warn(e));
        if (c) await c.disconnectUser().catch(e => console.warn(e));
        
        // Tắt Camera thủ công để tránh lỗi "Device in use"
        if (window.stream) {
           window.stream.getTracks().forEach(track => track.stop());
        }
        
        connectionRef.current = { client: null, call: null };
      };
      cleanup();
    };
  }, [tokenData, authUser, callId, navigate]);

  if (!client || !call) return <PageLoader />;

  return (
    <div className="h-screen w-full bg-black text-white">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  // Khi kết thúc cuộc gọi -> Quay lại trang Chat (hoặc trang chủ)
  if (callingState === CallingState.LEFT) {
    setTimeout(() => {
      navigate(-1); // Quay lại trang trước đó
    }, 0);
    return <PageLoader />;
  }

  return (
    <StreamTheme>
      <div className="h-full w-full relative bg-black overflow-hidden">
        {/* Video Area */}
        <div className="h-full w-full flex items-center justify-center p-4">
           <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gray-900/60 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-xl">
            <CallControls onLeave={() => navigate(-1)} />
          </div>
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;