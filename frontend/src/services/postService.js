import { axiosInstance } from '../lib/axios'; // 1. Dùng axiosInstance chung

const API_URL = '/posts/'; 


// 1. Tạo Bài Viết 
const createPost = async (formData) => {
 // 3. Xóa khối 'headers'. Axios sẽ tự động xử lý FormData.
const response = await axiosInstance.post(API_URL, formData);
return response.data;
};

// 2. Lấy Dòng Thời Gian
const getAllPosts = async () => {
  // Không cần header, axiosInstance sẽ tự gửi cookie
const response = await axiosInstance.get(API_URL);
return response.data; 
};

// 3. Thao Tác Like
const likePost = async (postId) => {
const response = await axiosInstance.put(`${API_URL}${postId}/like`);
return { 
postId: postId, 
likes: response.data.likes 
}; 
};

// 4. Thêm Bình luận
const addComment = async (postId, text) => {
  const response = await axiosInstance.post(`${API_URL}${postId}/comment`, { text }, {
    headers: {
        'Content-Type': 'application/json',
    }
  });
  return response.data;
};

  //  5. XÓA BÀI ĐĂNG
  const deletePost = async (postId) => {
      const response = await axiosInstance.delete(`${API_URL}${postId}`); 
      return response.data;
  };
  const getPostById = async (postId) => {
    const response = await axiosInstance.get(`${API_URL}${postId}`);
    return response.data; 
};
  // 🟢 7. Xóa Bình luận
const deleteComment = async (postId, commentId) => {
    const response = await axiosInstance.delete(`${API_URL}${postId}/comment/${commentId}`);
    return response.data;
};

// 🟢 8. Chỉnh sửa Bình luận
const editComment = async (postId, commentId, newText) => {
    const response = await axiosInstance.put(`${API_URL}${postId}/comment/${commentId}`, { text: newText }, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
};
export const postService = {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  deletePost,
  getPostById,
  deleteComment,
  editComment
};