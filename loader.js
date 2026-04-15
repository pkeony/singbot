/**
 * 싱봇 로더 - 메신저봇R에 이 코드만 넣으면 됩니다.
 * GitHub에서 최신 main.js를 불러와 실행합니다.
 *
 * PC에서 코드 수정 → git push → "싱봇업데이트" 채팅 입력 → 끝!
 */

var GITHUB_RAW_URL = "https://raw.githubusercontent.com/pkeony/singbot/main/main.js";
var CACHE_DURATION = 5 * 60 * 1000;
var _cachedCode = null;
var _lastFetchTime = 0;

function fetchText(url) {
  try {
    return String(org.jsoup.Jsoup.connect(url).ignoreContentType(true).timeout(5000).get().text());
  } catch (e1) {}
  try {
    var conn = new java.net.URL(url).openConnection();
    conn.setConnectTimeout(5000);
    conn.setReadTimeout(5000);
    var reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), "UTF-8"));
    var sb = new java.lang.StringBuilder();
    var line;
    while ((line = reader.readLine()) !== null) {
      sb.append(line);
      sb.append("\n");
    }
    reader.close();
    conn.disconnect();
    return String(sb.toString());
  } catch (e2) {
    throw new Error("HTTP 실패: " + e2);
  }
}

function loadAndEval() {
  var now = Date.now();
  if (_cachedCode && (now - _lastFetchTime) < CACHE_DURATION) {
    return;
  }
  var code = fetchText(GITHUB_RAW_URL);
  _cachedCode = code;
  _lastFetchTime = now;
  Log.i("싱봇 코드 로드 성공 (" + code.length + "자)");
}

// ★ 최초 로드 - 최상위 스코프에서 eval (글로벌에 _response 등록)
try {
  var _initCode = fetchText(GITHUB_RAW_URL);
  _cachedCode = _initCode;
  _lastFetchTime = Date.now();
  eval(_initCode);
  Log.i("싱봇 초기 로드 성공");
} catch (e) {
  Log.e("싱봇 초기 로드 실패: " + e);
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if (packageName !== "com.kakao.talk") return;

  // 수동 업데이트
  if (msg.trim() === "싱봇업데이트") {
    try {
      _cachedCode = null;
      var code = fetchText(GITHUB_RAW_URL);
      _cachedCode = code;
      _lastFetchTime = Date.now();
      eval(code);
      replier.reply("[ 싱봇 ] 최신 코드로 업데이트 완료!");
    } catch (e) {
      replier.reply("[ 싱봇 ] 업데이트 실패: " + e);
    }
    return;
  }

  try {
    _response(room, msg, sender, isGroupChat, replier, imageDB, packageName);
  } catch (e) {
    Log.e("싱봇 오류: " + e);
  }
}
