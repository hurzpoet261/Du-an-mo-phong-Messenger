// import React from 'react';
// import { Link } from 'react-router';
// import { Heart, MessageSquare, ClockIcon } from 'lucide-react';
// // Giả định các hàm tiện ích
// const timeAgo = (date) => "1 giờ trước"; 
// const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// const PostcardSearchResult = ({ post }) => {
    
//     // Dùng nội dung text làm tiêu đề tóm tắt (line-clamp-3)
//     const postTitle = post.content ? post.content.substring(0, 80) + (post.content.length > 80 ? '...' : '') : 'Bài viết không có nội dung';
    
//     return (
//         // 🟢 Link tới trang chi tiết bài viết (sẽ kích hoạt Modal)
//         <Link to={`/posts/${post._id}`} className="block h-full">
//             <div className="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl hover:bg-base-200 h-full">
//                 <div className="card-body p-4">
                    
//                     {/* TIÊU ĐỀ & TÁC GIẢ */}
//                     <div className="flex items-center gap-3 mb-2">
//                         <h4 className="font-semibold text-sm truncate">{capitalize(post.author.fullName)}</h4>
//                         <span className="text-xs opacity-70 flex items-center gap-1 ml-auto">
//                             <ClockIcon className="size-3" /> {timeAgo(post.createdAt)}
//                         </span>
//                     </div>

//                     {/* CONTENT POST */}
//                     <p className="text-sm line-clamp-3 mb-3 font-medium">
//                         {postTitle}
//                     </p>

//                     {/* PICTURE POST */}
//                     {post.image && (
//                         <div className="h-16 w-full overflow-hidden rounded-md mb-3">
//                             <img src={post.image} alt="Post image" className="w-full h-full object-cover" />
//                         </div>
//                     )}

//                     {/* LIKE & COMMENT */}
//                     <div className="flex items-center justify-start text-xs text-gray-500 pt-2 border-t border-base-200 mt-auto">
//                         <span className="flex items-center gap-1 mr-4">
//                             <Heart className="size-3 text-red-500" /> {post.likes.length}
//                         </span>
//                         <span className="flex items-center gap-1">
//                             <MessageSquare className="size-3" /> {post.comments.length}
//                         </span>
//                     </div>
//                 </div>
//             </div>
//         </Link>
//     );
// };

// export default PostcardSearchResult;

import React from 'react';
// SỬA LỖI 1: Import từ 'react-router-dom'
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, ClockIcon } from 'lucide-react';

// --- SỬA LỖI 2: Thêm các hàm tiện ích bị thiếu ---
const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vài giây trước";
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// --- Kết thúc hàm tiện ích ---

const PostcardSearchResult = ({ post }) => {
    
    const postTitle = post.content ? post.content.substring(0, 80) + (post.content.length > 80 ? '...' : '') : 'Bài viết không có nội dung';
    
    return (
        <Link to={`/posts/${post._id}`} className="block h-full"> {/* (Đảm bảo route /posts/:id tồn tại) */}
            <div className="card bg-base-100 shadow-lg transition-shadow hover:shadow-xl hover:bg-base-200 h-full">
                <div className="card-body p-4 flex flex-col"> {/* Thêm flex flex-col */}
                    
                    {/* TIÊU ĐỀ & TÁC GIẢ */}
                    <div className="flex items-center gap-3 mb-2">
                        {/* SỬA LỖI 3: Thêm ảnh đại diện tác giả */}
                        <div className="avatar">
                           <div className="w-8 rounded-full">
                             <img src={post.author.profilePic || 'https://avatar.iran.liara.run/public/girl'} alt={post.author.fullName} />
                           </div>
                        </div>
                        <h4 className="font-semibold text-sm truncate">{capitalize(post.author.fullName)}</h4>
                        <span className="text-xs opacity-70 flex items-center gap-1 ml-auto shrink-0"> {/* Thêm shrink-0 */}
                            <ClockIcon className="size-3" /> {timeAgo(post.createdAt)}
                        </span>
                    </div>

                    {/* CONTENT POST */}
                    <p className="text-sm line-clamp-3 mb-3 font-medium">
                        {postTitle}
                    </p>

                    {/* PICTURE POST */}
                    {post.image && (
                        <div className="h-24 w-full overflow-hidden rounded-md mb-3"> {/* Tăng chiều cao ảnh */}
                            <img src={post.image} alt="Post image" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* LIKE & COMMENT (đẩy xuống dưới cùng) */}
                    <div className="flex items-center justify-start text-xs text-gray-500 pt-2 border-t border-base-300 mt-auto">
                        <span className="flex items-center gap-1 mr-4">
                            <Heart className="size-3 text-red-500" /> {post.likes.length}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="size-3" /> {post.comments.length}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PostcardSearchResult;