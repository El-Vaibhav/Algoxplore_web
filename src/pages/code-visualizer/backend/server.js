import express from "express";
import cors from "cors";
import executeRoute from "./routes/execute.js";

const app = express();

app.use(cors({
  origin: ["https://algoxplore.vercel.app/"],
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