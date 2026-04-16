// ===== CGV 용아맥 상영 알림 연동 =====

var CGV_NTFY_TOPIC = "kelvin-cgv-imax";
var CGV_NTFY_API = "https://ntfy.sh/" + CGV_NTFY_TOPIC + "/json";
var _cgvLastCheckTime = Math.floor(Date.now() / 1000); // 봇 시작 시점부터
var _cgvNotifiedIds = {}; // 중복 알림 방지

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

// ===== 자동 알림: 아무 카톡이 올 때마다 새 알림 체크 =====
function checkCgvAutoAlert(replier) {
  try {
    var alerts = fetchCgvAlerts("10m"); // 최근 10분만 체크
    if (!alerts || alerts.length === 0) return;

    var newAlerts = [];
    for (var i = 0; i < alerts.length; i++) {
      var a = alerts[i];
      // 이미 알린 것 + 에러 알림 제외
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

function handleCgvHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 CGV ] 🎬 용아맥 상영 알림\n━━━━━━━━━━━━━━━━━━\n\n" +
      "📋 CGV — 최근 12시간 알림 확인\n" +
      "📋 CGV 오늘 — 오늘 알림 확인\n" +
      "📋 CGV 1시간 — 최근 1시간 알림\n\n" +
      "🔔 새 상영 뜨면 카톡으로 자동 알림!\n" +
      "⏱️ 체크 주기: 5분"
  );
}

var CGV_COMMANDS = [
  { triggers: ["CGV도움말", "cgv도움말", "ㅊㄱㅂ도움말"], handler: handleCgvHelp },
  { triggers: ["CGV", "cgv", "ㅊㄱㅂ"], handler: handleCgvStatus, hasArgs: true },
];
