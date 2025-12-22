import express from "express";
import multer from "multer"; 
import {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  deletePost,
  getPost, 
  editComment,
  deleteComment
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; 

const router = express.Router();

const storage = multer.memoryStorage();
// Cải tiến: Giới hạn kích thước file, ví dụ 10MB (cho video)
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- NÂNG CẤP TÍNH NĂNG ---
// Sửa route 'createPost'
router.route("/")
  .post(
    protectRoute, 
    // Đổi từ 'upload.single' thành 'upload.fields'
    upload.fields([
      { name: 'images', maxCount: 5 }, // Chấp nhận tối đa 5 file có tên 'images'
      { name: 'video', maxCount: 1 }  // Chấp nhận tối đa 1 file có tên 'video'
    ]), 
    createPost
  )
  .get(protectRoute, getAllPosts);
// --- KẾT THÚC NÂNG CẤP ---
router.route("/:id")
  .get(protectRoute, getPost)
  .delete(protectRoute, deletePost);

router.route("/:id/like").put(protectRoute, likePost);
router.route("/:id/comment").post(protectRoute, addComment);

// Route cho comment (giữ nguyên)
router.route("/:postId/comment/:commentId")
    .put(protectRoute, editComment)
    .delete(protectRoute, deleteComment);
export default router;