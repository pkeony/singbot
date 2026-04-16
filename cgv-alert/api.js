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

const SEOUL_THEATERS = [
  { siteNo: "0056", name: "강남" },
  { siteNo: "0001", name: "강변" },
  { siteNo: "0229", name: "건대입구" },
  { siteNo: "0010", name: "구로" },
  { siteNo: "0063", name: "대학로" },
  { siteNo: "0252", name: "동대문" },
  { siteNo: "0230", name: "등촌" },
  { siteNo: "0009", name: "명동" },
  { siteNo: "0011", name: "목동" },
  { siteNo: "0057", name: "미아" },
  { siteNo: "0030", name: "불광" },
  { siteNo: "0046", name: "상봉" },
  { siteNo: "0300", name: "성신여대입구" },
  { siteNo: "0088", name: "송파" },
  { siteNo: "0276", name: "수유" },
  { siteNo: "0150", name: "신촌아트레온" },
  { siteNo: "0040", name: "압구정" },
  { siteNo: "0112", name: "여의도" },
  { siteNo: "0059", name: "영등포" },
  { siteNo: "0074", name: "왕십리" },
  { siteNo: "0013", name: "용산아이파크몰" },
  { siteNo: "0131", name: "중계" },
  { siteNo: "0199", name: "천호" },
  { siteNo: "0107", name: "청담씨네시티" },
  { siteNo: "0223", name: "피카디리1958" },
  { siteNo: "0164", name: "하계" },
  { siteNo: "0191", name: "홍대" },
];

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
    const siteNo = body.siteNo || "0013";
    const siteNm = body.siteNm || "용산아이파크몰";
    const list = loadJSON(WATCHLIST_FILE);
    const idx = list.findIndex((w) => w.movNo === body.movNo && (w.siteNo || "0013") === siteNo);
    if (idx >= 0) {
      list[idx].dates = [...new Set([...list[idx].dates, ...body.dates])].sort();
      list[idx].movNm = body.movNm;
    } else {
      list.push({ movNo: body.movNo, movNm: body.movNm, dates: body.dates, siteNo, siteNm });
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

  // GET /theaters — 서울 CGV 극장 목록
  if (p === "/theaters" && req.method === "GET") {
    return respond(res, 200, { theaters: SEOUL_THEATERS });
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
