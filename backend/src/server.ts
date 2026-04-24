import express from "express";
import cors from "cors";
import { webhookRouter } from "./routes/webhook";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    "https://trikalvaani.com",
    "https://www.trikalvaani.com",
    process.env.FRONTEND_URL || "https://trikalvaani.com",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use("/api/webhooks/razorpay", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Trikal Vaani Backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/webhooks", webhookRouter);

app.get("/", (_req, res) => {
  res.json({
    name: "Trikal Vaani Backend",
    architect: "Rohiit Gupta — Chief Vedic Architect",
    version: "1.0.0",
    status: "running",
  });
});

app.listen(PORT, () => {
  console.log(`Trikal Vaani Backend running on port ${PORT}`);
});

export default app;