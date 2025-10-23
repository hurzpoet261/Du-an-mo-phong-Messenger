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
      required: true,
    },
    image: {
      type: String, // Lưu URL của ảnh (nếu có)
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến User model của bạn
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Mảng các user ID đã thích bài này
      },
    ],
    comments: [commentSchema], // Sử dụng schema con cho bình luận
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;