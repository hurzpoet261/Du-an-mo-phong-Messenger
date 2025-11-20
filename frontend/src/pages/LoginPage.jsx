import { useState, useEffect } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import useLogin from "../hooks/useLogin"; // Hook Login của bạn

const carouselImages = [
  "../src/assets/1.jpg",
  "../src/assets/2.jpg",
  "../src/assets/3.jpg",
];

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { isPending, error, loginMutation } = useLogin();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    loginMutation(loginData); 
  };

  // CAROUSEL LOGIC
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % carouselImages.length
);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM SECTION - LEFT SIDE */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              MESSENGER
              </span>
            </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Chào mừng trở lại</h2>
                  <p className="text-sm opacity-70">
                    Đăng nhập vào tài khoản của bạn
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                       <span className="label-text">Email</span>
                    </label>
                  <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Mật khẩu</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Bạn chưa có tài khoản?{" "}
                      <Link to="/signup" className="text-primary hover:underline">
                        Tạo tài khoản
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION - CAROUSEL */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8 text-center"> {/* Thêm text-center để căn giữa text */}
            {/* 1. Illustration Container */}
            <div className="relative aspect-square max-w-sm mx-auto overflow-hidden rounded-lg">
                <img 
                    src={carouselImages[currentImageIndex]} 
                    alt="Language connection illustration" 
                    className="w-full h-full object-contain transition-opacity duration-1000 ease-in-out" 
                    key={currentImageIndex}
                />
            </div>

            {/* 2. INDICATORS  */}
            <div className="flex justify-center space-x-2 mt-4">
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
            
            {/* 3. TEXT SECTION */}
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Kết nối với những người học ngôn ngữ trên toàn thế giới</h2>
              <p className="opacity-70">
                Thực hành hội thoại, kết bạn và cải thiện kỹ năng ngôn ngữ cùng nhau
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;