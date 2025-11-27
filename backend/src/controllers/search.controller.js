import User from "../models/User.js";
import Post from "../models/Post.js";

/**
 * @desc    Tìm kiếm đa năng (User hoặc Post) với bộ lọc nâng cao
 * @route   GET /api/search
 * @access  Private
 */
export const globalSearch = async (req, res) => {
  try {
    // 1. Lấy tất cả các tham số từ Query String
    const { 
        keyword, 
        type, 
        interests,      // Dạng chuỗi: "Music,Travel"
        location, 
        nativeLanguage, 
        learningLanguage 
    } = req.query;

    const currentUserId = req.user._id;

    // 2. Validate loại tìm kiếm
    if (!type || (type !== 'users' && type !== 'posts')) {
      return res.status(400).json({ message: "Loại tìm kiếm không hợp lệ" });
    }

    let results = [];

    // =========================================================
    // 🟢 TRƯỜNG HỢP 1: TÌM KIẾM NGƯỜI DÙNG (USERS)
    // =========================================================
    if (type === 'users') {
        // Khởi tạo query cơ bản: Loại trừ chính mình
        let query = { _id: { $ne: currentUserId } };

        // A. Nếu có từ khóa -> Tìm theo Tên hoặc Email
        if (keyword && keyword.trim() !== "") {
            const searchRegex = { $regex: keyword, $options: "i" };
            query.$or = [
                { fullName: searchRegex },
                { email: searchRegex }
            ];
        }

        // B. Lọc theo Quốc gia (Chính xác)
        if (location) {
            query.location = location;
        }

        // C. Lọc theo Ngôn ngữ (Chính xác)
        if (nativeLanguage) {
            query.nativeLanguage = nativeLanguage; // Ví dụ: 'vietnamese'
        }
        if (learningLanguage) {
            query.learningLanguage = learningLanguage; // Ví dụ: 'english'
        }

        // D. Lọc theo Sở thích (Quan trọng)
        // Tìm người dùng có CHỨA ít nhất một trong các sở thích đã chọn
        if (interests) {
            const interestArray = interests.split(','); // Chuyển "Music,Travel" -> ["Music", "Travel"]
            if (interestArray.length > 0) {
                // Sử dụng toán tử $in để tìm mảng chứa giá trị
                query.interests = { $in: interestArray };
            }
        }

        // Thực thi truy vấn
        results = await User.find(query)
            .select("fullName profilePic bio nativeLanguage learningLanguage location interests") // Lấy thêm interests
            .limit(20);
    } 
    
    // =========================================================
    // 🟢 TRƯỜNG HỢP 2: TÌM KIẾM BÀI VIẾT (POSTS)
    // =========================================================
    else if (type === 'posts') {
        // Với Post, bắt buộc phải có keyword (hoặc bạn có thể bỏ check này nếu muốn hiện tất cả)
        if (!keyword || keyword.trim() === "") {
             // Trả về rỗng nếu không có keyword, hoặc trả về bài mới nhất tùy logic bạn
             return res.status(200).json({ results: [] });
        }

        const searchRegex = { $regex: keyword, $options: "i" };

        results = await Post.find({ content: searchRegex })
            .populate("author", "fullName profilePic") 
            .sort({ createdAt: -1 }) // Mới nhất lên đầu
            .limit(20);
    }

    // 3. Trả về kết quả
    res.status(200).json({ results });

  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm", error: error.message });
  }
};