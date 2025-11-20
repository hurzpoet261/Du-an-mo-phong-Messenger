import React, { useState, useEffect, useMemo } from 'react';
import { Heart, MessageSquare, MoreHorizontal, Trash2, Pencil, Send, X, Check } from 'lucide-react';
import { postService } from '../services/postService.js';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from "date-fns/locale/vi";
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser.js';

/**
 * StatusItem (final)
 * - Giữ lại toàn bộ tính năng cũ (like, comment, edit/delete comment, delete post, menu...)
 * - Thêm gallery ảnh nâng cao (nhận diện orientation, chọn ảnh chính, layout responsive giống Facebook)
 * - Hỗ trợ tối đa 5 ảnh (frontend logic), hiển thị video nếu có
 *
 * Props:
 * - post: object (expect fields: _id, author, content, images[], video, likes[], comments[], createdAt)
 * - currentUserId: string | number (id của user hiện tại)
 * - updateLikesInFeed(postId, likes) : callback cập nhật likes
 * - updatePostInFeed(post) : callback cập nhật post
 * - onDeleteSuccess(postId) : callback khi xóa post thành công
 * - isModalView: boolean (nếu true show all comments & edit/delete controls)
 */

function StatusItem({ post, currentUserId, updateLikesInFeed, updatePostInFeed, onDeleteSuccess, isModalView }) {
    const [commentText, setCommentText] = useState('');
    const navigate = useNavigate();

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editBuffer, setEditBuffer] = useState('');

    const [imageMeta, setImageMeta] = useState([]); // [{ idx, src, width, height, area, orientation }]

    const authUser = useAuthUser?.(); // hook may return current user object
    const myProfilePic = authUser?.profilePic || '/default_avatar.png';

    const isSameId = (id1, id2) => (id1 && id2 && id1.toString() === id2.toString());

    const isLiked = useMemo(() => {
        return Array.isArray(post.likes) && post.likes.includes(currentUserId);
    }, [post.likes, currentUserId]);

    const isPostAuthor = isSameId(post.author?._id, currentUserId);

    const commentsToRender = useMemo(() => {
        return isModalView ? (post.comments || []) : ((post.comments || []).slice(-2));
    }, [post.comments, isModalView]);

    const timeAgo = (dateString) => {
        try { return formatDistanceToNowStrict(parseISO(dateString), { addSuffix: true, locale: vi }); }
        catch (e) { return ''; }
    };

    // Like
    const handleLike = async () => {
        try {
            const { postId, likes } = await postService.likePost(post._id);
            if (updateLikesInFeed) updateLikesInFeed(postId, likes);
        } catch (error) {
            console.error("Lỗi Like:", error);
            toast.error('Thao tác thất bại');
        }
    };

    // Add comment
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const updatedPost = await postService.addComment(post._id, commentText.trim());
            if (updatePostInFeed) updatePostInFeed(updatedPost);
            setCommentText('');
            toast.success('Đã bình luận');
        } catch (error) {
            console.error("Bình luận lỗi:", error);
            toast.error("Bình luận thất bại");
        }
    };

    // Confirm toast (reusable)
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

    // Delete post
    const handleDeletePost = () => {
        confirmAction("Xóa bài viết này?", async () => {
            try {
                await postService.deletePost(post._id);
                if (onDeleteSuccess) onDeleteSuccess(post._id);
                toast.success('Đã xóa bài viết');
            } catch (e) {
                console.error("Lỗi xóa bài:", e);
                toast.error(e.response?.data?.message || "Lỗi xóa bài");
            }
        });
    };

    // Delete comment
    const handleDeleteComment = (commentId) => {
        confirmAction("Xóa bình luận này?", async () => {
            try {
                const updatedPost = await postService.deleteComment(post._id, commentId);
                if (updatePostInFeed) updatePostInFeed(updatedPost);
                toast.success('Đã xóa bình luận');
            } catch (e) {
                console.error("Lỗi xóa bình luận:", e);
                toast.error("Không thể xóa bình luận");
            }
        });
    };

    // Start editing comment
    const startEdit = (commentId, text) => {
        setEditingCommentId(commentId);
        setEditBuffer(text);
    };

    // Save edited comment
    const saveEdit = async (commentId) => {
        if (!editBuffer.trim()) return;
        try {
            const updatedPost = await postService.editComment(post._id, commentId, editBuffer.trim());
            if (updatePostInFeed) updatePostInFeed(updatedPost);
            setEditingCommentId(null);
            setEditBuffer('');
            toast.success('Đã sửa bình luận');
        } catch (error) {
            console.error("Lỗi sửa bình luận:", error);
            toast.error("Không thể sửa bình luận");
        }
    };

    // --- Image analysis (compute orientation/area for up to 5 images) ---
    useEffect(() => {
        let mounted = true;
        const imgs = (post.images || []).slice(0, 5);
        if (!imgs.length) {
            setImageMeta([]);
            return;
        }

        const loaders = imgs.map((src, idx) => new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const width = img.naturalWidth || img.width || 0;
                const height = img.naturalHeight || img.height || 0;
                const area = width * height;
                const orientation = width >= height ? 'landscape' : 'portrait';
                resolve({ idx, src, width, height, area, orientation });
            };
            img.onerror = () => {
                resolve({ idx, src, width: 0, height: 0, area: 0, orientation: 'landscape' });
            };
            img.src = src;
        }));

        Promise.all(loaders).then(metas => {
            if (!mounted) return;
            metas.sort((a, b) => a.idx - b.idx);
            setImageMeta(metas);
        });

        return () => { mounted = false; };
    }, [post.images]);

    // choose main image & ordering (main => largest area)
    const gallery = useMemo(() => {
        const metas = imageMeta.slice();
        if (!metas.length) return { ordered: [], mainIdx: -1 };

        // choose main by largest area
        let mainMeta = metas.reduce((best, m) => (!best || (m.area > best.area)) ? m : best, null);
        if (!mainMeta) mainMeta = metas[0];

        const others = metas.filter(m => m.idx !== mainMeta.idx);
        // sort others for visual balance: landscape first then area desc
        others.sort((a, b) => {
            if (a.orientation !== b.orientation) return a.orientation === 'landscape' ? -1 : 1;
            return b.area - a.area;
        });

        const ordered = [mainMeta, ...others];
        return { ordered, mainIdx: mainMeta.idx };
    }, [imageMeta]);

    // render gallery layouts (1..5)
    const renderImagesLayout = () => {
        const imgs = gallery.ordered.map(m => m.src);
        const count = imgs.length;
        if (count === 0) return null;

        // 1 image
        if (count === 1) {
            return (
                <div className="w-full bg-base-200">
                    <img src={imgs[0]} alt="img-0" className="w-full h-auto max-h-[600px] object-cover rounded-md" />
                </div>
            );
        }

        // 2 images: side by side
        if (count === 2) {
            return (
                <div className="grid grid-cols-2 gap-0.5">
                    {imgs.map((src, i) => (
                        <div key={i} className="overflow-hidden bg-base-200 flex items-center justify-center max-h-[500px]">
                            <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            );
        }

        // 3 images: main left (two cols), two stacked on right
        if (count === 3) {
            return (
                <div className="grid grid-cols-3 gap-0.5">
                    <div className="col-span-2 overflow-hidden bg-base-200 max-h-[550px] rounded-md">
                        <img src={imgs[0]} alt="main" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="overflow-hidden bg-base-200 h-1/2 min-h-[0] rounded-md">
                            <img src={imgs[1]} alt="sub1" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden bg-base-200 h-1/2 min-h-[0] rounded-md">
                            <img src={imgs[2]} alt="sub2" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            );
        }

        // 4 images: 2x2 grid
        if (count === 4) {
            return (
                <div className="grid grid-cols-2 gap-0.5">
                    {imgs.map((src, i) => (
                        <div key={i} className="overflow-hidden bg-base-200 max-h-[450px] flex items-center justify-center rounded-md">
                            <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            );
        }

        // 5 images: hero left (2 cols) + 4 thumbs right (2x2)
        if (count === 5) {
            return (
                <div className="grid grid-cols-3 gap-0.5 items-stretch">
                    <div className="col-span-2 overflow-hidden bg-base-200 max-h-[600px] rounded-md">
                        <img src={imgs[0]} alt="main" className="w-full h-full object-cover" />
                    </div>

                    <div className="col-span-1 grid grid-rows-2 gap-0.5">
                        <div className="overflow-hidden bg-base-200 flex items-center justify-center rounded-md">
                            <img src={imgs[1]} alt="a1" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden bg-base-200 flex items-center justify-center rounded-md">
                            <img src={imgs[2]} alt="a2" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="col-span-1 grid grid-rows-2 gap-0.5">
                        <div className="overflow-hidden bg-base-200 flex items-center justify-center rounded-md">
                            <img src={imgs[3]} alt="a3" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden bg-base-200 flex items-center justify-center rounded-md">
                            <img src={imgs[4]} alt="a4" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            );
        }

        // fallback grid for >5 (shouldn't happen on front-end, but safe)
        return (
            <div className={`grid ${count > 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-0.5`}>
                {imgs.map((src, i) => (
                    <div key={i} className="overflow-hidden bg-base-200 max-h-[450px] flex items-center justify-center rounded-md">
                        <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        );
    };

    // Render
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

                <div className="media-container px-4">
                    {post.video && (
                        <div className="w-full bg-black flex justify-center mt-1">
                             <video src={post.video} controls className="max-h-[500px] w-auto rounded-md" />
                        </div>
                    )}

                    {post.images?.length > 0 && (
                        <div className="mt-2">
                            {renderImagesLayout()}
                        </div>
                    )}
                </div>

                {(Array.isArray(post.likes) && post.likes.length > 0) || (Array.isArray(post.comments) && post.comments.length > 0) ? (
                    <div className="flex justify-between px-4 py-2 text-xs text-gray-500 border-t border-base-200 mt-2">
                        <span>{(post.likes || []).length} lượt thích</span>
                        <span>{(post.comments || []).length} bình luận</span>
                    </div>
                ) : null}

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
                                            <button onClick={() => { setEditingCommentId(null); setEditBuffer(''); }} className="btn btn-xs btn-circle btn-ghost"><X size={14} /></button>
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

                    {!isModalView && (post.comments || []).length > 2 && (
                        <Link to={`/posts/${post._id}`} className="text-sm text-gray-500 hover:underline block mt-2">
                            Xem tất cả {(post.comments || []).length} bình luận
                        </Link>
                    )}

                    <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-4 relative">
                        <img src={myProfilePic} className="w-8 h-8 rounded-full object-cover" alt="my-avt" />
                         <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Viết bình luận..."
                                className="input input-bordered w-full pr-10 rounded-full h-10 min-h-0"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-sm btn-circle btn-ghost text-primary" disabled={!commentText.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default StatusItem;
