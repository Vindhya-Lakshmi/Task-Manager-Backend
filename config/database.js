import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://vindhyalakshmiofficial_db_user:QJFKLGPKPt6QWsFt@cluster0.yxniius.mongodb.net/')
    .then (() => console.log('db connected'))
}