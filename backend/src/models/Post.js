// import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema(
//   {
//     text: {
//       type: String,
//       required: true,
//     },
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const postSchema = new mongoose.Schema(
//   {
//     content: {
//       type: String,
//       required: true,
//     },
//     image: {
//       type: String, // Lưu URL của ảnh (nếu có)
//       default: "",
//     },
//     author: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // Tham chiếu đến User model của bạn
//       required: true,
//     },
//     likes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User", // Mảng các user ID đã thích bài này
//       },
//     ],
//     comments: [commentSchema], // Sử dụng schema con cho bình luận
//   },
//   {
//     timestamps: true, // Tự động thêm createdAt và updatedAt
//   }
// );

// const Post = mongoose.model("Post", postSchema);

// export default Post;

// backend/models/Post.js

import mongoose from "mongoose";

// commentSchema giữ nguyên, không thay đổi
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      // Cải tiến: Nội dung (text) chỉ bắt buộc khi không có ảnh HOẶC video
      required: function() { return !this.images.length && !this.video; }
    },
    
    // --- NÂNG CẤP TÍNH NĂNG ---
    images: [ // 1. Sửa 'image' (số ít) thành 'images' (mảng)
      { type: String } // Sẽ lưu một mảng các URL ảnh
    ],
    video: { // 2. Thêm trường mới để lưu video
      type: String, 
      default: ""
    },
    // --- KẾT THÚC NÂNG CẤP ---

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ],
    comments: [commentSchema], 
  },
  {
    timestamps: true, 
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;