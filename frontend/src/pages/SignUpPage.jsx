import { useState, useEffect } from "react"; //
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom"; // 

import useSignUp from "../hooks/useSignUp";

const carouselImages = [
  "../src/assets/1.jpg",
  "../src/assets/2.jpg",
  "../src/assets/3.jpg",
];

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  
  // 🟢 State để theo dõi chỉ mục ảnh hiện tại
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  // 🟢 Logic cho Carousel tự động chạy
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 5000); // Thay đổi ảnh mỗi 5 giây (5000ms)

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []); // [] đảm bảo useEffect chỉ chạy một lần khi mount

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP FORM - LEFT SIDE (Giữ nguyên) */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* ... LOGO, ERROR MESSAGE, FORM ... */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              MESSENGER
            </span>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Tạo tài khoản</h2>
                  <p className="text-sm opacity-70">
                    Tham gia MESSENGER và bắt đầu hành trình chinh phục ngôn ngữ của bạn!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Họ và tên</span>
                    </label>
                    <input
                      type="text"
                      placeholder="HỌ VÀ TÊN CỦA BẠN"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Mật khẩu</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Mật khẩu phải có ít nhất 6 ký tự.
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        Tôi đồng ý với{" "}
                        <span className="text-primary hover:underline">điều khoản dịch vụ</span> và{" "}
                        <span className="text-primary hover:underline">chính sách bảo mật</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Đăng nhập
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* 🟢 SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center relative"> 
          <div className="max-w-md p-8 text-center"> {/* Thêm text-center để căn giữa text */}
            {/* Carousel Images */}
            <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-lg">
                <img 
                    src={carouselImages[currentImageIndex]} 
                    alt="Language connection illustration" 
                    className="w-full h-full object-contain transition-opacity duration-1000 ease-in-out" 
                    key={currentImageIndex} // Key để React force re-render và kích hoạt transition
                />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Kết nối với những người học ngôn ngữ trên toàn thế giới</h2>
              <p className="opacity-70">
                Thực hành hội thoại, kết bạn và cải thiện kỹ năng ngôn ngữ cùng nhau
              </p>
            </div>
          </div>
          
          {/* 🟢 Tùy chọn: Indicators cho Carousel */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, idx) => (
              <span
                key={idx}
                className={`block h-2 w-2 rounded-full cursor-pointer transition-all duration-300 ${
                  currentImageIndex === idx ? "bg-primary w-4" : "bg-primary/50"
                }`}
                onClick={() => setCurrentImageIndex(idx)}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;