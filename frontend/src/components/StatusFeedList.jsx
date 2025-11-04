import React, { useState, useEffect, useCallback } from 'react';
import StatusItem from '../components/StatusItem.jsx';
import { postService } from '../services/postService.js';

function StatusFeedList({ newPost, currentUserId, onPostInserted }) { 
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
    const [error, setError] = useState(null); 

    const updateLikesInFeed = (postId, newLikes) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === postId ? { ...post, likes: newLikes } : post
            )
        );
    };
    
    const updatePostInFeed = (updatedPost) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            )
        );
    };

    const handleDeleteSuccess = (deletedPostId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
    };

    const loadPosts = useCallback(async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const data = await postService.getAllPosts(); 
            setPosts(data); 
        } catch (error) {
            console.error("Lỗi tải bài viết:", error);
        } finally {
            setIsLoading(false);
            setIsInitialLoadDone(true);
        }
    }, [isLoading]); 

    useEffect(() => {
        loadPosts();
    }, [loadPosts]); 

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

    return (
        <div className="status-feed-list">
            
            {isLoading && !isInitialLoadDone && (
                <div className="text-center p-4"><span className="loading loading-spinner text-primary"></span></div>
            )}
            
            {posts.map(post => (
                <StatusItem 
                    key={post._id} 
                    post={post} 
                    currentUserId={currentUserId}
                    updateLikesInFeed={updateLikesInFeed} 
                    updatePostInFeed={updatePostInFeed}   
                />
            ))}
            
            {/* Logic thông báo hết bài viết/trống */}
            {isInitialLoadDone && posts.length === 0 && (
                <div className="card card-compact bg-base-200 text-center p-6 my-4">
                    <p className="font-bold text-lg">Chưa có bài viết nào</p>
                    <p className="text-sm text-gray-600 mt-1">Hãy là người đầu tiên chia sẻ status của bạn!</p>
                </div>
            )}
        </div>
    );
}

export default StatusFeedList;