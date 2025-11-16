import { describe, it, expect } from "vitest";
import { api } from "./server.setup";

describe("Idempotency middleware", () => {
  it("returns identical response for duplicate requests within window", async () => {
    const payload = {
      count: 6,
      config: { test: true },
      email: "idem-test@example.com"
    };

    const res1 = await api()
      .post("/api/personas/generate")
      .send(payload)
      .expect(200);

    const res2 = await api()
      .post("/api/personas/generate")
      .send(payload)
      .expect(200);

    // Second response should have fromIdempotentCache flag
    expect(res2.body).toHaveProperty("fromIdempotentCache", true);
    
    // Responses should match structurally
    expect(res2.body.personas).toEqual(res1.body.personas);
  });
});
