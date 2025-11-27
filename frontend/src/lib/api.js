import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
};

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
};

export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};

export const getAuthUser = async () => {
    try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
    } catch (error) {
        console.log("Error in getAuthUser:", error);
        return null;
    }
};

export const completeOnboarding = async (userData) => {
    const response = await axiosInstance.post("/auth/onboarding", userData);
    return response.data;
};

export async function getUserFriends() {
    const response = await axiosInstance.get("/users/friends");
    return response.data;
}

export async function getRecommendedUsers() {
    const response = await axiosInstance.get("/users");
    return response.data;
}

export async function getOutgoingFriendReqs() {
    const response = await axiosInstance.get("/users/outgoing-friend-requests");
    return response.data;
}

export async function sendFriendRequest(userId) {
    const response = await axiosInstance.post(`/users/friend-request/${userId}`);
    return response.data;
}

export async function getFriendRequests() {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
}

export async function acceptFriendRequest(requestId) {
    const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
    return response.data;
}

export const declineFriendRequest = async (requestId) => {
    const response = await axiosInstance.delete(`/users/friend-request/${requestId}/decline`);
    return response.data;
};

export async function getStreamToken() {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
}

export const createPost = async (formData) => {
    const response = await axiosInstance.post("/posts/", formData);
    return response.data;
};

export const getAllPosts = async () => {
    const response = await axiosInstance.get("/posts/");
    return response.data;
};

export const likePost = async (postId) => {
    const response = await axiosInstance.put(`/posts/${postId}/like`);
    return {
        postId: postId,
        likes: response.data.likes
    };
};

export const addComment = async (postId, text) => {
    const response = await axiosInstance.post(`/posts/${postId}/comment`, { text });
    return response.data;
};

export const getPostById = async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
};
export const getUsersFriends = async () => {
    const response = await axiosInstance.get('/users/friends');
    return response.data;
};

export const createGroup = async ({ name, memberIds }) => {
    const response = await axiosInstance.post('/groups/create', { name, memberIds });
    return response.data;
};

export const getVideoToken = async () => {
    const response = await axiosInstance.get('/groups/video-token');
    return response.data;
};

export const startGroupCall = async (groupId) => {
    const response = await axiosInstance.post(`/groups/${groupId}/start-call`);
    return response.data;
};
export const addMembersToGroup = async (groupId, memberIds) => {
    // Gọi: POST /api/groups/:groupId/add-members
    const response = await axiosInstance.post(`/groups/${groupId}/add-members`, { memberIds });
    return response.data;
};

export const removeMemberFromGroup = async (groupId, memberId) => {
    // Gọi: DELETE /api/groups/:groupId/remove-member/:memberId
    const response = await axiosInstance.delete(`/groups/${groupId}/remove-member/${memberId}`);
    return response.data;
};
export const performSearch = async (params) => {
    // params bao gồm: keyword, type, interests (string), location, language...
    const response = await axiosInstance.get("/search", {
        params: params 
    });
    return response.data;
};
