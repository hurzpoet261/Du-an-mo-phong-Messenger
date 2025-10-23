import express from "express";
import {
  createPost,
  getAllPosts,
  likePost,
  addComment,
  deletePost,
} from "../controllers/post.controller.js";
// SỬA DÒNG NÀY: Bỏ 1 cái "protectRoute" bị lặp đi
import { protectRoute } from "../middleware/auth.middleware.js"; 

const router = express.Router();

// Tất cả các route này đều yêu cầu đăng nhập (đã 'protect')

// POST /api/posts/ -> Tạo post mới
// GET  /api/posts/ -> Lấy tất cả post
router.route("/").post(protectRoute, createPost).get(protectRoute, getAllPosts);

// PUT    /api/posts/:id/like -> Thích/Bỏ thích post
// POST   /api/posts/:id/comment -> Bình luận post
// DELETE /api/posts/:id -> Xóa post
router.route("/:id/like").put(protectRoute, likePost);
router.route("/:id/comment").post(protectRoute, addComment);
router.route("/:id").delete(protectRoute, deletePost);

export default router;