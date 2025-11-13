// import { StreamChat } from "stream-chat";
// import { StreamClient } from "@stream-io/node-sdk"; 
// import "dotenv/config";

// const apiKey = process.env.STREAM_API_KEY; 
// const apiSecret = process.env.STREAM_API_SECRET;


// if (!apiKey || !apiSecret) {
//   console.error("FATAL ERROR: Stream API key or Secret is missing.");

//   throw new Error("Stream API key or Secret is missing from .env file");
// }

// export const streamChatClient = StreamChat.getInstance(apiKey, apiSecret);

// export const streamVideoClient = new StreamClient(apiKey, apiSecret);

// export const upsertStreamUser = async (userData) => {
//   try {
//     await streamChatClient.upsertUsers([userData]);
//     return userData;
//   } catch (error) {
//     console.error("Error upserting Stream user:", error);
//     throw error;
//   }
// };

// export const generateStreamToken = (userId) => {
//   try {
//     const userIdStr = userId.toString();
//     return streamChatClient.createToken(userIdStr);
//   } catch (error) {
//     console.error("Error generating Stream token:", error);
//     throw error;
//   }
// };

// export const generateVideoUserToken = ({ user_id, validity_in_seconds } = {}) => {
//   try {

//     return streamVideoClient.generateUserToken({
//       user_id: user_id.toString(),
//       validity_in_seconds: validity_in_seconds ?? 60 * 60, 
//     });
//   } catch (error) {
//     console.error("Error generating Stream video token:", error);
//     throw error;
//   }
// };

import { StreamChat } from "stream-chat";
// IMPORT CLIENT TỪ PACKAGE BẠN ĐÃ CÀI
import { StreamClient } from "@stream-io/node-sdk"; 
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY; 
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("FATAL ERROR: Stream API key or Secret is missing.");
  throw new Error("Stream API key or Secret is missing from .env file");
}

// 1. Client cho Chat
export const streamChatClient = StreamChat.getInstance(apiKey, apiSecret);

// 2. Client cho Video (dùng package @stream-io/node-sdk)
// Chúng ta sẽ gọi nó là streamVideoClient cho nhất quán
export const streamVideoClient = new StreamClient(apiKey, apiSecret);

// --- Các hàm Helper ---

export const upsertStreamUser = async (userData) => {
  try {
    await streamChatClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamChatClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};

// Hàm tạo video token (DÙNG HÀM CỦA StreamClient)
export const generateVideoUserToken = ({ user_id, validity_in_seconds } = {}) => {
  try {
    // Client này dùng phương thức `generateUserToken`
    return streamVideoClient.generateUserToken({
      user_id: user_id.toString(),
      validity_in_seconds: validity_in_seconds ?? 60 * 60, // Mặc định 1 giờ
    });
  } catch (error) {
    console.error("Error generating Stream video token:", error);
    throw error;
  }
};
