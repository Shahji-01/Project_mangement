import mongoose from "mongoose";

const connection = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
};
export default connection;
