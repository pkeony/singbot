// CGV 용산아이파크몰 — 영화+날짜 상영 스케줄 알림 봇
// watch_list.json 기반 동적 감시, movie_list.json 자동 갱신
// puppeteer-extra + stealth 플러그인으로 Cloudflare 봇 탐지 우회 시도.
// 플러그인 미설치 시 기존 puppeteer로 폴백(동작은 하지만 차단될 가능성 높음).
let puppeteer;
let usingStealth = false;
try {
  const { addExtra } = require("puppeteer-extra");
  const stealth = require("puppeteer-extra-plugin-stealth");
  let base;
  try { base = require("puppeteer-core"); } catch { base = require("puppeteer"); }
  puppeteer = addExtra(base);
  puppeteer.use(stealth());
  usingStealth = true;
} catch (e) {
  try { puppeteer = require("puppeteer-core"); } catch { puppeteer = require("puppeteer"); }
}
const fs = require("fs");
const path = require("path");

// ===== 설정 =====
const CONFIG = {
  CGV_SECRET: "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg",
  SITE_NO: "0013", // 용산아이파크몰
  CO_CD: "A420",
  NTFY_TOPIC: process.env.NTFY_TOPIC || "kelvin-cgv-imax-v2",
  STATE_FILE: path.join(__dirname, "last_state.json"),
  WATCHLIST_FILE: path.join(__dirname, "watch_list.json"),
  MOVIELIST_FILE: path.join(__dirname, "movie_list.json"),
  ERROR_STATE_FILE: path.join(__dirname, "last_error.json"),
};

const TIMEOUT = 180000;
const ERROR_SUPPRESS_MS = 30 * 60 * 1000; // 같은 에러 30분 이내 반복 시 알림 생략

// ===== 에러 억제 (동일 에러 반복 시 카톡 스팸 방지) =====
function shouldSuppressError(errMsg) {
  try {
    const s = JSON.parse(fs.readFileSync(CONFIG.ERROR_STATE_FILE, "utf8"));
    if (s.msg === errMsg && Date.now() - s.time < ERROR_SUPPRESS_MS) return true;
  } catch {}
  return false;
}

function recordError(errMsg) {
  try {
    fs.writeFileSync(
      CONFIG.ERROR_STATE_FILE,
      JSON.stringify({ msg: errMsg, time: Date.now() })
    );
  } catch {}
}

function clearErrorState() {
  try {
    if (fs.existsSync(CONFIG.ERROR_STATE_FILE)) fs.unlinkSync(CONFIG.ERROR_STATE_FILE);
  } catch {}
}

// ===== 감시 목록 로드 =====
function loadWatchList() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.WATCHLIST_FILE, "utf8"));
  } catch {
    return [];
  }
}

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

// ===== ntfy 알림 (JSON API) =====
async function notify(title, message) {
  try {
    await fetch("https://ntfy.sh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: CONFIG.NTFY_TOPIC,
        title: title,
        message: message,
        priority: 4,
        tags: ["movie_camera"],
      }),
    });
    console.log(`[알림] ${title} — ${message}`);
  } catch (err) {
    console.error("[알림 실패]", err.message);
  }
}

// ===== 스케줄을 상영관별로 그룹화 =====
// cntlYn === "Y" = 예매 통제중(준비중). 시간·좌석수는 보이지만 실제 예매 불가 →
// 알림 의미 없으므로 제외. cntlYn === "N" 으로 바뀌는 순간 "새 세션"으로 감지됨.
function groupByHall(scheduleData) {
  const halls = {};
  for (const s of scheduleData) {
    if (s.cntlYn === "Y") continue;
    if (!Number(s.stcnt)) continue;
    const hall = s.scnsNm;
    if (!halls[hall]) halls[hall] = [];
    halls[hall].push({
      startTime: s.scnsrtTm,
      endTime: s.scnendTm,
      format: s.movkndDsplNm,
      totalSeats: s.stcnt,
      freeSeats: s.frSeatCnt,
    });
  }
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
  console.log(`[${now}] CGV 용아맥 체크 시작 (stealth=${usingStealth ? "ON" : "OFF"})`);

  const watchList = loadWatchList();
  if (watchList.length === 0) {
    console.log("[INFO] 감시 목록이 비어있습니다. 영화 목록만 업데이트합니다.");
  }

  let browser;
  try {
    const launchOptions = {
      headless: "new",
      protocolTimeout: TIMEOUT,
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
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);
    page.setDefaultTimeout(TIMEOUT);

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
    await page.goto("https://www.cgv.co.kr/", {
      waitUntil: "networkidle0",
      timeout: TIMEOUT,
    });
    console.log("[OK] CGV 메인 로드");

    // 2. API 조회 (스케줄 + 영화 목록)
    const evalConfig = {
      CGV_SECRET: CONFIG.CGV_SECRET,
      SITE_NO: CONFIG.SITE_NO,
      CO_CD: CONFIG.CO_CD,
      watchList: watchList,
    };

    const { schedules, movieList } = await page.evaluate(async (config) => {
      async function cgvFetch(pathname, params) {
        const url =
          "https://api.cgv.co.kr" +
          pathname +
          "?" +
          new URLSearchParams(params);
        const ts = Math.floor(Date.now() / 1000).toString();
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          enc.encode(config.CGV_SECRET),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const sig = await crypto.subtle.sign(
          "HMAC",
          key,
          enc.encode(ts + "|" + pathname + "|")
        );
        const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
        const r = await fetch(url, {
          headers: {
            Accept: "application/json",
            "X-TIMESTAMP": ts,
            "X-SIGNATURE": signature,
          },
          credentials: "include",
        });
        if (!r.ok) {
          const bodyText = await r.text().catch(() => "");
          throw new Error(
            "HTTP " + r.status + " " + pathname +
            " | server=" + (r.headers.get("server") || "?") +
            " | body=" + bodyText.substring(0, 120).replace(/\s+/g, " ")
          );
        }
        return r.json();
      }

      // 스케줄 조회 (극장별)
      const schedules = {};
      for (const watch of config.watchList) {
        const siteNo = watch.siteNo || config.SITE_NO;
        const siteNm = watch.siteNm || "용산아이파크몰";
        for (const date of watch.dates) {
          const key = siteNo + "_" + watch.movNo + "_" + date;
          const sch = await cgvFetch("/cnm/atkt/searchSchByMov", {
            coCd: config.CO_CD,
            siteNo: siteNo,
            movNo: watch.movNo,
            scnYmd: date,
            rtctlScopCd: "01",
          });
          schedules[key] = {
            movNm: watch.movNm,
            siteNm: siteNm,
            date: date,
            sessions: (sch.data || []).map((s) => ({
              scnsNm: s.scnsNm,
              scnsrtTm: s.scnsrtTm,
              scnendTm: s.scnendTm,
              movkndDsplNm: s.movkndDsplNm,
              stcnt: s.stcnt,
              frSeatCnt: s.frSeatCnt,
              cntlYn: s.cntlYn,
            })),
          };
        }
      }

      // 영화 목록 조회 (검색용)
      let movieList = [];
      try {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const ml = await cgvFetch("/cnm/atkt/searchAtktTopPostrList", {
          coCd: config.CO_CD,
          siteNo: config.SITE_NO,
          scnYmd: today,
        });
        movieList = (ml.data || []).map((m) => ({
          movNo: m.movNo,
          movNm: m.movNm,
        }));
      } catch (e) {
        // 영화 목록 실패해도 스케줄 체크는 계속
      }

      return { schedules, movieList };
    }, evalConfig);

    console.log("[OK] API 조회 완료");

    // 영화 목록 저장
    if (movieList && movieList.length > 0) {
      fs.writeFileSync(
        CONFIG.MOVIELIST_FILE,
        JSON.stringify(movieList, null, 2)
      );
      console.log(`[OK] 영화 목록 저장: ${movieList.length}개`);
    }

    // 감시 목록이 비어있으면 여기서 종료
    if (watchList.length === 0) {
      console.log("[완료] 영화 목록만 업데이트됨\n");
      return;
    }

    // 3. 이전 상태와 비교
    const prevState = loadState();
    const isFirstRun = Object.keys(prevState).length === 0;

    for (const [key, data] of Object.entries(schedules)) {
      const halls = groupByHall(data.sessions);
      const prevHalls = prevState[key] || {};

      if (isFirstRun) {
        const hallSummary = Object.entries(halls)
          .map(
            ([h, s]) =>
              `  ${h}: ${s.map((x) => formatTime(x.startTime)).join(", ")}`
          )
          .join("\n");
        console.log(
          `[초기] ${data.movNm} (${formatDate(data.date)})\n${hallSummary}`
        );
        prevState[key] = halls; // 버그 수정: 첫 실행에도 현재 상태 저장해야 다음 run에서 비교 가능
        continue;
      }

      // 상영관별 비교
      for (const [hall, sessions] of Object.entries(halls)) {
        const prevSessions = prevHalls[hall] || [];
        const prevTimes = prevSessions.map((s) => s.startTime);
        const newSessions = sessions.filter(
          (s) => !prevTimes.includes(s.startTime)
        );

        if (newSessions.length > 0) {
          const times = newSessions
            .map((s) => formatTime(s.startTime))
            .join(", ");
          const format = newSessions[0].format || "";
          const theaterTag = data.siteNm ? ` (${data.siteNm})` : "";
          await notify(
            `${data.movNm} 새 상영!${theaterTag}`,
            `${formatDate(data.date)} ${hall}\n${format} ${times}\n잔여석: ${newSessions.map((s) => s.freeSeats + "/" + s.totalSeats).join(", ")}`
          );
        }
      }

      // 새로 생긴 상영관 감지
      for (const hall of Object.keys(halls)) {
        if (!prevHalls[hall]) {
          const sessions = halls[hall];
          const times = sessions.map((s) => formatTime(s.startTime)).join(", ");
          const theaterTag2 = data.siteNm ? ` (${data.siteNm})` : "";
          await notify(
            `${data.movNm} 새 상영관!${theaterTag2}`,
            `${formatDate(data.date)} ${hall} 오픈!\n${times}`
          );
        }
      }

      prevState[key] = halls;
    }

    if (isFirstRun) {
      console.log("[INFO] 첫 실행 — 현재 스케줄 저장 완료. 다음부터 변경 감지.");
    } else {
      console.log("[INFO] 비교 완료");
    }

    // 4. 상태 저장
    saveState(prevState);
    clearErrorState(); // 성공 시 에러 억제 상태 초기화 → 다음 실패는 즉시 알림
    console.log("[완료]\n");
  } catch (err) {
    const errMsg = err.message || String(err);
    console.error("[에러]", errMsg);
    if (shouldSuppressError(errMsg)) {
      console.log("[SUPPRESSED] 같은 에러 30분 이내 반복 — 알림 생략");
    } else {
      await notify("CGV 체커 에러", errMsg);
      recordError(errMsg);
    }
  } finally {
    if (browser) await browser.close();
  }
}

main();
