import React, { useState, useRef } from 'react';
import { Image, Video, Album, Clock } from 'lucide-react'; 
import { postService } from '../services/postService.js';

function StatusCreationForm({ currentUser, onPostCreated }) { 
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null); 
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef(null); 

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const triggerFileInput = () => {
        fileInputRef.current.value = null; 
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !file) return;
        setIsPosting(true);

        try {
            const formData = new FormData();
            if (content.trim()) {
                formData.append('content', content.trim());
            }
            if (file) {
                formData.append('image', file); 
            }
            
            const newPost = await postService.createPost(formData);
            
            if (onPostCreated) {
                // 🟢 SỬA LỖI: CHỈ GỌI CALLBACK VỚI BÀI VIẾT ĐÃ NHẬN TỪ SERVER
                onPostCreated(newPost); 
            }
            
            setContent('');
            setFile(null);
            
        } catch (error) {
            console.error("Lỗi tạo bài viết:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || error.message;
            if (errorMessage.includes("UNAUTHORIZED")) {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            } else {
                 alert(`Đăng bài thất bại: ${errorMessage}.`);
            }
        } finally {
            setIsPosting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body p-4">
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />

                <div className="flex items-center gap-3">
                    <div className="avatar size-10">
                        {/* 🟢 Dùng profilePic từ currentUser */}
                        <img src={currentUser.profilePic || 'default_avatar.png'} alt="Avatar" className="rounded-full object-cover" />
                    </div>
                    
                    <textarea
                        placeholder="Hôm nay bạn thế nào?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea textarea-ghost w-full resize-none p-2 bg-base-200 rounded-full h-10 overflow-hidden text-base cursor-pointer"
                        rows={1}
                    />
                </div>
                
                {file && <p className="text-sm text-success my-2 ml-14">File đã chọn: **{file.name}**</p>} 

                <div className="divider my-1"></div> 

                <div className="flex justify-around gap-2">
                    <button type="button" className="btn btn-sm btn-ghost flex-grow" onClick={triggerFileInput}>
                        <Image size={18} className="text-green-500" /> Ảnh
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost flex-grow" onClick={triggerFileInput}>
                        <Video size={18} className="text-purple-500" /> Video
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-sm btn-primary flex-grow"
                        disabled={isPosting || (!content.trim() && !file)}
                    >
                        {isPosting ? 'Đang tải...' : 'Đăng'}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default StatusCreationForm;