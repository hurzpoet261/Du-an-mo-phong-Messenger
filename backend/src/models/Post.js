import mongoose from "mongoose";
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