import User from "../models/User.js";
import Post from "../models/Post.js";

export const search = async (req, res) => {
  try {
    const { keyword, type, location, nativeLanguage, interests } = req.query;
    const currentUserId = req.user._id;
    const searchType = type || 'users';

    // =========================================================
    // 🟢 1. TÌM KIẾM USER
    // =========================================================
    if (searchType === 'users') {
        const queryCriteria = { _id: { $ne: currentUserId } };

        // --- Tìm theo Tên/Email ---
        if (keyword && keyword.trim() !== "") {
            const regex = new RegExp(keyword, "i");
            queryCriteria.$or = [
                { fullName: regex },
                { email: regex }
            ];
        }

        // --- Lọc Quốc gia (Chính xác) ---
        if (location && location.trim() !== "") {
            queryCriteria.location = { $regex: `^${location.trim()}$`, $options: "i" };
        }

        // --- Lọc Ngôn ngữ (Chính xác) ---
        if (nativeLanguage && nativeLanguage.trim() !== "") {
            queryCriteria.nativeLanguage = { $regex: `^${nativeLanguage.trim()}$`, $options: "i" };
        }

        // --- Lọc Sở thích (Chính xác) ---
        if (interests) {
            const interestArray = interests.split(',').filter(i => i.trim() !== "");
            if (interestArray.length > 0) {
                 const exactInterestsRegex = interestArray.map(item => new RegExp(`^${item.trim()}$`, "i"));
                 queryCriteria.interests = { $in: exactInterestsRegex };
            }
        }

        const users = await User.find(queryCriteria)
            .select("fullName profilePic bio nativeLanguage learningLanguage location interests")
            .limit(20);

        return res.status(200).json({ results: users });
    }

    // =========================================================
    // 🟢 2. TÌM KIẾM POST (Đây là phần bạn có thể đang thiếu)
    // =========================================================
    if (searchType === 'posts') {
        // Nếu không có từ khóa thì trả về rỗng ngay (tránh tìm tất cả làm nặng server)
        if (!keyword || keyword.trim() === "") {
             return res.status(200).json({ results: [] });
        }

        const searchRegex = { $regex: keyword, $options: "i" };
        
        // Tìm bài viết có nội dung khớp từ khóa
        const posts = await Post.find({ content: searchRegex }) 
            .populate("author", "fullName profilePic") // Lấy thông tin người đăng
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({ results: posts });
    }

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};