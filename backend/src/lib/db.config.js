import mognoose from'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mognoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);    
  } catch (error) {
    console.error("Error connecting to MongoDB: ",error.message);
    process.exit(1);    
  }
}; 