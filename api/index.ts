// Vercel Serverless Function: single entry point for the entire /api/* backend.
// All /api requests are rewritten here via vercel.json; the original URL is
// preserved, so the Express router inside server/app.ts works unchanged.
import app from '../server/app.js';

export default app;
