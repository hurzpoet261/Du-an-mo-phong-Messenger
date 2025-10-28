import { axiosInstance } from '../lib/axios'; // 1. Dùng axiosInstance chung

const API_URL = '/posts/'; 

// 2. XÓA BỎ getAuthHeaders và getToken

// 1. Tạo Bài Viết (ĐÃ SỬA)
const createPost = async (formData) => {
  // 3. Xóa khối 'headers'. Axios sẽ tự động xử lý FormData.
  const response = await axiosInstance.post(API_URL, formData);
  return response.data;
};

// 2. Lấy Dòng Thời Gian (Đã sửa)
const getAllPosts = async () => {
  // Không cần header, axiosInstance sẽ tự gửi cookie
  const response = await axiosInstance.get(API_URL);
  return response.data; 
};

// 3. Thao Tác Like (Đã sửa)
const likePost = async (postId) => {
  const response = await axiosInstance.put(`${API_URL}${postId}/like`);
  return { 
    postId: postId, 
    likes: response.data.likes 
  }; 
};

// 4. Thêm Bình luận (Giữ nguyên)
const addComment = async (postId, text) => {
  const response = await axiosInstance.post(`${API_URL}${postId}/comment`, { text }, {
    headers: {
        'Content-Type': 'application/json',
    }
  });
  return response.data;
};

export const postService = {
  createPost,
  getAllPosts,
  likePost,
  addComment,
};