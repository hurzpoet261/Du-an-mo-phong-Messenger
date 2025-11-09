import React, { useState } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Trash2, Send } from 'lucide-react';
import { postService } from '../services/postService.js';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from "date-fns/locale/vi";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

function StatusItem({ post, currentUserId, updateLikesInFeed, updatePostInFeed, onDeleteSuccess, isModalView }) {
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const navigate = useNavigate();

    const isLiked = post.likes.includes(currentUserId);
    const isPostAuthor = post.author?._id === currentUserId;
    const commentsToRender = isModalView ? post.comments : post.comments.slice(-2);

    const timeAgo = (dateString) => {
        if (!dateString) return 'Vừa xong';
        try { return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: vi }); } catch (e) { return ''; }
    };

    const handleLike = async () => {
        try {
            const { postId, likes } = await postService.likePost(post._id);
            updateLikesInFeed(postId, likes);
        } catch (error) { console.error("Lỗi Like:", error); }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const updatedPost = await postService.addComment(post._id, commentText.trim());
            updatePostInFeed(updatedPost);
            setCommentText('');
            toast.success('Đã bình luận');
        } catch (error) { toast.error("Bình luận thất bại"); }
    };

    const handleDeletePost = () => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Xóa bài viết này?</p>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="btn btn-xs">Hủy</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await postService.deletePost(post._id);
                            if (onDeleteSuccess) onDeleteSuccess(post._id);
                            toast.success('Đã xóa bài viết');
                        } catch (e) { toast.error(e.response?.data?.message || "Lỗi xóa bài"); }
                    }} className="btn btn-xs btn-error text-white">Xóa</button>
                </div>
            </div>
        ));
    };

    const handleDeleteComment = (commentId) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Xóa bình luận này?</p>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="btn btn-xs">Hủy</button>
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const updatedPost = await postService.deleteComment(post._id, commentId);
                            updatePostInFeed(updatedPost);
                            toast.success('Đã xóa bình luận');
                        } catch (e) { toast.error("Không thể xóa bình luận"); }
                    }} className="btn btn-xs btn-error text-white">Xóa</button>
                </div>
            </div>
        ));
    };

    const handleEditComment = async (commentId, currentText) => {
        const newText = prompt("Chỉnh sửa bình luận:", currentText);
        if (newText && newText.trim() !== currentText) {
            try {
                const updatedPost = await postService.editComment(post._id, commentId, newText.trim());
                updatePostInFeed(updatedPost);
                toast.success('Đã sửa bình luận');
            } catch (error) { toast.error("Không thể sửa bình luận"); }
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl mb-4 border border-base-200">
            <div className="card-body p-0">
                {/* Header */}
                <div className="flex items-center p-4 pb-2">
                    <img src={post.author?.profilePic || '/default_avatar.png'} alt="avt" className="w-10 h-10 rounded-full object-cover mr-3" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{post.author?.fullName}</p>
                        <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                    </div>
                    {isPostAuthor && (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm"><MoreHorizontal size={20} /></div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                                <li><button onClick={handleDeletePost} className="text-error"><Trash2 size={16} /> Xóa</button></li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Content & Media */}
                <p className="px-4 pb-2 text-sm whitespace-pre-wrap">{post.content}</p>
                <div className="media-container">
                    {/* A. Hiển thị VIDEO (nếu có) */}
                    {post.video && (
                        <div className="w-full bg-black flex justify-center mt-1">
                            <video src={post.video} controls className="max-h-[500px] w-auto" />
                        </div>
                    )}
                    
                    {/* B. Hiển thị MẢNG ẢNH (post.images) */}
                    {post.images?.length > 0 && (
                        <div className={`grid gap-0.5 mt-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {post.images.map((img, idx) => (
                                <div key={idx} className="bg-base-200 flex items-center justify-center overflow-hidden max-h-[500px]">
                                    {/* 🟢 SỬA LỖI: Dùng object-contain để hiển thị toàn bộ ảnh, kể cả ảnh ngang */}
                                    <img src={img} alt={`media-${idx}`} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex border-y border-base-200 py-1 mt-2">
                    <button className={`btn btn-ghost flex-1 ${isLiked ? 'text-error' : 'text-gray-500'}`} onClick={handleLike}>
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> <span className="hidden sm:inline">Thích</span>
                    </button>
                    <button className="btn btn-ghost flex-1 text-gray-500" onClick={() => !isModalView && navigate(`/posts/${post._id}`)}>
                        <MessageSquare size={20} /> <span className="hidden sm:inline">Bình luận</span>
                    </button>
                </div>

                {/* Comments Section */}
                <div className="px-4 py-3 bg-base-100/50">
                    {commentsToRender.map(comment => {
                        const isCommentOwner = comment.author?._id === currentUserId;
                        const canDelete = isCommentOwner || isPostAuthor;
                        const canEdit = isCommentOwner;
                        const isEditing = editingCommentId === comment._id;

                        return (
                            <div key={comment._id} className="flex gap-2 mb-3 group">
                                <img src={comment.author?.profilePic || '/default_avatar.png'} className="w-8 h-8 rounded-full object-cover mt-1" />
                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="flex gap-2 items-center">
                                            <input className="input input-sm input-bordered flex-1" value={editBuffer} onChange={(e) => setEditBuffer(e.target.value)} autoFocus />
                                            <button onClick={() => saveEdit(comment._id)} className="btn btn-xs btn-circle btn-success text-white"><Check size={14} /></button>
                                            <button onClick={() => setEditingCommentId(null)} className="btn btn-xs btn-circle btn-ghost"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-base-200 p-2.5 rounded-2xl inline-block max-w-full">
                                                <span className="font-semibold text-sm block">{comment.author?.fullName}</span>
                                                <span className="text-[15px] break-words">{comment.text}</span>
                                            </div>
                                            {isModalView && (canEdit || canDelete) && (
                                                <div className="flex gap-2 text-xs text-gray-500 ml-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {canEdit && <button onClick={() => startEdit(comment._id, comment.text)} className="hover:text-primary">Sửa</button>}
                                                    {canDelete && <button onClick={() => handleDeleteComment(comment._id)} className="hover:text-error">Xóa</button>}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {!isModalView && post.comments.length > 2 && (
                        <Link to={`/posts/${post._id}`} className="text-sm text-gray-500 hover:underline block mt-2">
                            Xem tất cả {post.comments.length} bình luận
                        </Link>
                    )}

                    <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-4 relative">
                        <input type="text" placeholder="Viết bình luận..." className="input input-bordered w-full pr-10 rounded-full" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-sm btn-circle btn-ghost text-primary" disabled={!commentText.trim()}><Send size={18} /></button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StatusItem;