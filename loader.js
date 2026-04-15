/**
 * 싱봇 로더 - 메신저봇R에 이 코드만 넣으면 됩니다.
 * GitHub에서 최신 main.js를 불러와 실행합니다.
 *
 * 사용법:
 * 1. 이 파일 내용을 메신저봇R 스크립트에 붙여넣기
 * 2. GITHUB_RAW_URL을 본인 레포 URL로 변경
 * 3. 컴파일 후 실행
 *
 * PC에서 코드 수정 → git push → "싱봇업데이트" 채팅 입력 → 끝!
 */

// ★ 여기만 본인 GitHub 레포 정보로 변경하세요
var GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/pkeony/singbot/main/main.js';

// 캐시
var _cachedCode = null;
var _lastFetchTime = 0;
var _initialized = false;
var CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

/**
 * HTTP GET으로 텍스트를 가져오는 함수
 * 메신저봇R (Rhino 엔진) 환경에서 Java 클래스를 직접 사용
 */
function fetchText(url) {
  var conn = new java.net.URL(url).openConnection();
  conn.setRequestMethod('GET');
  conn.setConnectTimeout(5000);
  conn.setReadTimeout(5000);

  var reader = new java.io.BufferedReader(
    new java.io.InputStreamReader(conn.getInputStream(), 'UTF-8')
  );
  var line;
  var result = new java.lang.StringBuilder();
  while ((line = reader.readLine()) !== null) {
    result.append(line);
    result.append('\n');
  }
  reader.close();
  conn.disconnect();
  return String(result.toString());
}

function loadLatestCode() {
  var now = Date.now();

  // 캐시가 유효하면 재사용
  if (_cachedCode && now - _lastFetchTime < CACHE_DURATION) {
    return _cachedCode;
  }

  try {
    var code = fetchText(GITHUB_RAW_URL);
    _cachedCode = code;
    _lastFetchTime = now;
    Log.i('싱봇 코드 로드 성공 (' + code.length + '자)');
    return code;
  } catch (e) {
    Log.e('싱봇 코드 로드 실패: ' + e);
    // 이전 캐시가 있으면 폴백
    if (_cachedCode) {
      Log.i('캐시된 코드로 폴백');
      return _cachedCode;
    }
    return null;
  }
}

function initBot() {
  var code = loadLatestCode();
  if (code) {
    // 글로벌 스코프에서 eval 실행 (함수 안에서 하면 로컬에 갇힘)
    (1, eval)(code);
    _initialized = true;
    return true;
  }
  return false;
}

// 메신저봇R 진입점
function response(
  room,
  msg,
  sender,
  isGroupChat,
  replier,
  imageDB,
  packageName
) {
  if (packageName !== 'com.kakao.talk') return;

  // 수동 업데이트 명령
  if (msg.trim() === '싱봇업데이트') {
    _cachedCode = null;
    _initialized = false;
    if (initBot()) {
      replier.reply('[ 싱봇 ] 최신 코드로 업데이트 완료!');
    } else {
      replier.reply('[ 싱봇 ] 업데이트 실패 - 네트워크를 확인하세요');
    }
    return;
  }

  // 최초 로드
  if (!_initialized) {
    if (!initBot()) return;
  }

  // main.js의 _response 함수 호출
  try {
    _response(room, msg, sender, isGroupChat, replier, imageDB, packageName);
  } catch (e) {
    Log.e('싱봇 오류: ' + e);
  }
}
