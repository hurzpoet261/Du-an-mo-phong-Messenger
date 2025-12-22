import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GlobalCallListener = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  
  // 🛡️ CHỐT CHẶN: Danh sách các Call ID đã xử lý để chống lặp
  const processedCallIds = useRef(new Set());

  // Lấy token (React Query sẽ cache lại, không gọi API nhiều lần)
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: Infinity, // Giữ token luôn tươi mới, không fetch lại lung tung
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token) return;

    const initListener = async () => {
      const client = StreamChat.getInstance(STREAM_API_KEY);

      // 1. KẾT NỐI (Singleton Pattern)
      // Chỉ kết nối nếu chưa có hoặc user không khớp
      if (client.userID !== authUser._id) {
        if (client.userID) await client.disconnectUser();
        try {
            await client.connectUser(
                {
                id: authUser._id,
                name: authUser.fullName,
                image: authUser.profilePic,
                },
                tokenData.token
            );
        } catch (error) {
            console.error("Global Listener Connect Error:", error);
            return;
        }
      }

      // 2. HÀM XỬ LÝ SỰ KIỆN CHUNG (Cho cả Group và 1-1)
      const handleIncomingCall = (event) => {
        // Bỏ qua nếu là mình gọi
        if (event.user.id === authUser._id) return;

        const callId = event.call_id;
        const isGroupCall = event.type === 'group-call-started';

        // 🛑 CHECK DUPLICATE
        if (processedCallIds.current.has(callId)) return;
        
        processedCallIds.current.add(callId);
        // Xóa khỏi bộ nhớ sau 45s
        setTimeout(() => processedCallIds.current.delete(callId), 45000);

        // HIỆN THÔNG BÁO
        const toastId = `call-${callId}`;
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img className="h-10 w-10 rounded-full object-cover" src={event.user.image || "/avatar.png"} alt="" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.user.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {isGroupCall ? "📞 Mời họp nhóm..." : "📞 Đang gọi video..."}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(toastId);
                  // Điều hướng thông minh dựa trên loại cuộc gọi
                  if (isGroupCall) {
                      navigate(`/group-call/${callId}`);
                  } else {
                      navigate(`/call/${callId}`);
                  }
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Trả lời
              </button>
            </div>
          </div>
        ), { id: toastId, duration: 20000 });
      };

      // 3. ĐĂNG KÝ SỰ KIỆN
      client.on("call-started", handleIncomingCall);       // Sự kiện 1-1
      client.on("group-call-started", handleIncomingCall); // Sự kiện Group

      // 4. CLEANUP (Chỉ gỡ sự kiện, KHÔNG ngắt kết nối User để giữ app chạy mượt)
      return () => {
        client.off("call-started", handleIncomingCall);
        client.off("group-call-started", handleIncomingCall);
      };
    };

    // Gọi hàm init
    const cleanupPromise = initListener();

    return () => {
        cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [authUser, tokenData, navigate]);

  // Component này không render giao diện gì cả
  return null;
};

export default GlobalCallListener;