// ===== CGV 용아맥 상영 알림 연동 =====

var CGV_NTFY_TOPIC = "kelvin-cgv-imax";
var CGV_NTFY_API = "https://ntfy.sh/" + CGV_NTFY_TOPIC + "/json";

// ntfy에서 최근 알림 가져오기
function fetchCgvAlerts(since) {
  var url = CGV_NTFY_API + "?poll=1&since=" + (since || "1h");
  try {
    var conn = new java.net.URL(url).openConnection();
    conn.setConnectTimeout(5000);
    conn.setReadTimeout(5000);
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

// CGV 최근 알림 조회
function handleCgvStatus(room, msg, sender, replier) {
  var args = msg.replace(/^(CGV|cgv|ㅊㄱㅂ)\s*/, "").trim();
  var since = "12h"; // 기본 12시간
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

  // 최근 5개만
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

// CGV 도움말
function handleCgvHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 CGV ] 🎬 용아맥 상영 알림\n━━━━━━━━━━━━━━━━━━\n\n" +
      "📋 CGV — 최근 12시간 알림 확인\n" +
      "📋 CGV 오늘 — 오늘 알림 확인\n" +
      "📋 CGV 1시간 — 최근 1시간 알림\n\n" +
      "🔔 새 상영 뜨면 ntfy 앱으로 자동 알림!\n" +
      "⏱️ 체크 주기: 5분"
  );
}

// 명령어 등록
var CGV_COMMANDS = [
  { triggers: ["CGV도움말", "cgv도움말", "ㅊㄱㅂ도움말"], handler: handleCgvHelp },
  { triggers: ["CGV", "cgv", "ㅊㄱㅂ"], handler: handleCgvStatus, hasArgs: true },
];
