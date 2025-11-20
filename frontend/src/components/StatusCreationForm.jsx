import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, XCircle } from 'lucide-react'; 
import { postService } from '../services/postService.js';
import toast from 'react-hot-toast';

function StatusCreationForm({ currentUser, onPostCreated }) { 
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [imageMeta, setImageMeta] = useState([]);
    const [layout, setLayout] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef(null);

    // ----- 1. Lấy orientation từng hình -----
    const analyzeImages = (images) => {
        const meta = [];
        images.forEach((fileObj, index) => {
            const img = new Image();
            img.onload = () => {
                const orientation = img.width > img.height ? "landscape" : "portrait";
                meta[index] = { orientation };
                setImageMeta([...meta]);
            };
            img.src = fileObj.previewUrl;
        });
    };

    // ----- 2. Gợi ý layout tự động giống Facebook -----
    const autoChooseLayout = (count) => {
        if (count === 1) return "single";
        if (count === 2) return "two-grid";
        if (count === 3) return "three-mosaic";
        if (count === 4) return "four-grid";
        if (count >= 5) return "mosaic";
        return null;
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        // Giới hạn 1 video hoặc tối đa 5 ảnh
        const hasVideo = selectedFiles.some(f => f.type.startsWith("video/")) 
                      || files.some(f => f.type.startsWith("video/"));

        const totalImages =
            selectedFiles.filter(f => f.type.startsWith("image/")).length +
            files.filter(f => f.type.startsWith("image/")).length;

        if (hasVideo && selectedFiles.some(f => f.type.startsWith("image/"))) {
            toast.error("Không thể đăng cả ảnh và video cùng lúc.");
            return;
        }
        if (selectedFiles.some(f => f.type.startsWith("video/")) && files.length > 0) {
            toast.error("Không thể đăng kèm hình khi đã chọn video.");
            return;
        }
        if (totalImages > 5) {
            toast.error("Bạn chỉ được đăng tối đa 5 ảnh.");
            return;
        }

        const newFileObjects = selectedFiles.map(file => ({
            file,
            type: file.type,
            previewUrl: URL.createObjectURL(file)
        }));

        const nextFiles = [...files, ...newFileObjects];
        setFiles(nextFiles);

        // Auto layout
        const imagesOnly = nextFiles.filter(f => f.type.startsWith("image/"));
        if (imagesOnly.length > 0) {
            analyzeImages(imagesOnly);
            setLayout(autoChooseLayout(imagesOnly.length));
        }
    };

    const triggerFileInput = (acceptType) => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('accept', acceptType);
            fileInputRef.current.click();
        }
    };

    const removeFile = (indexToRemove) => {
        URL.revokeObjectURL(files[indexToRemove]?.previewUrl);
        const newFiles = files.filter((_, i) => i !== indexToRemove);
        setFiles(newFiles);

        const imagesOnly = newFiles.filter(f => f.type.startsWith("image/"));
        setLayout(autoChooseLayout(imagesOnly.length));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0) {
            toast.error("Vui lòng nhập nội dung hoặc chọn ảnh/video để đăng.");
            return;
        }

        setIsPosting(true);

        try {
            const formData = new FormData();
            formData.append("content", content);
            formData.append("layout", layout || "");

            files.forEach((f) => {
                if (f.type.startsWith("image/")) formData.append("images", f.file);
                if (f.type.startsWith("video/")) formData.append("video", f.file);
            });

            const newPost = await postService.createPost(formData);

            if (onPostCreated) onPostCreated(newPost);
            toast.success("Đăng bài thành công!");

            setContent('');
            setFiles([]);
            setLayout(null);
            setImageMeta([]);
            if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (err) {
            toast.error("Đăng bài thất bại.");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body p-4">

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img src={currentUser?.profilePic || '/default_avatar.png'} alt="Avatar" />
                        </div>
                    </div>

                    <textarea
                        placeholder={`Hôm nay bạn thế nào, ${currentUser?.fullName || ''}?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="textarea textarea-ghost w-full resize-none p-2 bg-base-200 rounded-full h-10 overflow-hidden text-base"
                        rows={1}
                    />
                </div>

                {files.length > 0 && (
                    <div className="my-2 ml-14 p-2 bg-base-200 rounded-lg">
                        <div className="grid grid-cols-3 gap-2">
                            {files.map((fileObj, index) => (
                                <div key={index} className="relative w-full h-24 rounded-md overflow-hidden bg-base-300 flex items-center justify-center">
                                    {fileObj.type.startsWith("image/") ? (
                                        <img src={fileObj.previewUrl} className="w-auto h-full object-contain" />
                                    ) : (
                                        <video src={fileObj.previewUrl} className="w-auto h-full object-contain" muted loop />
                                    )}
                                    <button type="button" onClick={() => removeFile(index)}
                                        className="btn btn-xs btn-circle absolute top-1 right-1 bg-black bg-opacity-50 text-white border-none hover:bg-error">
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="divider my-1"></div>

                <div className="flex justify-around gap-2">
                    <button type="button" className="btn btn-sm btn-ghost flex-grow" onClick={() => triggerFileInput('image/*')}>
                        <Image size={18} className="text-green-500" /> Ảnh
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost flex-grow" onClick={() => triggerFileInput('video/*')}>
                        <Video size={18} className="text-purple-500" /> Video
                    </button>
                    <button type="submit" className="btn btn-sm btn-primary flex-grow" disabled={isPosting}>
                        {isPosting ? 'Đang tải...' : 'Đăng'}
                    </button>
                </div>

            </div>
        </form>
    );
}

export default StatusCreationForm;
