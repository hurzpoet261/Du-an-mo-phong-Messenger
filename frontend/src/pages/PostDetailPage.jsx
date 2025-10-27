import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { postService } from '../services/postService.js'; 
import StatusItem from '../components/StatusItem.jsx'; // Tái sử dụng để hiển thị toàn bộ nội dung

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    
    // 🟢 Tải chi tiết bài viết
    const { data: post, isLoading, error } = useQuery({
        queryKey: ['postDetail', postId],
        queryFn: () => postService.getPostById(postId), // 🚨 Cần triển khai hàm getPostById
        enabled: !!postId,
    });
    
    const handleClose = () => {
        navigate(-1); // Quay lại trang trước (SearchPage)
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }
    
    if (error || !post) {
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center" onClick={handleClose}>
                <div className="alert alert-error max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <span>Lỗi: Không tìm thấy bài viết chi tiết.</span>
                </div>
            </div>
        );
    }

    return (
        // KHUNG PHỦ MỜ VÀ MODAL
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            
            <div 
                className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nút đóng */}
                <button 
                    className="btn btn-sm btn-circle absolute right-4 top-4 z-10 bg-base-300 hover:bg-base-content hover:text-white border-none"
                    onClick={handleClose}
                >
                    <XIcon className="size-5" />
                </button>

                {/* NỘI DUNG BÀI VIẾT (Sử dụng StatusItem để hiển thị chi tiết) */}
                <div className="p-4">
                    {/* 🚨 Tái sử dụng StatusItem để hiển thị chi tiết (đã bao gồm Likes/Comments) */}
                    <StatusItem 
                        post={post} 
                        currentUserId={post.author._id} // Giả định
                        isModalView={true} 
                        // Các props khác (update likes/comments)
                    />
                </div>

            </div>
        </div>
    );
};

export default PostDetailPage;