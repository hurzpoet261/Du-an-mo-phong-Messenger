import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../lib/api.js";

const useCreatePost = () => {
    const queryClient = useQueryClient();

    const {
        mutate: createPostMutation,
        isPending,
        isSuccess,
        error,
    } = useMutation({
        mutationFn: (formData) => createPost(formData), // Hàm API sẽ nhận formData
        
        onSuccess: () => {
            // Rất quan trọng:
            // Sau khi tạo post thành công, hãy báo cho TanStack Query rằng
            // dữ liệu của query "posts" (từ useGetAllPosts) đã cũ.
            // Nó sẽ tự động refetch (gọi lại getAllPosts) để cập nhật UI.
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    return { createPostMutation, isPending, isSuccess, error };
};

export default useCreatePost;