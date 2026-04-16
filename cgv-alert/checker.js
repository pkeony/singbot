// CGV 용산아이파크몰 — 특정 영화+날짜 상영 스케줄 알림 봇
const puppeteer = require("puppeteer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ===== 설정 =====
const CONFIG = {
  CGV_SECRET: "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg",
  SITE_NO: "0013", // 용산아이파크몰
  CO_CD: "A420",
  NTFY_TOPIC: process.env.NTFY_TOPIC || "kelvin-cgv-imax",
  STATE_FILE: path.join(__dirname, "last_state.json"),

  // ===== 감시할 영화 + 날짜 =====
  WATCH_LIST: [
    { movNo: "30000994", movNm: "프로젝트 헤일메리", dates: ["20260421"] },
    // 추가 예시:
    // { movNo: "30001072", movNm: "짱구", dates: ["20260422", "20260423"] },
  ],
};

// ===== 상태 저장/로드 =====
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
}

// ===== ntfy 알림 =====
async function notify(title, message) {
  try {
    await fetch(`https://ntfy.sh/${CONFIG.NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: Buffer.from(title).toString("base64"),
        Priority: "high",
        Tags: "movie_camera",
        Encoding: "base64",
      },
      body: Buffer.from(message).toString("base64"),
    });
    console.log(`[알림] ${title} — ${message}`);
  } catch (err) {
    console.error("[알림 실패]", err.message);
  }
}

// ===== 스케줄을 상영관별로 그룹화 =====
function groupByHall(scheduleData) {
  const halls = {};
  for (const s of scheduleData) {
    const hall = s.scnsNm;
    if (!halls[hall]) halls[hall] = [];
    halls[hall].push({
      startTime: s.scnsrtTm, // "0800"
      endTime: s.scnendTm,   // "1046"
      format: s.movkndDsplNm,// "IMAX LASER 2D"
      totalSeats: s.stcnt,
      freeSeats: s.frSeatCnt,
    });
  }
  // 시간순 정렬
  for (const hall of Object.keys(halls)) {
    halls[hall].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return halls;
}

function formatTime(t) {
  return t.substring(0, 2) + ":" + t.substring(2, 4);
}

function formatDate(d) {
  return d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6, 8);
}

// ===== 메인 =====
async function main() {
  const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  console.log(`[${now}] CGV 용아맥 체크 시작`);

  let browser;
  try {
    browser = await puppeteer.launch({
      ...(process.env.PUPPETEER_EXECUTABLE_PATH ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH } : {}),
      headless: "new",
      protocolTimeout: 60000,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-software-rasterizer",
        "--disable-translate",
        "--disable-sync",
        "--metrics-recording-only",
        "--no-first-run",
      ],
    });

    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // 이미지/폰트/CSS 차단 (메모리 절약)
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 1. CGV 메인 방문 (Cloudflare 쿠키)
    await page.goto("https://www.cgv.co.kr/", { waitUntil: "networkidle0", timeout: 60000 });
    console.log("[OK] CGV 메인 로드");

    // 2. 각 감시 대상 영화+날짜별 스케줄 조회
    const results = await page.evaluate(async (config) => {
      async function cgvFetch(pathname, params) {
        const url = "https://api.cgv.co.kr" + pathname + "?" + new URLSearchParams(params);
        const ts = Math.floor(Date.now() / 1000).toString();
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey("raw", enc.encode(config.CGV_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(ts + "|" + pathname + "|"));
        const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
        const r = await fetch(url, {
          headers: { Accept: "application/json", "X-TIMESTAMP": ts, "X-SIGNATURE": signature },
          credentials: "include",
        });
        return r.json();
      }

      const output = {};
      for (const watch of config.WATCH_LIST) {
        for (const date of watch.dates) {
          const key = watch.movNo + "_" + date;
          const sch = await cgvFetch("/cnm/atkt/searchSchByMov", {
            coCd: config.CO_CD, siteNo: config.SITE_NO,
            movNo: watch.movNo, scnYmd: date, rtctlScopCd: "01",
          });
          output[key] = {
            movNm: watch.movNm,
            date: date,
            sessions: (sch.data || []).map((s) => ({
              scnsNm: s.scnsNm,
              scnsrtTm: s.scnsrtTm,
              scnendTm: s.scnendTm,
              movkndDsplNm: s.movkndDsplNm,
              stcnt: s.stcnt,
              frSeatCnt: s.frSeatCnt,
            })),
          };
        }
      }
      return output;
    }, CONFIG);

    console.log(`[OK] API 조회 완료`);

    // 3. 이전 상태와 비교
    const prevState = loadState();
    const isFirstRun = Object.keys(prevState).length === 0;

    for (const [key, data] of Object.entries(results)) {
      const halls = groupByHall(data.sessions);
      const prevHalls = prevState[key] || {};

      if (isFirstRun) {
        // 첫 실행: 현재 상태만 저장, 알림 없음
        const hallSummary = Object.entries(halls)
          .map(([h, s]) => `  ${h}: ${s.map((x) => formatTime(x.startTime)).join(", ")}`)
          .join("\n");
        console.log(`[초기] ${data.movNm} (${formatDate(data.date)})\n${hallSummary}`);
        continue;
      }

      // 상영관별 비교
      for (const [hall, sessions] of Object.entries(halls)) {
        const prevSessions = prevHalls[hall] || [];
        const prevTimes = prevSessions.map((s) => s.startTime);
        const newSessions = sessions.filter((s) => !prevTimes.includes(s.startTime));

        if (newSessions.length > 0) {
          const times = newSessions.map((s) => formatTime(s.startTime)).join(", ");
          const format = newSessions[0].format || "";
          await notify(
            `${data.movNm} 새 상영!`,
            `${formatDate(data.date)} ${hall}\n${format} ${times}\n잔여석: ${newSessions.map((s) => s.freeSeats + "/" + s.totalSeats).join(", ")}`
          );
        }
      }

      // 새로 생긴 상영관 감지
      for (const hall of Object.keys(halls)) {
        if (!prevHalls[hall]) {
          const sessions = halls[hall];
          const times = sessions.map((s) => formatTime(s.startTime)).join(", ");
          if (!isFirstRun) {
            await notify(
              `${data.movNm} 새 상영관!`,
              `${formatDate(data.date)} ${hall} 오픈!\n${times}`
            );
          }
        }
      }

      // 상태 업데이트 (상영관별 시간 저장)
      prevState[key] = halls;
    }

    if (isFirstRun) {
      console.log("[INFO] 첫 실행 — 현재 스케줄 저장 완료. 다음부터 변경 감지.");
    } else {
      console.log("[INFO] 비교 완료");
    }

    // 4. 상태 저장
    saveState(prevState);
    console.log("[완료]\n");
  } catch (err) {
    console.error("[에러]", err.message);
    await notify("CGV 체커 에러", err.message);
  } finally {
    if (browser) await browser.close();
  }
}

main();
