import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/database.js';
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js';


const app = express();
const port = process.env.PORT || 4000;

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//db connect
connectDB()

//route
app.use("/api/user", userRouter)
app.use("/api/tasks", taskRouter);

app.get('/',(req, res)=>{
    res.send("sample rout")
})

app.listen(port,()=>{
    console.log(`listening http://localhost:${port}`);
    
})