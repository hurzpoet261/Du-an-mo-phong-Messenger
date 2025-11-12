import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk"; 
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY; 
const apiSecret = process.env.STREAM_API_SECRET;


if (!apiKey || !apiSecret) {
  console.error("FATAL ERROR: Stream API key or Secret is missing.");

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