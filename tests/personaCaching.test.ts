import { describe, it, expect } from "vitest";
import { api } from "./server.setup";

const payload = {
  count: 12,
  config: { test: true },
  email: "cache-test@example.com"
};

describe("Persona caching", () => {
  it("returns fromCache=false on first call and true on second", async () => {
    const start1 = Date.now();
    const res1 = await api()
      .post("/api/personas/generate")
      .send(payload)
      .expect(200);

    const duration1 = Date.now() - start1;
    expect(res1.body).toHaveProperty("personas");
    expect(res1.body.fromCache).toBe(false);

    const start2 = Date.now();
    const res2 = await api()
      .post("/api/personas/generate")
      .send(payload)
      .expect(200);

    const duration2 = Date.now() - start2;
    expect(res2.body.fromCache).toBe(true);
    expect(res2.body.personas.length).toBe(res1.body.personas.length);

    // Cached version should be significantly faster
    expect(duration2).toBeLessThan(duration1);
  });
});
