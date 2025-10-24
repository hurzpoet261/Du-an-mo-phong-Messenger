import React from 'react';
import { Heart, MessageSquare, MoreHorizontal } from 'lucide-react'; 
import { postService } from '../services/postService.js';
import { formatDistanceToNowStrict, parseISO } from 'date-fns'; 
import { vi } from 'date-fns/locale';

function StatusItem({ post, currentUserId, updateFeedPost }) { 
    
    const isLiked = post.likes.includes(currentUserId);
    
    const handleLike = async () => {
        try {
            const updatedPost = await postService.likePost(post._id);
            updateFeedPost(updatedPost); 
        } catch (error) {
            console.error("Lỗi Thích/Bỏ thích:", error.response?.data || error.message);
        }
    };

    const timeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';
        try {
             return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: vi });
        } catch (e) {
            return 'Không xác định';
        }
    }; 

    return (
        <div className="card bg-base-100 shadow-xl mb-4"> {/* Dùng card bg-base-100 */}
            <div className="card-body p-0">
                
                {/* 1. Header (Người dùng và Thời gian) */}
                <div className="flex items-center p-4 pb-2">
                    <div className="avatar size-10 mr-3">
                        <img src={post.userId?.avatar || 'default_avatar.png'} alt={post.userId?.name} className="rounded-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <span className="font-semibold text-sm">{post.userId?.name}</span>
                        <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
                    </div>
                    <MoreHorizontal size={20} className="text-gray-500 cursor-pointer" /> 
                </div>

                {/* 2. Nội dung Text */}
                <p className="px-4 pb-2 text-base whitespace-pre-wrap">{post.content}</p>
                
                {/* 3. Media (Ảnh/Video) - Không padding, để tràn sát cạnh card-body */}
                {post.image && (
                    <img src={post.image} alt="Post media" className="w-full object-cover max-h-96" />
                )}
                
                {/* Lượt thích */}
                {post.likes.length > 0 && (
                    <div className="px-4 pt-2 text-sm text-gray-600">
                        {post.likes.length} lượt thích
                    </div>
                )}
                
                {/* 4. Actions (Like, Comment) */}
                <div className="divider my-1 px-4"></div> {/* Đường phân cách */}
                
                <div className="flex justify-around text-gray-600 px-4 pb-3">
                    {/* Nút Like */}
                    <button 
                        className={`btn btn-sm btn-ghost flex-grow ${isLiked ? 'text-primary' : ''}`}
                        onClick={handleLike}
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> 
                        <span className="ml-1 font-semibold">Thích</span>
                    </button>
                    
                    {/* Nút Comment */}
                    <button className="btn btn-sm btn-ghost flex-grow">
                        <MessageSquare size={18} /> 
                        <span className="ml-1 font-semibold">Bình luận</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StatusItem;