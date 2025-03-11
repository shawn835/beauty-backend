import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not defined in environment variables");

const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB!");
    }
    return client.db("beautySiteDB");
  } catch (error) {
    console.error("error connecting to mongoDB: ", error);
  }
};

// Close the DB if the app shuts down
process.on("SIGINT", async () => {
  await client.close();
  console.log("mongoDB connection closed");
  process.exit(0);
});
