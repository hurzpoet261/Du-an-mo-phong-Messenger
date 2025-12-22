import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk"; 
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY; 
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key or Secret is missing from .env file");
}

export const streamChatClient = StreamChat.getInstance(apiKey, apiSecret);
export const streamVideoClient = new StreamClient(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamChatClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

// 🟢 FIX LỖI 1: Lùi thời gian 'iat' (Issued At) lại 60 giây
export const generateStreamToken = (userId) => {
  const issuedAt = Math.floor(Date.now() / 1000) - 60; // Lùi 60s
  // createToken(userId, expiration, issuedAt)
  return streamChatClient.createToken(userId.toString(), undefined, issuedAt);
};

// 🟢 FIX LỖI 1 CHO VIDEO: Cũng lùi 60 giây
export const generateVideoUserToken = (userId) => {
  const issuedAt = Math.floor(Date.now() / 1000) - 60; // Lùi 60s

  try {
    return streamVideoClient.generateUserToken({
      user_id: userId.toString(),
      validity_in_seconds: 60 * 60, 
      iat: issuedAt, // Thêm tham số này để Stream biết token được tạo từ "quá khứ"
    });
  } catch (error) {
    console.error("Error generating Stream video token:", error);
    throw error;
  }
};