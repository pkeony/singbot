// ===== CGV 용아맥 상영 알림 연동 =====

var CGV_NTFY_TOPIC = "kelvin-cgv-imax-v2";
var CGV_NTFY_API = "https://ntfy.sh/" + CGV_NTFY_TOPIC + "/json";
var _cgvLastCheckTime = Math.floor(Date.now() / 1000);
var _cgvNotifiedIds = {};

// ===== GCP API 연동 (감시 목록 관리) =====
var CGV_API_BASE = "http://35.212.161.13:8080";
var CGV_API_KEY = "singbot-cgv-2026";

// 서울 CGV 극장 목록
var SEOUL_THEATERS = [
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
  { siteNo: "0191", name: "홍대" }
];

function findTheater(query) {
  if (!query) return null;
  var q = query.toLowerCase();
  for (var i = 0; i < SEOUL_THEATERS.length; i++) {
    if (SEOUL_THEATERS[i].name.toLowerCase().indexOf(q) !== -1) {
      return SEOUL_THEATERS[i];
    }
  }
  return null;
}

// ntfy에서 최근 알림 가져오기
function fetchCgvAlerts(since) {
  var url = CGV_NTFY_API + "?poll=1&since=" + (since || "1h");
  try {
    var conn = new java.net.URL(url).openConnection();
    conn.setConnectTimeout(3000);
    conn.setReadTimeout(3000);
    conn.setRequestProperty("Accept", "application/json");
    var reader = new java.io.BufferedReader(
      new java.io.InputStreamReader(conn.getInputStream(), "UTF-8")
    );
    var lines = [];
    var line;
    while ((line = reader.readLine()) !== null) {
      var s = String(line).trim();
      if (s.length > 0) lines.push(s);
    }
    reader.close();
    conn.disconnect();

    var alerts = [];
    for (var i = 0; i < lines.length; i++) {
      try {
        var obj = JSON.parse(lines[i]);
        if (obj.event === "message") {
          alerts.push({
            id: obj.id || "",
            title: obj.title || "",
            message: obj.message || "",
            time: obj.time || 0,
          });
        }
      } catch (e) {}
    }
    return alerts;
  } catch (e) {
    return null;
  }
}

function formatTimeAgo(unixTime) {
  var diff = Math.floor(Date.now() / 1000) - unixTime;
  if (diff < 60) return diff + "초 전";
  if (diff < 3600) return Math.floor(diff / 60) + "분 전";
  if (diff < 86400) return Math.floor(diff / 3600) + "시간 전";
  return Math.floor(diff / 86400) + "일 전";
}

function formatCgvDate(d) {
  if (!d || d.length !== 8) return d;
  return d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6, 8);
}

// ===== GCP API 호출 헬퍼 =====
function cgvApiRequest(method, pathAndQuery, body) {
  var sep = pathAndQuery.indexOf("?") === -1 ? "?" : "&";
  var fullUrl = CGV_API_BASE + pathAndQuery + sep + "key=" + encodeURIComponent(CGV_API_KEY);
  try {
    var conn = new java.net.URL(fullUrl).openConnection();
    conn.setConnectTimeout(5000);
    conn.setReadTimeout(10000);
    conn.setRequestMethod(method);
    conn.setRequestProperty("Accept", "application/json");

    if (body) {
      conn.setDoOutput(true);
      conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
      var os = conn.getOutputStream();
      var bytes = new java.lang.String(JSON.stringify(body)).getBytes("UTF-8");
      os.write(bytes, 0, bytes.length);
      os.close();
    }

    var reader = new java.io.BufferedReader(
      new java.io.InputStreamReader(conn.getInputStream(), "UTF-8")
    );
    var result = "";
    var line;
    while ((line = reader.readLine()) !== null) {
      result += String(line);
    }
    reader.close();
    conn.disconnect();
    return JSON.parse(result);
  } catch (e) {
    return { error: e.toString() };
  }
}

// ===== 자동 알림: 아무 카톡이 올 때마다 새 알림 체크 =====
function checkCgvAutoAlert(replier) {
  try {
    var alerts = fetchCgvAlerts("10m");
    if (!alerts || alerts.length === 0) return;

    var newAlerts = [];
    for (var i = 0; i < alerts.length; i++) {
      var a = alerts[i];
      if (!_cgvNotifiedIds[a.id] && a.time > _cgvLastCheckTime && a.title.indexOf("에러") === -1) {
        newAlerts.push(a);
        _cgvNotifiedIds[a.id] = true;
      }
    }

    if (newAlerts.length === 0) return;

    _cgvLastCheckTime = Math.floor(Date.now() / 1000);

    var text = "[ 싱봇 CGV ] 🎬 새 상영 알림!\n━━━━━━━━━━━━━━━━━━";
    for (var i = 0; i < newAlerts.length; i++) {
      var a = newAlerts[i];
      text += "\n\n🔔 " + a.title + "\n" + a.message;
    }
    replier.reply(text);
  } catch (e) {
    // 자동 알림은 실패해도 조용히 넘어감
  }
}

// ===== 수동 조회 =====
function handleCgvStatus(room, msg, sender, replier) {
  var args = msg.replace(/^(CGV|cgv|ㅊㄱㅂ)\s*/, "").trim();
  var since = "12h";
  if (args === "오늘") since = "24h";
  if (args === "1시간") since = "1h";

  var alerts = fetchCgvAlerts(since);
  if (alerts === null) {
    replier.reply("[ 싱봇 CGV ] 알림 서버 연결 실패!");
    return;
  }

  if (alerts.length === 0) {
    replier.reply(
      "[ 싱봇 CGV ] 🎬 최근 알림 없음\n━━━━━━━━━━━━━━━━━━\n" +
        "최근 " + since + " 동안 새 상영 변동 없습니다.\n\n" +
        "5분마다 자동 체크 중! 🔄"
    );
    return;
  }

  var recent = alerts.slice(-5);
  var text = "[ 싱봇 CGV ] 🎬 최근 알림\n━━━━━━━━━━━━━━━━━━\n";
  for (var i = recent.length - 1; i >= 0; i--) {
    var a = recent[i];
    text += "\n🔔 " + a.title + "\n";
    text += a.message + "\n";
    text += "⏰ " + formatTimeAgo(a.time) + "\n";
  }
  text += "\n━━━━━━━━━━━━━━━━━━\n5분마다 자동 체크 중 🔄";
  replier.reply(text);
}

// ===== CGV 등록 =====
function handleCgvRegister(room, msg, sender, replier) {
  var args = msg.replace(/^(CGV등록|cgv등록|ㅊㄱㅂ등록)\s*/, "").trim();
  if (!args) {
    replier.reply("[ 싱봇 CGV ] 사용법: CGV등록 [극장] 영화명 날짜\n예) CGV등록 짱구 20260425\n예) CGV등록 강남 짱구 0425\n극장 생략 시 용산아이파크몰");
    return;
  }

  var parts = args.split(/\s+/);
  var date = "";
  var movieQuery = "";
  var theater = null;
  var lastPart = parts[parts.length - 1];

  if (/^\d{8}$/.test(lastPart)) {
    date = lastPart;
    parts = parts.slice(0, -1);
  } else if (/^\d{4}$/.test(lastPart) && parts.length > 1) {
    date = new Date().getFullYear().toString() + lastPart;
    parts = parts.slice(0, -1);
  } else {
    replier.reply("[ 싱봇 CGV ] 날짜를 입력해주세요!\n예) CGV등록 짱구 20260425\n예) CGV등록 강남 짱구 0425");
    return;
  }

  // 첫 단어가 극장명인지 확인
  if (parts.length > 1) {
    var maybeTheater = findTheater(parts[0]);
    if (maybeTheater) {
      theater = maybeTheater;
      parts = parts.slice(1);
    }
  }
  movieQuery = parts.join(" ");

  if (!theater) {
    theater = { siteNo: "0013", name: "용산아이파크몰" };
  }

  if (!movieQuery) {
    replier.reply("[ 싱봇 CGV ] 영화명을 입력해주세요!\n예) CGV등록 짱구 20260425");
    return;
  }

  var searchResult = cgvApiRequest("GET", "/search?q=" + encodeURIComponent(movieQuery));
  if (searchResult.error) {
    replier.reply("[ 싱봇 CGV ] API 연결 실패!\n" + searchResult.error);
    return;
  }

  if (!searchResult.results || searchResult.results.length === 0) {
    replier.reply("[ 싱봇 CGV ] '" + movieQuery + "' 검색 결과 없음!\n용산아이파크몰 상영 중인 영화만 검색됩니다.");
    return;
  }

  var match = null;
  if (searchResult.results.length === 1) {
    match = searchResult.results[0];
  } else {
    for (var i = 0; i < searchResult.results.length; i++) {
      if (searchResult.results[i].movNm.toLowerCase() === movieQuery.toLowerCase()) {
        match = searchResult.results[i];
        break;
      }
    }
  }

  if (!match) {
    var text = "[ 싱봇 CGV ] 여러 영화가 검색됐어요:\n";
    for (var i = 0; i < Math.min(searchResult.results.length, 5); i++) {
      var m = searchResult.results[i];
      text += "\n" + (i + 1) + ". " + m.movNm;
    }
    text += "\n\n정확한 영화명으로 다시 등록해주세요!";
    replier.reply(text);
    return;
  }

  var result = cgvApiRequest("POST", "/watchlist", {
    movNo: match.movNo,
    movNm: match.movNm,
    dates: [date],
    siteNo: theater.siteNo,
    siteNm: theater.name,
  });

  if (result.error) {
    replier.reply("[ 싱봇 CGV ] 등록 실패!\n" + result.error);
    return;
  }

  replier.reply(
    "[ 싱봇 CGV ] ✅ 등록 완료!\n" +
    "극장: " + theater.name + "\n" +
    "영화: " + match.movNm + "\n" +
    "날짜: " + formatCgvDate(date) + "\n" +
    "새 상영 뜨면 자동 알림!"
  );
}

// ===== CGV 삭제 =====
function handleCgvRemove(room, msg, sender, replier) {
  var args = msg.replace(/^(CGV삭제|cgv삭제|ㅊㄱㅂ삭제)\s*/, "").trim();
  if (!args) {
    replier.reply("[ 싱봇 CGV ] 사용법: CGV삭제 영화명\n예) CGV삭제 짱구");
    return;
  }

  var listResult = cgvApiRequest("GET", "/watchlist");
  if (listResult.error) {
    replier.reply("[ 싱봇 CGV ] API 연결 실패!\n" + listResult.error);
    return;
  }

  var watchList = listResult.watchList || [];
  var found = null;
  for (var i = 0; i < watchList.length; i++) {
    if (watchList[i].movNm.toLowerCase().indexOf(args.toLowerCase()) !== -1 ||
        watchList[i].movNo === args) {
      found = watchList[i];
      break;
    }
  }

  if (!found) {
    replier.reply("[ 싱봇 CGV ] '" + args + "' 감시 목록에 없습니다!");
    return;
  }

  var result = cgvApiRequest("DELETE", "/watchlist?movNo=" + found.movNo);
  if (result.error) {
    replier.reply("[ 싱봇 CGV ] 삭제 실패!\n" + result.error);
    return;
  }

  replier.reply("[ 싱봇 CGV ] ❌ 삭제 완료!\n" + found.movNm + " 감시를 중단합니다.");
}

// ===== CGV 목록 =====
function handleCgvList(room, msg, sender, replier) {
  var result = cgvApiRequest("GET", "/watchlist");
  if (result.error) {
    replier.reply("[ 싱봇 CGV ] API 연결 실패!\n" + result.error);
    return;
  }

  var watchList = result.watchList || [];
  if (watchList.length === 0) {
    replier.reply("[ 싱봇 CGV ] 📋 감시 목록이 비어있습니다!\nCGV등록 영화명 날짜 로 추가하세요.");
    return;
  }

  var text = "[ 싱봇 CGV ] 📋 감시 목록\n━━━━━━━━━━━━━━━━━━";
  for (var i = 0; i < watchList.length; i++) {
    var w = watchList[i];
    var dates = [];
    for (var j = 0; j < w.dates.length; j++) {
      dates.push(formatCgvDate(w.dates[j]));
    }
    var siteNm = w.siteNm || "용산아이파크몰";
    text += "\n\n🎬 " + w.movNm + "\n🏢 " + siteNm + "\n📅 " + dates.join(", ");
  }
  text += "\n\n━━━━━━━━━━━━━━━━━━\n5분마다 자동 체크 중 🔄";
  replier.reply(text);
}

// ===== CGV 영화 검색 =====
function handleCgvSearch(room, msg, sender, replier) {
  var query = msg.replace(/^(CGV영화검색|cgv영화검색|ㅊㄱㅂ영화검색)\s*/, "").trim();
  if (!query) {
    replier.reply("[ 싱봇 CGV ] 사용법: CGV영화검색 영화명\n예) CGV영화검색 짱구");
    return;
  }

  var result = cgvApiRequest("GET", "/search?q=" + encodeURIComponent(query));
  if (result.error) {
    replier.reply("[ 싱봇 CGV ] API 연결 실패!\n" + result.error);
    return;
  }

  if (!result.results || result.results.length === 0) {
    replier.reply("[ 싱봇 CGV ] '" + query + "' 검색 결과 없음!\n용산아이파크몰 상영 중인 영화만 검색됩니다.");
    return;
  }

  var text = "[ 싱봇 CGV ] 🔍 검색 결과\n━━━━━━━━━━━━━━━━━━";
  for (var i = 0; i < Math.min(result.results.length, 10); i++) {
    var m = result.results[i];
    text += "\n" + (i + 1) + ". " + m.movNm;
  }
  text += "\n\n━━━━━━━━━━━━━━━━━━\nCGV등록 영화명 날짜 로 감시 추가!";
  replier.reply(text);
}

// ===== CGV 영화 목록 (전체) =====
function handleCgvMovieList(room, msg, sender, replier) {
  var result = cgvApiRequest("GET", "/movies");
  if (result.error) {
    replier.reply("[ 싱봇 CGV ] API 연결 실패!\n" + result.error);
    return;
  }

  var movies = result.movies || [];
  if (movies.length === 0) {
    replier.reply("[ 싱봇 CGV ] 영화 목록이 아직 없습니다!\n잠시 후 다시 시도해주세요.");
    return;
  }

  var text = "[ 싱봇 CGV ] 🎬 용아맥 상영 중 (" + movies.length + "편)\n━━━━━━━━━━━━━━━━━━";
  for (var i = 0; i < movies.length; i++) {
    text += "\n" + (i + 1) + ". " + movies[i].movNm;
  }
  text += "\n\n━━━━━━━━━━━━━━━━━━\nCGV등록 영화명 날짜 로 감시 추가!";
  replier.reply(text);
}

// ===== CGV 극장 목록 =====
function handleCgvTheaterList(room, msg, sender, replier) {
  var text = "[ 싱봇 CGV ] 🏢 서울 CGV 극장\n━━━━━━━━━━━━━━━━━━";
  for (var i = 0; i < SEOUL_THEATERS.length; i++) {
    text += "\n" + SEOUL_THEATERS[i].name;
  }
  text += "\n\n━━━━━━━━━━━━━━━━━━\nCGV등록 극장명 영화명 날짜\n예) CGV등록 강남 짱구 0425";
  replier.reply(text);
}

// ===== 도움말 =====
function handleCgvHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 CGV ] 🎬 CGV 상영 알림\n━━━━━━━━━━━━━━━━━━\n\n" +
      "📋 CGV — 최근 12시간 알림 확인\n" +
      "📋 CGV 오늘 — 오늘 알림 확인\n" +
      "📋 CGV 1시간 — 최근 1시간 알림\n\n" +
      "🎬 CGV등록 [극장] 영화명 날짜\n" +
      "   예) CGV등록 짱구 20260425\n" +
      "   예) CGV등록 강남 짱구 0425\n" +
      "   극장 생략 시 용산아이파크몰\n" +
      "❌ CGV삭제 영화명\n" +
      "   예) CGV삭제 짱구\n" +
      "📋 CGV목록 — 감시 목록 확인\n" +
      "🏢 CGV극장목록 — 서울 CGV 극장\n" +
      "🔍 CGV영화검색 영화명\n" +
      "   예) CGV영화검색 짱구\n" +
      "📜 CGV영화목록 — 전체 상영 영화\n\n" +
      "🔔 새 상영 뜨면 카톡으로 자동 알림!\n" +
      "⏱️ 체크 주기: 5분"
  );
}

var CGV_COMMANDS = [
  { triggers: ["CGV도움말", "cgv도움말", "ㅊㄱㅂ도움말"], handler: handleCgvHelp },
  { triggers: ["CGV등록", "cgv등록", "ㅊㄱㅂ등록"], handler: handleCgvRegister, hasArgs: true },
  { triggers: ["CGV삭제", "cgv삭제", "ㅊㄱㅂ삭제"], handler: handleCgvRemove, hasArgs: true },
  { triggers: ["CGV목록", "cgv목록", "ㅊㄱㅂ목록"], handler: handleCgvList },
  { triggers: ["CGV영화검색", "cgv영화검색", "ㅊㄱㅂ영화검색"], handler: handleCgvSearch, hasArgs: true },
  { triggers: ["CGV영화목록", "cgv영화목록", "ㅊㄱㅂ영화목록"], handler: handleCgvMovieList },
  { triggers: ["CGV극장목록", "cgv극장목록", "ㅊㄱㅂ극장목록"], handler: handleCgvTheaterList },
  { triggers: ["CGV", "cgv", "ㅊㄱㅂ"], handler: handleCgvStatus, hasArgs: true },
];
