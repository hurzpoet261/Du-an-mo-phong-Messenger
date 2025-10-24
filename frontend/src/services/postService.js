import axios from 'axios';

// 🟢 Đảm bảo URL chính xác với cổng 5001 như lỗi bạn gặp
const API_URL = 'http://localhost:5001/api/posts/'; 
const getToken = () => localStorage.getItem('token'); 

// Hàm tiện ích để lấy token và ném lỗi nếu thiếu
const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        // 🚨 Ném ra lỗi rõ ràng để component có thể xử lý việc đăng xuất/chuyển hướng
        throw new Error("UNAUTHORIZED_NO_TOKEN"); 
    }
    return {
        'Authorization': `Bearer ${token}`,
    };
};

// 1. Tạo Bài Viết (POST /api/posts/)
const createPost = async (formData) => {
    const headers = getAuthHeaders();
    
    const response = await axios.post(API_URL, formData, {
        headers: {
            ...headers,
            'Content-Type': 'multipart/form-data', 
        },
    });
    return response.data;
};

// 2. Lấy Dòng Thời Gian (GET /api/posts/timeline/all)
const getAllPosts = async (page = 1, limit = 10) => {
    const headers = getAuthHeaders();
    
    const response = await axios.get(`${API_URL}timeline/all?page=${page}&limit=${limit}`, {
        headers: headers,
    });
    return response.data; 
};

// 3. Thao Tác Like (PUT /api/posts/:id/like)
const likePost = async (postId) => {
    const headers = getAuthHeaders();
    
    const response = await axios.put(`${API_URL}${postId}/like`, {}, {
        headers: headers,
    });
    return response.data;
};

export const postService = {
    createPost,
    getAllPosts,
    likePost,
};