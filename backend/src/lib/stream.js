import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey ||!apiSecret) {
  console.error("Stream API key or secret is missing.");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// Create or update user in stream
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error while upserting user data: ", error);
  }
};

// Todo: Generate stream token for user
export const generateStreamToken = async (userId) => {};