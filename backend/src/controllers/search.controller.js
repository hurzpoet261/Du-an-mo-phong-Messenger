import User from "../models/User.js";
import Post from "../models/Post.js";

/**
 * @desc    Tìm kiếm theo loại (User hoặc Post)
 * @route   GET /api/search?keyword=...&type=...
 * @access  Private (được bảo vệ bởi protectRoute)
 */
export const globalSearch = async (req, res) => {
  // Lấy thêm 'type' từ query
  const { keyword, type } = req.query;
  const currentUserId = req.user._id;

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
  }

  // BẮT BUỘC: Phải có 'type' là 'users' hoặc 'posts'
  if (!type || (type !== 'users' && type !== 'posts')) {
    return res.status(400).json({ message: "Loại tìm kiếm không hợp lệ (phải là 'users' hoặc 'posts')" });
  }

  try {
    const searchQuery = { $regex: keyword, $options: "i" };
    let results = []; // Khởi tạo mảng kết quả rỗng

    // LOGIC RẼ NHÁNH MỚI
    if (type === 'users') {
      // 1. Nếu type=users, CHỈ tìm kiếm User
      results = await User.find({
        $and: [
          { _id: { $ne: currentUserId } },
          { $or: [{ fullName: searchQuery }, { email: searchQuery }] },
        ],
      })
        .select("fullName profilePic bio nativeLanguage learningLanguage") // Lấy đủ trường cho FriendCard
        .limit(15); // Giới hạn 15 người

    } else if (type === 'posts') {
      // 2. Nếu type=posts, CHỈ tìm kiếm Post
      results = await Post.find({ content: searchQuery })
        .populate("author", "fullName profilePic") // Lấy đủ trường cho Postcard
        .sort({ createdAt: -1 })
        .limit(15); // Giới hạn 15 bài
    }

    // 3. Trả về một mảng kết quả duy nhất
    // Tên key là 'results'
    res.status(200).json({ results });

  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi tìm kiếm", error: error.message });
  }
};