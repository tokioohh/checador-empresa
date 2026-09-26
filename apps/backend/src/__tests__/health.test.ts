import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

describe("GET /api/health", () => {
  it("returns { status: 'ok' } with 200", async () => {
    const res = await request(createApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
