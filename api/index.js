import serverless from "serverless-http";
import app from "../backend/src/app.js";
import connectDB from "../backend/src/config/db.js";

let dbInitialized = false;
async function ensureDB() {
  if (!dbInitialized) {
    await connectDB();
    dbInitialized = true;
  }
}

const handler = serverless(app);

export default async function (req, res) {
  await ensureDB();
  return handler(req, res);
}
