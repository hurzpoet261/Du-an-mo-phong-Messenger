import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { LoaderIcon, MapPinIcon, ShipWheelIcon, ShuffleIcon, CameraIcon, Heart } from "lucide-react";

import { ALL_LANGUAGES, ALL_COUNTRIES, INTERESTS_LIST } from "../constants/index.js";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    interests: authUser?.interests || [],
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Hồ sơ đã được cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Lỗi cập nhật hồ sơ");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, profilePic: randomAvatar });
    toast.success("Đã tạo ảnh đại diện ngẫu nhiên!");
  };

  const toggleInterest = (interest) => {
    setFormState(prev => {
        const currentInterests = prev.interests || [];
        if (currentInterests.includes(interest)) {
            return { ...prev, interests: currentInterests.filter(i => i !== interest) };
        } else {
            if (currentInterests.length >= 5) {
                toast.error("Bạn chỉ có thể chọn tối đa 5 sở thích.");
                return prev;
            }
            return { ...prev, interests: [...currentInterests, interest] };
        }
    });
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Hoàn thành hồ sơ của bạn</h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* --- AVATAR --- */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="size-32 rounded-full bg-base-300 overflow-hidden border-4 border-base-100 shadow-sm">
                {formState.profilePic ? (
                  <img src={formState.profilePic} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <CameraIcon className="size-12 text-base-content opacity-40" />
                  </div>
                )}
              </div>
              <button type="button" onClick={handleRandomAvatar} className="btn btn-accent btn-sm">
                <ShuffleIcon className="size-4 mr-2" /> Tạo ngẫu nhiên
              </button>
            </div>

            {/* --- FULL NAME --- */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Họ và tên</span></label>
              <input
                type="text"
                value={formState.fullName}
                onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                className="input input-bordered w-full"
                placeholder="Nhập tên hiển thị của bạn"
                required
              />
            </div>

            {/* --- BIO --- */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Tiểu sử</span></label>
              <textarea
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                className="textarea textarea-bordered h-24"
                placeholder="Giới thiệu ngắn gọn về bản thân..."
              />
            </div>

            {/* --- INTERESTS --- */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                        <Heart className="size-4 text-primary" /> Sở thích (Chọn tối đa 5)
                    </span>
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-base-100 rounded-lg border border-base-300 max-h-60 overflow-y-auto">
                    {INTERESTS_LIST.map((interest) => {
                        const isSelected = formState.interests?.includes(interest);
                        return (
                            <div
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`badge badge-lg cursor-pointer transition-all select-none border ${
                                    isSelected
                                    ? 'badge-primary shadow-md scale-105 border-primary'
                                    : 'badge-ghost opacity-70 hover:opacity-100 bg-base-200 border-base-300'
                                }`}
                            >
                                {interest}
                            </div>
                        );
                    })}
                </div>
                <label className="label">
                    <span className="label-text-alt text-gray-500">
                        Đã chọn: {formState.interests?.length || 0}/5
                    </span>
                </label>
            </div>

            {/* --- LANGUAGES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Ngôn ngữ mẹ đẻ</span></label>
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Chọn ngôn ngữ...</option>
                  {ALL_LANGUAGES.map((lang) => (
                    // Using lowercase value to match backend convention if needed
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Ngôn ngữ đang học</span></label>
                <select
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="">Chọn ngôn ngữ...</option>
                  {ALL_LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- LOCATION (Fixes "Thai" vs "Thailand" issue) --- */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Quốc gia</span></label>
              <div className="relative">
                <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-50 z-10" />
                <select
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="select select-bordered w-full pl-10"
                >
                  <option value="">Chọn quốc gia...</option>
                  {ALL_COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <button className="btn btn-primary w-full text-lg mt-4" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <ShipWheelIcon className="size-6 mr-2" /> Hoàn tất hồ sơ
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin size-6 mr-2" /> Đang lưu...
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;