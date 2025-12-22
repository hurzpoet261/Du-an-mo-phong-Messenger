import Post from "../models/Post.js";
import { uploader } from "../lib/cloudinary.js"; // Chỉ cần uploader
// Import 2 thư viện helper để xử lý file
import dataurl from "dataurl"; 
import path from "path";

const { format } = dataurl;

/**
 * Hàm helper mới: Upload 1 file (buffer) lên Cloudinary
 */
const uploadToCloudinary = async (file) => {
  // 1. Chuyển buffer (từ multer) thành chuỗi DataURI
  const fileUri = format({
    data: file.buffer,
    mimetype: file.mimetype,
  });
  
  // 2. Upload lên Cloudinary, 'auto' để tự nhận diện video
  const result = await uploader.upload(fileUri, {
    folder: "messenger-posts",
    resource_type: "auto" 
  });
  return result.secure_url; // Trả về URL an toàn
};


// --- HÀM createPost (ĐÃ NÂNG CẤP) ---
export const createPost = async (req, res) => {
  try {
    // 1. Lấy nội dung (text) từ req.body
    const { content } = req.body;
    const author = req.user._id; 
    
    // 2. Lấy file từ req.files (do 'upload.fields' tạo ra)
    const imageFiles = req.files?.images || []; // Mảng ảnh
    const videoFile = req.files?.video ? req.files.video[0] : null; // 1 video

    if (!content && imageFiles.length === 0 && !videoFile) { 
      return res.status(400).json({ message: "Bài đăng phải có nội dung, ảnh hoặc video" });
    }
    
    let imagesUrls = [];
    let videoUrl = "";

    // 3. Upload nhiều ảnh (chạy song song cho nhanh)
    if (imageFiles.length > 0) {
      imagesUrls = await Promise.all(
        imageFiles.map(file => uploadToCloudinary(file))
      );
    }

    // 4. Upload 1 video (nếu có)
    if (videoFile) {
      videoUrl = await uploadToCloudinary(videoFile);
    }

    const post = new Post({
      content: content || "",
      images: imagesUrls,
      video: videoUrl,
      author,
    });

    const createdPost = await post.save();

    const populatedPost = await Post.findById(createdPost._id).populate(
      "author",
      "fullName profilePic"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Lỗi server khi tạo bài đăng:", error); 
    res.status(500).json({ message: "Lỗi server khi tạo bài đăng", error: error.message });
  }
};
// --- KẾT THÚC HÀM createPost ---


// (Tất cả các hàm khác: getAllPosts, likePost, addComment, v.v... giữ nguyên y hệt)

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "fullName profilePic") 
      .populate("comments.author", "fullName profilePic") 
      .sort({ createdAt: -1 }); 
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy bài đăng", error: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.status(200).json({ message: isLiked ? "Đã bỏ thích" : "Đã thích", likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi thích bài đăng", error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const author = req.user._id;
    if (!text) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }
    const comment = { text, author };
    post.comments.push(comment);
    await post.save();
    const updatedPost = await Post.findById(postId)
      .populate("author", "fullName profilePic")
      .populate("comments.author", "fullName profilePic");
    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi bình luận", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }
    if (post.author.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Bạn không có quyền xóa bài đăng này" });
    }
    await post.deleteOne();
    res.status(200).json({ message: "Xóa bài đăng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi xóa bài đăng", error: error.message });
  }
};

export const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId)
            .populate("author", "fullName profilePic")
            .populate("comments.author", "fullName profilePic");
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài đăng" });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Lỗi server khi lấy bài đăng chi tiết:", error);
        res.status(500).json({ message: "Lỗi server khi lấy bài đăng", error: error.message });
    }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Quyền: Tác giả bài viết HOẶC tác giả bình luận
    if (post.author.toString() !== userId.toString() && comment.author.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    // Sử dụng pull để xóa subdocument an toàn
    post.comments.pull(commentId);
    await post.save();

    // Populate lại để trả về FE
    const updatedPost = await Post.findById(postId)
        .populate("author", "fullName profilePic")
        .populate("comments.author", "fullName profilePic");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error in deleteComment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🟢 SỬA BÌNH LUẬN
export const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Quyền: CHỈ tác giả bình luận
    if (comment.author.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized to edit this comment" });
    }

    comment.text = text; // Cập nhật nội dung
    await post.save();

    const updatedPost = await Post.findById(postId)
        .populate("author", "fullName profilePic")
        .populate("comments.author", "fullName profilePic");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error in editComment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}