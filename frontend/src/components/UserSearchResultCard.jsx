import React from 'react';
import { UserPlusIcon, CheckCircleIcon, MessageSquare } from "lucide-react";
// Import capitalize từ utils
import { capitialize } from "../lib/utils";
import { getLanguageFlag } from "./FriendCard";

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
        <div className="card bg-base-200 hover:shadow-md transition-shadow h-full">
            <div className="card-body p-4 flex flex-col">
                {/* USER INFO */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="avatar">
                        <div className="w-12 rounded-full">
                            <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-semibold truncate">{capitialize(user.fullName)}</h3>
                        <p className="text-xs text-base-content/60 truncate">{user.email}</p>
                    </div>
                </div>

                {/* LANGUAGES */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="badge badge-secondary badge-outline text-xs flex items-center h-auto py-1">
                        {getLanguageFlag(user.nativeLanguage) && (
                            <img src={getLanguageFlag(user.nativeLanguage)} className="h-3 mr-1 rounded-[1px]" alt="flag"/>
                        )}
                        <span className="opacity-70 mr-1">Quốc gia:</span>
                        {capitialize(user.nativeLanguage || 'N/A')}
                    </span>
                    <span className="badge badge-primary badge-outline text-xs flex items-center h-auto py-1">
                         {getLanguageFlag(user.learningLanguage) && (
                            <img src={getLanguageFlag(user.learningLanguage)} className="h-3 mr-1 rounded-[1px]" alt="flag"/>
                        )}
                        <span className="opacity-70 mr-1">Ngôn ngữ:</span>
                        {capitialize(user.learningLanguage || 'N/A')}
                    </span>
                </div>

                {/* --- PHẦN THÊM MỚI: SỞ THÍCH --- */}
                {user.interests && user.interests.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {/* Hiển thị tối đa 4 sở thích để không bị vỡ layout */}
                            {user.interests.slice(0, 4).map((interest, index) => (
                                <span key={index} className="badge badge-ghost badge-xs text-[10px] border-base-content/20">
                                    {capitialize(interest)}
                                </span>
                            ))}
                            {user.interests.length > 4 && (
                                <span className="text-[10px] opacity-50 pl-1">
                                    +{user.interests.length - 4}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {/* ------------------------------- */}

                {/* ACTION BUTTON */}
                <button 
                    className={`btn btn-sm w-full mt-auto ${
                        isFriend ? "btn-success text-white" : (isRequestSent ? "btn-disabled" : "btn-primary")
                    }`}
                    onClick={handleAction}
                    disabled={isRequestSent} 
                >
                    {isFriend ? (
                        <> <MessageSquare className="size-4 mr-2" /> Tin nhắn </>
                    ) : isRequestSent ? (
                        <> <CheckCircleIcon className="size-4 mr-2" /> Đã gửi </>
                    ) : (
                        <> <UserPlusIcon className="size-4 mr-2" /> Kết bạn </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default UserSearchResultCard;