import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../lib/api.js";

/**
 * Hook để lấy chi tiết một bài viết
 * @param {string} postId ID của bài viết cần lấy
 */
const useGetPostById = (postId) => {
    const { 
        data: post, 
        isLoading, 
        error 
    } = useQuery({
        // Key này khớp với key bạn đã dùng trong component
        queryKey: ['postDetail', postId], 
        
        // Sử dụng hàm API mới của chúng ta
        queryFn: () => getPostById(postId), 
        
        // Chỉ chạy query này khi postId tồn tại
        enabled: !!postId, 
    });

    return { post, isLoading, error };
};

export default useGetPostById;