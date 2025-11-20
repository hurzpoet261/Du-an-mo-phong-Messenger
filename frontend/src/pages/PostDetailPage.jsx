import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { postService } from '../services/postService.js'; 
import StatusItem from '../components/StatusItem.jsx'; 
import useAuthUser from '../hooks/useAuthUser.js'; 

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { authUser } = useAuthUser();
    const currentUserId = authUser?._id; 

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['postDetail', postId],
        queryFn: () => postService.getPostById(postId), 
        enabled: !!postId, 
    });
    
    const handleClose = () => {
        navigate(-1);
    };

    const handleModalUpdate = (updatedPost) => {
        queryClient.setQueryData(['postDetail', postId], updatedPost);
    };

    const handleModalLikesUpdate = (id, newLikes) => {
        queryClient.setQueryData(['postDetail', postId], (oldPost) => {
            if (!oldPost) return oldPost;
            return { ...oldPost, likes: newLikes };
        });
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
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    className="btn btn-sm btn-circle absolute right-4 top-4 z-10 bg-base-300 hover:bg-base-content hover:text-white border-none"
                    onClick={handleClose}
                >
                    <XIcon className="size-5" />
                </button>

                <div className="p-4 pt-10">
                    <StatusItem 
                        post={post} 
                        currentUserId={currentUserId} // 
                        isModalView={true} 
                        updatePostInFeed={handleModalUpdate}
                        updateLikesInFeed={handleModalLikesUpdate}

                    />
                </div>

            </div>
        </div>
    );
};

export default PostDetailPage;