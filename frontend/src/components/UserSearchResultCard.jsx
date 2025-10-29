// import { Link } from "react-router";
// import { UserPlusIcon, CheckCircleIcon, MessageSquare } from "lucide-react";
// import { LANGUAGE_TO_FLAG } from "../constants";


// const UserSearchResultCard = ({ 
//     user, 
//     isFriend, 
//     isRequestSent, 
//     sendRequestMutation, 
//     onMessageClick 
// }) => {
    
//     const getLanguageFlag = (language) => {
//         if (!language) return null;
//         const langLower = language.toLowerCase();
//         const countryCode = LANGUAGE_TO_FLAG[langLower];
//         if (countryCode) {
//             return (
//                 <img
//                     src={`https://flagcdn.com/24x18/${countryCode}.png`}
//                     alt={`${langLower} flag`}
//                     className="h-3 mr-1 inline-block"
//                 />
//             );
//         }
//         return null;
//     }

//     const handleAction = () => {
//         if (isFriend) {
//             onMessageClick(user._id);
//         } else if (!isRequestSent) {
//             sendRequestMutation(user._id);
//         }
//     };

//     return (
//         <div className="card bg-base-200 hover:shadow-md transition-shadow">
//             <div className="card-body p-4">
//                 {/* USER INFO */}
//                 <div className="flex items-center gap-3 mb-3">
//                     <div className="avatar size-12">
//                         <img src={user.profilePic} alt={user.fullName} />
//                     </div>
//                     <h3 className="font-semibold truncate">{user.fullName}</h3>
//                 </div>

//                 {/* LANGUAGES */}
//                 <div className="flex flex-wrap gap-1.5 mb-3">
//                     <span className="badge badge-secondary text-xs">
//                         {getLanguageFlag(user.nativeLanguage)}
//                         Native: {user.nativeLanguage}
//                     </span>
//                     <span className="badge badge-outline text-xs">
//                         {getLanguageFlag(user.learningLanguage)}
//                         Learning: {user.learningLanguage}
//                     </span>
//                 </div>

//                 {/*  ACTION BUTTON */}
//                 <button 
//                     className={`btn btn-sm w-full mt-2 ${
//                         isFriend ? "btn-success" : (isRequestSent ? "btn-disabled" : "btn-primary")
//                     }`}
//                     onClick={handleAction}
//                     disabled={isRequestSent || isFriend} // Vô hiệu hóa nếu đã gửi hoặc đã là bạn bè
//                 >
//                     {isFriend ? (
//                         <> <MessageSquare className="size-4 mr-2" /> Message </>
//                     ) : isRequestSent ? (
//                         <> <CheckCircleIcon className="size-4 mr-2" /> Request Sent </>
//                     ) : (
//                         <> <UserPlusIcon className="size-4 mr-2" /> Send Request </>
//                     )}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default UserSearchResultCard;

import React from 'react';
// SỬA 1: 'react-router-dom' là thư viện đúng, không phải 'react-router'
import { Link } from "react-router-dom"; 
import { UserPlusIcon, CheckCircleIcon, MessageSquare } from "lucide-react";

// SỬA 2: Import hằng số từ file constants/index.js của bạn
import { LANGUAGE_TO_FLAG } from "../constants"; // (Đảm bảo đường dẫn này đúng)

// SỬA 3: Chuyển hàm này ra ngoài component để tối ưu hiệu suất
// (Không cần tạo lại hàm này mỗi khi component render)
const getLanguageFlag = (language) => {
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

const UserSearchResultCard = ({ 
    user, 
    isFriend, 
    isRequestSent, 
    sendRequestMutation, 
    onMessageClick 
}) => {
    
    const handleAction = () => {
        if (isFriend) {
            onMessageClick(user._id);
        } else if (!isRequestSent) {
            sendRequestMutation(user._id);
        }
    };

    return (
        // SỬA 4: Thêm 'h-full' để đảm bảo các card có chiều cao bằng nhau
        <div className="card bg-base-200 hover:shadow-md transition-shadow h-full">
            {/* SỬA 5: Thêm 'flex flex-col' để đẩy nút bấm xuống dưới cùng */}
            <div className="card-body p-4 flex flex-col">
                {/* USER INFO */}
                <div className="flex items-center gap-3 mb-3">
                    {/* SỬA 6: Cấu trúc 'avatar' của DaisyUI cần 1 div con với w- (width) */}
                    <div className="avatar">
                        <div className="w-12 rounded-full">
                           <img src={user.profilePic || 'https://avatar.iran.liara.run/public/boy'} alt={user.fullName} />
                        </div>
                    </div>
                    <h3 className="font-semibold truncate">{user.fullName}</h3>
                </div>

                {/* LANGUAGES */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="badge badge-secondary text-xs">
                        {getLanguageFlag(user.nativeLanguage)}
                        Native: {user.nativeLanguage || 'N/A'}
                    </span>
                    <span className="badge badge-outline text-xs">
                        {getLanguageFlag(user.learningLanguage)}
                        Learning: {user.learningLanguage || 'N/A'}
                    </span>
                </div>

                {/* ACTION BUTTON */}
                <button 
                    // SỬA 5 (tiếp): Thêm 'mt-auto' để đẩy nút này xuống dưới
                    className={`btn btn-sm w-full mt-auto ${
                        isFriend ? "btn-success" : (isRequestSent ? "btn-disabled" : "btn-primary")
                    }`}
                    onClick={handleAction}
                    // SỬA 7: Chỉ 'disabled' khi đã gửi, nút 'Message' (isFriend) VẪN CÓ THỂ BẤM
                    disabled={isRequestSent} 
                >
                    {isFriend ? (
                        <> <MessageSquare className="size-4 mr-2" /> Message </>
                    ) : isRequestSent ? (
                        <> <CheckCircleIcon className="size-4 mr-2" /> Request Sent </>
                    ) : (
                        <> <UserPlusIcon className="size-4 mr-2" /> Send Request </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default UserSearchResultCard;