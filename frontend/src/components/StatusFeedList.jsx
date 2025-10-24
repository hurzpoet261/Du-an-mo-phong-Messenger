import React, { useState, useEffect, useCallback } from 'react';
import StatusItem from './StatusItem.jsx';
import { postService } from '../services/postService.js';

function StatusFeedList({ newPost, currentUserId, onPostInserted }) { 
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0); 
    const [hasMore, setHasMore] = useState(true);
    const [isInitialLoadDone, setIsInitialLoadDone] = useState(false); 

    const updateFeedPost = (updatedPost) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            )
        );
    };

    const loadPosts = useCallback(async (pageNumber) => {
        if (isLoading || !hasMore) return;
        
        setIsLoading(true);

        try {
            const data = await postService.getAllPosts(pageNumber, 10); 
            
            setPosts(prevPosts => {
                const newPosts = data.posts.filter(p => !prevPosts.some(ep => ep._id === p._id));
                return pageNumber === 1 ? newPosts : [...prevPosts, ...newPosts];
            });

            setHasMore(data.posts.length === 10); 
            setPage(pageNumber); 

        } catch (error) {
            // 🔴 KHẮC PHỤC LỖI VÒNG LẶP:
            console.error("Lỗi tải bài viết:", error);
            
            // 1. Giả định rằng đã hết dữ liệu để ngăn tải tiếp
            setHasMore(false); 
            
            // 2. Vẫn cập nhật page để thoát khỏi điều kiện page === 0 trong useEffect
            setPage(pageNumber); 
            
        } finally {
            setIsLoading(false);
            if (pageNumber === 1) {
                setIsInitialLoadDone(true);
            }
        }
    }, [isLoading, hasMore]); 

    // useEffect: Tải bài viết cho lần truy cập đầu tiên (Trang 1)
    useEffect(() => {
        if (page === 0) {
            loadPosts(1);
        }
    }, [page, loadPosts]); 

    // useEffect: Xử lý bài viết mới được tạo
    useEffect(() => {
        if (newPost && newPost._id) {
            setPosts(prevPosts => {
                if (!prevPosts.some(p => p._id === newPost._id)) {
                    return [newPost, ...prevPosts];
                }
                return prevPosts;
            });
            
            if (onPostInserted) {
                onPostInserted(); 
            }
        }
    }, [newPost, onPostInserted]); 

    const handleLoadMore = () => {
        loadPosts(page + 1);
    };

    return (
        <div className="status-feed-list">
            
            {isLoading && page === 0 && (
                <div className="text-center p-4"><span className="loading loading-spinner text-primary"></span></div>
            )}
            
            {posts.map(post => (
                <StatusItem 
                    key={post._id} 
                    post={post} 
                    currentUserId={currentUserId}
                    updateFeedPost={updateFeedPost}
                />
            ))}

            {/* Các điều kiện hiển thị trạng thái Load More, Hết Feed */}
            {isLoading && page > 0 && (<div className="text-center p-4"><span className="loading loading-spinner text-primary loading-sm"></span></div>)}
            {hasMore && !isLoading && posts.length > 0 && (
                 <button onClick={handleLoadMore} className="btn btn-block btn-ghost my-4">Tải thêm bài viết</button>
            )}
            
            {isInitialLoadDone && !hasMore && posts.length === 0 && (
                <div className="card card-compact bg-base-200 text-center p-6 my-4">
                    <p className="font-bold text-lg">Chưa có bài viết nào</p>
                    <p className="text-sm text-gray-600 mt-1">Hãy là người đầu tiên chia sẻ status của bạn!</p>
                </div>
            )}
            
            {isInitialLoadDone && !hasMore && posts.length > 0 && (
                <div className="text-center text-sm text-gray-500 py-4">--- Bạn đã xem hết bài viết ---</div>
            )}
        </div>
    );
}

export default StatusFeedList;