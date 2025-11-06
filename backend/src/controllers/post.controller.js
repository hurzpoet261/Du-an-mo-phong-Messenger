// import Post from "../models/Post.js";
// import { uploader, dataUri } from "../lib/cloudinary.js";

// /**
//  * @desc    Tạo một bài đăng mới
//  * @route   POST /api/posts
//  * @access  Private
//  */
// export const createPost = async (req, res) => {
//   try {
//     const { content } = req.body;
//     const author = req.user._id; 

//     if (!content && !req.file) { 
//       return res.status(400).json({ message: "Bài đăng phải có nội dung hoặc ảnh" });
//     }
    
//     let imageUrl = "";
    
//     if (req.file) {
//       const file = dataUri(req); 

//       const result = await uploader.upload(file, {
//         folder: "messenger-posts" // (Tên thư mục trên Cloudinary)
//       });
//       imageUrl = result.secure_url;
//     }

//     const post = new Post({
//       content: content || "", // Nếu không có content (chỉ có ảnh) thì lưu chuỗi rỗng
//       image: imageUrl, // Lưu URL từ Cloudinary
//       author,
//     });

//     const createdPost = await post.save();

//     // Trả về bài post mới với thông tin tác giả
//     const populatedPost = await Post.findById(createdPost._id).populate(
//       "author",
//       "fullName profilePic"
//     );

//     res.status(201).json(populatedPost);
//   } catch (error) {
//     console.error("Lỗi server khi tạo bài đăng:", error); // Log lỗi chi tiết
//     res.status(500).json({ message: "Lỗi server khi tạo bài đăng", error: error.message });
//   }
// };

// /**
//  * @desc    Lấy tất cả bài đăng (cho news feed)
//  * @route   GET /api/posts
//  * @access  Private
//  */
// export const getAllPosts = async (req, res) => {
//   try {
//     const posts = await Post.find({})
//       .populate("author", "fullName profilePic") // Lấy thông tin tác giả
//       .populate("comments.author", "fullName profilePic") // Lấy thông tin người bình luận
//       .sort({ createdAt: -1 }); // Mới nhất lên đầu

//     res.status(200).json(posts);
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server khi lấy bài đăng", error: error.message });
//   }
// };

// /**
//  * @desc    Thích hoặc bỏ thích một bài đăng
//  * @route   PUT /api/posts/:id/like
//  * @access  Private
//  */
// export const likePost = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const userId = req.user._id;

//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).json({ message: "Không tìm thấy bài đăng" });
//     }

//     // Kiểm tra xem user đã thích bài này chưa
//     const isLiked = post.likes.includes(userId);

//     if (isLiked) {
//       // Bỏ thích: Xóa userId khỏi mảng likes
//       post.likes.pull(userId);
//     } else {
//       // Thích: Thêm userId vào mảng likes
//       post.likes.push(userId);
//     }

//     await post.save();
//     res.status(200).json({ message: isLiked ? "Đã bỏ thích" : "Đã thích", likes: post.likes });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server khi thích bài đăng", error: error.message });
//   }
// };

// /**
//  * @desc    Bình luận về một bài đăng
//  * @route   POST /api/posts/:id/comment
//  * @access  Private
//  */
// export const addComment = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const postId = req.params.id;
//     const author = req.user._id;

//     if (!text) {
//       return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
//     }

//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).json({ message: "Không tìm thấy bài đăng" });
//     }

//     const comment = {
//       text,
//       author,
//     };

//     post.comments.push(comment);
//     await post.save();

//     // Trả về toàn bộ bài post đã được cập nhật
//     const updatedPost = await Post.findById(postId)
//       .populate("author", "fullName profilePic")
//       .populate("comments.author", "fullName profilePic");

//     res.status(201).json(updatedPost);
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server khi bình luận", error: error.message });
//   }
// };

// /**
//  * @desc    Xóa một bài đăng
//  * @route   DELETE /api/posts/:id
//  * @access  Private
//  */
// export const deletePost = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const userId = req.user._id;

//     const post = await Post.findById(postId);

//     if (!post) {
//       return res.status(404).json({ message: "Không tìm thấy bài đăng" });
//     }

//     if (post.author.toString() !== userId.toString()) {
//       return res.status(401).json({ message: "Bạn không có quyền xóa bài đăng này" });
//     }

//     await post.deleteOne();

//     res.status(200).json({ message: "Xóa bài đăng thành công" });
//   } catch (error) {
//     res.status(500).json({ message: "Lỗi server khi xóa bài đăng", error: error.message });
//   }
// };

// /**
//  * @desc    Lấy chi tiết một bài đăng (Dùng cho Post Detail Modal)
//  * @route   GET /api/posts/:id
//  * @access  Private
//  */
// export const getPost = async (req, res) => {
//     try {
//         const postId = req.params.id;
        
//         // 🚨 QUAN TRỌNG: Lấy bài đăng và populate thông tin cần thiết
//         const post = await Post.findById(postId)
//             .populate("author", "fullName profilePic")
//             .populate("comments.author", "fullName profilePic");

//         if (!post) {
//             return res.status(404).json({ message: "Không tìm thấy bài đăng" });
//         }
//         res.status(200).json(post);
//     } catch (error) {
//         console.error("Lỗi server khi lấy bài đăng chi tiết:", error);
//         res.status(500).json({ message: "Lỗi server khi lấy bài đăng", error: error.message });
//     }
// };
// // BE: server/controllers/post.controller.js (Cần thêm vào cuối file)

// /**
//  * @desc    Xóa một bình luận (Chủ bài đăng HOẶC Tác giả bình luận có quyền)
//  * @route   DELETE /api/posts/:postId/comment/:commentId
//  * @access  Private
//  */
// export const deleteComment = async (req, res) => {
//     try {
//         const { postId, commentId } = req.params;
//         const userId = req.user._id;

//         const post = await Post.findById(postId);
//         if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

//         const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
//         if (commentIndex === -1) return res.status(404).json({ message: "Không tìm thấy bình luận" });

//         const comment = post.comments[commentIndex];
//         const isPostAuthor = post.author.toString() === userId.toString();
//         const isCommentAuthor = comment.author.toString() === userId.toString();

//         // Kiểm tra quyền: Chỉ tác giả bài đăng hoặc tác giả bình luận mới được xóa
//         if (!isPostAuthor && !isCommentAuthor) {
//             return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này." });
//         }

//         post.comments.splice(commentIndex, 1); // Xóa bình luận khỏi mảng
//         await post.save();

//         // Trả về toàn bộ bài post đã được cập nhật
//         const updatedPost = await Post.findById(postId)
//             .populate("author", "fullName profilePic")
//             .populate("comments.author", "fullName profilePic");

//         res.status(200).json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi server khi xóa bình luận", error: error.message });
//     }
// };

// /**
//  * @desc    Chỉnh sửa một bình luận (Chỉ Tác giả bình luận có quyền)
//  * @route   PUT /api/posts/:postId/comment/:commentId
//  * @access  Private
//  */
// export const editComment = async (req, res) => {
//     try {
//         const { postId, commentId } = req.params;
//         const { text } = req.body;
//         const userId = req.user._id;

//         const post = await Post.findById(postId);
//         if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });

//         const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
//         if (commentIndex === -1) return res.status(404).json({ message: "Không tìm thấy bình luận" });

//         const comment = post.comments[commentIndex];

//         // Kiểm tra quyền: Chỉ tác giả bình luận mới được chỉnh sửa
//         if (comment.author.toString() !== userId.toString()) {
//             return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bình luận này." });
//         }
        
//         // Cập nhật nội dung bình luận
//         post.comments[commentIndex].text = text;
//         await post.save();

//         // Trả về toàn bộ bài post đã được cập nhật
//         const updatedPost = await Post.findById(postId)
//             .populate("author", "fullName profilePic")
//             .populate("comments.author", "fullName profilePic");

//         res.status(200).json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi server khi chỉnh sửa bình luận", error: error.message });
//     }
// };


// backend/controllers/post.controller.js

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
      images: imagesUrls, // 5. Lưu mảng URL ảnh
      video: videoUrl, // 6. Lưu URL video
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
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
        const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) return res.status(404).json({ message: "Không tìm thấy bình luận" });
        const comment = post.comments[commentIndex];
        const isPostAuthor = post.author.toString() === userId.toString();
        const isCommentAuthor = comment.author.toString() === userId.toString();
        if (!isPostAuthor && !isCommentAuthor) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này." });
        }
        post.comments.splice(commentIndex, 1); 
        await post.save();
        const updatedPost = await Post.findById(postId)
            .populate("author", "fullName profilePic")
            .populate("comments.author", "fullName profilePic");
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi xóa bình luận", error: error.message });
    }
};

export const editComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài đăng" });
        const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) return res.status(404).json({ message: "Không tìm thấy bình luận" });
        const comment = post.comments[commentIndex];
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bình luận này." });
        }
        post.comments[commentIndex].text = text;
        await post.save();
        const updatedPost = await Post.findById(postId)
            .populate("author", "fullName profilePic")
            .populate("comments.author", "fullName profilePic");
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi chỉnh sửa bình luận", error: error.message });
    }
};