import { describe, it, expect } from "vitest";
import { api } from "./server.setup";

describe("Chat streaming", () => {
  it("responds with event-stream content type", async () => {
    const res = await api()
      .post("/api/chat/stream")
      .send({
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Hello, what is ACA?" }
        ],
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.text).toContain("data:");
  });
});
