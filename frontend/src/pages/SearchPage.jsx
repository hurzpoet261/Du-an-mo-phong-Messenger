// import React, { useState, useEffect } from 'react';
// import { SearchIcon, UserIcon, FileTextIcon, FilterIcon } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import useDebounce from '../hooks/useDebounce.js'; 

// import UserSearchResultCard from '../components/UserSearchResultCard.jsx';
// import PostcardSearchResult from '../components/PostcardSearchResult.jsx'; 

// // Giả định service và options
// const searchService = { performSearch: async (query, type, sort) => { 
//     console.log(`Searching for: ${query}, Type: ${type}, Sort: ${sort}`);
//     // 🚨 Thay thế bằng API call thực tế của bạn
//     return type === 'user' ? [] : []; 
// }};
// const SORT_OPTIONS = {
//     user: [{ label: "Mới nhất", value: "newest" }, { label: "Cũ nhất", value: "oldest" }],
//     post: [{ label: "Mới nhất", value: "newest" }, { label: "Phổ biến (Likes)", value: "likes" }]
// };

// const SearchPage = () => {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchType, setSearchType] = useState('user');
//     const [sortBy, setSortBy] = useState('newest');

//     const debouncedQuery = useDebounce(searchQuery, 500); 

//     // Logic gọi API
//     const { data: searchResults, isLoading } = useQuery({
//         queryKey: ['search', debouncedQuery, searchType, sortBy],
//         queryFn: () => searchService.performSearch(debouncedQuery, searchType, sortBy),
//         enabled: !!debouncedQuery,
//     });
    
//     useEffect(() => {
//         setSortBy('newest');
//     }, [searchType]);
    
//     // Giả định các hàm action
//     const handleSendFriendRequest = (userId) => { console.log(`Sending request to: ${userId}`); };
//     const handleMessageUser = (userId) => { console.log(`Navigating to chat with: ${userId}`); };


//     const renderResults = () => {
//         if (!debouncedQuery) {
//             return <p className="text-center text-gray-500 mt-12">Nhập từ khóa để bắt đầu tìm kiếm.</p>;
//         }
//         if (isLoading) {
//             return <div className="flex justify-center mt-12"><span className="loading loading-spinner loading-lg"></span></div>;
//         }
//         if (searchResults?.length === 0) {
//             return <p className="text-center text-gray-500 mt-12">Không tìm thấy kết quả nào cho "{searchQuery}".</p>;
//         }
        
//         if (searchType === 'user') {
//             return (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
//                     {searchResults?.map((user) => (
//                         <UserSearchResultCard 
//                             key={user._id} 
//                             user={user}
//                             isFriend={false}
//                             isRequestSent={false} 
//                             sendRequestMutation={handleSendFriendRequest}
//                             onMessageClick={handleMessageUser}
//                         />
//                     ))}
//                 </div>
//             );
//         } else if (searchType === 'post') {
//              return (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
//                     {searchResults?.map((post) => (
//                         // 🟢 Sử dụng Component PostcardSearchResult mới
//                         <PostcardSearchResult 
//                             key={post._id} 
//                             post={post}
//                         />
//                     ))}
//                 </div>
//             );
//         }
//         return null;
//     };

//     return (
//         <div className="p-6 sm:p-8">
//             <div className="max-w-4xl mx-auto space-y-6">
//                 <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>

//                 {/* Thanh Tìm kiếm */}
//                 <div className="relative">
//                     <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder={`Tìm kiếm ${searchType === 'user' ? 'tên người dùng...' : 'nội dung bài viết...'}`}
//                         className="input input-lg input-bordered w-full pl-12 pr-16 bg-base-200 focus:bg-white transition-colors"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>

//                 {/* Bộ Lọc/Tùy chọn */}
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-base-100 rounded-lg shadow-sm">
                    
//                     {/* Loại Tìm kiếm (Radio buttons) */}
//                     <div className="flex space-x-6">
//                         <div className="form-control">
//                             <label className="label cursor-pointer gap-2" onClick={() => setSearchType('user')}>
//                                 <input type="radio" name="search_type" className="radio radio-primary radio-sm" checked={searchType === 'user'} readOnly />
//                                 <span className="label-text flex items-center gap-1 font-medium"><UserIcon className="size-4" /> Người dùng</span>
//                             </label>
//                         </div>
//                         <div className="form-control">
//                             <label className="label cursor-pointer gap-2" onClick={() => setSearchType('post')}>
//                                 <input type="radio" name="search_type" className="radio radio-primary radio-sm" checked={searchType === 'post'} readOnly />
//                                 <span className="label-text flex items-center gap-1 font-medium"><FileTextIcon className="size-4" /> Bài viết</span>
//                             </label>
//                         </div>
//                     </div>

//                     {/* Sắp xếp (Dropdown) */}
//                     <div className="flex items-center gap-3">
//                         <FilterIcon className="size-5 text-primary" />
//                         <select 
//                             className="select select-bordered select-sm w-full max-w-xs"
//                             value={sortBy}
//                             onChange={(e) => setSortBy(e.target.value)}
//                         >
//                             {SORT_OPTIONS[searchType].map((option) => (
//                                 <option key={option.value} value={option.value}>
//                                     {option.label}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                 </div>

//                 {/* Khu vực Hiển thị Kết quả */}
//                 {renderResults()}
//             </div>
//         </div>
//     );
// };

// export default SearchPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import UserSearchResultCard from '../components/UserSearchResultCard.jsx'; 
import PostcardSearchResult from '../components/PostcardSearchResult.jsx'; 

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('users'); 
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [myContext, setMyContext] = useState({ friends: [], sentRequests: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyContext = async () => {
        try {
            const res = await fetch('/api/users/me/context', {
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include' 
            });
            const data = await res.json();
            if (res.ok) {
                setMyContext({
                    friends: data.friends || [],
                    sentRequests: data.sentRequests || []
                });
            }
        } catch (error) {
            console.error("Lỗi fetch context:", error); 
        }
    };
    fetchMyContext();
  }, []); 

  const handleSearch = async (e) => {
    if (e) e.preventDefault(); 
    if (!keyword.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]); 
    try {
      const res = await fetch(`/api/search?keyword=${keyword}&type=${searchType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) setResults(data.results);
    } catch (error) {
        // Lỗi SyntaxError sẽ được bắt ở đây
      console.error('Lỗi khi tìm kiếm:', error); 
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendRequest = async (recipientId) => {
    try {
        const res = await fetch(`/api/users/friend-request/${recipientId}`, { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include' // Thêm vào đây
        });
        
        if (res.ok) {
            setMyContext(prev => ({
                ...prev,
                sentRequests: [...prev.sentRequests, recipientId]
            })); 
        } else {
            const data = await res.json();
            alert(`Lỗi: ${data.message}`);
        }
    } catch (error) {
        console.error("Lỗi gửi yêu cầu:", error);
    }
  };
  
  // HÀM NHẮN TIN
  const handleMessageClick = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  // HÀM RENDER KẾT QUẢ
  const renderResults = () => {
    if (loading) {
      return <div className='flex justify-center items-center mt-10'><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }
    if (results.length === 0) {
      return <div className='text-center mt-10 text-base-content/70'>{hasSearched ? `Không tìm thấy kết quả nào cho "${keyword}".` : 'Nhập từ khóa để bắt đầu tìm kiếm.'}</div>;
    }

    if (searchType === 'users') {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {results.map(user => {
            const isFriend = myContext.friends.includes(user._id);
            const isRequestSent = myContext.sentRequests.includes(user._id);
            
            return (
              <UserSearchResultCard 
                key={user._id} 
                user={user}
                isFriend={isFriend}
                isRequestSent={isRequestSent}
                sendRequestMutation={handleSendRequest}
                onMessageClick={handleMessageClick}
              />
            );
          })}
        </div>
      );
    }

    if (searchType === 'posts') {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {results.map(post => (
            <PostcardSearchResult key={post._id} post={post} />
          ))}
        </div>
      );
    }
  };

  // PHẦN GIAO DIỆN
  return (
    <div className='p-4 md:p-8 max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 hidden md:block'>Tìm kiếm</h1>
      <form onSubmit={handleSearch} className="relative mb-4">
        <input
          type="text"
          value={keyword}
          // ĐÂY LÀ DÒNG SỬA LỖI GÕ CHỮ
          onChange={(e) => setKeyword(e.target.value)} 
          placeholder={searchType === 'users' ? "Tìm kiếm tên người dùng..." : "Tìm kiếm nội dung bài viết..."}
          className="input input-bordered w-full pl-10 text-lg py-6"
        />
        <button type="submit" className='absolute left-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle'>
            <Search className='size-5 text-base-content/50' />
        </button>
      </form>

      <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div className="join">
          <button
            className={`btn join-item ${searchType === 'users' ? 'btn-active' : ''}`}
            onClick={() => setSearchType('users')}
          >
            Người dùng
          </button>
          <button
            className={`btn join-item ${searchType === 'posts' ? 'btn-active' : ''}`}
            onClick={() => setSearchType('posts')}
          >
            Bài viết
          </button>
        </div>
        
        <select className="select select-bordered select-sm font-normal">
          <option>Mới nhất</option>
          <option>Cũ nhất</option>
        </select>
      </div>

      <div className="search-results-container">
        {renderResults()}
      </div>
    </div>
  );
};

export default SearchPage;