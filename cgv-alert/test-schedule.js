// 특정 영화 + 날짜의 상영관별 스케줄 조회 테스트
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  await page.goto("https://www.cgv.co.kr/", { waitUntil: "networkidle2", timeout: 30000 });
  console.log("[OK] CGV 메인 로드");

  const result = await page.evaluate(async () => {
    const SECRET = "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg";
    async function cgvFetch(path, params) {
      const url = "https://api.cgv.co.kr" + path + "?" + new URLSearchParams(params);
      const ts = Math.floor(Date.now() / 1000).toString();
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(ts + "|" + path + "|"));
      const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
      const r = await fetch(url, {
        headers: { Accept: "application/json", "X-TIMESTAMP": ts, "X-SIGNATURE": signature },
        credentials: "include",
      });
      return r.json();
    }

    const output = {};
    const CO_CD = "A420";
    const SITE_NO = "0013"; // 용산아이파크몰

    // 1. 영화 목록에서 '프로젝트 헤일메리' 찾기
    const movies = await cgvFetch("/cnm/atkt/searchOnlyCgvMovList", { coCd: CO_CD, siteNo: SITE_NO });
    output.allMovies = (movies.data || []).map((m) => ({ movNo: m.movNo, movNm: m.movNm }));

    const target = (movies.data || []).find((m) => m.movNm.includes("헤일메리"));
    if (!target) {
      output.error = "영화를 찾을 수 없음";
      return output;
    }
    output.targetMovie = { movNo: target.movNo, movNm: target.movNm };

    // 2. searchSchByMov — 영화별 상영 스케줄
    const sch = await cgvFetch("/cnm/atkt/searchSchByMov", {
      coCd: CO_CD, siteNo: SITE_NO, movNo: target.movNo, scnYmd: "20260421", rtctlScopCd: "01",
    });
    output.scheduleByMov = sch;

    // 3. 다른 API도 시도
    const sch2 = await cgvFetch("/cnm/atkt/searchMovScnInfo", {
      coCd: CO_CD, siteNo: SITE_NO, movNo: target.movNo, scnYmd: "20260421",
    });
    output.movScnInfo = sch2;

    // 4. 상영 날짜 조회
    const dates = await cgvFetch("/cnm/atkt/searchSiteScnscYmdListByMov", {
      coCd: CO_CD, siteNo: SITE_NO, movNo: target.movNo,
    });
    output.movieDates = dates;

    return output;
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
