const PORT = 3000;

const http = require("http");
const { readDB, writeDB, deleteDB } = require("./db_helpers");

const parseParams = (url, param) => {
  const path = new URL(`http://localhost:${PORT}${url}`);
  const params = path.searchParams;
  return params.get(param);
};

const handler = async (request, response) => {
  if (request.url.startsWith("/event")) {
    if (request.method === "GET") {
      const eventId = parseParams(request.url, "id");
      const events = await readDB("events.json");

      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(events.filter((event) => event.id == eventId))
      );
    } else if (request.method === "POST") {
      response.writeHead(201, {
        "Content-Type": "application/json",
      });

      let body = "";
      request.on("data", (chunk) => {
        body += chunk;
      });

      request.on("end", async () => {
        body = JSON.parse(body);
        const result = await writeDB("events.json", body);

        response.end(JSON.stringify(result));
      });
    } else if (request.method === "DELETE") {
      const eventId = parseParams(request.url, "id");
      const deletedId = await deleteDB("events.json", eventId);
      response.end(JSON.stringify({ id: deletedId }));
    }
  }
};

const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`Server on localhost, port ${PORT}`);
});
