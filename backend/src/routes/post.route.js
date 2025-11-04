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
const upload = multer({ storage: storage });

router.route("/")
  .post(
    protectRoute, 
    upload.single('image'), 
    createPost
  )
  .get(protectRoute, getAllPosts);


router.route("/:id/like").put(protectRoute, likePost);
router.route("/:id/comment").post(protectRoute, addComment);
router.route("/:id").delete(protectRoute, deletePost);
router.route("/:id").get(protectRoute, getPost);
router.route("/:postId/comment/:commentId")
    .put(protectRoute, editComment)
    .delete(protectRoute, deleteComment);
export default router;