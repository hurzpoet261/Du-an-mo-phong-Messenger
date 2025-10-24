import React, { useState } from 'react';
import useAuthUser from '../hooks/useAuthUser.js'; 

import StatusCreationForm from '../components/StatusCreationForm.jsx';
import StatusFeedList from '../components/StatusFeedList.jsx';

function StatusFeedPage() {
    //  Lấy dữ liệu người dùng THỰC TẾ từ hook useAuthUser
    const { isLoading, authUser } = useAuthUser(); // Lấy authUser.data?.user và isLoading

    const [latestPost, setLatestPost] = useState(null); 
    
    // 1. Xử lý Trạng thái Tải (Loading)
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
    
    // 2. Xử lý Trạng thái Chưa Đăng nhập (Lỗi 401/Không có dữ liệu)
    if (!authUser) {
        return (
            <div className="status-page-layout">
                <div className="card card-compact bg-error text-error-content text-center p-6 my-4">
                    <p className="font-bold text-lg">Truy cập bị từ chối (401)</p>
                    <p className="text-sm mt-1">Vui lòng đăng nhập để xem nội dung Status Feed.</p>
                </div>
            </div>
        );
    }

    const handlePostCreated = (post) => {
        // Cập nhật post với thông tin user THỰC TẾ từ hook
        // 🚨 Giả định dữ liệu user từ hook có trường _id
        setLatestPost({...post, userId: authUser}); 
    };
    
    const handlePostInserted = () => {
        setLatestPost(null);
    };

    return (
        <div className="app-container">
            {/* ❌ Sidebar được render ở component Layout cha */}
            
            <div className="status-page-layout">
                <StatusCreationForm 
                    currentUser={authUser} // 🟢 Truyền user THỰC TẾ
                    onPostCreated={handlePostCreated} 
                /> 
                
                <StatusFeedList 
                    currentUserId={authUser._id} // 🟢 Truyền ID THỰC TẾ (authUser._id)
                    newPost={latestPost} 
                    onPostInserted={handlePostInserted} 
                />
            </div>
        </div>
    );
}

export default StatusFeedPage;