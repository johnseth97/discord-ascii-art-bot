// util/healthcheck.ts
import http from "http";

export async function healthcheck() {
  const port = Number(process.env.PORT) || 8080;
  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        res.writeHead(200);
        res.end("OK");
      } else {
        res.writeHead(404);
        res.end();
      }
    })
    .listen(port, () => console.log(`Health check listening on ${port}`));
}
