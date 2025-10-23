import Post from "../models/Post.js";

/**
 * @desc    Tạo một bài đăng mới
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const author = req.user._id; // Lấy từ middleware 'protect'

    if (!content) {
      return res.status(400).json({ message: "Nội dung không được để trống" });
    }

    const post = new Post({
      content,
      image: image || "",
      author,
    });

    const createdPost = await post.save();

    // Trả về bài post mới với thông tin tác giả
    const populatedPost = await Post.findById(createdPost._id).populate(
      "author",
      "fullName profilePic"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi tạo bài đăng", error: error.message });
  }
};

/**
 * @desc    Lấy tất cả bài đăng (cho news feed)
 * @route   GET /api/posts
 * @access  Private
 */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "fullName profilePic") // Lấy thông tin tác giả
      .populate("comments.author", "fullName profilePic") // Lấy thông tin người bình luận
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy bài đăng", error: error.message });
  }
};

/**
 * @desc    Thích hoặc bỏ thích một bài đăng
 * @route   PUT /api/posts/:id/like
 * @access  Private
 */
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    // Kiểm tra xem user đã thích bài này chưa
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Bỏ thích: Xóa userId khỏi mảng likes
      post.likes.pull(userId);
    } else {
      // Thích: Thêm userId vào mảng likes
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: isLiked ? "Đã bỏ thích" : "Đã thích", likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi thích bài đăng", error: error.message });
  }
};

/**
 * @desc    Bình luận về một bài đăng
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
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

    const comment = {
      text,
      author,
    };

    post.comments.push(comment);
    await post.save();

    // Trả về toàn bộ bài post đã được cập nhật
    const updatedPost = await Post.findById(postId)
      .populate("author", "fullName profilePic")
      .populate("comments.author", "fullName profilePic");

    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi bình luận", error: error.message });
  }
};

/**
 * @desc    Xóa một bài đăng
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng" });
    }

    // Rất quan trọng: Kiểm tra xem người xóa có phải là tác giả không
    if (post.author.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Bạn không có quyền xóa bài đăng này" });
    }

    await post.deleteOne(); // Xóa bài đăng

    res.status(200).json({ message: "Xóa bài đăng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi xóa bài đăng", error: error.message });
  }
};