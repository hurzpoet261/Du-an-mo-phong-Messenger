import React, { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal } from 'lucide-react'; 
import { postService } from '../services/postService.js';
import { formatDistanceToNowStrict, parseISO } from 'date-fns'; 
import { vi } from 'date-fns/locale';

function StatusItem({ post, currentUserId, updateLikesInFeed, updatePostInFeed }) { 
    
    const isLiked = post.likes.includes(currentUserId);
    const [commentText, setCommentText] = useState('');
    
    // 🟢 Cập nhật: Handle Like
    const handleLike = async () => {
        try {
            const { postId, likes } = await postService.likePost(post._id);
            updateLikesInFeed(postId, likes); // Cập nhật mảng likes
        } catch (error) {
            console.error("Lỗi Thích/Bỏ thích:", error.response?.data || error.message);
        }
    };
    
    // 🟢 Cập nhật: Handle Comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        
        try {
            const updatedPost = await postService.addComment(post._id, commentText.trim());
            updatePostInFeed(updatedPost); // Cập nhật toàn bộ bài post trong Feed List
            setCommentText(''); 
            
        } catch (error) {
            console.error("Lỗi bình luận:", error.response?.data || error.message);
            alert("Bình luận thất bại. Vui lòng thử lại.");
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
        <div className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body p-0">
                
                {/* 1. Header (Dùng post.author) */}
                <div className="flex items-center p-4 pb-2">
                    <div className="avatar size-10 mr-3">
                        {/* 🟢 Dùng author?.profilePic */}
                        <img src={post.author?.profilePic || 'default_avatar.png'} alt={post.author?.fullName} className="rounded-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-grow">
                        {/* 🟢 Dùng author?.fullName */}
                        <span className="font-semibold text-sm">{post.author?.fullName}</span>
                        <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
                    </div>
                    <MoreHorizontal size={20} className="text-gray-500 cursor-pointer" /> 
                </div>

                {/* 2. Nội dung Text & Media */}
                <p className="px-4 pb-2 text-base whitespace-pre-wrap">{post.content}</p>
                {post.image && (<img src={post.image} alt="Post media" className="w-full object-cover max-h-96" />)}
                
                {/* Lượt thích và Số lượng Bình luận */}
                {(post.likes.length > 0 || post.comments.length > 0) && (
                    <div className="flex justify-between px-4 pt-2 text-sm text-gray-600">
                        {post.likes.length > 0 && <span>{post.likes.length} lượt thích</span>}
                        {post.comments.length > 0 && <span>{post.comments.length} bình luận</span>}
                    </div>
                )}
                
                <div className="divider my-1 px-4"></div> 
                
                {/* 4. Actions (Like, Comment) */}
                <div className="flex justify-around text-gray-600 px-4 pb-3">
                    <button 
                        className={`btn btn-sm btn-ghost flex-grow ${isLiked ? 'text-primary' : ''}`}
                        onClick={handleLike} 
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> 
                        <span className="ml-1 font-semibold">Thích</span>
                    </button>
                    <button className="btn btn-sm btn-ghost flex-grow">
                        <MessageSquare size={18} /> 
                        <span className="ml-1 font-semibold">Bình luận</span>
                    </button>
                </div>

                {/* 5. Khu vực Comment */}
                <div className="px-4 pb-4">
                    {/* Danh sách Comments */}
                    {post.comments.map(comment => (
                         <div key={comment._id} className="flex text-sm mt-2 items-start">
                            <img src={comment.author?.profilePic || 'default_avatar.png'} alt="Commenter" className="w-6 h-6 rounded-full mr-2 object-cover mt-1" />
                            <div className="bg-base-200 rounded-xl px-3 py-1">
                                <span className="font-semibold">{comment.author?.fullName}: </span>
                                <span>{comment.text}</span>
                            </div>
                         </div>
                    ))}
                    
                    {/* Form Comment */}
                    <form onSubmit={handleCommentSubmit} className="flex mt-3 gap-2">
                         <img src={currentUserId?.profilePic || 'default_avatar.png'} alt="My Avatar" className="w-8 h-8 rounded-full object-cover" />
                        <input
                            type="text"
                            placeholder="Viết bình luận..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="input input-sm input-bordered flex-grow rounded-full"
                        />
                        <button type="submit" className="btn btn-sm btn-primary btn-circle" disabled={!commentText.trim()}>
                            <MessageSquare size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StatusItem;