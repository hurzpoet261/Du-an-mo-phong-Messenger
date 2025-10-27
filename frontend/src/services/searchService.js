import axios from 'axios';

// Giả định API cho tìm kiếm: GET /api/search?q=query&type=user
const SEARCH_API_URL = 'http://localhost:5001/api/search'; 
axios.defaults.withCredentials = true; 

const performSearch = async (query, searchType, sortBy) => {
    const response = await axios.get(SEARCH_API_URL, {
        params: {
            q: query,
            type: searchType,
            sort: sortBy
        }
    });
    // Trả về mảng kết quả tìm kiếm (User hoặc Post)
    return response.data; 
};

export const searchService = {
    performSearch
};