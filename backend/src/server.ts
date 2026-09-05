import dotenv from "dotenv";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { serve } from "inngest/express";

import { connectDB } from "./config/db";
import { auth } from "./lib/auth";
import userRouter from "./routes/user";
import activityLogRouter from "./routes/activity";
import { inngest } from "./inngest/client";
import { admitPatient } from "./inngest/functions";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const inngestHandler = serve({
  client: inngest,
  functions: [admitPatient],
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
}

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});
app.use("/api/users", userRouter);
app.use("/api/activity-logs", activityLogRouter);
// app.use("/api/notifications", notificationRouter);
// app.use("/api/lab-results", labResultsRouter);
// app.use("/api/invoices", invoiceRouter);

// Inngest API route. Keep `/api/ingest` as a compatibility alias for manual sync URLs.
app.use("/api/inngest", inngestHandler);

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      `❌ Error connecting to the database: ${(error as Error).message}`,
    );
    process.exit(1); // Exit process with failure
  });
