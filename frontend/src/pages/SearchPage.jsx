import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react'; 
import UserSearchResultCard from '../components/UserSearchResultCard.jsx'; 
import PostcardSearchResult from '../components/PostcardSearchResult.jsx'; 
// ✅ Giữ đúng đường dẫn này để không bị lỗi import
import { ALL_COUNTRIES, ALL_LANGUAGES, INTERESTS_LIST } from "../constants/index.js"; 

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState('users'); 
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [myContext, setMyContext] = useState({ friends: [], sentRequests: [] });
  const navigate = useNavigate();

  // STATE CHO BỘ LỌC
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
      location: "",
      nativeLanguage: "",
      interests: [] 
  });

  useEffect(() => {
    const fetchMyContext = async () => {
        try {
            const res = await fetch('/api/users/me/context', {
                headers: { 'Content-Type': 'application/json' },
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

  const toggleInterest = (interest) => {
      setFilters(prev => {
          const current = prev.interests;
          return current.includes(interest) 
            ? { ...prev, interests: current.filter(i => i !== interest) }
            : { ...prev, interests: [...current, interest] };
      });
  };

  const clearFilters = () => {
      setFilters({ location: "", nativeLanguage: "", interests: [] });
      setShowFilters(false);
  };

  // 🟢 HÀM SEARCH CŨ (Không có header chặn cache -> Chạy mượt)
  const handleSearch = async (e, forcedType = searchType) => { 
    if (e) e.preventDefault(); 
    const currentKeyword = keyword.trim();
    
    // Logic chặn tìm kiếm rỗng
    const hasFilters = filters.interests.length > 0 || filters.location || filters.nativeLanguage;
    if (!currentKeyword && !hasFilters && forcedType === 'users') return;
    if (!currentKeyword && forcedType === 'posts') return;

    setLoading(true);
    setHasSearched(true);
    setResults([]); 

    try {
        const searchParams = new URLSearchParams({
            keyword: currentKeyword,
            type: forcedType,
        });

        if (forcedType === 'users') {
            if (filters.location) searchParams.append('location', filters.location);
            if (filters.nativeLanguage) searchParams.append('nativeLanguage', filters.nativeLanguage);
            if (filters.interests.length > 0) searchParams.append('interests', filters.interests.join(','));
        }

        // Fetch bình thường (cho phép Cache)
        const res = await fetch(`/api/search?${searchParams.toString()}`, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }, 
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (data.results) setResults(data.results);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error); 
    } finally {
        setLoading(false);
    }
  };
  
  const handleTypeChange = (newType) => {
    setResults([]); 
    setSearchType(newType);
    if (newType === 'posts') clearFilters();

    if (keyword.trim()) {
        handleSearch(null, newType); 
    }
  };
  
  const handleSendRequest = async (recipientId) => { 
    try {
        const res = await fetch(`/api/users/friend-request/${recipientId}`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            setMyContext(prev => ({ ...prev, sentRequests: [...prev.sentRequests, recipientId] })); 
        }
    } catch (error) { console.error("Lỗi gửi yêu cầu:", error); }
  };

  const handleMessageClick = (friendId) => { navigate(`/chat/${friendId}`); };

  const renderResults = () => {
    if (loading) return <div className='flex justify-center items-center mt-10'><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    
    if (results.length === 0) return <div className='text-center mt-10 text-base-content/70'>{hasSearched ? `Không tìm thấy kết quả nào.` : 'Nhập từ khóa để bắt đầu tìm kiếm.'}</div>;

    if (searchType === 'users') {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {results.map(user => (
            <UserSearchResultCard 
              key={user._id} user={user}
              isFriend={myContext.friends.includes(user._id)}
              isRequestSent={myContext.sentRequests.includes(user._id)}
              sendRequestMutation={handleSendRequest}
              onMessageClick={handleMessageClick}
            />
          ))}
        </div>
      );
    }

    if (searchType === 'posts') {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
          {results.map(post => <PostcardSearchResult key={post._id} post={post} />)}
        </div>
      );
    }
  };

  return (
    <div className='p-4 md:p-8 max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-6 hidden md:block'>Tìm kiếm</h1>
      
      <form onSubmit={handleSearch} className="relative mb-4 flex gap-2">
        <div className="relative flex-grow">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)} 
              placeholder={searchType === 'users' ? "Tìm tên, email..." : "Tìm nội dung bài viết..."}
              className="input input-bordered w-full pl-10 text-lg py-6"
            />
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50' />
        </div>
        
        {searchType === 'users' && (
            <button 
                type="button"
                className={`btn btn-lg ${showFilters ? 'btn-primary' : 'btn-ghost bg-base-200'}`}
                onClick={() => setShowFilters(!showFilters)}
                title="Bộ lọc nâng cao"
            >
                <Filter size={24} />
            </button>
        )}
        
        <button type="submit" className='btn btn-lg btn-primary'>Tìm</button>
      </form>

      {/* FILTER PANEL */}
      {showFilters && searchType === 'users' && (
          <div className="bg-base-200 p-4 rounded-xl mb-6 border border-base-300 animate-fade-in-down">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Lọc theo tiêu chí</h3>
                  <button onClick={clearFilters} className="btn btn-xs btn-ghost text-error">Xóa bộ lọc</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select 
                      className="select select-bordered w-full"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                  >
                      <option value="">Tất cả quốc gia</option>
                      {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <select 
                      className="select select-bordered w-full"
                      value={filters.nativeLanguage}
                      onChange={(e) => setFilters({...filters, nativeLanguage: e.target.value})}
                  >
                      <option value="">Tất cả ngôn ngữ</option>
                      {ALL_LANGUAGES.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
                  </select>
              </div>

              <div className="mb-2">
                  <span className="label-text font-semibold mb-2 block">Sở thích chung:</span>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                      {INTERESTS_LIST.map(interest => (
                          <span 
                              key={interest}
                              onClick={() => toggleInterest(interest)}
                              className={`badge badge-lg cursor-pointer select-none border ${
                                  filters.interests.includes(interest) 
                                  ? 'badge-primary border-primary' 
                                  : 'badge-outline bg-base-100'
                              }`}
                          >
                              {interest}
                          </span>
                      ))}
                  </div>
              </div>
          </div>
      )}

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
      </div>

      <div className="search-results-container">
        {renderResults()}
      </div>
    </div>
  );
};

export default SearchPage;