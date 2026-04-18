// Import the Express framework to create a web server and handle HTTP requests
import express from "express";
// Import the runUserCode function from the jsExecutor module to execute user code safely
import { runUserCode } from "../executor/jsExecutor.js";

// Create a new Express router to define routes for this module
const router = express.Router();

// Define a POST route at the root path "/" for handling code execution requests
router.post("/", async (req, res) => {
  // Use try-catch to handle any errors that might occur during execution
  try {
    // Extract code, algorithm, and input from the request body (JSON data sent by client)
    const { code, algorithm, input } = req.body;

    // Check if code or algorithm is missing, and return a 400 Bad Request error if so
    if (!code || !algorithm) {
      return res.status(400).json({
        error: "Code and algorithm are required",
      });
    }

    // Call the runUserCode function asynchronously to execute the user's code
    // This runs the algorithm and returns steps for visualization or an error
    const result = await runUserCode(code, algorithm, input);

    // If there's an error in the result, return it as a JSON response
    if (result.error) {
      return res.json({ error: result.error });
    }

    // If successful, return the steps as JSON for the client to visualize
    res.json({ steps: result.steps });

  // Catch any unexpected errors and return a 500 Internal Server Error
  } catch (err) {
    res.status(500).json({
      error: err.message || "Execution failed",
    });
  }
});

// Export the router so it can be used in other parts of the application
export default router;