import React, { useState, useMemo } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Trash2, Pencil, Send, X, Check } from 'lucide-react';
import { postService } from '../services/postService.js';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from "date-fns/locale/vi";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser.js';

function StatusItem({ post, currentUserId, updateLikesInFeed, updatePostInFeed, onDeleteSuccess, isModalView }) {
    const [commentText, setCommentText] = useState('');
    const navigate = useNavigate();

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editBuffer, setEditBuffer] = useState('');

    const isSameId = (id1, id2) => (id1 && id2 && id1.toString() === id2.toString());

    const isLiked = post.likes.includes(currentUserId);
    const isPostAuthor = isSameId(post.author?._id, currentUserId);

    const commentsToRender = useMemo(() => {
        return isModalView ? post.comments : post.comments.slice(-2);
    }, [post.comments, isModalView]);

    const timeAgo = (dateString) => {
        try { return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: vi }); } 
        catch (e) { return ''; }
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

    const confirmAction = (message, onConfirm) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-2">
                <p className="font-medium">{message}</p>
                <div className="flex gap-2 justify-end w-full">
                    <button onClick={() => toast.dismiss(t.id)} className="btn btn-xs btn-ghost">Hủy</button>
                    <button onClick={() => { onConfirm(); toast.dismiss(t.id); }} className="btn btn-xs btn-error text-white">Xóa</button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center' });
    };

    const handleDeletePost = () => {
        confirmAction("Xóa bài viết này?", async () => {
            try {
                await postService.deletePost(post._id);
                if (onDeleteSuccess) onDeleteSuccess(post._id);
                toast.success('Đã xóa bài viết');
            } catch (e) { toast.error(e.response?.data?.message || "Lỗi xóa bài"); }
        });
    };

    const handleDeleteComment = (commentId) => {
        confirmAction("Xóa bình luận này?", async () => {
            try {
                const updatedPost = await postService.deleteComment(post._id, commentId);
                updatePostInFeed(updatedPost);
                toast.success('Đã xóa bình luận');
            } catch (e) { toast.error("Không thể xóa bình luận"); }
        });
    };

    const startEdit = (commentId, text) => {
        setEditingCommentId(commentId);
        setEditBuffer(text);
    };

    const saveEdit = async (commentId) => {
        if (!editBuffer.trim()) return;
        try {
            const updatedPost = await postService.editComment(post._id, commentId, editBuffer.trim());
            updatePostInFeed(updatedPost);
            setEditingCommentId(null);
            toast.success('Đã sửa bình luận');
        } catch (error) { toast.error("Không thể sửa bình luận"); }
    };

    return (
        <div className="card bg-base-100 shadow-xl mb-4 border border-base-200">
            <div className="card-body p-0">
                
                <div className="flex items-center p-4 pb-2">
                    <img src={post.author?.profilePic || '/default_avatar.png'} alt="avt" className="w-10 h-10 rounded-full object-cover mr-3" />
                    <div className="flex-grow">
                        <p className="font-semibold text-sm">{post.author?.fullName}</p>
                        <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
                    </div>
                    {isPostAuthor && (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm"><MoreHorizontal size={20} /></div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40">
                                <li><button onClick={handleDeletePost} className="text-error"><Trash2 size={16} /> Xóa bài viết</button></li>
                            </ul>
                        </div>
                    )}
                </div>

                <p className="px-4 pb-2 text-sm sm:text-base whitespace-pre-wrap">{post.content}</p>
                <div className="media-container">
                    {post.video && (
                        <div className="w-full bg-black flex justify-center mt-1">
                             <video src={post.video} controls className="max-h-[500px] w-auto" />
                        </div>
                    )}
                    {post.images?.length > 0 && (
                        <div className={`grid gap-0.5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {post.images.map((img, idx) => (
                                <div key={idx} className="bg-base-200 flex items-center justify-center overflow-hidden max-h-[500px]">
                                    <img src={img} alt={`media-${idx}`} className="w-full h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {(post.likes.length > 0 || post.comments.length > 0) && (
                    <div className="flex justify-between px-4 py-2 text-xs text-gray-500 border-t border-base-200 mt-2">
                        <span>{post.likes.length} lượt thích</span>
                        <span>{post.comments.length} bình luận</span>
                    </div>
                )}
                
                <div className="flex border-y border-base-200 py-1">
                    <button className={`btn btn-ghost flex-1 rounded-none gap-2 ${isLiked ? 'text-error' : 'text-gray-500'}`} onClick={handleLike}>
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> <span className="hidden sm:inline">Thích</span>
                    </button>
                    <button className="btn btn-ghost flex-1 rounded-none text-gray-500 gap-2" onClick={() => !isModalView && navigate(`/posts/${post._id}`)}>
                        <MessageSquare size={20} /> <span className="hidden sm:inline">Bình luận</span>
                    </button>
                </div>

                <div className="px-4 py-3 bg-base-100/50">
                    {commentsToRender.map(comment => {
                        const isEditing = editingCommentId === comment._id;
                        const isCommentOwner = isSameId(comment.author?._id, currentUserId);
                        const canDelete = isCommentOwner || isPostAuthor;
                        const canEdit = isCommentOwner;

                        return (
                            <div key={comment._id} className="flex gap-2 mb-3 group relative">
                                <img src={comment.author?.profilePic || '/default_avatar.png'} className="w-8 h-8 rounded-full object-cover mt-1" alt="avatar" />
                                <div className="flex-1 min-w-0">
                                    {isEditing ? (
                                        <div className="flex gap-2 items-center w-full">
                                            <input className="input input-sm input-bordered flex-grow" value={editBuffer} onChange={(e) => setEditBuffer(e.target.value)} autoFocus />
                                            <button onClick={() => saveEdit(comment._id)} className="btn btn-xs btn-circle btn-success text-white"><Check size={14} /></button>
                                            <button onClick={() => setEditingCommentId(null)} className="btn btn-xs btn-circle btn-ghost"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-base-200 p-2.5 rounded-2xl inline-block max-w-full">
                                                <span className="font-semibold text-sm block">{comment.author?.fullName}</span>
                                                <span className="text-[15px] break-words whitespace-pre-wrap">{comment.text}</span>
                                            </div>
                                            {isModalView && (canEdit || canDelete) && (
                                                <div className="flex gap-2 text-xs text-gray-500 ml-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0">
                                                    {canEdit && <button onClick={() => startEdit(comment._id, comment.text)} className="hover:text-primary p-1 bg-base-100 rounded-full shadow-sm"><Pencil size={14} /></button>}
                                                    {canDelete && <button onClick={() => handleDeleteComment(comment._id)} className="hover:text-error p-1 bg-base-100 rounded-full shadow-sm"><Trash2 size={14} /></button>}
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
                        <img src={useAuthUser?.profilePic || '/default_avatar.png'} className="w-8 h-8 rounded-full object-cover" alt="my-avt" />
                         <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Viết bình luận..."
                                className="input input-bordered w-full pr-10 rounded-full h-10 min-h-0"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-sm btn-circle btn-ghost text-primary" disabled={!commentText.trim()}><Send size={18} /></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StatusItem;