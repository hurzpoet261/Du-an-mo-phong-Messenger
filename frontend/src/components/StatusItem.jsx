import React, { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react'; 
import { postService } from '../services/postService.js'; // Cập nhật đường dẫn tới service của bạn
import { formatDistanceToNowStrict, parseISO } from 'date-fns'; 
import { vi } from "date-fns/locale/vi";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom'; 

function StatusItem({ post, currentUserId, updateLikesInFeed, updatePostInFeed, onDeleteSuccess, isModalView }) { 
    
    const [commentText, setCommentText] = useState('');
    const isLiked = post.likes.includes(currentUserId);
    const isAuthor = post.author?._id === currentUserId; 
    const navigate = useNavigate();

    // 🟢 LỌC BÌNH LUẬN DỰA TRÊN isModalView
    const commentsToShow = isModalView 
        ? post.comments // Nếu là Modal/Detail, hiển thị TẤT CẢ
        : post.comments.slice(-2); // Nếu là Feed, chỉ hiển thị 2 bình luận cuối cùng

    const timeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';
        try { 
            return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: vi }); 
        } catch (e) { 
            return 'Không xác định'; 
        }
    }; 
    
    const handleLike = async () => {
        try {
            const { postId, likes } = await postService.likePost(post._id);
            updateLikesInFeed(postId, likes);
        } catch (error) {
            console.error("Lỗi Thích/Bỏ thích:", error.response?.data || error.message);
        }
    };
    
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        
        try {
            const updatedPost = await postService.addComment(post._id, commentText.trim());
            updatePostInFeed(updatedPost);
            setCommentText(''); 
            
        } catch (error) {
            console.error("Lỗi bình luận:", error.response?.data || error.message);
            toast.error("Bình luận thất bại. Vui lòng thử lại.");
        }
    };

    const handleDelete = () => {
        const executeDelete = async () => {
            try {
                await postService.deletePost(post._id);
                if (onDeleteSuccess) {
                    onDeleteSuccess(post._id);
                }
                toast.success('Xóa bài đăng thành công!', { duration: 2000 });
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi: Bạn không thể xóa bài đăng này.");
            }
        };

        toast((t) => (
            <div className="flex flex-col items-start p-2">
                <p className="font-semibold mb-2">Bạn có chắc chắn muốn xóa bài đăng này?</p>
                <div className="flex justify-end w-full gap-2 mt-2">
                    <button onClick={() => toast.dismiss(t.id)} className="btn btn-sm btn-ghost">
                        Hủy
                    </button>
                    <button 
                        onClick={() => { executeDelete(); toast.dismiss(t.id); }} 
                        className="btn btn-sm btn-error"
                    >
                        <Trash2 className="size-4" /> Xóa
                    </button>
                </div>
            </div>
        ), { duration: 999999, position: 'top-center' });
    };
    
    // Nút Comment kích hoạt Modal/Detail Page
    const handleCommentClick = () => {
        if (!isModalView) { 
            navigate(`/posts/${post._id}`);
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body p-0">
                
                {/* Header */}
                <div className="flex items-center p-4 pb-2">
                    <div className="avatar size-10 mr-3">
                        <img src={post.author?.profilePic || 'default_avatar.png'} alt={post.author?.fullName} className="rounded-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <span className="font-semibold text-sm">{post.author?.fullName}</span>
                        <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
                    </div>
                    
                    {isAuthor ? (
                        <div className="dropdown dropdown-end ml-auto">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle p-0">
                                <MoreHorizontal size={20} className="text-gray-500 cursor-pointer" />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36">
                                <li>
                                    <button onClick={handleDelete} className="text-error">
                                        <Trash2 size={16} /> Xóa Bài Đăng
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <MoreHorizontal size={20} className="text-gray-500 cursor-pointer ml-auto" />
                    )}
                </div>

                {/* Nội dung Text & Media */}
                <p className="px-4 pb-2 text-base whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                    <img src={post.image} alt="Post media" className="w-full object-contain max-h-[600px] block" />
                )}
                
                {/* Lượt thích và Số lượng Bình luận */}
                {(post.likes.length > 0 || post.comments.length > 0) && (
                    <div className="flex justify-between px-4 pt-2 text-sm text-gray-600">
                        {post.likes.length > 0 && <span>{post.likes.length} lượt thích</span>}
                        {post.comments.length > 0 && <span>{post.comments.length} bình luận</span>}
                    </div>
                )}
                
                <div className="divider my-1 px-4"></div> 
                
                {/* Actions (Like, Comment) */}
                <div className="flex justify-around text-gray-600 px-4 pb-3">
                    <button 
                        className={`btn btn-sm btn-ghost flex-grow ${isLiked ? 'text-primary' : ''}`}
                        onClick={handleLike} 
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} /> 
                        <span className="ml-1 font-semibold">Thích</span>
                    </button>
                    
                    <button 
                        className="btn btn-sm btn-ghost flex-grow"
                        onClick={handleCommentClick} 
                    >
                        <MessageSquare size={18} /> 
                        <span className="ml-1 font-semibold">Bình luận</span>
                    </button>
                </div>

                {/* Khu vực Comment */}
                <div className="px-4 pb-4">
                    
                    {/* Danh sách Comments */}
                    {commentsToShow.map(comment => (
                         <div key={comment._id} className="flex text-sm mt-2 items-start">
                             <img src={comment.author?.profilePic || 'default_avatar.png'} alt="Commenter" className="w-6 h-6 rounded-full mr-2 object-cover mt-1" />
                             <div className="bg-base-200 rounded-xl px-3 py-1">
                                 <span className="font-semibold">{comment.author?.fullName}: </span>
                                 <span>{comment.text}</span>
                             </div>
                         </div>
                    ))}
                    
                    {/* Nút Xem tất cả bình luận (Chỉ hiển thị ở Feed View) */}
                    {!isModalView && post.comments.length > 2 && (
                        <div className="mt-2 text-sm">
                            <Link to={`/posts/${post._id}`} className="text-primary hover:underline font-medium">
                                Xem tất cả {post.comments.length} bình luận
                            </Link>
                        </div>
                    )}
                    
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