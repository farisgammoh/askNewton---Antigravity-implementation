import request from "supertest";
import { app } from "../server/index";

export const api = () => request(app);
