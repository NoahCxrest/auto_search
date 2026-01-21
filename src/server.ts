import { createApiServer } from "./api/server.js";

const port = parseInt(process.env["PORT"] ?? "3000", 10);
const api = createApiServer(port);
api.start();
