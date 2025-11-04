import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { postService } from '../services/postService.js'; 
import StatusItem from '../components/StatusItem.jsx'; 

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Tải chi tiết bài viết
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['postDetail', postId],
        queryFn: () => postService.getPostById(postId), 
        enabled: !!postId, 
    });
    
    const handleClose = () => {
        navigate(-1);
    };

    // Hàm cập nhật bài post (Sau khi Comment)
    const handleModalUpdate = (updatedPost) => {
        queryClient.setQueryData(['postDetail', postId], updatedPost);
    };

    // Hàm cập nhật likes
    const handleModalLikesUpdate = (id, newLikes) => {
        queryClient.setQueryData(['postDetail', postId], (oldPost) => {
            if (!oldPost) return oldPost;
            return { ...oldPost, likes: newLikes };
        });
        // Có thể thêm logic cập nhật cache của StatusFeedList nếu cần
    };

    // Xử lý Trạng thái Loading/Error
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
                <div className="text-error bg-base-200 p-4 rounded-lg shadow-xl flex items-center gap-3">
                    <XIcon className="size-6" /> Lỗi: Không tìm thấy bài viết hoặc phiên hết hạn.
                    <button className="btn btn-sm btn-error ml-4" onClick={handleClose}>Đóng</button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            
            <div 
                className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng Modal khi click vào nội dung
            >
                {/* Nút đóng */}
                <button 
                    className="btn btn-sm btn-circle absolute right-4 top-4 z-10 bg-base-300 hover:bg-base-content hover:text-white border-none"
                    onClick={handleClose}
                >
                    <XIcon className="size-5" />
                </button>

                {/* Nội dung Bài Viết chi tiết */}
                <div className="p-4 pt-10">
                    <StatusItem 
                        post={post} 
                        currentUserId={post.author._id} // ID người dùng hiện tại
                        isModalView={true} // BẮT BUỘC: Hiển thị tất cả bình luận và vô hiệu hóa routing
                        updatePostInFeed={handleModalUpdate}
                        updateLikesInFeed={handleModalLikesUpdate}
                    />
                </div>

            </div>
        </div>
    );
};

export default PostDetailPage;