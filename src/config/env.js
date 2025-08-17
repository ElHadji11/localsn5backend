import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ARCJET_KEY: process.env.ARCJET_KEY,
};

//LOGS 
console.log("Environment variables loaded:");
console.log("PORT:", ENV.PORT);
console.log("NODE_ENV:", ENV.NODE_ENV);
console.log("MONGO_URI exists:", !!ENV.MONGO_URI);