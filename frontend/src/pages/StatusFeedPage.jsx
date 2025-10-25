import React, { useState } from 'react';
import useAuthUser from '../hooks/useAuthUser.js'; 

import StatusCreationForm from '../components/StatusCreationForm.jsx';
import StatusFeedList from '../components/StatusFeedList.jsx';

function StatusFeedPage() {
    const { isLoading, authUser } = useAuthUser(); 
    const [latestPost, setLatestPost] = useState(null); 
    
    // Xử lý trạng thái Loading/Chưa đăng nhập...
    if (isLoading) {
        return (
             <div className="status-page-layout">
                <div className="text-center p-8">
                    <span className="loading loading-spinner text-primary loading-lg"></span>
                    <p className="text-sm mt-3">Đang tải dữ liệu người dùng...</p>
                </div>
            </div>
        );
    }
    
    if (!authUser) {
        return (
            <div className="status-page-layout">
                <div className="card card-compact bg-error text-error-content text-center p-6 my-4">
                    <p className="font-bold text-lg">Truy cập bị từ chối</p>
                    <p className="text-sm mt-1">Vui lòng đăng nhập để xem nội dung Status Feed.</p>
                </div>
            </div>
        );
    }

    const handlePostCreated = (post) => {
        // 🟢 SỬA LỖI: CHỈ LƯU TRỰC TIẾP BÀI POST NHẬN ĐƯỢC TỪ BE
        setLatestPost(post); 
    };
    
    const handlePostInserted = () => {
        setLatestPost(null);
    };

    return (
        <div className="app-container">
            <div className="status-page-layout">
                <StatusCreationForm 
                    currentUser={authUser} 
                    onPostCreated={handlePostCreated} 
                /> 
                
                <StatusFeedList 
                    currentUserId={authUser._id} 
                    newPost={latestPost} 
                    onPostInserted={handlePostInserted} 
                />
            </div>
        </div>
    );
}

export default StatusFeedPage;