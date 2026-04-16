// CGV 감시 목록 관리 API 서버
// GCP VM에서 실행: node api.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.CGV_API_KEY || "singbot-cgv-2026";
const WATCHLIST_FILE = path.join(__dirname, "watch_list.json");
const MOVIELIST_FILE = path.join(__dirname, "movie_list.json");

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch {
    return [];
  }
}

function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(null);
      }
    });
  });
}

function respond(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const p = parsed.pathname;
  const q = parsed.query;

  if (q.key !== API_KEY) {
    return respond(res, 401, { error: "unauthorized" });
  }

  // GET /watchlist
  if (p === "/watchlist" && req.method === "GET") {
    return respond(res, 200, { watchList: loadJSON(WATCHLIST_FILE) });
  }

  // POST /watchlist — add/update { movNo, movNm, dates[] }
  if (p === "/watchlist" && req.method === "POST") {
    const body = await readBody(req);
    if (!body || !body.movNo || !body.movNm || !body.dates || !body.dates.length) {
      return respond(res, 400, { error: "movNo, movNm, dates[] required" });
    }
    const list = loadJSON(WATCHLIST_FILE);
    const idx = list.findIndex((w) => w.movNo === body.movNo);
    if (idx >= 0) {
      list[idx].dates = [...new Set([...list[idx].dates, ...body.dates])].sort();
      list[idx].movNm = body.movNm;
    } else {
      list.push({ movNo: body.movNo, movNm: body.movNm, dates: body.dates });
    }
    saveJSON(WATCHLIST_FILE, list);
    return respond(res, 200, { ok: true, watchList: list });
  }

  // DELETE /watchlist?movNo=xxx[&date=YYYYMMDD]
  if (p === "/watchlist" && req.method === "DELETE") {
    if (!q.movNo) return respond(res, 400, { error: "movNo required" });
    let list = loadJSON(WATCHLIST_FILE);
    if (q.date) {
      const item = list.find((w) => w.movNo === q.movNo);
      if (item) {
        item.dates = item.dates.filter((d) => d !== q.date);
        if (item.dates.length === 0) list = list.filter((w) => w.movNo !== q.movNo);
      }
    } else {
      list = list.filter((w) => w.movNo !== q.movNo);
    }
    saveJSON(WATCHLIST_FILE, list);
    return respond(res, 200, { ok: true, watchList: list });
  }

  // GET /movies — 전체 영화 목록
  if (p === "/movies" && req.method === "GET") {
    const movies = loadJSON(MOVIELIST_FILE);
    return respond(res, 200, { movies });
  }

  // GET /search?q=keyword
  if (p === "/search" && req.method === "GET") {
    if (!q.q) return respond(res, 400, { error: "q required" });
    const movies = loadJSON(MOVIELIST_FILE);
    const keyword = q.q.toLowerCase();
    const results = movies.filter((m) => m.movNm.toLowerCase().includes(keyword));
    return respond(res, 200, { results: results.slice(0, 10) });
  }

  respond(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log("[CGV API] listening on port " + PORT);
});
