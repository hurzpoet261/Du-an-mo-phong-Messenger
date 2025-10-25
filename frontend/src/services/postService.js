import axios from 'axios';

const API_URL = 'http://localhost:5001/api/posts/'; 
const getToken = () => localStorage.getItem('token'); 

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
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
    return response.data; // Trả về Post đã được populate "author"
};

// 2. Lấy Dòng Thời Gian (GET /api/posts)
const getAllPosts = async () => {
    const headers = getAuthHeaders();
    const response = await axios.get(API_URL, { 
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
    // BE chỉ trả về mảng likes. FE cần ID để cập nhật state.
    return { 
        postId: postId, 
        likes: response.data.likes 
    }; 
};

// 4. Thêm Bình luận (POST /api/posts/:id/comment)
const addComment = async (postId, text) => {
    const headers = getAuthHeaders();
    const response = await axios.post(`${API_URL}${postId}/comment`, { text }, {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        },
    });
    // BE trả về toàn bộ Post đã được cập nhật và populate comments
    return response.data;
};

export const postService = {
    createPost,
    getAllPosts,
    likePost,
    addComment,
};