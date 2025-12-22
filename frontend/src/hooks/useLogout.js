import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import { StreamChat } from "stream-chat"; // 🟢 1. Import Stream

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY; // 🟢 2. Lấy API Key

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // 🟢 3. NGẮT KẾT NỐI STREAM (QUAN TRỌNG NHẤT)
      const client = StreamChat.getInstance(STREAM_API_KEY);
      if (client) {
        await client.disconnectUser();
        console.log("🔒 Đã ngắt kết nối Stream Chat");
      }

      // 4. Xóa cache Auth của React Query (Logic cũ)
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // 5. (Tùy chọn) Reload trang để đảm bảo sạch sẽ 100%
      // window.location.reload(); 
    },
    onError: (error) => {
      console.error("Lỗi đăng xuất:", error);
    },
  });

  return { logoutMutation, isPending, error };
};

export default useLogout;