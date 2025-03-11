import { connectDB } from "../db.js";

export const getCollection = async (collectionName) => {
  try {
    const db = await connectDB(); // Connect
    return db.collection(collectionName); // Get collection
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw new Error("Database error");
  }
};
