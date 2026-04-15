// ===== 싱봇 유틸리티 =====

var CHOSUNG = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ",
  "ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
];

function getChosung(char) {
  var code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char;
  return CHOSUNG[Math.floor(code / 588)];
}

function hashCode(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return hash;
}

function todayString() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function todaySeed() {
  var d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function normalize(s) {
  return s.replace(/\s/g, "").toLowerCase();
}

// "천일(천일염)" → "천일" (괄호 설명 제거)
function stripParens(s) {
  var idx = s.indexOf("(");
  if (idx > 0) return s.substring(0, idx).trim();
  return s;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBar(score) {
  var filled = Math.floor(score / 10);
  var bar = "";
  for (var i = 0; i < 10; i++) {
    bar += (i < filled ? "■" : "□");
  }
  return bar;
}

var GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com/pkeony/singbot/main/";
var _jsonCache = {};

function fetchText(url) {
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
}

function loadJsonData(path) {
  if (_jsonCache.hasOwnProperty(path)) return _jsonCache[path];
  var text = fetchText(GITHUB_RAW_BASE_URL + path);
  var data = JSON.parse(text);
  _jsonCache[path] = data;
  return data;
}
