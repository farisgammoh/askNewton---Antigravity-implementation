import request from "supertest";
import express from "express";
import { registerRoutes } from "../server/routes";

let testApp: express.Express | null = null;

export const api = () => {
  if (!testApp) {
    testApp = express();
    testApp.use(express.json());
    // Register all routes on the test app instance
    registerRoutes(testApp).catch(err => {
      console.error("Failed to register test routes:", err);
    });
  }
  return request(testApp);
};
