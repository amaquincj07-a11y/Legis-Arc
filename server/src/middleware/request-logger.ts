import morgan from "morgan";
import { env } from "../config/env.js";

export const requestLogger = morgan(env.isDev ? "dev" : "combined");
