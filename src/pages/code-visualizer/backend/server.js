// Import the Express framework to build the web server
import express from "express";
// Import the CORS middleware to handle cross-origin requests (security for web apps)
import cors from "cors";
// Import the execute route handler from the routes folder
import executeRoute from "./routes/execute.js";

// Create an Express application instance
const app = express();

// Define a list of allowed origins (websites) that can access this server
// This includes the production site and local development URLs
const allowedOrigins = [
  "https://algoxplore.vercel.app",  // Production website
  "http://localhost:8080",         // Local development
  "http://127.0.0.1:8080",         // Alternative local address
].filter(Boolean);  // Remove any falsy values if present

// Set up CORS middleware to control which websites can make requests to this server
app.use(cors({
  // Allow requests from the production site
  origin: ["https://algoxplore.vercel.app"],
  // Custom origin function to check if the requesting origin is allowed
  origin(origin, callback) {
    // If no origin (like server-to-server) or origin is in allowed list, allow it
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // Allow the request
      return;
    }
    // Otherwise, block the request with an error
    callback(new Error("Not allowed by CORS"));
  },
  // Allow only GET and POST HTTP methods
  methods: ["GET", "POST"],
  // Allow credentials (cookies, authorization headers) to be sent
  credentials: true,
}));

// Use Express's built-in JSON parser middleware to automatically parse JSON in request bodies
app.use(express.json());

// Mount the execute route at the "/api/execute" path
// This means requests to "/api/execute" will be handled by the executeRoute
app.use("/api/execute", executeRoute);

// Define a simple GET route at the root path "/" to check if the server is running
app.get("/", (req, res) => {
  // Send a JSON response with a success message
  res.json({ message: "Express backend running 🚀" });
});

// Set the port number from environment variable or default to 8000
const PORT = process.env.PORT || 8000;

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message to the console when the server starts successfully
  console.log(`Server running on port ${PORT}`);
});