import { upsertStreamUser, generateStreamToken } from "../lib/stream.js"; 
import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * Hàm trợ giúp (helper) để tạo JWT và set cookie
 */
const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    httpOnly: true, // Chống XSS
    sameSite: "none",
    secure: true,
  });
};

/**
 * Hàm trợ giúp (helper) để dọn dẹp và trả về thông tin user
 */
const getSafeUserResponse = (user) => {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    bio: user.bio,
    profilePic: user.profilePic,
    nativeLanguage: user.nativeLanguage,
    learningLanguage: user.learningLanguage,
    location: user.location,
    isOnboarded: user.isOnboarded,
    friends: user.friends,
  };
};


// 1. ĐĂNG KÝ (SIGNUP)
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    // --- (Phần validation của bạn đã rất tốt, giữ nguyên) ---
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }
    // --- Hết phần validation ---

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    // 1. Tạo user trên GetStream (Logic này của bạn đã đúng)
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
      // Không cần return lỗi ở đây, lỡ Stream lỗi thì user vẫn đăng ký được
    }

    // 2. TẠO CHAT TOKEN (THAY ĐỔI MỚI)
    const chatToken = generateStreamToken(newUser._id);

    // 3. Tạo JWT và set cookie
    generateTokenAndSetCookie(newUser._id, res);

    // 4. Trả về user an toàn và chatToken
    res.status(201).json({
      success: true,
      user: getSafeUserResponse(newUser),
      chatToken: chatToken // <-- TRẢ VỀ TOKEN NGAY LẬP TỨC
    });

  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// 2. ĐĂNG NHẬP (LOGIN)
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    // 1. TẠO CHAT TOKEN (THAY ĐỔI MỚI)
    const chatToken = generateStreamToken(user._id);

    // 2. Tạo JWT và set cookie
    generateTokenAndSetCookie(user._id, res);

    // 3. Trả về user an toàn và chatToken
    res.status(200).json({
      success: true,
      user: getSafeUserResponse(user),
      chatToken: chatToken // <-- TRẢ VỀ TOKEN NGAY LẬP TỨC
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// 3. ĐĂNG XUẤT (LOGOUT)
export function logout(req, res) {
  // Logic của bạn đã hoàn hảo
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

// 4. ONBOARDING
export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        // (Phần missingFields của bạn rất hay, giữ nguyên)
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true } // Quan trọng: để nhận về user đã update
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Cập nhật user trên GetStream (Logic này của bạn đã đúng)
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    // Trả về user an toàn (THAY ĐỔI MỚI)
    res.status(200).json({
      success: true,
      user: getSafeUserResponse(updatedUser)
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}