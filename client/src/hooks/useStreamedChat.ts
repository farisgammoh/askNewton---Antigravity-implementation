import { useState } from "react";

/**
 * Hook for streaming chat responses from the server
 * Provides better UX by showing responses as they arrive
 * 
 * @example
 * const { streamingText, sendMessages, isStreaming } = useStreamedChat();
 * 
 * // Use in component
 * <button onClick={() => sendMessages(messages)} disabled={isStreaming}>
 *   Send
 * </button>
 * <div>{streamingText}</div>
 */
export function useStreamedChat() {
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  async function sendMessages(messages: any[]) {
    setStreamingText("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data:")) continue;
          
          try {
            const json = part.replace(/^data:\s*/, "");
            const payload = JSON.parse(json);

            if (payload.content) {
              setStreamingText((prev) => prev + payload.content);
            }
            
            if (payload.done) {
              setIsStreaming(false);
            }
          } catch (e) {
            console.error("Failed to parse SSE message:", e);
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      setIsStreaming(false);
    }
  }

  return { streamingText, sendMessages, isStreaming };
}
