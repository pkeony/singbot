// Puppeteer 없이 CGV API 직접 호출 테스트
const crypto = require("crypto");
const SECRET = "ydqXY0ocnFLmJGHr_zNzFcpjwAsXq_8JcBNURAkRscg";

async function cgvApi(pathname, params) {
  const qs = new URLSearchParams(params).toString();
  const url = "https://api.cgv.co.kr" + pathname + "?" + qs;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = timestamp + "|" + pathname + "|";
  const signature = crypto.createHmac("sha256", SECRET).update(message).digest("base64");

  const resp = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "ko-KR",
      Referer: "https://cgv.co.kr/",
      Origin: "https://cgv.co.kr",
      "X-TIMESTAMP": timestamp,
      "X-SIGNATURE": signature,
    },
  });
  const text = await resp.text();
  try {
    return { status: resp.status, data: JSON.parse(text) };
  } catch {
    return { status: resp.status, html: true };
  }
}

(async () => {
  const tests = [
    ["/cnm/atkt/searchSiteScnscYmdListBySite", { coCd: "A420", siteNo: "0013" }],
    ["/cnm/atkt/searchOnlyCgvMovList", { coCd: "A420", siteNo: "0013" }],
    ["/cnm/atkt/searchSscnsSchdExistList", { coCd: "A420", siteNo: "0013", scnYmd: "20260416", tcscnsGradCd: "03" }],
  ];

  for (const [path, params] of tests) {
    const r = await cgvApi(path, params);
    const label = path.split("/").pop();
    if (r.html) {
      console.log(label + ": " + r.status + " (BLOCKED)");
    } else {
      console.log(label + ": " + r.status + " OK (" + (r.data.data ? r.data.data.length + "건" : "empty") + ")");
    }
  }
})();
