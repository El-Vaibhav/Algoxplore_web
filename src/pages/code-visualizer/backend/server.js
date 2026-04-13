import express from "express";
import cors from "cors";
import executeRoute from "./routes/execute.js";

const app = express();
const allowedOrigins = [
  "https://algoxplore.vercel.app",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
].filter(Boolean);

app.use(cors({
  origin: ["https://algoxplore.vercel.app"],
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

app.use("/api/execute", executeRoute);

app.get("/", (req, res) => {
  res.json({ message: "Express backend running 🚀" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});