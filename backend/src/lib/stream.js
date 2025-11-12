// import { StreamChat } from "stream-chat";
// import "dotenv/config";

// const apiKey = process.env.STREAM_API_KEY;
// const apiSecret = process.env.STREAM_API_SECRET;

// if (!apiKey || !apiSecret) {
//   console.error("Stream API key or Secret is missing");
// }

// const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// export const upsertStreamUser = async (userData) => {
//   try {
//     await streamClient.upsertUsers([userData]);
//     return userData;
//   } catch (error) {
//     console.error("Error upserting Stream user:", error);
//   }
// };

// export const generateStreamToken = (userId) => {
//   try {
//     // ensure userId is a string
//     const userIdStr = userId.toString();
//     return streamClient.createToken(userIdStr);
//   } catch (error) {
//     console.error("Error generating Stream token:", error);
//   }
// };

// src/lib/stream.js

import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk"; // <-- đúng package & export cho server-side
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
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

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamChatClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};

export const generateVideoUserToken = ({ user_id, validity_in_seconds } = {}) => {
  try {
    return streamVideoClient.generateUserToken({
      user_id: user_id.toString(),
      validity_in_seconds: validity_in_seconds ?? 60 * 60, 
    });
  } catch (error) {
    console.error("Error generating Stream video token:", error);
    throw error;
  }
};