import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "./server.setup";

describe("Waitlist API", () => {
  let fetchSpy: any;

  beforeEach(() => {
    // Set mock env vars
    process.env.AIRTABLE_TOKEN = "pat-test-token";
    process.env.AIRTABLE_BASE_ID = "appTestBaseId";
    process.env.HUBSPOT_TOKEN = "pat-hs-token";

    // Spy on global fetch
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully registers a valid waitlist request", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      text: async () => "{}",
      json: async () => ({})
    } as any);

    const res = await api()
      .post("/api/waitlist")
      .send({
        email: "test-user@example.com",
        state: "California",
        language: "en",
        newcomer: "yes",
        source: "testing"
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    // Verify Airtable and HubSpot were called
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("handles spam bots via honeypot and returns 200 without calling APIs", async () => {
    const res = await api()
      .post("/api/waitlist")
      .send({
        email: "bot-user@example.com",
        company: "BotCorp",
        state: "California"
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    // Fetch should not be called since the request is intercepted by the honeypot
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects invalid email addresses with 400 status", async () => {
    const res = await api()
      .post("/api/waitlist")
      .send({
        email: "invalid-email-format",
        state: "California"
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Please enter a valid email address.");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 502 if Airtable API fails", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => "Unauthorized Access"
    } as any);

    const res = await api()
      .post("/api/waitlist")
      .send({
        email: "test-fail@example.com",
        state: "Texas",
        language: "es"
      });

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty("error", "Could not save your spot. Please try again.");
  });
});
