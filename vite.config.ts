import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind to 0.0.0.0
    port: 5173,
    cors: true,
    origin: "https://76a85a86b3c4.ngrok.app", // 🟢 Set your ngrok domain here
    // allowedHosts: ['.ngrok.app']  ← Not part of Vite, remove if present
  },
});
