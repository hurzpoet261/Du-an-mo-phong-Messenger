import { Link } from "react-router-dom";
import { capitialize } from "../lib/utils"; 
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic || "/avatar.png"} alt={friend.fullName} className="rounded-full object-cover"/>
          </div>
          <div className="overflow-hidden">
             {/* Dùng capitalize cho tên */}
             <h3 className="font-semibold truncate">{capitialize(friend.fullName)}</h3>
          </div>
        </div>

        {/* LANGUAGES */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage) && (
                <img src={getLanguageFlag(friend.nativeLanguage)} alt="flag" className="h-3 mr-1 inline-block rounded-[1px]"/>
            )}
            Quốc gia: {capitialize(friend.nativeLanguage)}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage) && (
                <img src={getLanguageFlag(friend.learningLanguage)} alt="flag" className="h-3 mr-1 inline-block rounded-[1px]"/>
            )}
            Ngôn ngữ: {capitialize(friend.learningLanguage)}
          </span>
        </div>

        {/* --- PHẦN THÊM MỚI: SỞ THÍCH --- */}
        {friend.interests && friend.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
                {friend.interests.map((interest, index) => (
                    <span key={index} className="badge badge-neutral badge-xs opacity-70">
                        {capitialize(interest)}
                    </span>
                ))}
            </div>
        )}

        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full mt-auto">
          Tin nhắn
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;
  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];
  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}