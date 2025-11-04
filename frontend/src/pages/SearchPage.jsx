import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, FileText as FileTextIcon } from 'lucide-react'; 
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

    // 🚨 Logic fetchMyContext
  useEffect(() => {
    const fetchMyContext = async () => {
        try {
            const res = await fetch('/api/users/me/context', {
                headers: { 'Content-Type': 'application/json' },
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

  // HÀM XỬ LÝ SEARCH (Sử dụng tham số để đồng bộ)
  const handleSearch = async (e, forcedType = searchType) => { 
    if (e) e.preventDefault(); 
    const currentKeyword = keyword.trim();
    
    if (!currentKeyword) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]); 
    try {
        // Sử dụng forcedType để đảm bảo đồng bộ
      const res = await fetch(`/api/search?keyword=${currentKeyword}&type=${forcedType}`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
        
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.results) setResults(data.results);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error); 
    } finally {
      setLoading(false);
    }
  };

  // HÀM XỬ LÝ CHUYỂN ĐỔI LOẠI TÌM KIẾM (FIX LỖI ĐỒNG BỘ)
  const handleTypeChange = (newType) => {
    // 1. Xóa kết quả cũ ngay lập tức (Ngăn lỗi render)
    setResults([]); 
    // 2. Cập nhật loại tìm kiếm
    setSearchType(newType);
    
    // 3. Nếu đã có từ khóa, gọi tìm kiếm lại ngay lập tức với loại mới
    if (keyword.trim()) {
        handleSearch(null, newType); // Truyền newType để buộc đồng bộ
    }
  };
  // ----------------------------------------------------------------------

  // 🚨 HÀM ACTIONS (Giả định chúng được định nghĩa ở đâu đó)
  const handleSendRequest = async (recipientId) => { console.log(`Request sent to ${recipientId}`); };
  const handleMessageClick = (friendId) => { navigate(`/chat/${friendId}`); };

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
          onChange={(e) => setKeyword(e.target.value)} 
          placeholder={searchType === 'users' ? "Tìm kiếm tên người dùng..." : "Tìm kiếm nội dung bài viết..."}
          className="input input-bordered w-full pl-10 text-lg py-6"
        />
        <button type="submit" className='absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle'>
            <Search className='size-5 text-base-content/50' />
        </button>
      </form>

      <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div className="join">
          <button
            className={`btn join-item ${searchType === 'users' ? 'btn-active' : ''}`}
            onClick={() => handleTypeChange('users')}
          >
            Người dùng
          </button>
          <button
            className={`btn join-item ${searchType === 'posts' ? 'btn-active' : ''}`}
            onClick={() => handleTypeChange('posts')}
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
        {console.log("Current Results:", results)}
      </div>
    </div>
  );
};

export default SearchPage;