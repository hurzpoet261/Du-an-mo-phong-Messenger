import React, { useState, useEffect } from 'react';
import { SearchIcon, UserIcon, FileTextIcon, FilterIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useDebounce from '../hooks/useDebounce.js'; 

import UserSearchResultCard from '../components/UserSearchResultCard.jsx';
import PostcardSearchResult from '../components/PostcardSearchResult.jsx'; 

// Giả định service và options
const searchService = { performSearch: async (query, type, sort) => { 
    console.log(`Searching for: ${query}, Type: ${type}, Sort: ${sort}`);
    // 🚨 Thay thế bằng API call thực tế của bạn
    return type === 'user' ? [] : []; 
}};
const SORT_OPTIONS = {
    user: [{ label: "Mới nhất", value: "newest" }, { label: "Cũ nhất", value: "oldest" }],
    post: [{ label: "Mới nhất", value: "newest" }, { label: "Phổ biến (Likes)", value: "likes" }]
};

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('user');
    const [sortBy, setSortBy] = useState('newest');

    const debouncedQuery = useDebounce(searchQuery, 500); 

    // Logic gọi API
    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery, searchType, sortBy],
        queryFn: () => searchService.performSearch(debouncedQuery, searchType, sortBy),
        enabled: !!debouncedQuery,
    });
    
    useEffect(() => {
        setSortBy('newest');
    }, [searchType]);
    
    // Giả định các hàm action
    const handleSendFriendRequest = (userId) => { console.log(`Sending request to: ${userId}`); };
    const handleMessageUser = (userId) => { console.log(`Navigating to chat with: ${userId}`); };


    const renderResults = () => {
        if (!debouncedQuery) {
            return <p className="text-center text-gray-500 mt-12">Nhập từ khóa để bắt đầu tìm kiếm.</p>;
        }
        if (isLoading) {
            return <div className="flex justify-center mt-12"><span className="loading loading-spinner loading-lg"></span></div>;
        }
        if (searchResults?.length === 0) {
            return <p className="text-center text-gray-500 mt-12">Không tìm thấy kết quả nào cho "{searchQuery}".</p>;
        }
        
        if (searchType === 'user') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {searchResults?.map((user) => (
                        <UserSearchResultCard 
                            key={user._id} 
                            user={user}
                            isFriend={false}
                            isRequestSent={false} 
                            sendRequestMutation={handleSendFriendRequest}
                            onMessageClick={handleMessageUser}
                        />
                    ))}
                </div>
            );
        } else if (searchType === 'post') {
             return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    {searchResults?.map((post) => (
                        // 🟢 Sử dụng Component PostcardSearchResult mới
                        <PostcardSearchResult 
                            key={post._id} 
                            post={post}
                        />
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>

                {/* Thanh Tìm kiếm */}
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Tìm kiếm ${searchType === 'user' ? 'tên người dùng...' : 'nội dung bài viết...'}`}
                        className="input input-lg input-bordered w-full pl-12 pr-16 bg-base-200 focus:bg-white transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Bộ Lọc/Tùy chọn */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-base-100 rounded-lg shadow-sm">
                    
                    {/* Loại Tìm kiếm (Radio buttons) */}
                    <div className="flex space-x-6">
                        <div className="form-control">
                            <label className="label cursor-pointer gap-2" onClick={() => setSearchType('user')}>
                                <input type="radio" name="search_type" className="radio radio-primary radio-sm" checked={searchType === 'user'} readOnly />
                                <span className="label-text flex items-center gap-1 font-medium"><UserIcon className="size-4" /> Người dùng</span>
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer gap-2" onClick={() => setSearchType('post')}>
                                <input type="radio" name="search_type" className="radio radio-primary radio-sm" checked={searchType === 'post'} readOnly />
                                <span className="label-text flex items-center gap-1 font-medium"><FileTextIcon className="size-4" /> Bài viết</span>
                            </label>
                        </div>
                    </div>

                    {/* Sắp xếp (Dropdown) */}
                    <div className="flex items-center gap-3">
                        <FilterIcon className="size-5 text-primary" />
                        <select 
                            className="select select-bordered select-sm w-full max-w-xs"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {SORT_OPTIONS[searchType].map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Khu vực Hiển thị Kết quả */}
                {renderResults()}
            </div>
        </div>
    );
};

export default SearchPage;