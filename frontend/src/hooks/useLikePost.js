import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from "../lib/api.js";
import  useAuthUser  from "./useAuthUser.js"; // Cần AuthUser

const useLikePost = () => {
    const queryClient = useQueryClient();
    const { data: authUser } = useAuthUser(); // Lấy user ID
    const currentUserId = authUser?._id;

    const { 
        mutate: likePostMutation, 
        isPending 
    } = useMutation({
        mutationFn: likePost, // Hàm API (postId) => { postId, likes }
        
        // Dùng 'onSuccess' thay vì 'invalidate'
        onSuccess: (data) => {
            // 'data' là kết quả trả về từ API, ví dụ: { postId, likes: [...] }
            if (!data || !currentUserId) return;

            const { postId, likes } = data;

            // 1. Cập nhật cache của Dòng thời gian ("posts")
            queryClient.setQueryData(["posts"], (oldData) => {
                if (!oldData) return [];
                // Tìm bài post và cập nhật mảng 'likes' của nó
                return oldData.map(post =>
                    post._id === postId ? { ...post, likes: likes } : post
                );
            });

            // 2. Cập nhật cache của Trang chi tiết (nếu có)
            queryClient.setQueryData(['postDetail', postId], (oldData) => {
                if (!oldData) return;
                return { ...oldData, likes: likes };
            });
        },
    });

    return { likePostMutation, isPending };
};

export default useLikePost;