import express from "express";
import { askNewtonAI } from "../services/openai";

const router = express.Router();

/**
 * Streaming chat endpoint for better UX with Server-Sent Events (SSE)
 * Cost: Same as regular chat, but perceived performance is better
 */
router.post("/api/chat/stream", async (req, res, next) => {
  try {
    const { messages, conversationId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }
    
    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
    
    // For now, send the full response at once since we'll stream in a future update
    // This maintains API compatibility while we prepare streaming infrastructure
    const userMessage = messages[messages.length - 1]?.content || "";
    const conversationContext = messages.slice(0, -1);
    
    const response = await askNewtonAI.generateChatResponse(
      userMessage,
      conversationContext
    );
    
    // Send as SSE format
    res.write(`data: ${JSON.stringify({ content: response })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
  } catch (err) {
    console.error("Streaming chat error:", err);
    next(err);
  }
});

export default router;
