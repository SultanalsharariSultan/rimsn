import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { xCallback, xDelete, xDisconnect, xLogin, xScan, xStatus, xUnlike } from "../x";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.get("/api/x/status", (req, res) => res.json(xStatus(req)));
  app.get("/api/x/login", (req, res) => { try { xLogin(req, res); } catch (error) { res.status(503).send(error instanceof Error ? error.message : "X OAuth غير مهيأ"); } });
  app.get("/api/x/callback", (req, res) => { xCallback(req, res).catch((error) => res.status(502).send(error instanceof Error ? error.message : "X OAuth callback failed")); });
  app.post("/api/x/disconnect", (req, res) => xDisconnect(req, res));
  app.get("/api/x/scan", (req, res) => { xScan(req).then((data) => res.json(data)).catch((error) => res.status(502).json({ error: error instanceof Error ? error.message : "تعذر فحص الحساب" })); });
  app.post("/api/x/delete", (req, res) => { xDelete(req).then((data) => res.json(data)).catch((error) => res.status(502).json({ error: error instanceof Error ? error.message : "تعذر تنفيذ الحذف" })); });
  app.post("/api/x/unlike", (req, res) => { xUnlike(req).then((data) => res.json(data)).catch((error) => res.status(502).json({ error: error instanceof Error ? error.message : "تعذر إزالة الإعجاب" })); });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
