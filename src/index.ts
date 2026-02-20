import express from 'express';
import subjectsRouter from "./routes/subjects";
import cors from "cors";
import securityMiddleware from "./middleware/security";
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

// Middleware to parse JSON bodies
app.use(express.json());

if (!process.env.FRONTEND_URL) {
    console.warn("FRONTEND_URL is not set; CORS will block all cross-origin requests");
}

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

// Router for subjects
app.use('/api/subjects', subjectsRouter)

// Security Middleware
app.use(securityMiddleware);

// Root route
app.get('/', (req, res) => {
  res.send('Classroom backend is running');
});

// Start server
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server started at ${url}`);
});
