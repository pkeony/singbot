// CGV 용산아이파크몰 IMAX 상영 스케줄 알림 봇
// Puppeteer + HMAC 서명으로 CGV 내부 API 호출

const puppeteer = require("puppeteer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// ===== 설정 =====
const CONFIG = {
  CGV_SECRET: "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg",
  SITE_NO: "0013", // 용산아이파크몰
  CO_CD: "A420",
  IMAX_GRAD_CD: "03", // 아이맥스 tcscnsGradCd
  NTFY_TOPIC: process.env.NTFY_TOPIC || "kelvin-cgv-imax",
  STATE_FILE: path.join(__dirname, "last_state.json"),
  CHECK_INTERVAL_MIN: 15, // cron에서 관리하므로 여기선 참고용
};

// ===== HMAC 서명 =====
function makeSignature(pathname, body, timestamp) {
  const message = `${timestamp}|${pathname}|${body}`;
  return crypto
    .createHmac("sha256", CONFIG.CGV_SECRET)
    .update(message)
    .digest("base64");
}

// ===== 상태 저장/로드 =====
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, "utf8"));
  } catch {
    return { knownDates: [], knownMovies: {} };
  }
}

function saveState(state) {
  fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
}

// ===== ntfy 알림 =====
async function sendNotification(title, message) {
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
    console.log(`[알림 전송] ${title}: ${message}`);
  } catch (err) {
    console.error("[알림 실패]", err.message);
  }
}

// ===== 메인 체크 로직 =====
async function checkIMАX() {
  console.log(`[${new Date().toLocaleString("ko-KR")}] CGV 용아맥 체크 시작`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // 1. CGV 메인 방문 (Cloudflare 쿠키 획득)
    await page.goto("https://www.cgv.co.kr/", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
    console.log("[OK] CGV 메인 페이지 로드");

    // 2. 브라우저 컨텍스트에서 API 호출 (CF 세션 유지)
    const result = await page.evaluate(async (config) => {
      async function cgvFetch(pathname, params) {
        const qs = new URLSearchParams(params).toString();
        const url = "https://api.cgv.co.kr" + pathname + "?" + qs;
        const timestamp = Math.floor(Date.now() / 1000).toString();
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
          enc.encode(timestamp + "|" + pathname + "|")
        );
        const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

        const resp = await fetch(url, {
          headers: {
            Accept: "application/json",
            "X-TIMESTAMP": timestamp,
            "X-SIGNATURE": signature,
          },
          credentials: "include",
        });
        return resp.json();
      }

      const output = {};

      // 2a. 상영 날짜 목록
      const dates = await cgvFetch(
        "/cnm/atkt/searchSiteScnscYmdListBySite",
        { coCd: config.CO_CD, siteNo: config.SITE_NO }
      );
      output.dates = dates.data || [];

      // 2b. 각 날짜별 IMAX 상영 존재 여부
      output.imaxByDate = {};
      for (const d of output.dates) {
        const schd = await cgvFetch(
          "/cnm/atkt/searchSscnsSchdExistList",
          { coCd: config.CO_CD, siteNo: config.SITE_NO, scnYmd: d.scnYmd }
        );
        const imaxEntry = (schd.data || []).find(
          (e) => e.comCdval === config.IMAX_GRAD_CD
        );
        if (imaxEntry) {
          output.imaxByDate[d.scnYmd] = parseInt(imaxEntry.schdCnt);
        }
      }

      // 2c. 영화 목록
      const movies = await cgvFetch(
        "/cnm/atkt/searchOnlyCgvMovList",
        { coCd: config.CO_CD, siteNo: config.SITE_NO }
      );
      output.movies = (movies.data || []).map((m) => ({
        movNo: m.movNo,
        movNm: m.movNm,
      }));

      return output;
    }, CONFIG);

    console.log(
      `[OK] API 조회 완료 — 날짜 ${result.dates.length}개, IMAX 날짜 ${Object.keys(result.imaxByDate).length}개, 영화 ${result.movies.length}편`
    );

    // 3. 이전 상태와 비교
    const prevState = loadState();
    const notifications = [];

    // 3a. 새 IMAX 날짜 감지
    const prevImaxDates = Object.keys(prevState.knownMovies || {});
    const currImaxDates = Object.keys(result.imaxByDate);

    for (const date of currImaxDates) {
      if (!prevImaxDates.includes(date)) {
        const formatted = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
        notifications.push({
          title: `용아맥 IMAX 새 날짜 오픈!`,
          message: `${formatted} — IMAX ${result.imaxByDate[date]}회 상영`,
        });
      } else if (result.imaxByDate[date] !== prevState.knownMovies[date]) {
        const formatted = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
        const prev = prevState.knownMovies[date] || 0;
        const curr = result.imaxByDate[date];
        if (curr > prev) {
          notifications.push({
            title: `용아맥 IMAX 스케줄 추가!`,
            message: `${formatted} — IMAX ${prev}회 → ${curr}회`,
          });
        }
      }
    }

    // 3b. 새 상영 날짜 감지 (IMAX 아니더라도)
    const prevDates = prevState.knownDates || [];
    const currDates = result.dates.map((d) => d.scnYmd);
    const newDates = currDates.filter((d) => !prevDates.includes(d));
    if (newDates.length > 0) {
      console.log(`[INFO] 새 상영 날짜: ${newDates.join(", ")}`);
    }

    // 4. 알림 전송
    for (const n of notifications) {
      await sendNotification(n.title, n.message);
    }

    if (notifications.length === 0) {
      console.log("[INFO] 변경사항 없음");
    }

    // 5. 상태 저장
    saveState({
      knownDates: currDates,
      knownMovies: result.imaxByDate,
      lastCheck: new Date().toISOString(),
      movieList: result.movies,
    });

    console.log(`[완료] 체크 종료\n`);
  } catch (err) {
    console.error("[에러]", err.message);
    await sendNotification(
      "CGV 체커 에러",
      `에러 발생: ${err.message}`
    );
  } finally {
    if (browser) await browser.close();
  }
}

// ===== 실행 =====
checkIMАX();
