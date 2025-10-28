import React, { useState, useRef } from 'react';
import { Image, Video } from 'lucide-react'; 
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

            formData.append('content', content); 
            

            if (file) {
                formData.append('image', file); 
            }
            
            // Gọi hàm createPost (đã xóa header thủ công)
            const newPost = await postService.createPost(formData);
            
            if (onPostCreated) {
                onPostCreated(newPost); 
            }
            
            setContent('');
            setFile(null);
            
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
            console.error("Lỗi tạo bài viết:", errorMessage);
            // Hiển thị lỗi chính xác từ server, ví dụ "Nội dung không được để trống"
            alert(`Đăng bài thất bại: ${errorMessage}.`);
        } finally {
            setIsPosting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body p-4">
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />

                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img src={currentUser?.profilePic || '/default_avatar.png'} alt="Avatar" />
                        </div>
                    </div>
                    
                    <textarea
                        placeholder={`Hôm nay bạn thế nào, ${currentUser?.fullName || ''}?`}
                        value={content} // Giá trị được lấy từ state 'content'
                        onChange={(e) => setContent(e.target.value)} // Cập nhật state 'content'
                        className="textarea textarea-ghost w-full resize-none p-2 bg-base-200 rounded-full h-10 overflow-hidden text-base"
                        rows={1}
                    />
                </div>
                
                {file && <p className="text-sm text-success my-2 ml-14">File đã chọn: {file.name}</p>} 

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