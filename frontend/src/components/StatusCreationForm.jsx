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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !file) return;
        setIsPosting(true);

        try {
            const formData = new FormData();
            formData.append('content', content);
            if (file) {
                formData.append('image', file); 
            }
            const newPost = await postService.createPost(formData);
            
            if (onPostCreated) {
                onPostCreated({...newPost, userId: currentUser}); 
            }
            
            // Reset trạng thái sau khi thành công
            setContent('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = null;
            
        } catch (error) {
            console.error("Lỗi tạo bài viết:", error.response?.data || error.message);
            
            // 🟢 Xử lý lỗi token cụ thể
            if (error.message.includes("UNAUTHORIZED_NO_TOKEN")) {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                // Lý tưởng là gọi hàm logout và chuyển hướng
            } else {
                alert(`Đăng bài thất bại: ${error.response?.data?.error || error.message}.`);
            }
            
        } finally {
            setIsPosting(false);
        }
    };
    
    // 🟢 Hàm kích hoạt input file (Dùng cho cả Ảnh và Video)
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body p-4">
                
                {/* ẨN input type="file": chấp nhận image/*,video/* */}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />

                <div className="flex items-center gap-3">
                    <div className="avatar size-10">
                        <img src={currentUser.avatar || 'default_avatar.png'} alt="Avatar" className="rounded-full object-cover" />
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
                    {/* 🟢 Nút Ảnh: Kích hoạt chọn file */}
                    <button type="button" className="btn btn-sm btn-ghost flex-grow" onClick={triggerFileInput}>
                        <Image size={18} className="text-green-500" /> Ảnh
                    </button>
                    {/* 🟢 Nút Video: Kích hoạt chọn file */}
                    <button type="button" className="btn btn-sm btn-ghost flex-grow" onClick={triggerFileInput}>
                        <Video size={18} className="text-purple-500" /> Video
                    </button>
                    {/* ... (Các nút khác giữ nguyên) ... */}
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