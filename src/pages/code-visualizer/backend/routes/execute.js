import express from "express";
import { runUserCode } from "../executor/jsExecutor.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { code, algorithm, input } = req.body;

    if (!code || !algorithm) {
      return res.status(400).json({
        error: "Code and algorithm are required",
      });
    }

    const result = await runUserCode(code, algorithm, input);

    if (result.error) {
      return res.json({ error: result.error });
    }

    res.json({ steps: result.steps });
  } catch (err) {
    res.status(500).json({
      error: err.message || "Execution failed",
    });
  }
});

export default router;