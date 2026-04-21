// ===== Polyfills (ES5 환경 호환) =====
(function () {
  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function (predicate) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var thisArg = arguments[1];
        var k = 0;
        while (k < len) {
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) return kValue;
          k++;
        }
        return undefined;
      },
    });
  }
  if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
      value: function (predicate) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var thisArg = arguments[1];
        var k = 0;
        while (k < len) {
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) return k;
          k++;
        }
        return -1;
      },
    });
  }
  if (!Array.prototype.every) {
    Object.defineProperty(Array.prototype, 'every', {
      value: function (callbackfn, thisArg) {
        'use strict';
        var T, k;
        if (this == null) throw new TypeError('this is null or not defined');
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callbackfn !== 'function') throw new TypeError();
        if (arguments.length > 1) T = thisArg;
        k = 0;
        while (k < len) {
          var kValue;
          if (k in O) {
            kValue = O[k];
            var testResult = callbackfn.call(T, kValue, k, O);
            if (!testResult) return false;
          }
          k++;
        }
        return true;
      },
    });
  }
  if (!Array.prototype.reduce) {
    Object.defineProperty(Array.prototype, 'reduce', {
      value: function (callback) {
        if (this === null) throw new TypeError('Array.prototype.reduce called on null or undefined');
        if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
        var o = Object(this);
        var len = o.length >>> 0;
        var k = 0;
        var value;
        if (arguments.length >= 2) {
          value = arguments[1];
        } else {
          while (k < len && !(k in o)) k++;
          if (k >= len) throw new TypeError('Reduce of empty array with no initial value');
          value = o[k++];
        }
        while (k < len) {
          if (k in o) value = callback(value, o[k], k, o);
          k++;
        }
        return value;
      },
    });
  }
  if (!Array.prototype.filter) {
    Object.defineProperty(Array.prototype, 'filter', {
      value: function (func, thisArg) {
        'use strict';
        if (!((typeof func === 'Function' || typeof func === 'function') && this)) throw new TypeError();
        var len = this.length >>> 0, res = new Array(len), t = this, c = 0, i = -1;
        var thisContext = thisArg === undefined ? this : thisArg;
        while (++i !== len) {
          if (i in this) {
            if (func.call(thisContext, t[i], i, t)) res[c++] = t[i];
          }
        }
        res.length = c;
        return res;
      },
    });
  }
  if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
      return this.slice(0, str.length) === str;
    };
  }
  if (!Array.prototype.map) {
    Object.defineProperty(Array.prototype, 'map', {
      value: function (callback, thisArg) {
        var T, A, k;
        if (this == null) throw new TypeError('this is null or not defined');
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
        if (arguments.length > 1) T = thisArg;
        A = new Array(len);
        k = 0;
        while (k < len) {
          var kValue, mappedValue;
          if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
          }
          k++;
        }
        return A;
      },
    });
  }
  if (!Object.values) {
    Object.values = function (obj) {
      var values = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) values.push(obj[key]);
      }
      return values;
    };
  }
  if (!Array.prototype.some) {
    Object.defineProperty(Array.prototype, 'some', {
      value: function (fun) {
        'use strict';
        if (this == null) throw new TypeError('Array.prototype.some called on null or undefined');
        if (typeof fun !== 'function') throw new TypeError();
        var t = Object(this);
        var len = t.length >>> 0;
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
          if (i in t && fun.call(thisArg, t[i], i, t)) return true;
        }
        return false;
      },
    });
  }
})();
// ===== 명언 DB =====

function getQuotesDb() {
  return loadJsonData("data/quotes_db.json");
}
// ===== 넌센스 퀴즈 DB =====

function getNonsenseDb() {
  return loadJsonData("data/nonsense_db.json");
}
// ===== 캐치마인드 퀴즈 DB (이미지 기반) =====

var CATCHMIND_BASE_URL = "https://pkeony.github.io/singbot-images";

function getCatchmindDb() {
  return loadJsonData("data/catchmind_db.json");
}
// ===== 운세 텍스트 DB (조합형) =====

function getFortuneDb() {
  return loadJsonData("data/fortune_db.json");
}
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
  var url = GITHUB_RAW_BASE_URL + path;
  var text;
  try {
    text = fetchText(url);
  } catch (e) {
    throw new Error("DB 네트워크 로드 실패 (" + url + "): " + e);
  }
  try {
    var data = JSON.parse(text);
    _jsonCache[path] = data;
    return data;
  } catch (e2) {
    throw new Error("DB JSON 파싱 실패 (" + url + "): " + e2);
  }
}
// ===== 싱봇 상태 관리 =====

var roomState = {};
var scoreData = {};

var DATA_DIR = (function() {
  try {
    return FileStream.getSdcardPath() + "/singbot/";
  } catch (e) {
    try {
      return android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + "/singbot/";
    } catch (e2) {
      return "/sdcard/singbot/";
    }
  }
})();

function initRoom(room) {
  if (!roomState[room]) {
    roomState[room] = {
      activeQuiz: null,
      usedQuestions: { nonsense: [], catchmind: [] }
    };
  }
}

function loadScores() {
  try {
    var raw = FileStream.read(DATA_DIR + "scores.json");
    if (raw) scoreData = JSON.parse(raw);
  } catch (e) {
    scoreData = {};
  }
}

function saveScores() {
  try {
    FileStream.createDir(DATA_DIR);
    FileStream.write(DATA_DIR + "scores.json", JSON.stringify(scoreData));
  } catch (e) {
    // 메모리에 유지, 다음 저장 시 재시도
  }
}

function addScore(room, quizType, sender, isCorrect) {
  if (!scoreData[room]) scoreData[room] = {};
  if (!scoreData[room][quizType]) scoreData[room][quizType] = {};
  if (!scoreData[room][quizType][sender]) {
    scoreData[room][quizType][sender] = { correct: 0, total: 0 };
  }
  if (isCorrect) scoreData[room][quizType][sender].correct++;
  scoreData[room][quizType][sender].total++;
  saveScores();
}

function getLeaderboard(room, quizType) {
  if (!scoreData[room] || !scoreData[room][quizType]) return [];
  var scores = scoreData[room][quizType];
  var entries = [];
  for (var name in scores) {
    if (scores.hasOwnProperty(name)) {
      entries.push({
        name: name,
        correct: scores[name].correct,
        total: scores[name].total
      });
    }
  }
  entries.sort(function(a, b) { return b.correct - a.correct; });
  return entries;
}

// 스크립트 초기화 시 점수 로드
try { loadScores(); } catch (e) {}
// ===== VS 선택 =====

var VS_MESSAGES = [
  "고민 끝! 오늘은 '{choice}'(으)로 갑시다!",
  "제가 골랐습니다! '{choice}'!!!",
  "운명의 선택은... '{choice}'!",
  "'{choice}'(이)가 당신을 부르고 있어요!",
  "두구두구두구... '{choice}'!",
  "이건 무조건 '{choice}'이죠!",
  "'{choice}' 말고 다른 게 있나요?",
  "고민하지 마세요. '{choice}'입니다.",
  "하늘이 정해준 답... '{choice}'!",
  "싱봇의 촉이 말합니다... '{choice}'!"
];

function handleVsPick(room, msg, sender, replier) {
  var input = msg.replace(/^(vs|VS)\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 VS ]\n\n사용법: vs 선택지1 선택지2 선택지3\n예시: vs 김치찜 백반 된장찌개");
    return;
  }

  var options;
  if (input.indexOf(",") !== -1) {
    options = input.split(",");
  } else {
    options = input.split(/\s+/);
  }

  var cleaned = [];
  for (var i = 0; i < options.length; i++) {
    var opt = options[i].trim();
    if (opt.length > 0) cleaned.push(opt);
  }

  if (cleaned.length < 2) {
    replier.reply("2개 이상의 선택지를 입력해주세요!");
    return;
  }

  var chosen = pickRandom(cleaned);
  var template = pickRandom(VS_MESSAGES);

  var reply = "[ 싱봇 VS ]\n\n";
  reply += cleaned.join(" vs ") + "\n\n";
  reply += template.replace(/\{choice\}/g, chosen);

  replier.reply(reply);
}
// ===== 오늘의 한마디 =====

function handleDailyQuote(room, msg, sender, replier) {
  var quotesDb = getQuotesDb();
  var idx = todaySeed() % quotesDb.length;
  var quote = quotesDb[idx];

  replier.reply(
    "[ 싱봇 오늘의 한마디 ]\n\n" +
    "\"" + quote.text + "\"\n\n" +
    "- " + quote.author + " -"
  );
}
// ===== 넌센스 퀴즈 =====

function generateNonsenseHint(answer, level, naverHint) {
  // level 1: 네이버 제공 힌트 (백과XX 같은)
  if (level === 1 && naverHint) {
    return naverHint;
  }

  var chars = stripParens(answer).split("");
  var masked = [];

  if (level <= 1) {
    for (var i = 0; i < chars.length; i++) masked.push("●");
  } else if (level === 2) {
    for (var i = 0; i < chars.length; i++) {
      if (i === 0 || i === chars.length - 1) masked.push(chars[i]);
      else masked.push("●");
    }
  } else {
    var hideIdx = 1 + Math.floor(Math.random() * Math.max(1, chars.length - 2));
    if (chars.length <= 2) hideIdx = chars.length - 1;
    for (var i = 0; i < chars.length; i++) {
      masked.push(i === hideIdx ? "●" : chars[i]);
    }
  }
  return masked.join(" ");
}

function handleNonsenseStart(room, msg, sender, replier) {
  initRoom(room);
  var nonsenseDb = getNonsenseDb();

  if (roomState[room].activeQuiz) {
    replier.reply("이미 퀴즈가 진행 중입니다! '정답 [답]'으로 답해주세요.");
    return;
  }

  var used = roomState[room].usedQuestions.nonsense;
  var available = [];
  for (var i = 0; i < nonsenseDb.length; i++) {
    if (used.indexOf(i) === -1) available.push(i);
  }
  if (available.length === 0) {
    roomState[room].usedQuestions.nonsense = [];
    for (var i = 0; i < nonsenseDb.length; i++) available.push(i);
  }

  var idx = pickRandom(available);
  var quiz = nonsenseDb[idx];
  roomState[room].usedQuestions.nonsense.push(idx);

  var hint = generateNonsenseHint(quiz.a, 0, quiz.h);

  roomState[room].activeQuiz = {
    type: "nonsense",
    question: quiz.q,
    answer: quiz.a,
    naverHint: quiz.h || "",
    reason: quiz.r || "",
    hintLevel: 0,
    startTime: Date.now()
  };

  replier.reply(
    "[ 싱봇 넌센스 퀴즈 ]\n\n" +
    quiz.q + "\n\n" +
    "힌트: " + hint + "\n" +
    "⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n" +
    "정답 [답] | 힌트 | 포기\n" +
    "넌센스점수판\n" +
    "⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼"
  );
}

function handleNonsenseLeaderboard(room, msg, sender, replier) {
  var entries = getLeaderboard(room, "nonsense");
  if (entries.length === 0) {
    replier.reply("아직 기록이 없어요! '넌센스'를 입력해서 퀴즈를 시작해보세요.");
    return;
  }

  var MEDALS = ["🥇", "🥈", "🥉"];
  var text = "[ 싱봇 넌센스 점수판 ]\n\n";
  var limit = Math.min(entries.length, 10);
  for (var i = 0; i < limit; i++) {
    var prefix = i < 3 ? MEDALS[i] : (i + 1) + "위";
    var rate = Math.round(entries[i].correct / entries[i].total * 100);
    text += prefix + " " + entries[i].name + " - " + entries[i].correct + "문제 정답";
    text += " (정답률 " + rate + "%)\n";
  }

  replier.reply(text);
}
// ===== 캐치마인드 퀴즈 (이미지 기반) =====

function generateCatchmindHint(answer, level) {
  var chars = answer.split("");
  var result = [];

  if (level <= 0) {
    for (var i = 0; i < chars.length; i++) result.push("●");
  } else if (level === 1) {
    // 초성 힌트
    for (var i = 0; i < chars.length; i++) {
      if (i % 2 === 0) result.push(getChosung(chars[i]));
      else result.push("●");
    }
  } else if (level === 2) {
    // 일부 글자 공개
    for (var i = 0; i < chars.length; i++) {
      if (i % 2 === 0) result.push(chars[i]);
      else result.push("●");
    }
  } else {
    // 하나만 숨기기
    var hideIdx = Math.floor(Math.random() * chars.length);
    for (var i = 0; i < chars.length; i++) {
      result.push(i === hideIdx ? "●" : chars[i]);
    }
  }
  return result.join(" ");
}

function handleCatchmindStart(room, msg, sender, replier) {
  initRoom(room);
  var catchmindDb = getCatchmindDb();

  if (roomState[room].activeQuiz) {
    replier.reply("이미 퀴즈가 진행 중입니다! '정답 [답]'으로 답해주세요.");
    return;
  }

  // 안 쓴 문제 찾기
  var used = roomState[room].usedQuestions.catchmind;
  var available = [];
  for (var i = 0; i < catchmindDb.length; i++) {
    if (used.indexOf(i) === -1) available.push(i);
  }
  if (available.length === 0) {
    roomState[room].usedQuestions.catchmind = [];
    for (var i = 0; i < catchmindDb.length; i++) available.push(i);
  }

  var idx = pickRandom(available);
  var quiz = catchmindDb[idx];
  roomState[room].usedQuestions.catchmind.push(idx);

  var hint = generateCatchmindHint(quiz.answer, 0);

  roomState[room].activeQuiz = {
    type: "catchmind",
    question: "캐치마인드",
    answer: quiz.answer,
    hintLevel: 0,
    startTime: Date.now(),
    quizId: quiz.id
  };

  // OG 미리보기용 URL 전송
  var quizUrl = CATCHMIND_BASE_URL + "/q/" + quiz.id + ".html";
  replier.reply(quizUrl);
  replier.reply(
    "[ 싱봇 캐치마인드 ]\n\n" +
    hint + "\n" +
    "⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼\n" +
    "정답 [답] | 힌트 | 포기\n" +
    "캐치점수판\n" +
    "⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼⎼"
  );
}

function handleCatchmindLeaderboard(room, msg, sender, replier) {
  var entries = getLeaderboard(room, "catchmind");
  if (entries.length === 0) {
    replier.reply("아직 기록이 없어요! '캐치마인드'를 입력해서 퀴즈를 시작해보세요.");
    return;
  }

  var MEDALS = ["🥇", "🥈", "🥉"];
  var text = "[ 싱봇 캐치마인드 점수판 ]\n\n";
  var limit = Math.min(entries.length, 10);
  for (var i = 0; i < limit; i++) {
    var prefix = i < 3 ? MEDALS[i] : (i + 1) + "위";
    var rate = Math.round(entries[i].correct / entries[i].total * 100);
    text += prefix + " " + entries[i].name + " - " + entries[i].correct + "문제 정답";
    text += " (정답률 " + rate + "%)\n";
  }

  replier.reply(text);
}
// ===== 운세 =====

var DDI_ANIMALS = ["원숭이","닭","개","돼지","쥐","소","호랑이","토끼","용","뱀","말","양"];

function getConstellation(month, day) {
  var md = month * 100 + day;
  if (md >= 1222 || md <= 119) return "염소";
  if (md <= 218) return "물병";
  if (md <= 320) return "물고기";
  if (md <= 419) return "양";
  if (md <= 520) return "황소";
  if (md <= 621) return "쌍둥이";
  if (md <= 722) return "게";
  if (md <= 822) return "사자";
  if (md <= 922) return "처녀";
  if (md <= 1022) return "천칭";
  if (md <= 1121) return "전갈";
  return "사수";
}

// 네이버 별자리 운세 API (pkid=105) - 검증됨
function fetchNaverStarFortune(constellation) {
  try {
    var query = java.net.URLEncoder.encode(constellation + "자리 운세", "UTF-8");
    var url = "https://ts-proxy.naver.com/content/apirender.nhn?where=m&pkid=105&key=FortuneAPI&q=" + query;
    var response = org.jsoup.Jsoup.connect(url)
      .ignoreContentType(true)
      .userAgent("Mozilla/5.0")
      .get().text();
    var data = JSON.parse(response);
    if (!data.result || data.result.length === 0) return null;

    var doc = org.jsoup.Jsoup.parse(data.result[0]);
    var content = doc.select("p.text_box").text();
    if (content && content.length > 10) return content;
    return null;
  } catch (e) {
    return null;
  }
}

function handleFortune(room, msg, sender, replier) {
  var fortuneDb = getFortuneDb();
  var input = msg.replace(/^(운세|오늘의운세)[,\s]*/, "").trim();
  var name, year, month, day, gender;

  // 쉼표 형식: 여자,19901122
  var commaMatch = input.match(/^(남|여|남자|여자)[,\s]+(\d{8})$/) ||
                   input.match(/^(\d{8})[,\s]+(남|여|남자|여자)$/);
  // 공백 형식: 여자 19901122
  var spaceMatch = !commaMatch && (
    input.match(/^(남|여|남자|여자)\s+(\d{8})$/) ||
    input.match(/^(\d{8})\s+(남|여|남자|여자)$/)
  );

  var match = commaMatch || spaceMatch;
  if (match) {
    if (/^\d/.test(match[1])) { var t = match[1]; match[1] = match[2]; match[2] = t; }
    name = sender;
    gender = match[1].charAt(0);
    var ds = match[2];
    year = parseInt(ds.substring(0, 4));
    month = parseInt(ds.substring(4, 6));
    day = parseInt(ds.substring(6, 8));
  } else {
    replier.reply(
      "[ 싱봇 운세 ]\n\n" +
      "사용법:\n" +
      "  운세 여자,19901122\n" +
      "  운세 남 19950315\n" +
      "  오늘의운세,여,19901122"
    );
    return;
  }

  var star = getConstellation(month, day);
  var ddi = DDI_ANIMALS[year % 12];
  var genderText = gender === "여" ? "여자" : "남자";

  var today = new Date();
  var todayStr = today.getFullYear() + "." +
    (today.getMonth() + 1 < 10 ? "0" : "") + (today.getMonth() + 1) + "." +
    (today.getDate() < 10 ? "0" : "") + today.getDate();

  // 네이버 별자리 운세 API (메신저봇R에서만)
  var fortuneText = null;
  if (typeof org !== "undefined" && typeof org.jsoup !== "undefined") {
    fortuneText = fetchNaverStarFortune(star);
  }

  var result = "[ " + name + " ]님의 오늘의운세 ~ ♬\n\n";
  result += todayStr + " | " + star + "자리 | " + ddi + "띠 | " + genderText + "\n";
  result += "━━━━━━━━━━━━━━━━━━\n\n";

  if (fortuneText) {
    result += fortuneText;
  } else {
    // 폴백: 알고리즘 조합
    var baseKey = name + year + month + day + gender + todayString();
    var s1 = Math.abs(hashCode(baseKey + "word"));
    var s2 = Math.abs(hashCode(baseKey + "intro"));
    var s3 = Math.abs(hashCode(baseKey + "body"));
    var s4 = Math.abs(hashCode(baseKey + "close"));

    result += "총운: \"" + fortuneDb.word[s1 % fortuneDb.word.length] + "\"\n\n";
    result += fortuneDb.intro[s2 % fortuneDb.intro.length] + " ";
    result += fortuneDb.body[s3 % fortuneDb.body.length] + " ";
    result += fortuneDb.closing[s4 % fortuneDb.closing.length];
  }

  result += "\n\n━━━━━━━━━━━━━━━━━━\n";

  var s5 = Math.abs(hashCode(name + year + month + day + gender + todayString() + "luck"));
  result += "🔮 행운지수: " + generateBar((s5 % 100) + 1) + " " + ((s5 % 100) + 1) + "점\n";
  result += "🎨 행운의 색: " + fortuneDb.luckyColors[Math.abs(hashCode(name + year + todayString() + "color")) % fortuneDb.luckyColors.length] + "\n";
  result += "🔢 행운의 숫자: " + ((Math.abs(hashCode(name + day + todayString() + "num")) % 45) + 1);

  replier.reply(result);
}
// ===== Gemma AI 대화 =====

var GEMMA_MODEL = "gemma-4-31b-it";

function _getApiKey() {
  try {
    var raw = FileStream.read(DATA_DIR + "api_key.txt");
    return raw ? raw.trim() : "";
  } catch (e) {
    return "";
  }
}

var chatHistory = {};

function handleChat(room, msg, sender, replier) {
  var prompt = msg.replace(/^~\s*/, "").trim();
  if (!prompt) {
    replier.reply("사용법: ~ <질문>\n예) ~ 오늘 뭐 먹지?");
    return;
  }

  var apiKey = _getApiKey();
  if (!apiKey) {
    replier.reply("API 키가 설정되지 않았어요.\n" + DATA_DIR + "api_key.txt 파일에 키를 넣어주세요.");
    return;
  }
  var GEMMA_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMMA_MODEL + ":generateContent?key=" + apiKey;

  // 대화 기록 관리 (방별, 유저별, 최근 10턴)
  var historyKey = room + ":" + sender;
  if (!chatHistory[historyKey]) chatHistory[historyKey] = [];

  chatHistory[historyKey].push({ role: "user", parts: [{ text: prompt }] });

  if (chatHistory[historyKey].length > 20) {
    chatHistory[historyKey] = chatHistory[historyKey].slice(-20);
  }

  try {
    var Jsoup = org.jsoup.Jsoup;
    var Method = org.jsoup.Connection.Method;

    var contents = [
      { role: "user", parts: [{ text: "너는 카카오톡 채팅봇이야. 친구처럼 반말로 짧게 대답해. 3줄 이내로. 이모지 가끔 써." }] },
      { role: "model", parts: [{ text: "ㅇㅋ 알겠어!" }] }
    ].concat(chatHistory[historyKey]);

    var body = JSON.stringify({
      contents: contents,
      generationConfig: {
        maxOutputTokens: 200,
        thinkingConfig: { thinkingLevel: "MINIMAL" }
      }
    });

    var response = Jsoup.connect(GEMMA_ENDPOINT)
      .header("Content-Type", "application/json")
      .requestBody(body)
      .method(Method.POST)
      .ignoreContentType(true)
      .ignoreHttpErrors(true)
      .timeout(120000)
      .execute();

    var statusCode = response.statusCode();
    var json = JSON.parse(response.body());

    if (statusCode < 200 || statusCode >= 300) {
      replier.reply("API 오류: HTTP " + statusCode);
      chatHistory[historyKey].pop();
      return;
    }

    var answer = "";
    var candidates = json.candidates || [];
    for (var i = 0; i < candidates.length; i++) {
      var parts = (candidates[i].content && candidates[i].content.parts) || [];
      for (var j = 0; j < parts.length; j++) {
        if (parts[j].thought === true) continue;
        if (typeof parts[j].text === "string" && parts[j].text.length > 0) {
          answer += parts[j].text;
        }
      }
    }

    if (!answer) {
      replier.reply("응답을 받지 못했어요.");
      chatHistory[historyKey].pop();
      return;
    }

    chatHistory[historyKey].push({ role: "model", parts: [{ text: answer }] });
    replier.reply(answer);
  } catch (e) {
    replier.reply("오류 발생: " + e.toString());
    chatHistory[historyKey].pop();
  }
}

function handleChatReset(room, msg, sender, replier) {
  var historyKey = room + ":" + sender;
  chatHistory[historyKey] = [];
  replier.reply(sender + "님의 대화 기록을 초기화했어요.");
}
// ===== 광산 게임 데이터 =====

var MineData = null;

function getMineData() {
  if (MineData) return MineData;

  MineData = loadJsonData("data/mine_db.json");

  if (!MineData.resourceIdMap) MineData.resourceIdMap = {};
  for (var id in MineData.resources) {
    if (MineData.resources.hasOwnProperty(id)) {
      MineData.resourceIdMap[MineData.resources[id].name] = id;
    }
  }

  return MineData;
}

function ensureMineDataLoaded() {
  return getMineData();
}
// ===== 싱봇 광산 게임 =====

var MINE_DATA_DIR = DATA_DIR + "mine_data/";
var mineAccounts = {};

// --- 유틸리티 ---

function sanitizeSender(sender) {
  return sender.replace(/[^a-zA-Z0-9가-힣]/g, "");
}

function saveMineAccount(sender, account) {
  mineAccounts[sender] = account;
  var fileName = sanitizeSender(sender) + ".json";
  try {
    FileStream.createDir(MINE_DATA_DIR);
    FileStream.write(MINE_DATA_DIR + fileName, JSON.stringify(account));
  } catch (e) {
    try {
      var folder = new java.io.File(MINE_DATA_DIR);
      if (!folder.exists()) folder.mkdirs();
      var file = new java.io.File(folder, fileName);
      var fos = new java.io.FileOutputStream(file);
      var writer = new java.io.OutputStreamWriter(fos, "UTF-8");
      writer.write(JSON.stringify(account));
      writer.close();
      fos.close();
    } catch (e2) {
      Log.e("광산 저장 오류: " + e2);
    }
  }
}

function loadMineAccount(sender) {
  if (mineAccounts[sender]) return mineAccounts[sender];
  var fileName = sanitizeSender(sender) + ".json";
  try {
    var raw = FileStream.read(MINE_DATA_DIR + fileName);
    if (raw) {
      mineAccounts[sender] = JSON.parse(raw);
      return mineAccounts[sender];
    }
  } catch (e) {}
  try {
    var file = new java.io.File(MINE_DATA_DIR, fileName);
    if (file.exists()) {
      var fis = new java.io.FileInputStream(file);
      var reader = new java.io.InputStreamReader(fis, "UTF-8");
      var br = new java.io.BufferedReader(reader);
      var data = "";
      var line;
      while ((line = br.readLine()) != null) data += line;
      br.close();
      reader.close();
      fis.close();
      mineAccounts[sender] = JSON.parse(data);
      return mineAccounts[sender];
    }
  } catch (e2) {}
  return null;
}

// 디스크에서 전체 계정 로드 (광부이름 역조회용)
function loadAllMineAccounts() {
  try {
    var dir = new java.io.File(MINE_DATA_DIR);
    if (!dir.exists()) return;
    var files = dir.listFiles();
    if (!files) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f.getName().endsWith(".json")) continue;
      var senderName = f.getName().replace(".json", "");
      if (mineAccounts[senderName]) continue;
      try {
        var fis = new java.io.FileInputStream(f);
        var reader = new java.io.InputStreamReader(fis, "UTF-8");
        var br = new java.io.BufferedReader(reader);
        var data = "";
        var line;
        while ((line = br.readLine()) != null) data += line;
        br.close();
        mineAccounts[senderName] = JSON.parse(data);
      } catch (e2) {}
    }
  } catch (e) {}
}

// 광부이름으로 sender(카톡이름) 역조회
function findSenderByMineName(name) {
  for (var s in mineAccounts) {
    if (mineAccounts.hasOwnProperty(s) && mineAccounts[s].name === name) return s;
  }
  // 메모리에 없으면 디스크에서 전체 로드 후 재시도
  loadAllMineAccounts();
  for (var s in mineAccounts) {
    if (mineAccounts.hasOwnProperty(s) && mineAccounts[s].name === name) return s;
  }
  return null;
}

function createMineAccount(sender, name) {
  var now = Date.now();
  return {
    name: name,
    sender: sender,
    createdAt: now,
    lastActiveTime: now,
    lastStaminaRegen: now,
    gold: MineData.config.STARTING_GOLD,
    stamina: MineData.config.MAX_STAMINA_BASE,
    maxStamina: MineData.config.MAX_STAMINA_BASE,
    currentArea: 0,
    depth: 1,
    maxDepthReached: 1,
    pickaxeLevel: 1,
    equipment: { helmet: null, lamp: null, boots: null },
    resources: [],
    items: [],
    codex: {},
    idleRate: MineData.config.IDLE_RATE_BASE,
    prestigeCount: 0,
    starFragments: 0,
    prestigeBonuses: {
      miningPower: 0,
      idleRate: 0,
      luck: 0,
      stamina: 0,
      startDepth: 0
    },
    pvpWins: 0,
    pvpLosses: 0,
    guild: null,
    totalMined: 0,
    totalGoldEarned: 0,
    buffs: {},
    gamblingStats: { totalBet: 0, totalWon: 0, totalLost: 0, lastGambleTime: 0 },
    dailyQuests: { date: 0, quests: [], allClaimed: false },
    eventStats: { total: 0, byType: {} },
    pendingMerchant: null,
    titles: { unlocked: [], equipped: null },
    questsCompleted: 0
  };
}

// --- 자원/아이템 헬퍼 ---

function addResource(account, resourceName, count) {
  for (var i = 0; i < account.resources.length; i++) {
    if (account.resources[i].name === resourceName) {
      account.resources[i].count += count;
      return;
    }
  }
  account.resources.push({ name: resourceName, count: count });
}

function getResourceCount(account, resourceName) {
  for (var i = 0; i < account.resources.length; i++) {
    if (account.resources[i].name === resourceName) return account.resources[i].count;
  }
  return 0;
}

function removeResource(account, resourceName, count) {
  for (var i = 0; i < account.resources.length; i++) {
    if (account.resources[i].name === resourceName) {
      account.resources[i].count -= count;
      if (account.resources[i].count <= 0) {
        account.resources.splice(i, 1);
      }
      return true;
    }
  }
  return false;
}

function addItem(account, itemName, count) {
  for (var i = 0; i < account.items.length; i++) {
    if (account.items[i].name === itemName) {
      account.items[i].count += count;
      return;
    }
  }
  account.items.push({ name: itemName, count: count });
}

function getItemCount(account, itemName) {
  for (var i = 0; i < account.items.length; i++) {
    if (account.items[i].name === itemName) return account.items[i].count;
  }
  return 0;
}

function removeItem(account, itemName, count) {
  for (var i = 0; i < account.items.length; i++) {
    if (account.items[i].name === itemName) {
      account.items[i].count -= count;
      if (account.items[i].count <= 0) {
        account.items.splice(i, 1);
      }
      return true;
    }
  }
  return false;
}

// --- 장비 보너스 ---

function ensureEquipment(account) {
  if (!account.equipment) account.equipment = { helmet: null, lamp: null, boots: null };
}

function getEquipData(slot, tierIndex) {
  var items = MineData.equipment[slot];
  if (!items || tierIndex < 0 || tierIndex >= items.length) return null;
  return items[tierIndex];
}

function getEquippedData(account, slot) {
  ensureEquipment(account);
  var equipped = account.equipment[slot];
  if (!equipped) return null;
  var items = MineData.equipment[slot];
  for (var i = 0; i < items.length; i++) {
    if (items[i].name === equipped.name) return items[i];
  }
  return null;
}

function getEquipStaminaBonus(account) {
  var data = getEquippedData(account, "helmet");
  return data ? data.staminaBonus : 0;
}

function getEquipLuckBonus(account) {
  var data = getEquippedData(account, "lamp");
  return data ? data.luckBonus : 0;
}

function getEquipIdleBonus(account) {
  var data = getEquippedData(account, "boots");
  return data ? data.idleBonus : 0;
}

function getEquipDepthBonus(account) {
  var data = getEquippedData(account, "boots");
  return data ? data.depthBonus : 0;
}

// --- 곡괭이 계산 ---

function getPickaxeTier(level) {
  for (var i = MineData.pickaxeTiers.length - 1; i >= 0; i--) {
    if (level >= MineData.pickaxeTiers[i].levels[0]) return i;
  }
  return 0;
}

function getPickaxePower(account) {
  var tier = MineData.pickaxeTiers[getPickaxeTier(account.pickaxeLevel)];
  var levelInTier = account.pickaxeLevel - tier.levels[0];
  var base = tier.basePower + levelInTier * tier.growth;
  var prestigeBonus = 1 + account.prestigeBonuses.miningPower * 0.10;
  var codexBonus = getCodexBonus(account, "power");
  var guildBonus = getGuildBonus(account).miningPower;
  return Math.floor(base * prestigeBonus * (1 + codexBonus) * (1 + guildBonus));
}

function getPickaxeInfo(level) {
  var tierIdx = getPickaxeTier(level);
  var tier = MineData.pickaxeTiers[tierIdx];
  return { tier: tier, tierIndex: tierIdx };
}

function getUpgradeCost(level) {
  var goldCost = Math.floor(MineData.config.UPGRADE_BASE_COST * Math.pow(MineData.config.UPGRADE_COST_MULTIPLIER, level));
  var tierIdx = Math.floor(level / 5);
  var resourceCosts = [];
  if (tierIdx >= 1) resourceCosts.push({ name: "구리광석", count: tierIdx * 5 });
  if (tierIdx >= 2) resourceCosts.push({ name: "철광석", count: (tierIdx - 1) * 5 });
  if (tierIdx >= 3) resourceCosts.push({ name: "은광석", count: (tierIdx - 2) * 3 });
  return { gold: goldCost, resources: resourceCosts };
}

// --- 스태미나 ---

function getEffectiveMaxStamina(account) {
  var base = MineData.config.MAX_STAMINA_BASE;
  base += account.prestigeBonuses.stamina * 5;
  base += getEquipStaminaBonus(account);
  base += getCodexBonus(account, "stamina");
  return base;
}

function regenStamina(account) {
  account.maxStamina = getEffectiveMaxStamina(account);
  var now = Date.now();
  var elapsed = now - account.lastStaminaRegen;
  var regenTicks = Math.floor(elapsed / MineData.config.STAMINA_REGEN_MS);
  if (regenTicks > 0) {
    account.stamina = Math.min(account.maxStamina, account.stamina + regenTicks);
    account.lastStaminaRegen = now;
  }
}

// --- 방치 수입 ---

function calculateIdleIncome(account) {
  var now = Date.now();
  var elapsed = now - account.lastActiveTime;
  elapsed = Math.min(elapsed, MineData.config.IDLE_CAP_MS);
  var minutesAway = Math.floor(elapsed / 60000);
  if (minutesAway < 1) return null;

  var rate = account.idleRate * (1 + account.prestigeBonuses.idleRate * 0.20);
  var codexBonus = getCodexBonus(account, "idle");
  rate = rate * (1 + codexBonus);
  rate = rate * (1 + getEquipIdleBonus(account));
  rate = rate * (1 + getGuildBonus(account).idleRate);

  // 방치 버프 확인
  if (account.buffs.idle && account.buffs.idle.expires > now) {
    rate = rate * 1.5;
  }

  var amount = Math.floor(minutesAway * rate);
  if (amount <= 0) return null;

  var area = MineData.areas[account.currentArea];
  var basicDrop = area.drops[0];
  var resourceName = MineData.resources[basicDrop.id].name;

  return { resource: resourceName, amount: amount, minutes: minutesAway };
}

// --- 도감 보너스 ---

function getCodexCount(account) {
  var count = 0;
  for (var k in account.codex) {
    if (account.codex.hasOwnProperty(k) && account.codex[k]) count++;
  }
  return count;
}

function getCodexBonus(account, bonusType) {
  var count = getCodexCount(account);
  var total = 0;
  for (var i = 0; i < MineData.codexRewards.length; i++) {
    var reward = MineData.codexRewards[i];
    if (count >= reward.threshold && reward.bonus === bonusType) {
      total += reward.value;
    }
  }
  return total;
}

// --- 지역 전환 ---

function checkAreaUnlock(account) {
  for (var i = account.currentArea + 1; i < MineData.areas.length; i++) {
    var area = MineData.areas[i];
    if (account.depth >= area.unlockDepth &&
        account.pickaxeLevel >= area.unlockPickaxe &&
        account.prestigeCount >= area.unlockPrestige) {
      account.currentArea = i;
    } else {
      break;
    }
  }
}

// --- 깊이 보스 ---

function checkDepthBoss(account, oldDepth, newDepth) {
  for (var d in MineData.depthBosses) {
    if (MineData.depthBosses.hasOwnProperty(d)) {
      var bossDepth = parseInt(d);
      if (oldDepth < bossDepth && newDepth >= bossDepth) {
        var boss = MineData.depthBosses[d];
        var power = getPickaxePower(account);
        if (power >= boss.requiredPower) {
          account.gold += boss.reward.gold;
          account.totalGoldEarned += boss.reward.gold;
          return { defeated: true, boss: boss, depth: bossDepth, gold: boss.reward.gold };
        } else {
          account.depth = bossDepth - 1;
          return { defeated: false, boss: boss, depth: bossDepth, requiredPower: boss.requiredPower, currentPower: power };
        }
      }
    }
  }
  return null;
}

// ===== 하위 호환 초기화 =====

function ensureNewFields(account) {
  if (!account.gamblingStats) account.gamblingStats = { totalBet: 0, totalWon: 0, totalLost: 0, lastGambleTime: 0 };
  if (!account.dailyQuests) account.dailyQuests = { date: 0, quests: [], allClaimed: false };
  if (!account.eventStats) account.eventStats = { total: 0, byType: {} };
  if (!account.titles) account.titles = { unlocked: [], equipped: null };
  if (!account.questsCompleted) account.questsCompleted = 0;
}

// ===== Feature 3: 채굴 이벤트 =====

function rollMiningEvent(account, area) {
  if (Math.random() >= MineData.miningEvents.chance) return null;

  var types = MineData.miningEvents.types;
  var totalWeight = 0;
  for (var i = 0; i < types.length; i++) totalWeight += types[i].weight;
  var roll = Math.random() * totalWeight;
  var picked = types[0];
  for (var i = 0; i < types.length; i++) {
    roll -= types[i].weight;
    if (roll <= 0) { picked = types[i]; break; }
  }

  var result = { type: picked.id, name: picked.name, emoji: picked.emoji, details: {} };

  if (picked.id === "treasure_chest") {
    var bonusGold = picked.goldRange[0] + Math.floor(Math.random() * (picked.goldRange[1] - picked.goldRange[0] + 1));
    result.details.bonusGold = bonusGold;
  } else if (picked.id === "trap") {
    var pct = picked.goldLossPercent[0] + Math.random() * (picked.goldLossPercent[1] - picked.goldLossPercent[0]);
    var loss = Math.min(Math.floor(account.gold * pct), picked.maxLoss);
    if (loss < 1) loss = 0;
    result.details.goldLoss = loss;
  } else if (picked.id === "merchant") {
    var shopItems = MineData.shopItems;
    var offer = shopItems[Math.floor(Math.random() * 2)];
    var discountPrice = Math.floor(offer.price * 0.5);
    result.details.offer = { name: offer.name, originalPrice: offer.price, price: discountPrice, effect: offer.effect, value: offer.value };
    account.pendingMerchant = { offer: result.details.offer, expireTime: Date.now() + 300000 };
  } else if (picked.id === "rich_vein") {
    result.details.multiplier = 2;
  } else if (picked.id === "mysterious_ore") {
    var areaIndex = account.currentArea;
    var higherArea = MineData.areas[Math.min(areaIndex + 1, MineData.areas.length - 1)];
    var dropPool = higherArea.drops;
    var pick = dropPool[Math.floor(Math.random() * dropPool.length)];
    var res = MineData.resources[pick.id];
    result.details.resourceId = pick.id;
    result.details.resourceName = res.name;
    result.details.resourceEmoji = res.emoji;
    result.details.count = 1 + Math.floor(Math.random() * 2);
  }

  ensureNewFields(account);
  account.eventStats.total++;
  if (!account.eventStats.byType[picked.id]) account.eventStats.byType[picked.id] = 0;
  account.eventStats.byType[picked.id]++;

  return result;
}

function handleMerchantBuy(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);

  if (!account.pendingMerchant || Date.now() > account.pendingMerchant.expireTime) {
    account.pendingMerchant = null;
    saveMineAccount(sender, account);
    replier.reply("[ 싱봇 광산 ] 떠돌이 상인이 없거나 시간이 만료되었습니다.");
    return;
  }

  var offer = account.pendingMerchant.offer;
  if (account.gold < offer.price) {
    replier.reply("[ 싱봇 광산 ] 골드 부족! (필요: " + offer.price + "G, 보유: " + account.gold + "G)");
    return;
  }

  account.gold -= offer.price;
  var effectMsg = "";
  if (offer.effect === "stamina") {
    account.stamina = Math.min(account.maxStamina, account.stamina + offer.value);
    effectMsg = "체력 +" + offer.value;
  } else if (offer.effect === "luck") {
    if (!account.buffs.luck) account.buffs.luck = { uses: 0 };
    account.buffs.luck.uses += offer.value;
    effectMsg = "행운 부적 " + offer.value + "회분";
  }

  account.pendingMerchant = null;
  saveMineAccount(sender, account);
  replier.reply("[ 싱봇 광산 ] 🧙 상인에게 구매 완료!\n\n" + offer.name + " (" + offer.price + "G)\n" + effectMsg + "\n💰 잔여: " + account.gold + "G");
}

// ===== Feature 4: 칭호 시스템 =====

function getCodexCount(account) {
  var count = 0;
  for (var k in account.codex) {
    if (account.codex.hasOwnProperty(k) && account.codex[k]) count++;
  }
  return count;
}

function checkTitleUnlocks(account) {
  ensureNewFields(account);
  var newTitles = [];
  for (var i = 0; i < MineData.titles.length; i++) {
    var title = MineData.titles[i];
    if (account.titles.unlocked.indexOf(title.id) >= 0) continue;

    var cond = title.condition;
    var val = 0;
    if (cond.type === "codexCount") val = getCodexCount(account);
    else if (cond.type === "gamblingTotal") val = account.gamblingStats ? account.gamblingStats.totalBet : 0;
    else if (cond.type === "questsCompleted") val = account.questsCompleted || 0;
    else val = account[cond.type] || 0;

    if (val >= cond.value) {
      account.titles.unlocked.push(title.id);
      newTitles.push(title);
    }
  }
  return newTitles;
}

function getTitleById(id) {
  for (var i = 0; i < MineData.titles.length; i++) {
    if (MineData.titles[i].id === id) return MineData.titles[i];
  }
  return null;
}

function getEquippedTitleDisplay(account) {
  ensureNewFields(account);
  if (!account.titles.equipped) return "";
  var t = getTitleById(account.titles.equipped);
  if (!t) return "";
  return t.emoji + " " + t.name;
}

function titleUnlockText(newTitles) {
  if (newTitles.length === 0) return "";
  var text = "\n🏅 새 칭호 획득!\n";
  for (var i = 0; i < newTitles.length; i++) {
    text += "  " + newTitles[i].emoji + " " + newTitles[i].name + "\n";
  }
  return text;
}

function handleTitleList(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);
  checkTitleUnlocks(account);
  saveMineAccount(sender, account);

  var text = "[ 싱봇 광산 ] 🏅 칭호 목록\n━━━━━━━━━━━━━━━━━━\n";
  var equipped = getEquippedTitleDisplay(account);
  text += "🏷️ 장착중: " + (equipped || "없음") + "\n\n";

  for (var i = 0; i < MineData.titles.length; i++) {
    var t = MineData.titles[i];
    var unlocked = account.titles.unlocked.indexOf(t.id) >= 0;
    text += (unlocked ? "✅ " : "🔒 ") + t.emoji + " " + t.name + " — " + t.desc + "\n";
  }
  text += "\n'ㄱㅅ칭호장착 [칭호명]'으로 장착";
  replier.reply(text);
}

function handleTitleEquip(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);

  var input = msg.replace(/^(광산|ㄱㅅ|ㄳ)칭호장착\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ칭호장착 [칭호명]\n해제: ㄱㅅ칭호장착 해제");
    return;
  }
  if (input === "해제") {
    account.titles.equipped = null;
    saveMineAccount(sender, account);
    replier.reply("[ 싱봇 광산 ] 칭호를 해제했습니다.");
    return;
  }
  var found = null;
  for (var i = 0; i < MineData.titles.length; i++) {
    if (MineData.titles[i].name === input) { found = MineData.titles[i]; break; }
  }
  if (!found) { replier.reply("[ 싱봇 광산 ] 존재하지 않는 칭호입니다. 'ㄱㅅ칭호'로 확인하세요."); return; }
  if (account.titles.unlocked.indexOf(found.id) < 0) { replier.reply("[ 싱봇 광산 ] 미해금 칭호입니다.\n조건: " + found.desc); return; }

  account.titles.equipped = found.id;
  saveMineAccount(sender, account);
  replier.reply("[ 싱봇 광산 ] 🏷️ 칭호 장착!\n" + found.emoji + " " + found.name);
}

// ===== Feature 1: 도박장 =====

function handleGamble(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);

  var args = msg.replace(/^((광산|ㄱㅅ|ㄳ)도박|ㄷㅂ)\s*/, "").trim().split(/\s+/);
  var amount = parseInt(args[0]);
  var choice = args[1] || null;

  if (!amount || isNaN(amount) || amount < MineData.gambling.minBet) {
    replier.reply(
      "[ 싱봇 광산 ] 🎰 도박장\n━━━━━━━━━━━━━━━━━━\n" +
      "🎲 홀짝: ㄱㅅ도박 [금액] [홀/짝]\n" +
      "  → 승리 시 1.95배\n\n" +
      "🎰 룰렛: ㄱㅅ도박 [금액]\n" +
      "  → x0 ~ x5 배율\n\n" +
      "최소 " + MineData.gambling.minBet + "G / 최대 " + MineData.gambling.maxBet + "G"
    );
    return;
  }

  if (amount > MineData.gambling.maxBet) amount = MineData.gambling.maxBet;
  if (account.gold < amount) {
    replier.reply("[ 싱봇 광산 ] 골드 부족! (필요: " + amount + "G, 보유: " + account.gold + "G)");
    return;
  }

  account.gold -= amount;
  account.gamblingStats.totalBet += amount;
  account.gamblingStats.lastGambleTime = Date.now();
  var text = "";

  if (choice === "홀" || choice === "짝") {
    var dice = 1 + Math.floor(Math.random() * 6);
    var isOdd = dice % 2 === 1;
    var diceResult = isOdd ? "홀" : "짝";
    var won = (choice === "홀" && isOdd) || (choice === "짝" && !isOdd);
    var payout = won ? Math.floor(amount * 1.95) : 0;

    text = "[ 싱봇 광산 ] 🎲 홀짝\n━━━━━━━━━━━━━━━━━━\n";
    text += "배팅: " + amount + "G | 선택: " + choice + "\n";
    text += "🎲 주사위: [" + dice + "] → " + diceResult + "!\n\n";

    if (won) {
      account.gold += payout;
      account.gamblingStats.totalWon += payout;
      text += "🎉 승리! +" + payout + "G (1.95배)\n";
    } else {
      account.gamblingStats.totalLost += amount;
      text += "😢 패배! -" + amount + "G\n";
    }
  } else {
    var slots = MineData.gambling.roulette;
    var tw = 0;
    for (var i = 0; i < slots.length; i++) tw += slots[i].weight;
    var r = Math.random() * tw;
    var slot = slots[0];
    for (var i = 0; i < slots.length; i++) {
      r -= slots[i].weight;
      if (r <= 0) { slot = slots[i]; break; }
    }
    var payout = Math.floor(amount * slot.multiplier);

    text = "[ 싱봇 광산 ] 🎰 배율 룰렛\n━━━━━━━━━━━━━━━━━━\n";
    text += "배팅: " + amount + "G\n";
    text += "🎰 결과: " + slot.label + " (x" + slot.multiplier + ")\n\n";

    if (payout > 0) {
      account.gold += payout;
      if (payout > amount) {
        account.gamblingStats.totalWon += payout;
        text += "🎉 +" + payout + "G!\n";
      } else {
        account.gamblingStats.totalLost += (amount - payout);
        text += "😐 " + payout + "G 회수 (-" + (amount - payout) + "G)\n";
      }
    } else {
      account.gamblingStats.totalLost += amount;
      text += "💀 전액 잃었습니다! -" + amount + "G\n";
    }
  }

  text += "💰 보유: " + account.gold + "G";
  var newTitles = checkTitleUnlocks(account);
  text += titleUnlockText(newTitles);
  saveMineAccount(sender, account);
  replier.reply(text);
}

function handleGambleStats(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);
  var s = account.gamblingStats;
  var net = s.totalWon - s.totalLost;
  replier.reply(
    "[ 싱봇 광산 ] 🎰 도박 기록\n━━━━━━━━━━━━━━━━━━\n" +
    "총 배팅: " + s.totalBet + "G\n" +
    "총 수익: " + s.totalWon + "G\n" +
    "총 손실: " + s.totalLost + "G\n" +
    "순이익: " + (net >= 0 ? "+" : "") + net + "G"
  );
}

// ===== Feature 2: 일일퀘스트 =====

function seededRandom(seed) {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed;
}

function generateDailyQuests(account) {
  ensureNewFields(account);
  var today = todaySeed();
  if (account.dailyQuests.date === today) return;

  var seed = today + hashCode(account.sender || account.name);
  var types = MineData.dailyQuests.types;
  var questCount = MineData.dailyQuests.questsPerDay;

  var indices = [];
  for (var i = 0; i < types.length; i++) indices.push(i);
  for (var i = indices.length - 1; i > 0; i--) {
    seed = seededRandom(seed);
    var j = (seed >>> 0) % (i + 1);
    var tmp = indices[i]; indices[i] = indices[j]; indices[j] = tmp;
  }

  var quests = [];
  for (var q = 0; q < questCount && q < indices.length; q++) {
    var type = types[indices[q]];
    seed = seededRandom(seed);
    var paramVal = type.paramRange[0] + ((seed >>> 0) % (type.paramRange[1] - type.paramRange[0] + 1));
    seed = seededRandom(seed);
    var baseReward = type.rewardGold[0] + ((seed >>> 0) % (type.rewardGold[1] - type.rewardGold[0] + 1));
    var tierIdx = getPickaxeInfo(account.pickaxeLevel).tierIndex;
    var tierMult = MineData.dailyQuests.tierMultiplier[tierIdx] || 1;
    var rewardGold = Math.floor(baseReward * tierMult);

    var desc = type.desc.replace("{n}", paramVal);
    var resourceName = null;
    if (type.id === "collect_resource") {
      var area = MineData.areas[account.currentArea];
      seed = seededRandom(seed);
      var dropIdx = (seed >>> 0) % area.drops.length;
      var res = MineData.resources[area.drops[dropIdx].id];
      resourceName = res.name;
      desc = desc.replace("{resource}", resourceName);
    }

    quests.push({
      typeId: type.id, desc: desc, target: paramVal, progress: 0,
      resourceName: resourceName, rewardGold: rewardGold, completed: false, claimed: false
    });
  }

  account.dailyQuests = { date: today, quests: quests, allClaimed: false };
}

function checkQuestProgress(account, mineResult) {
  ensureNewFields(account);
  generateDailyQuests(account);
  var quests = account.dailyQuests.quests;

  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    if (q.completed) continue;
    if (q.typeId === "mine_count") q.progress++;
    else if (q.typeId === "collect_resource" && mineResult.drops) {
      for (var j = 0; j < mineResult.drops.length; j++) {
        if (mineResult.drops[j].name === q.resourceName) q.progress += mineResult.drops[j].count;
      }
    } else if (q.typeId === "earn_gold") q.progress += mineResult.gold || 0;
    else if (q.typeId === "reach_depth") { if (account.depth > q.progress) q.progress = account.depth; }
    if (q.progress >= q.target) q.completed = true;
  }
}

function handleDailyQuest(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);
  generateDailyQuests(account);
  saveMineAccount(sender, account);

  var quests = account.dailyQuests.quests;
  var text = "[ 싱봇 광산 ] 📋 오늘의 퀘스트\n━━━━━━━━━━━━━━━━━━\n\n";
  var allClaimed = true;

  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    var prog = Math.min(q.progress, q.target);
    var bar = "";
    var filled = Math.floor(prog / q.target * 10);
    for (var b = 0; b < 10; b++) bar += b < filled ? "■" : "□";

    text += (i + 1) + "️⃣ " + q.desc + "\n";
    text += "   [" + bar + "] " + prog + "/" + q.target;
    if (q.claimed) text += " ✅ 수령완료";
    else if (q.completed) { text += " ✅"; allClaimed = false; }
    else allClaimed = false;
    text += "\n   보상: 💰 " + q.rewardGold + "G\n\n";
  }

  text += "🎁 올클리어: 💰 " + MineData.dailyQuests.completionBonusGold + "G + 🌟 " + MineData.dailyQuests.completionBonusStarFragments + "\n";
  if (!allClaimed) text += "'ㄱㅅ퀘스트보상'으로 보상 수령";
  replier.reply(text);
}

function handleDailyQuestClaim(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureNewFields(account);
  generateDailyQuests(account);

  var quests = account.dailyQuests.quests;
  var claimed = 0;
  var text = "[ 싱봇 광산 ] 📋 퀘스트 보상\n━━━━━━━━━━━━━━━━━━\n";

  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    if (q.completed && !q.claimed) {
      q.claimed = true;
      account.gold += q.rewardGold;
      account.totalGoldEarned += q.rewardGold;
      account.questsCompleted = (account.questsCompleted || 0) + 1;
      claimed++;
      text += "✅ " + q.desc + " → +" + q.rewardGold + "G\n";
    }
  }

  if (claimed === 0) { replier.reply("[ 싱봇 광산 ] 수령할 보상이 없습니다!"); return; }

  var allClaimed = true;
  for (var i = 0; i < quests.length; i++) { if (!quests[i].claimed) { allClaimed = false; break; } }
  if (allClaimed && !account.dailyQuests.allClaimed) {
    account.dailyQuests.allClaimed = true;
    var tierIdx = getPickaxeInfo(account.pickaxeLevel).tierIndex;
    var tierMult = MineData.dailyQuests.tierMultiplier[tierIdx] || 1;
    var bonusGold = Math.floor(MineData.dailyQuests.completionBonusGold * tierMult);
    account.gold += bonusGold;
    account.totalGoldEarned += bonusGold;
    account.starFragments += MineData.dailyQuests.completionBonusStarFragments;
    text += "\n🎁 올클리어!\n  💰 +" + bonusGold + "G + 🌟 +" + MineData.dailyQuests.completionBonusStarFragments + "\n";
  }

  text += "\n💰 보유: " + account.gold + "G";
  var newTitles = checkTitleUnlocks(account);
  text += titleUnlockText(newTitles);
  saveMineAccount(sender, account);
  replier.reply(text);
}

// --- 핵심: 채굴 ---

function doMine(account) {
  regenStamina(account);
  if (account.stamina <= 0) {
    var nextRegen = Math.ceil((MineData.config.STAMINA_REGEN_MS - (Date.now() - account.lastStaminaRegen)) / 60000);
    return { success: false, msg: "체력이 부족합니다! " + nextRegen + "분 후 회복.\n체력: 0/" + account.maxStamina };
  }

  account.stamina--;
  account.lastActiveTime = Date.now();
  account.totalMined++;

  var area = MineData.areas[account.currentArea];
  var drops = [];
  var newDiscoveries = [];

  // 행운 보너스
  var luckBonus = account.prestigeBonuses.luck * 0.05;
  luckBonus += getCodexBonus(account, "luck");
  luckBonus += getEquipLuckBonus(account);
  luckBonus += getGuildBonus(account).luck;
  if (account.buffs.luck && account.buffs.luck.uses > 0) {
    luckBonus += 0.30;
    account.buffs.luck.uses--;
    if (account.buffs.luck.uses <= 0) delete account.buffs.luck;
  }

  // 드롭 롤
  for (var i = 0; i < area.drops.length; i++) {
    var drop = area.drops[i];
    if (Math.random() < drop.rate + luckBonus) {
      var amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
      var powerMultiplier = 1 + account.prestigeBonuses.miningPower * 0.10;
      amount = Math.max(1, Math.floor(amount * powerMultiplier));
      var resourceName = MineData.resources[drop.id].name;
      addResource(account, resourceName, amount);
      drops.push({ name: resourceName, count: amount, emoji: MineData.resources[drop.id].emoji });

      // 도감 발견
      if (!account.codex[drop.id]) {
        account.codex[drop.id] = true;
        newDiscoveries.push(resourceName);
      }
    }
  }

  // 골드
  var goldEarned = area.goldRange[0] + Math.floor(Math.random() * (area.goldRange[1] - area.goldRange[0] + 1));
  account.gold += goldEarned;
  account.totalGoldEarned += goldEarned;

  // 깊이 진행
  var oldDepth = account.depth;
  var depthGain = MineData.config.DEPTH_GAIN_MIN +
    Math.floor(Math.random() * (MineData.config.DEPTH_GAIN_MAX - MineData.config.DEPTH_GAIN_MIN + 1));
  depthGain += getEquipDepthBonus(account);
  account.depth += depthGain;

  // 지역 최대 깊이 제한
  var maxAreaDepth = area.depthRange[1];
  if (account.depth > maxAreaDepth) account.depth = maxAreaDepth;

  if (account.depth > account.maxDepthReached) account.maxDepthReached = account.depth;

  // 보스 체크
  var bossResult = checkDepthBoss(account, oldDepth, account.depth);

  // 지역 전환 체크
  checkAreaUnlock(account);

  // 채굴 이벤트 (Feature 3)
  ensureNewFields(account);
  var miningEvent = rollMiningEvent(account, area);
  if (miningEvent) {
    if (miningEvent.type === "rich_vein") {
      for (var i = 0; i < drops.length; i++) {
        addResource(account, drops[i].name, drops[i].count);
        drops[i].count *= 2;
      }
    } else if (miningEvent.type === "trap") {
      account.gold -= miningEvent.details.goldLoss;
      if (account.gold < 0) account.gold = 0;
    } else if (miningEvent.type === "treasure_chest") {
      account.gold += miningEvent.details.bonusGold;
      account.totalGoldEarned += miningEvent.details.bonusGold;
    } else if (miningEvent.type === "mysterious_ore") {
      addResource(account, miningEvent.details.resourceName, miningEvent.details.count);
      drops.push({ name: miningEvent.details.resourceName, count: miningEvent.details.count, emoji: miningEvent.details.resourceEmoji });
      if (!account.codex[miningEvent.details.resourceId]) {
        account.codex[miningEvent.details.resourceId] = true;
        newDiscoveries.push(miningEvent.details.resourceName);
      }
    }
  }

  var mineResult = {
    success: true,
    drops: drops,
    gold: goldEarned,
    depthGain: account.depth - oldDepth,
    newDiscoveries: newDiscoveries,
    bossResult: bossResult,
    miningEvent: miningEvent
  };

  // 일일퀘스트 진행 (Feature 2)
  checkQuestProgress(account, mineResult);

  return mineResult;
}

// ===== 커맨드 핸들러 =====

function handleMineRegister(room, msg, sender, replier) {
  var existing = loadMineAccount(sender);
  if (existing) {
    replier.reply("[ 싱봇 광산 ] 이미 등록된 광부입니다!\n광부명: " + existing.name + "\n'채굴'로 바로 시작하세요.");
    return;
  }
  var name = msg.replace(/^(광산|ㄱㅅ|ㄳ)등록\s*/, "").trim();
  if (!name || name.length < 1 || name.length > 10) {
    replier.reply("[ 싱봇 광산 ]\n\n사용법: ㄱㅅ등록 [광부이름]\n예) ㄱㅅ등록 뚱이\n\n이름은 1~10자");
    return;
  }
  var account = createMineAccount(sender, name);
  saveMineAccount(sender, account);
  replier.reply(
    "[ 싱봇 광산 ] ⛏️ 광부 등록 완료!\n\n" +
    "광부명: " + name + "\n" +
    "곡괭이: 나무 곡괭이 Lv.1\n" +
    "시작 골드: " + account.gold + "G\n" +
    "체력: " + account.stamina + "/" + account.maxStamina + "\n\n" +
    "'채굴'로 광물을 캐세요!\n" +
    "'ㄱㅅ도움말'로 명령어를 확인하세요."
  );
}

function handleMine(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  // 방치 수입
  var idle = calculateIdleIncome(account);
  var idleMsg = "";
  if (idle) {
    addResource(account, idle.resource, idle.amount);
    idleMsg = "💤 방치 수입 (" + idle.minutes + "분): " + idle.resource + " +" + idle.amount + "\n\n";
  }

  var result = doMine(account);
  saveMineAccount(sender, account);

  if (!result.success) {
    replier.reply("[ 싱봇 광산 ]\n\n" + idleMsg + result.msg);
    return;
  }

  var area = MineData.areas[account.currentArea];
  var text = "[ 싱봇 광산 ] ⛏️ 채굴!\n\n";
  if (idleMsg) text += idleMsg;

  text += area.emoji + " " + area.name + " | 깊이 " + account.depth;
  if (result.depthGain > 0) text += " (+" + result.depthGain + ")";
  text += "\n";
  text += "체력: " + account.stamina + "/" + account.maxStamina + "\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  // 드롭
  if (result.drops.length > 0) {
    for (var i = 0; i < result.drops.length; i++) {
      var d = result.drops[i];
      text += d.emoji + " " + d.name + " x" + d.count + "\n";
    }
  } else {
    text += "이번엔 빈 광맥이었습니다...\n";
  }

  text += "💰 +" + result.gold + "G (보유: " + account.gold + "G)\n";

  // 새 발견
  if (result.newDiscoveries.length > 0) {
    text += "\n🆕 새로운 광물 발견!\n";
    for (var i = 0; i < result.newDiscoveries.length; i++) {
      text += "  → " + result.newDiscoveries[i] + " (도감 등록!)\n";
    }
  }

  // 보스
  if (result.bossResult) {
    text += "\n";
    if (result.bossResult.defeated) {
      text += "⚔️ [" + result.bossResult.boss.name + "] 격파!\n";
      text += "보상: " + result.bossResult.gold + "G\n";
    } else {
      text += "🚫 [" + result.bossResult.boss.name + "] 등장!\n";
      text += "필요 파워: " + result.bossResult.requiredPower + " (현재: " + result.bossResult.currentPower + ")\n";
      text += "곡괭이를 강화하고 다시 도전하세요!";
    }
  }

  // 채굴 이벤트 표시
  if (result.miningEvent) {
    var ev = result.miningEvent;
    text += "\n━━━ " + ev.emoji + " " + ev.name + " ━━━\n";
    if (ev.type === "treasure_chest") {
      text += "보물 발견! 💰 +" + ev.details.bonusGold + "G\n";
    } else if (ev.type === "trap") {
      text += "골드 -" + ev.details.goldLoss + "G! 조심하세요!\n";
    } else if (ev.type === "merchant") {
      text += "\"" + ev.details.offer.name + "을(를) " + ev.details.offer.price + "G에 팔지...\"\n";
      text += "(원가 " + ev.details.offer.originalPrice + "G → 50% 할인!)\n";
      text += "'ㄱㅅ상인구매'로 구매 (5분 제한)\n";
    } else if (ev.type === "rich_vein") {
      text += "모든 드롭이 2배!\n";
    } else if (ev.type === "mysterious_ore") {
      text += ev.details.resourceEmoji + " " + ev.details.resourceName + " x" + ev.details.count + " 획득!\n";
    }
  }

  // 칭호 체크
  ensureNewFields(account);
  var newTitles = checkTitleUnlocks(account);
  text += titleUnlockText(newTitles);

  replier.reply(text);
}

function handleMineInfo(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }
  regenStamina(account);

  var tierInfo = getPickaxeInfo(account.pickaxeLevel);
  var power = getPickaxePower(account);
  var area = MineData.areas[account.currentArea];
  var codexCount = getCodexCount(account);
  var totalResources = Object.keys(MineData.resources).length;

  ensureNewFields(account);
  var text = "[ 싱봇 광산 ] " + account.name + "\n";
  var titleDisp = getEquippedTitleDisplay(account);
  if (titleDisp) text += "🏷️ " + titleDisp + "\n";
  text += "━━━━━━━━━━━━━━━━━━\n";
  text += "⛏️ " + tierInfo.tier.emoji + " " + tierInfo.tier.name + " Lv." + account.pickaxeLevel + "\n";
  text += "   파워: " + power + "\n";
  text += "💰 골드: " + account.gold + "G\n";
  text += "❤️ 체력: " + account.stamina + "/" + account.maxStamina + "\n";
  text += area.emoji + " " + area.name + " (깊이 " + account.depth + ")\n";
  text += "📖 도감: " + codexCount + "/" + totalResources + "\n";
  text += "⛏️ 총 채굴: " + account.totalMined + "회\n";
  if (account.prestigeCount > 0) {
    text += "⭐ 프레스티지: " + account.prestigeCount + "회\n";
    text += "🌟 별의 파편: " + account.starFragments + "\n";
  }

  replier.reply(text);
}

function handlePickaxeUpgrade(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (account.pickaxeLevel >= 40) {
    replier.reply("[ 싱봇 광산 ] 곡괭이가 이미 최대 레벨입니다! (Lv.40)");
    return;
  }

  var cost = getUpgradeCost(account.pickaxeLevel);
  var currentTier = getPickaxeInfo(account.pickaxeLevel);
  var nextLevel = account.pickaxeLevel + 1;
  var nextTier = getPickaxeInfo(nextLevel);

  // 바로 강화 실행 (자원 부족 시 부족 메시지)
  if (account.gold < cost.gold) {
    replier.reply("[ 싱봇 광산 ] 골드가 부족합니다! (필요: " + cost.gold + "G, 보유: " + account.gold + "G)");
    return;
  }
  for (var i = 0; i < cost.resources.length; i++) {
    var r = cost.resources[i];
    if (getResourceCount(account, r.name) < r.count) {
      replier.reply("[ 싱봇 광산 ] " + r.name + "이(가) 부족합니다! (필요: " + r.count + ", 보유: " + getResourceCount(account, r.name) + ")");
      return;
    }
  }

  // 비용 차감
  account.gold -= cost.gold;
  for (var i = 0; i < cost.resources.length; i++) {
    removeResource(account, cost.resources[i].name, cost.resources[i].count);
  }

  // 강화 성공 판정
  var successRate = MineData.config.UPGRADE_SUCCESS_RATE[currentTier.tierIndex];
  if (successRate === undefined) successRate = 1.0;
  var succeeded = Math.random() < successRate;

  if (!succeeded) {
    saveMineAccount(sender, account);
    replier.reply(
      "[ 싱봇 광산 ] 💔 강화 실패!\n\n" +
      currentTier.tier.emoji + " Lv." + account.pickaxeLevel + " 유지\n" +
      "성공률: " + Math.round(successRate * 100) + "%\n" +
      "자원과 골드가 소모되었습니다.\n" +
      "💰 잔여: " + account.gold + "G"
    );
    return;
  }

  account.pickaxeLevel = nextLevel;
  saveMineAccount(sender, account);

  var newPower = getPickaxePower(account);

  // 티어 변경 시 새 곡괭이 이미지 전송
  if (currentTier.tierIndex !== nextTier.tierIndex) {
    var imgUrl = getPickaxeImageUrl(nextTier.tierIndex);
    if (imgUrl) replier.reply(imgUrl);
  }

  var text = "[ 싱봇 광산 ] ⛏️ 강화 성공!\n\n";
  if (currentTier.tierIndex !== nextTier.tierIndex) {
    text += "🎉 " + nextTier.tier.name + " 획득!\n";
  }
  text += nextTier.tier.emoji + " Lv." + nextLevel + " | 파워: " + newPower + "\n";
  if (successRate < 1.0) text += "성공률: " + Math.round(successRate * 100) + "%\n";
  text += "💰 잔여 골드: " + account.gold + "G";
  replier.reply(text);
}

function getPickaxeImageUrl(tierIndex) {
  var tier = MineData.pickaxeTiers[tierIndex];
  if (!tier || !tier.image) return null;
  return MineData.pickaxeImageBase + "/mine/" + tier.image + ".html?v=2";
}

function handlePickaxeInfo(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  var tierInfo = getPickaxeInfo(account.pickaxeLevel);
  var power = getPickaxePower(account);
  var tier = tierInfo.tier;

  // OG 미리보기 이미지 전송
  var imageUrl = getPickaxeImageUrl(tierInfo.tierIndex);
  if (imageUrl) replier.reply(imageUrl);

  var text = "[ 싱봇 광산 ] 곡괭이 정보\n";
  text += "━━━━━━━━━━━━━━━━━━\n";
  text += tier.emoji + " " + tier.name + "\n";
  text += "레벨: " + account.pickaxeLevel + " / 40\n";
  text += "파워: " + power + "\n";
  text += "티어: " + (tierInfo.tierIndex + 1) + " / " + MineData.pickaxeTiers.length + "\n";

  // 다음 레벨 비용
  if (account.pickaxeLevel < 40) {
    var cost = getUpgradeCost(account.pickaxeLevel);
    text += "\n다음 강화 비용:\n";
    text += "  💰 " + cost.gold + "G\n";
    for (var i = 0; i < cost.resources.length; i++) {
      text += "  " + cost.resources[i].name + " x" + cost.resources[i].count + "\n";
    }
  }

  replier.reply(text);
}

function handleMineInventory(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  var text = "[ 싱봇 광산 ] " + account.name + "의 인벤토리\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  if (account.resources.length === 0 && account.items.length === 0) {
    text += "텅 비었습니다!";
    replier.reply(text);
    return;
  }

  if (account.resources.length > 0) {
    text += "📦 광물:\n";
    for (var i = 0; i < account.resources.length; i++) {
      var r = account.resources[i];
      var id = MineData.resourceIdMap[r.name];
      var emoji = id ? MineData.resources[id].emoji : "•";
      text += "  " + emoji + " " + r.name + " x" + r.count + "\n";
    }
  }

  if (account.items.length > 0) {
    text += "\n🎒 아이템:\n";
    for (var i = 0; i < account.items.length; i++) {
      text += "  • " + account.items[i].name + " x" + account.items[i].count + "\n";
    }
  }

  text += "\n💰 골드: " + account.gold + "G";
  replier.reply(text);
}

function handleMineCodex(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  var totalResources = 0;
  var codexCount = getCodexCount(account);
  var text = "[ 싱봇 광산 ] 광물 도감\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  var tierNames = ["Common", "Uncommon", "Rare"];
  for (var t = 1; t <= 3; t++) {
    var tierLabel = t === 1 ? "⬜ Common" : (t === 2 ? "🟦 Uncommon" : "🟪 Rare");
    text += "\n" + tierLabel + "\n";
    for (var id in MineData.resources) {
      if (MineData.resources.hasOwnProperty(id) && MineData.resources[id].tier === t) {
        totalResources++;
        var res = MineData.resources[id];
        if (account.codex[id]) {
          text += "  " + res.emoji + " " + res.name + " [발견]\n";
        } else {
          text += "  ❓ ??? [미발견]\n";
        }
      }
    }
  }

  text += "\n진행: " + codexCount + "/" + totalResources + "\n";

  // 보상 표시
  text += "\n🎁 보상:\n";
  for (var i = 0; i < MineData.codexRewards.length; i++) {
    var reward = MineData.codexRewards[i];
    var achieved = codexCount >= reward.threshold;
    text += "  " + (achieved ? "✅" : "⬜") + " " + reward.threshold + "종 — " + reward.desc + "\n";
  }

  replier.reply(text);
}

function handleMineShop(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  var text = "[ 싱봇 광산 ] 상점\n";
  text += "━━━━━━━━━━━━━━━━━━\n";
  text += "💰 보유: " + account.gold + "G\n\n";

  for (var i = 0; i < MineData.shopItems.length; i++) {
    var item = MineData.shopItems[i];
    text += (i + 1) + ". " + item.name + " — " + item.price + "G\n";
    text += "   " + item.desc + "\n";
  }

  text += "\n'ㄱㅅ구매 [아이템명]'으로 구매";
  replier.reply(text);
}

function handleMineBuy(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  var itemName = msg.replace(/^((광산|ㄱㅅ|ㄳ)구매|ㄳㅅ)\s*/, "").trim();
  if (!itemName) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ구매 [아이템명]\n예) ㄱㅅ구매 에너지 음료");
    return;
  }

  var shopItem = null;
  for (var i = 0; i < MineData.shopItems.length; i++) {
    if (MineData.shopItems[i].name === itemName) {
      shopItem = MineData.shopItems[i];
      break;
    }
  }

  if (!shopItem) {
    replier.reply("[ 싱봇 광산 ] 상점에 없는 아이템입니다. 'ㄱㅅ상점'으로 목록을 확인하세요.");
    return;
  }

  if (account.gold < shopItem.price) {
    replier.reply("[ 싱봇 광산 ] 골드가 부족합니다! (필요: " + shopItem.price + "G, 보유: " + account.gold + "G)");
    return;
  }

  account.gold -= shopItem.price;

  // 효과 적용
  var effectMsg = "";
  if (shopItem.effect === "stamina") {
    account.stamina = Math.min(account.maxStamina, account.stamina + shopItem.value);
    effectMsg = "체력 +" + shopItem.value + " (현재: " + account.stamina + "/" + account.maxStamina + ")";
  } else if (shopItem.effect === "luck") {
    account.buffs.luck = { uses: shopItem.value };
    effectMsg = "희귀 드롭률 +30% (채굴 " + shopItem.value + "회)";
  } else if (shopItem.effect === "depth") {
    account.depth += shopItem.value;
    if (account.depth > account.maxDepthReached) account.maxDepthReached = account.depth;
    checkAreaUnlock(account);
    effectMsg = "깊이 +" + shopItem.value + " (현재: " + account.depth + ")";
  } else if (shopItem.effect === "idle") {
    account.buffs.idle = { expires: Date.now() + shopItem.value * 60000 };
    effectMsg = "방치 수입 +50% (" + Math.floor(shopItem.value / 60) + "시간)";
  }

  saveMineAccount(sender, account);
  replier.reply("[ 싱봇 광산 ] 구매 완료!\n\n" + shopItem.name + " 사용!\n" + effectMsg + "\n💰 잔여: " + account.gold + "G");
}

function handleMineSell(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!");
    return;
  }

  var input = msg.replace(/^((광산|ㄱㅅ|ㄳ)판매|ㄳㅍ)\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ판매 [자원명] [수량]\n예) ㄱㅅ판매 돌 10\n전부 판매: ㄱㅅ판매 돌 전부");
    return;
  }

  // "자원명 수량" 또는 "자원명 전부"
  var parts = input.split(/\s+/);
  var resourceName = parts[0];
  var sellAll = parts.length > 1 && parts[parts.length - 1] === "전부";
  var count = sellAll ? 0 : (parts.length > 1 ? parseInt(parts[parts.length - 1]) : 0);

  var id = MineData.resourceIdMap[resourceName];
  if (!id) {
    replier.reply("[ 싱봇 광산 ] 알 수 없는 자원입니다: " + resourceName);
    return;
  }

  var has = getResourceCount(account, resourceName);
  if (has <= 0) {
    replier.reply("[ 싱봇 광산 ] " + resourceName + "을(를) 보유하고 있지 않습니다.");
    return;
  }

  if (sellAll) count = has;
  if (count <= 0 || isNaN(count)) {
    replier.reply("[ 싱봇 광산 ] 수량을 입력해주세요.\n예) ㄱㅅ판매 돌 10");
    return;
  }
  if (count > has) count = has;

  var unitPrice = MineData.resources[id].sellPrice;
  var totalGold = unitPrice * count;

  removeResource(account, resourceName, count);
  account.gold += totalGold;
  account.totalGoldEarned += totalGold;
  saveMineAccount(sender, account);

  replier.reply(
    "[ 싱봇 광산 ] 판매 완료!\n\n" +
    MineData.resources[id].emoji + " " + resourceName + " x" + count + " → " + totalGold + "G\n" +
    "(개당 " + unitPrice + "G)\n" +
    "💰 보유: " + account.gold + "G"
  );
}

function handleMineHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 광산 도움말 ] ⛏️\n\n" +
    "* ㄱㅅ / ㄳ 둘 다 가능\n" +
    "* 초성 단축키도 지원!\n\n" +
    "기본:\n" +
    "  ㅊㄱ — 채굴\n" +
    "  ㄳㅈㅂ — 광산정보\n" +
    "  ㄱㅅ등록 [이름] — 광부 등록\n\n" +
    "장비:\n" +
    "  ㄱㅎ — 곡괭이강화\n" +
    "  ㄱㅈㅂ — 곡괭이정보\n" +
    "  ㅈㅂ — 장착 장비 확인\n" +
    "  ㄳㅁㄹ — 제작 가능 목록\n" +
    "  ㄳㅈㅈ [장비명] — 장비 제작\n" +
    "  ㄳㅎㅈ [슬롯] — 장비 해제\n\n" +
    "자원:\n" +
    "  ㅇㅂ — 인벤토리\n" +
    "  ㄷㄱ — 도감\n\n" +
    "경제:\n" +
    "  ㄳㅅㅈ — 상점\n" +
    "  ㄳㅅ [아이템] — 상점 구매\n" +
    "  ㄳㅍ [자원] [수량] — 상점 판매\n" +
    "  ㄳㅅㅅ — 시세 (매일 변동)\n" +
    "  ㅅㅈㅍ [자원] [수량] — 시장 판매\n\n" +
    "거래:\n" +
    "  ㄱㅅ거래신청 [상대] — 거래 요청\n" +
    "  ㄱㅅ거래수락/거절 — 응답\n" +
    "  ㄱㅅ거래올리기 [자원] [수량]\n" +
    "  ㄱㅅ거래골드 [수량]\n" +
    "  ㄱㅅ거래확인/취소\n\n" +
    "환생:\n" +
    "  ㄱㅅ환생 — 프레스티지 (깊이500+)\n" +
    "  ㄱㅅ환생상점 — 영구 보너스 구매\n" +
    "  ㄱㅅ환생구매 [보너스명]\n\n" +
    "대결:\n" +
    "  ㅂㅌ [상대] — PvP 대결\n" +
    "  ㅂㅌㅇ / ㅂㅌㄴ — 수락/거절\n" +
    "  ㅋㄱ — 대결 중 채굴\n" +
    "  ㅎㅂ — 항복\n" +
    "  ㄹㅋ — 랭킹\n\n" +
    "길드:\n" +
    "  ㄱㅅ길드생성 [이름] — 길드 생성\n" +
    "  ㄱㅅ길드가입 [길드명] — 가입 신청\n" +
    "  ㄱㅅ길드수락 [이름] — 가입 수락\n" +
    "  ㄱㅅ길드채굴 — 길드 광산 채굴\n" +
    "  ㄱㅅ길드정보 — 길드 정보\n" +
    "  ㄱㅅ길드탈퇴 — 길드 탈퇴\n\n" +
    "도박:\n" +
    "  ㄷㅂ [금액] — 배율 룰렛\n" +
    "  ㄷㅂ [금액] [홀/짝] — 홀짝\n" +
    "  ㄷㅂㄱㄹ — 도박 통계\n\n" +
    "퀘스트:\n" +
    "  ㄳㅋ — 일일퀘스트 확인\n" +
    "  ㄳㅋㅈ — 보상 수령\n\n" +
    "칭호:\n" +
    "  ㄱㅅ칭호 — 칭호 목록\n" +
    "  ㄱㅅ칭호장착 [이름] — 칭호 장착"
  );
}

// ===== 장비 시스템 =====

function handleMineEquipInfo(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureEquipment(account);

  var text = "[ 싱봇 광산 ] " + account.name + "의 장비\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  var slots = ["helmet", "lamp", "boots"];
  var slotNames = { helmet: "안전모", lamp: "램프", boots: "장화" };
  for (var s = 0; s < slots.length; s++) {
    var slot = slots[s];
    var equipped = account.equipment[slot];
    text += "\n" + slotNames[slot] + ": ";
    if (equipped) {
      var data = getEquippedData(account, slot);
      text += (data ? data.emoji + " " : "") + equipped.name + " (Tier " + equipped.tier + ")\n";
      if (data) {
        if (data.staminaBonus) text += "  → 체력 +" + data.staminaBonus + "\n";
        if (data.pvpDef) text += "  → 방어 +" + data.pvpDef + "\n";
        if (data.luckBonus) text += "  → 행운 +" + Math.round(data.luckBonus * 100) + "%\n";
        if (data.idleBonus) text += "  → 방치 +" + Math.round(data.idleBonus * 100) + "%\n";
        if (data.depthBonus) text += "  → 깊이 +" + data.depthBonus + "\n";
      }
    } else {
      text += "없음\n";
    }
  }

  text += "\n'ㄱㅅ제작 [장비명]'으로 제작\n'ㄱㅅ제작목록'으로 제작 가능 목록";
  replier.reply(text);

  // 장착 중인 장비 이미지 전송
  for (var s = 0; s < slots.length; s++) {
    var data = getEquippedData(account, slots[s]);
    if (data && data.image) {
      replier.reply(MineData.pickaxeImageBase + "/mine/" + data.image + ".html?v=2");
    }
  }
}

function handleMineCraftList(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var text = "[ 싱봇 광산 ] 제작 목록\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  var slots = ["helmet", "lamp", "boots"];
  var slotNames = { helmet: "🪖 안전모", lamp: "🔦 램프", boots: "🥾 장화" };
  for (var s = 0; s < slots.length; s++) {
    var slot = slots[s];
    text += "\n" + slotNames[slot] + ":\n";
    var items = MineData.equipment[slot];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      text += "  " + item.emoji + " " + item.name + " (T" + item.tier + ")\n";
      text += "    ";
      if (item.staminaBonus) text += "체력+" + item.staminaBonus + " ";
      if (item.pvpDef) text += "방어+" + item.pvpDef + " ";
      if (item.luckBonus) text += "행운+" + Math.round(item.luckBonus * 100) + "% ";
      if (item.idleBonus) text += "방치+" + Math.round(item.idleBonus * 100) + "% ";
      if (item.depthBonus) text += "깊이+" + item.depthBonus + " ";
      text += "\n";
      text += "    💰 " + item.cost.gold + "G";
      for (var r = 0; r < item.cost.resources.length; r++) {
        text += " + " + item.cost.resources[r].name + " x" + item.cost.resources[r].count;
      }
      text += "\n";
    }
  }

  text += "\n'ㄱㅅ제작 [장비명]'으로 제작";
  replier.reply(text);
}

function handleMineCraft(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureEquipment(account);

  var input = msg.replace(/^((광산|ㄱㅅ|ㄳ)제작|ㄳㅈㅈ)\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ제작 [장비명]\n예) ㄱㅅ제작 가죽 안전모\n\n'ㄱㅅ제작목록'으로 목록 확인");
    return;
  }

  // 장비 찾기
  var targetItem = null;
  var targetSlot = null;
  var slots = ["helmet", "lamp", "boots"];
  for (var s = 0; s < slots.length; s++) {
    var items = MineData.equipment[slots[s]];
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === input) {
        targetItem = items[i];
        targetSlot = slots[s];
        break;
      }
    }
    if (targetItem) break;
  }

  if (!targetItem) {
    replier.reply("[ 싱봇 광산 ] 알 수 없는 장비: " + input + "\n'ㄱㅅ제작목록'으로 확인하세요.");
    return;
  }

  // 비용 확인
  if (account.gold < targetItem.cost.gold) {
    replier.reply("[ 싱봇 광산 ] 골드 부족! (필요: " + targetItem.cost.gold + "G, 보유: " + account.gold + "G)");
    return;
  }
  for (var r = 0; r < targetItem.cost.resources.length; r++) {
    var req = targetItem.cost.resources[r];
    if (getResourceCount(account, req.name) < req.count) {
      replier.reply("[ 싱봇 광산 ] " + req.name + " 부족! (필요: " + req.count + ", 보유: " + getResourceCount(account, req.name) + ")");
      return;
    }
  }

  // 비용 차감
  account.gold -= targetItem.cost.gold;
  for (var r = 0; r < targetItem.cost.resources.length; r++) {
    removeResource(account, targetItem.cost.resources[r].name, targetItem.cost.resources[r].count);
  }

  // 장착 (기존 장비 대체)
  account.equipment[targetSlot] = { name: targetItem.name, tier: targetItem.tier };
  account.maxStamina = getEffectiveMaxStamina(account);
  saveMineAccount(sender, account);

  // 장비 이미지 전송
  if (targetItem.image) {
    replier.reply(MineData.pickaxeImageBase + "/mine/" + targetItem.image + ".html?v=2");
  }

  var text = "[ 싱봇 광산 ] 제작 & 장착 완료!\n\n";
  text += targetItem.emoji + " " + targetItem.name + "\n";
  if (targetItem.staminaBonus) text += "  → 체력 +" + targetItem.staminaBonus + " (최대: " + account.maxStamina + ")\n";
  if (targetItem.luckBonus) text += "  → 행운 +" + Math.round(targetItem.luckBonus * 100) + "%\n";
  if (targetItem.idleBonus) text += "  → 방치 +" + Math.round(targetItem.idleBonus * 100) + "%\n";
  if (targetItem.depthBonus) text += "  → 깊이 +" + targetItem.depthBonus + "\n";
  text += "\n💰 잔여: " + account.gold + "G";
  replier.reply(text);
}

function handleMineUnequip(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }
  ensureEquipment(account);

  var input = msg.replace(/^((광산|ㄱㅅ|ㄳ)해제|ㄳㅎㅈ)\s*/, "").trim();
  var slotMap = { "안전모": "helmet", "헬멧": "helmet", "램프": "lamp", "장화": "boots" };
  var slot = slotMap[input];

  if (!slot) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ해제 [안전모/램프/장화]");
    return;
  }

  if (!account.equipment[slot]) {
    replier.reply("[ 싱봇 광산 ] 해당 슬롯에 장비가 없습니다.");
    return;
  }

  var removed = account.equipment[slot].name;
  account.equipment[slot] = null;
  account.maxStamina = getEffectiveMaxStamina(account);
  if (account.stamina > account.maxStamina) account.stamina = account.maxStamina;
  saveMineAccount(sender, account);

  replier.reply("[ 싱봇 광산 ] " + removed + " 해제 완료.");
}

// ===== 거래 시스템 =====

var mineTradeRequests = {};
var mineTradeSessions = {};

function handleMineTradeRequest(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var input = msg.replace(/^(광산|ㄱㅅ|ㄳ)거래신청\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ거래신청 [상대 광부이름]");
    return;
  }

  // 광부이름으로 먼저 찾고, 없으면 카톡이름으로 시도
  var target = findSenderByMineName(input);
  if (!target) target = input;
  if (target === sender) {
    replier.reply("[ 싱봇 광산 ] 자기 자신과 거래할 수 없습니다.");
    return;
  }
  if (mineTradeSessions[sender]) {
    replier.reply("[ 싱봇 광산 ] 이미 진행 중인 거래가 있습니다.");
    return;
  }

  mineTradeRequests[target] = { from: sender, room: room, time: Date.now() };
  replier.reply("[ 싱봇 광산 ] " + account.name + "님이 " + (loadMineAccount(target) ? loadMineAccount(target).name : target) + "님에게 거래를 신청했습니다!\n" + target + "님은 'ㄱㅅ거래수락' 또는 'ㄱㅅ거래거절'을 입력하세요.");
}

function handleMineTradeAccept(room, msg, sender, replier) {
  var req = mineTradeRequests[sender];
  if (!req) {
    replier.reply("[ 싱봇 광산 ] 받은 거래 요청이 없습니다.");
    return;
  }
  // 5분 타임아웃
  if (Date.now() - req.time > 300000) {
    delete mineTradeRequests[sender];
    replier.reply("[ 싱봇 광산 ] 거래 요청�� 만료되었습니다.");
    return;
  }

  var sessionId = req.from + ":" + sender + ":" + Date.now();
  var session = {
    id: sessionId,
    p1: { sender: req.from, resources: [], gold: 0, confirmed: false },
    p2: { sender: sender, resources: [], gold: 0, confirmed: false }
  };
  mineTradeSessions[req.from] = sessionId;
  mineTradeSessions[sender] = sessionId;
  mineTradeSessions[sessionId] = session;
  delete mineTradeRequests[sender];

  replier.reply(
    "[ 싱봇 광산 ] 거래 시작!\n\n" +
    session.p1.sender + " ↔ " + session.p2.sender + "\n\n" +
    "'ㄱㅅ거래올리기 [자원] [수량]' — 자원 제안\n" +
    "'ㄱㅅ거래골드 [수량]' — 골드 제안\n" +
    "'ㄱㅅ거래확인' — 거래 확정 (양쪽 모두)\n" +
    "'ㄱㅅ거래취소' — 거래 취소"
  );
}

function handleMineTradeDecline(room, msg, sender, replier) {
  if (mineTradeRequests[sender]) {
    var from = mineTradeRequests[sender].from;
    delete mineTradeRequests[sender];
    replier.reply("[ 싱봇 광산 ] " + sender + "님이 " + from + "님의 거래를 거절했습니다.");
  } else {
    replier.reply("[ 싱봇 광산 ] 받은 거래 요청이 없습니다.");
  }
}

function getMineTradeSession(sender) {
  var sessionId = mineTradeSessions[sender];
  if (!sessionId) return null;
  var session = mineTradeSessions[sessionId];
  if (!session) return null;
  return session;
}

function getMyTradeSlot(session, sender) {
  return session.p1.sender === sender ? session.p1 : session.p2;
}

function handleMineTradeOffer(room, msg, sender, replier) {
  var session = getMineTradeSession(sender);
  if (!session) { replier.reply("[ 싱봇 광산 ] 진행 중인 거래가 없습니다."); return; }

  var input = msg.replace(/^(광산|ㄱㅅ|ㄳ)거래올리기\s*/, "").trim();
  var parts = input.split(/\s+/);
  if (parts.length < 2) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ거래올리기 [자원명] [수량]");
    return;
  }
  var resourceName = parts[0];
  var count = parseInt(parts[1]);
  if (isNaN(count) || count <= 0) {
    replier.reply("[ 싱봇 광산 ] 올바른 수량을 입력하세요.");
    return;
  }

  var account = loadMineAccount(sender);
  if (getResourceCount(account, resourceName) < count) {
    replier.reply("[ 싱봇 광산 ] " + resourceName + " 부족! (보유: " + getResourceCount(account, resourceName) + ")");
    return;
  }

  var slot = getMyTradeSlot(session, sender);
  // 기존 제안에 추가
  var found = false;
  for (var i = 0; i < slot.resources.length; i++) {
    if (slot.resources[i].name === resourceName) {
      slot.resources[i].count += count;
      found = true;
      break;
    }
  }
  if (!found) slot.resources.push({ name: resourceName, count: count });
  slot.confirmed = false;
  // 상대도 미확정으로
  var otherSlot = session.p1.sender === sender ? session.p2 : session.p1;
  otherSlot.confirmed = false;

  replier.reply("[ 싱봇 광산 ] " + sender + "님이 " + resourceName + " x" + count + " 제안!\n" + formatTradeStatus(session));
}

function handleMineTradeGold(room, msg, sender, replier) {
  var session = getMineTradeSession(sender);
  if (!session) { replier.reply("[ 싱봇 광산 ] 진행 중인 거래가 없습니다."); return; }

  var amount = parseInt(msg.replace(/^(광산|ㄱㅅ|ㄳ)거래골드\s*/, "").trim());
  if (isNaN(amount) || amount <= 0) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ거래골드 [수량]");
    return;
  }

  var account = loadMineAccount(sender);
  if (account.gold < amount) {
    replier.reply("[ 싱봇 광산 ] 골드 부족! (보유: " + account.gold + "G)");
    return;
  }

  var slot = getMyTradeSlot(session, sender);
  slot.gold = amount;
  slot.confirmed = false;
  var otherSlot = session.p1.sender === sender ? session.p2 : session.p1;
  otherSlot.confirmed = false;

  replier.reply("[ 싱봇 광산 ] " + sender + "님이 " + amount + "G 제안!\n" + formatTradeStatus(session));
}

function handleMineTradeConfirm(room, msg, sender, replier) {
  var session = getMineTradeSession(sender);
  if (!session) { replier.reply("[ 싱봇 광산 ] 진행 중인 거래가 없습니다."); return; }

  var slot = getMyTradeSlot(session, sender);
  slot.confirmed = true;

  var otherSlot = session.p1.sender === sender ? session.p2 : session.p1;
  if (!otherSlot.confirmed) {
    replier.reply("[ 싱봇 광산 ] " + sender + "님 확인 완료! " + otherSlot.sender + "님의 확인을 기다리는 중...\n" + formatTradeStatus(session));
    return;
  }

  // 양쪽 확인 → 거래 실행
  var acc1 = loadMineAccount(session.p1.sender);
  var acc2 = loadMineAccount(session.p2.sender);

  // 최종 자원 검증
  for (var i = 0; i < session.p1.resources.length; i++) {
    var r = session.p1.resources[i];
    if (getResourceCount(acc1, r.name) < r.count) {
      replier.reply("[ 싱봇 광산 ] " + session.p1.sender + "님의 " + r.name + " 부족으로 거래 실패!");
      cleanupTradeSession(session);
      return;
    }
  }
  for (var i = 0; i < session.p2.resources.length; i++) {
    var r = session.p2.resources[i];
    if (getResourceCount(acc2, r.name) < r.count) {
      replier.reply("[ 싱봇 광산 ] " + session.p2.sender + "님의 " + r.name + " 부족으로 거래 실패!");
      cleanupTradeSession(session);
      return;
    }
  }
  if (acc1.gold < session.p1.gold || acc2.gold < session.p2.gold) {
    replier.reply("[ 싱봇 광산 ] 골드 부족으로 거래 실패!");
    cleanupTradeSession(session);
    return;
  }

  // 교환 실행
  // p1 → p2
  for (var i = 0; i < session.p1.resources.length; i++) {
    var r = session.p1.resources[i];
    removeResource(acc1, r.name, r.count);
    addResource(acc2, r.name, r.count);
  }
  if (session.p1.gold > 0) { acc1.gold -= session.p1.gold; acc2.gold += session.p1.gold; }
  // p2 → p1
  for (var i = 0; i < session.p2.resources.length; i++) {
    var r = session.p2.resources[i];
    removeResource(acc2, r.name, r.count);
    addResource(acc1, r.name, r.count);
  }
  if (session.p2.gold > 0) { acc2.gold -= session.p2.gold; acc1.gold += session.p2.gold; }

  saveMineAccount(session.p1.sender, acc1);
  saveMineAccount(session.p2.sender, acc2);
  cleanupTradeSession(session);

  replier.reply("[ 싱봇 광산 ] 거래 완료! 🤝\n\n" + session.p1.sender + " ↔ " + session.p2.sender);
}

function handleMineTradeCancel(room, msg, sender, replier) {
  var session = getMineTradeSession(sender);
  if (!session) { replier.reply("[ 싱봇 광산 ] 진행 중인 거래가 없습니다."); return; }
  cleanupTradeSession(session);
  replier.reply("[ 싱봇 광산 ] " + sender + "님이 거래를 취소했습니다.");
}

function cleanupTradeSession(session) {
  delete mineTradeSessions[session.p1.sender];
  delete mineTradeSessions[session.p2.sender];
  delete mineTradeSessions[session.id];
}

function formatTradeStatus(session) {
  var text = "\n━━━ 거래 현황 ━━━\n";
  text += session.p1.sender + (session.p1.confirmed ? " ✅" : " ⬜") + ":\n";
  if (session.p1.gold > 0) text += "  💰 " + session.p1.gold + "G\n";
  for (var i = 0; i < session.p1.resources.length; i++) {
    text += "  " + session.p1.resources[i].name + " x" + session.p1.resources[i].count + "\n";
  }
  text += session.p2.sender + (session.p2.confirmed ? " ✅" : " ⬜") + ":\n";
  if (session.p2.gold > 0) text += "  💰 " + session.p2.gold + "G\n";
  for (var i = 0; i < session.p2.resources.length; i++) {
    text += "  " + session.p2.resources[i].name + " x" + session.p2.resources[i].count + "\n";
  }
  return text;
}

// ===== 시장 시스��� (일일 변동 시세) =====

function getMarketPrice(resourceId) {
  var basePrice = MineData.marketBasePrices[resourceId];
  if (!basePrice) return 0;
  var seed = todaySeed() + Math.abs(hashCode(resourceId));
  var rng = (Math.abs(seed) % 100) / 100;
  var multiplier = 0.5 + rng * 1.5; // 0.5x ~ 2.0x
  return Math.max(1, Math.floor(basePrice * multiplier));
}

function handleMineMarket(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var text = "[ 싱봇 광산 ] 오늘의 시장 시세\n";
  text += "━━━━━━━━━━━━━━━━━━\n";
  text += "📅 " + todayString() + " (매일 변동)\n\n";

  for (var id in MineData.marketBasePrices) {
    if (MineData.marketBasePrices.hasOwnProperty(id)) {
      var res = MineData.resources[id];
      var price = getMarketPrice(id);
      var basePrice = res.sellPrice;
      var diff = price - basePrice;
      var arrow = diff > 0 ? "📈" : (diff < 0 ? "📉" : "➡️");
      text += res.emoji + " " + res.name + ": " + price + "G " + arrow;
      if (diff !== 0) text += " (" + (diff > 0 ? "+" : "") + diff + ")";
      text += "\n";
    }
  }

  text += "\n기준가 대비 변동 표시\n";
  text += "'ㄱㅅ시장판매 [자원] [수량]'으로 시장가 판매";
  replier.reply(text);
}

function handleMineMarketSell(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var input = msg.replace(/^((광산|ㄱㅅ|ㄳ)시장판매|ㅅㅈㅍ)\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ시장판매 [자원명] [수량]\n예) ㄱㅅ시장판매 금광석 5\n전부: ㄱㅅ시장판매 금광석 전부");
    return;
  }

  var parts = input.split(/\s+/);
  var resourceName = parts[0];
  var id = MineData.resourceIdMap[resourceName];
  if (!id) {
    replier.reply("[ 싱봇 광산 ] 알 수 없는 자원: " + resourceName);
    return;
  }

  var has = getResourceCount(account, resourceName);
  if (has <= 0) {
    replier.reply("[ 싱봇 광산 ] " + resourceName + "을(를) 보유하고 있지 않습니다.");
    return;
  }

  var sellAll = parts.length > 1 && parts[1] === "전부";
  var count = sellAll ? has : (parts.length > 1 ? parseInt(parts[1]) : 0);
  if (isNaN(count) || count <= 0) {
    replier.reply("[ 싱봇 광산 ] 수량을 입력하세요.");
    return;
  }
  if (count > has) count = has;

  var unitPrice = getMarketPrice(id);
  var totalGold = unitPrice * count;
  var npcTotal = MineData.resources[id].sellPrice * count;
  var diff = totalGold - npcTotal;

  removeResource(account, resourceName, count);
  account.gold += totalGold;
  account.totalGoldEarned += totalGold;
  saveMineAccount(sender, account);

  var text = "[ 싱봇 광산 ] 시장 판매 완료!\n\n";
  text += MineData.resources[id].emoji + " " + resourceName + " x" + count + "\n";
  text += "시장가: " + unitPrice + "G × " + count + " = " + totalGold + "G\n";
  if (diff > 0) {
    text += "📈 NPC 대비 +" + diff + "G 이득!\n";
  } else if (diff < 0) {
    text += "📉 NPC 대비 " + diff + "G 손해...\n";
  }
  text += "💰 보유: " + account.gold + "G";
  replier.reply(text);
}

// ===== 프레스티지 시스템 =====

function handleMinePrestige(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var req = MineData.prestigeRequirements;
  if (account.depth < req.minDepth || account.pickaxeLevel < req.minPickaxe) {
    replier.reply(
      "[ 싱봇 광산 ] 환생 조건 미달!\n\n" +
      "필요: 깊이 " + req.minDepth + "+ (현재: " + account.depth + ")\n" +
      "필요: 곡괭이 Lv." + req.minPickaxe + "+ (현재: Lv." + account.pickaxeLevel + ")"
    );
    return;
  }

  // "광산환생 확인" 이면 실행
  if (msg.indexOf("확인") === -1) {
    var fragments = Math.floor(account.depth / 50) + Math.floor(account.pickaxeLevel / 5);
    replier.reply(
      "[ 싱봇 광산 ] ⭐ 환생 안내\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "획득 별의 파편: " + fragments + "개\n" +
      "(현재 보유: " + account.starFragments + "개)\n\n" +
      "🔄 리셋 항목:\n" +
      "  깊이, 곡괭이, 자원, 장비, 골드\n\n" +
      "✅ 유지 항목:\n" +
      "  도감, 별의 파편, 영구 보너스, 통계\n\n" +
      "'ㄱㅅ환생 확인'으로 환생 진행"
    );
    return;
  }

  // 환생 실행
  var fragments = Math.floor(account.depth / 50) + Math.floor(account.pickaxeLevel / 5);
  account.starFragments += fragments;
  account.prestigeCount++;

  // 리셋
  var startDepth = MineData.prestigeStartDepths[account.prestigeBonuses.startDepth] || 1;
  account.depth = Math.max(1, startDepth);
  account.maxDepthReached = Math.max(account.maxDepthReached, account.depth);
  account.pickaxeLevel = 1;
  account.currentArea = 0;
  account.resources = [];
  account.items = [];
  account.equipment = { helmet: null, lamp: null, boots: null };
  account.gold = MineData.config.STARTING_GOLD;
  account.buffs = {};
  account.maxStamina = getEffectiveMaxStamina(account);
  account.stamina = account.maxStamina;
  account.lastActiveTime = Date.now();
  account.lastStaminaRegen = Date.now();

  // 지역 재계산
  checkAreaUnlock(account);

  saveMineAccount(sender, account);

  replier.reply(
    "[ 싱봇 광산 ] ⭐ 환생 완료!\n" +
    "━━━━━━━━━━━━━━━━━━\n" +
    "환생 횟수: " + account.prestigeCount + "회\n" +
    "별의 파편: +" + fragments + " (보유: " + account.starFragments + ")\n" +
    "시작 깊이: " + account.depth + "\n\n" +
    "'ㄱㅅ환생상점'에서 영구 보너스를 구매하세요!"
  );
}

function handleMinePrestigeShop(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var text = "[ 싱봇 광산 ] ⭐ 환생 상점\n";
  text += "━━━━━━━━━━━━━━━━━━\n";
  text += "🌟 보유 별의 파편: " + account.starFragments + "\n\n";

  var shop = MineData.prestigeShop;
  for (var i = 0; i < shop.length; i++) {
    var item = shop[i];
    var currentLevel = account.prestigeBonuses[item.id] || 0;
    text += (i + 1) + ". " + item.name;
    if (currentLevel >= item.maxLevel) {
      text += " [MAX]\n";
    } else {
      text += " (Lv." + currentLevel + "/" + item.maxLevel + ")\n";
      text += "   다음: 🌟" + item.costs[currentLevel] + " — " + item.desc + "\n";
    }
  }

  text += "\n'ㄱㅅ환생구매 [보너스명]'으로 구매";
  replier.reply(text);
}

function handleMinePrestigeBuy(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var input = msg.replace(/^((광산|ㄱㅅ|ㄳ)환생구매)\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ환생구매 [보너스명]\n예) ㄱㅅ환생구매 채굴 효율");
    return;
  }

  var shop = MineData.prestigeShop;
  var target = null;
  for (var i = 0; i < shop.length; i++) {
    if (shop[i].name === input || shop[i].name.indexOf(input) !== -1) {
      target = shop[i];
      break;
    }
  }

  if (!target) {
    replier.reply("[ 싱봇 광산 ] 해당 보너스를 찾을 수 없습니다. 'ㄱㅅ환생상점'에서 확인하세요.");
    return;
  }

  var currentLevel = account.prestigeBonuses[target.id] || 0;
  if (currentLevel >= target.maxLevel) {
    replier.reply("[ 싱봇 광산 ] " + target.name + "은(는) 이미 최대 레벨입니다!");
    return;
  }

  var cost = target.costs[currentLevel];
  if (account.starFragments < cost) {
    replier.reply("[ 싱봇 광산 ] 별의 파편 부족! (필요: " + cost + ", 보유: " + account.starFragments + ")");
    return;
  }

  account.starFragments -= cost;
  account.prestigeBonuses[target.id] = currentLevel + 1;

  // 체력 보너스 즉시 반영
  account.maxStamina = getEffectiveMaxStamina(account);

  saveMineAccount(sender, account);

  replier.reply(
    "[ 싱봇 광산 ] ⭐ 구매 완료!\n\n" +
    target.name + " Lv." + (currentLevel + 1) + "/" + target.maxLevel + "\n" +
    target.desc + "\n" +
    "🌟 잔여: " + account.starFragments
  );
}

// ===== PvP 광산 대결 =====

var mineDuelRequests = {};
var mineDuelSessions = {};

function pvpMineTurn(account) {
  var base = account.pickaxeLevel * 2;
  var flatLuck = 10 + Math.floor(Math.random() * 30);         // 10~39 (레벨 무관 공평한 운)
  var scaleLuck = Math.floor(Math.random() * account.pickaxeLevel); // 레벨 비례 운
  var prestigeBonus = 1 + account.prestigeBonuses.miningPower * 0.10;
  var critChance = 0.15 + (account.prestigeBonuses.luck * 0.01);
  var crit = Math.random() < critChance ? 1.8 : 1;
  return Math.floor((base + flatLuck + scaleLuck) * prestigeBonus * crit);
}

function handleMineDuel(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  if (mineDuelSessions[sender]) {
    replier.reply("[ 싱봇 광산 ] 이미 대결 진행 중입니다. 'ㄱㅅ캐기'로 채굴하세요.");
    return;
  }

  var input = msg.replace(/^((광산|ㄱㅅ|ㄳ)대결|ㅂㅌ)\s*/, "").trim();
  if (!input) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ대결 [상대 광부이름]");
    return;
  }

  // 광부이름으로 먼저 찾고, 없으면 카톡이름으로 시도
  var target = findSenderByMineName(input);
  if (!target) target = input;
  var targetAccount = loadMineAccount(target);
  if (!targetAccount) {
    replier.reply("[ 싱봇 광산 ] '" + input + "' 광부를 찾을 수 없습니다.");
    return;
  }
  if (target === sender) {
    replier.reply("[ 싱봇 광산 ] 자기 자신과 대결할 수 없습니다.");
    return;
  }

  mineDuelRequests[target] = { from: sender, room: room, time: Date.now() };
  replier.reply(
    "[ 싱봇 광산 ] ⚔️ " + account.name + "님이 " + targetAccount.name + "님에게 대결 신청!\n\n" +
    "5턴 채굴 대결 — 더 많이 캔 사람이 승리!\n" +
    target + "님은 'ㄱㅅ대결수락' 또는 'ㄱㅅ대결거절'을 입력하세요."
  );
}

function handleMineDuelAccept(room, msg, sender, replier) {
  var req = mineDuelRequests[sender];
  if (!req) {
    replier.reply("[ 싱봇 광산 ] 받은 대결 요청이 없습니다.");
    return;
  }
  if (Date.now() - req.time > 300000) {
    delete mineDuelRequests[sender];
    replier.reply("[ 싱봇 광산 ] 대결 요청이 만료되었습니다.");
    return;
  }

  var sessionId = req.from + ":" + sender + ":" + Date.now();
  var session = {
    id: sessionId,
    p1: { sender: req.from, total: 0, turns: 0 },
    p2: { sender: sender, total: 0, turns: 0 },
    maxTurns: 5,
    currentTurn: 0,
    room: room
  };
  mineDuelSessions[req.from] = sessionId;
  mineDuelSessions[sender] = sessionId;
  mineDuelSessions[sessionId] = session;
  delete mineDuelRequests[sender];

  replier.reply(
    "[ 싱봇 광산 ] ⚔️ 대결 시작!\n\n" +
    session.p1.sender + " vs " + session.p2.sender + "\n" +
    "5턴 채굴 대결! 'ㄱㅅ캐기'로 채굴하세요."
  );
}

function handleMineDuelDecline(room, msg, sender, replier) {
  if (mineDuelRequests[sender]) {
    var from = mineDuelRequests[sender].from;
    delete mineDuelRequests[sender];
    replier.reply("[ 싱봇 광산 ] " + sender + "님이 대결을 거절했습니다.");
  } else {
    replier.reply("[ 싱봇 광산 ] 받은 대결 요청이 없습니다.");
  }
}

function handleMineDig(room, msg, sender, replier) {
  var sessionId = mineDuelSessions[sender];
  if (!sessionId) { replier.reply("[ 싱봇 광산 ] 진행 중인 대결이 없습니다."); return; }
  var session = mineDuelSessions[sessionId];
  if (!session) { replier.reply("[ 싱봇 광산 ] 진행 중인 대결이 없습니다."); return; }

  var mySlot = session.p1.sender === sender ? session.p1 : session.p2;
  var otherSlot = session.p1.sender === sender ? session.p2 : session.p1;

  if (mySlot.turns > session.currentTurn) {
    replier.reply("[ 싱봇 광산 ] 이번 턴은 이미 채굴했습니다. " + otherSlot.sender + "님을 기다리는 중...");
    return;
  }

  var account = loadMineAccount(sender);
  var mined = pvpMineTurn(account);
  mySlot.total += mined;
  mySlot.turns++;

  // 양쪽 다 이번 턴 완료했는지 체크
  if (mySlot.turns > session.currentTurn && otherSlot.turns > session.currentTurn) {
    session.currentTurn++;
    var text = "[ 싱봇 광산 ] ⚔️ 턴 " + session.currentTurn + "/" + session.maxTurns + "\n";
    text += "━━━━━━━━━━━━━━━━━━\n";
    text += session.p1.sender + ": +" + getLastTurnAmount(session.p1, session.currentTurn) + " (총 " + session.p1.total + ")\n";
    text += session.p2.sender + ": +" + getLastTurnAmount(session.p2, session.currentTurn) + " (총 " + session.p2.total + ")\n";

    if (session.currentTurn >= session.maxTurns) {
      // 대결 종료
      text += "\n━━━━━━━━━━━━━━━━━━\n";
      var acc1 = loadMineAccount(session.p1.sender);
      var acc2 = loadMineAccount(session.p2.sender);
      if (session.p1.total > session.p2.total) {
        text += "🏆 " + session.p1.sender + " 승리!\n";
        acc1.pvpWins++;
        acc2.pvpLosses++;
      } else if (session.p2.total > session.p1.total) {
        text += "🏆 " + session.p2.sender + " 승리!\n";
        acc2.pvpWins++;
        acc1.pvpLosses++;
      } else {
        text += "🤝 무승부!\n";
      }
      text += session.p1.total + " vs " + session.p2.total;
      saveMineAccount(session.p1.sender, acc1);
      saveMineAccount(session.p2.sender, acc2);
      cleanupDuelSession(session);
    }

    replier.reply(text);
  } else {
    replier.reply("[ 싱봇 광산 ] ⛏️ 채굴! +" + mined + " (총 " + mySlot.total + ")\n" + otherSlot.sender + "님을 기다리는 중...");
  }
}

function getLastTurnAmount(slot, currentTurn) {
  // 직전 턴에서 캔 양 (total 차이로 계산은 복잡하므로 표시용)
  return slot.total;
}

function handleMineSurrender(room, msg, sender, replier) {
  var sessionId = mineDuelSessions[sender];
  if (!sessionId) { replier.reply("[ 싱봇 광산 ] 진행 중인 대결이 없습니다."); return; }
  var session = mineDuelSessions[sessionId];

  var other = session.p1.sender === sender ? session.p2.sender : session.p1.sender;
  var accWinner = loadMineAccount(other);
  var accLoser = loadMineAccount(sender);
  accWinner.pvpWins++;
  accLoser.pvpLosses++;
  saveMineAccount(other, accWinner);
  saveMineAccount(sender, accLoser);
  cleanupDuelSession(session);

  replier.reply("[ 싱봇 광산 ] " + sender + "님이 항복! 🏆 " + other + "님 승리!");
}

function cleanupDuelSession(session) {
  delete mineDuelSessions[session.p1.sender];
  delete mineDuelSessions[session.p2.sender];
  delete mineDuelSessions[session.id];
}

// ===== 랭킹 =====

var mineRankingCache = null;
var mineRankingCacheTime = 0;

function handleMineRanking(room, msg, sender, replier) {
  var now = Date.now();
  // 10분 캐시
  if (!mineRankingCache || now - mineRankingCacheTime > 600000) {
    mineRankingCache = buildMineRanking();
    mineRankingCacheTime = now;
  }

  var text = "[ 싱봇 광산 ] 🏆 랭킹\n";
  text += "━━━━━━━━━━━━━━━━━━\n\n";

  text += "⛏️ 최고 깊이:\n";
  for (var i = 0; i < mineRankingCache.depth.length && i < 5; i++) {
    var e = mineRankingCache.depth[i];
    text += "  " + (i + 1) + ". " + e.name + " — 깊이 " + e.value + "\n";
  }

  text += "\n🔨 곡괭이 레벨:\n";
  for (var i = 0; i < mineRankingCache.pickaxe.length && i < 5; i++) {
    var e = mineRankingCache.pickaxe[i];
    text += "  " + (i + 1) + ". " + e.name + " — Lv." + e.value + "\n";
  }

  text += "\n⭐ 프레스티지:\n";
  for (var i = 0; i < mineRankingCache.prestige.length && i < 5; i++) {
    var e = mineRankingCache.prestige[i];
    text += "  " + (i + 1) + ". " + e.name + " — " + e.value + "회\n";
  }

  text += "\n⚔️ PvP 승수:\n";
  for (var i = 0; i < mineRankingCache.pvp.length && i < 5; i++) {
    var e = mineRankingCache.pvp[i];
    text += "  " + (i + 1) + ". " + e.name + " — " + e.value + "승\n";
  }

  if (mineRankingCache.depth.length === 0) {
    text += "\n(아직 데이터가 없습니다)";
  }

  replier.reply(text);
}

function buildMineRanking() {
  var entries = [];
  for (var sender in mineAccounts) {
    if (mineAccounts.hasOwnProperty(sender)) {
      var acc = mineAccounts[sender];
      entries.push(acc);
    }
  }

  // 파일에서도 로드 시도 (캐시 안 된 유저)
  try {
    var files = [];
    try {
      var folder = new java.io.File(MINE_DATA_DIR);
      if (folder.exists()) files = folder.listFiles() || [];
    } catch (e) {}
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.getName().indexOf(".json") !== -1) {
        var senderName = f.getName().replace(".json", "");
        if (!mineAccounts[senderName]) {
          try {
            var fis = new java.io.FileInputStream(f);
            var reader = new java.io.InputStreamReader(fis, "UTF-8");
            var br = new java.io.BufferedReader(reader);
            var data = "";
            var line;
            while ((line = br.readLine()) != null) data += line;
            br.close();
            var acc = JSON.parse(data);
            entries.push(acc);
          } catch (e2) {}
        }
      }
    }
  } catch (e) {}

  var depth = [], pickaxe = [], prestige = [], pvp = [];
  for (var i = 0; i < entries.length; i++) {
    var acc = entries[i];
    depth.push({ name: acc.name, value: acc.maxDepthReached || acc.depth || 0 });
    pickaxe.push({ name: acc.name, value: acc.pickaxeLevel || 0 });
    if (acc.prestigeCount > 0) prestige.push({ name: acc.name, value: acc.prestigeCount });
    if (acc.pvpWins > 0) pvp.push({ name: acc.name, value: acc.pvpWins });
  }

  var sortDesc = function(a, b) { return b.value - a.value; };
  depth.sort(sortDesc);
  pickaxe.sort(sortDesc);
  prestige.sort(sortDesc);
  pvp.sort(sortDesc);

  return { depth: depth, pickaxe: pickaxe, prestige: prestige, pvp: pvp };
}

// ===== 길드 시스템 =====

var MINE_GUILD_FILE = DATA_DIR + "mine_guilds.json";
var mineGuilds = {};

function loadMineGuilds() {
  try {
    var raw = FileStream.read(MINE_GUILD_FILE);
    if (raw) mineGuilds = JSON.parse(raw);
  } catch (e) {
    try {
      var file = new java.io.File(MINE_GUILD_FILE);
      if (file.exists()) {
        var fis = new java.io.FileInputStream(file);
        var reader = new java.io.InputStreamReader(fis, "UTF-8");
        var br = new java.io.BufferedReader(reader);
        var data = "";
        var line;
        while ((line = br.readLine()) != null) data += line;
        br.close();
        mineGuilds = JSON.parse(data);
      }
    } catch (e2) {}
  }
}

function saveMineGuilds() {
  try {
    FileStream.createDir(DATA_DIR);
    FileStream.write(MINE_GUILD_FILE, JSON.stringify(mineGuilds));
  } catch (e) {
    try {
      var file = new java.io.File(MINE_GUILD_FILE);
      var fos = new java.io.FileOutputStream(file);
      var writer = new java.io.OutputStreamWriter(fos, "UTF-8");
      writer.write(JSON.stringify(mineGuilds));
      writer.close();
      fos.close();
    } catch (e2) {
      Log.e("길드 저장 오류: " + e2);
    }
  }
}

function getPlayerGuild(sender) {
  var account = loadMineAccount(sender);
  if (!account || !account.guild) return null;
  return mineGuilds[account.guild] || null;
}

function getGuildBonus(account) {
  if (!account.guild) return { miningPower: 0, idleRate: 0, luck: 0 };
  var guild = mineGuilds[account.guild];
  if (!guild) return { miningPower: 0, idleRate: 0, luck: 0 };
  var perks = MineData.guild.perks;
  return {
    miningPower: guild.level * perks.miningPower,
    idleRate: Math.floor(guild.level / 2) * perks.idleRate,
    luck: Math.floor(guild.level / 3) * perks.luck
  };
}

function handleMineGuildCreate(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  if (account.guild) {
    replier.reply("[ 싱봇 광산 ] 이미 길드에 가입되어 있습니다. (" + account.guild + ")");
    return;
  }
  if (account.prestigeCount < MineData.guild.createPrestigeReq) {
    replier.reply("[ 싱봇 광산 ] 길드 생성에는 프레스티지 " + MineData.guild.createPrestigeReq + "회 이상이 필요합니다. (현재: " + account.prestigeCount + "회)");
    return;
  }

  var guildName = msg.replace(/^(광산|ㄱㅅ|ㄳ)길드생성\s*/, "").trim();
  if (!guildName || guildName.length < 2 || guildName.length > 8) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ길드생성 [길드명]\n길드명: 2~8자");
    return;
  }
  if (mineGuilds[guildName]) {
    replier.reply("[ 싱봇 광산 ] 이미 존재하는 길드명입니다.");
    return;
  }
  if (account.gold < MineData.guild.createCost) {
    replier.reply("[ 싱봇 광산 ] 골드 부족! (필요: " + MineData.guild.createCost + "G, 보유: " + account.gold + "G)");
    return;
  }

  account.gold -= MineData.guild.createCost;
  account.guild = guildName;

  mineGuilds[guildName] = {
    name: guildName,
    leader: sender,
    members: [sender],
    level: 1,
    exp: 0,
    guildDepth: 0,
    totalMined: 0,
    joinRequests: [],
    createdAt: Date.now()
  };

  saveMineAccount(sender, account);
  saveMineGuilds();

  replier.reply(
    "[ 싱봇 광산 ] 🏰 길드 생성 완료!\n\n" +
    "길드명: " + guildName + "\n" +
    "길드장: " + account.name + "\n" +
    "레벨: 1\n\n" +
    "멤버 모집: 'ㄱㅅ길드가입 " + guildName + "'"
  );
}

function handleMineGuildJoin(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  if (account.guild) {
    replier.reply("[ 싱봇 광산 ] 이미 길드에 가입되어 있습니다. (" + account.guild + ")");
    return;
  }

  var guildName = msg.replace(/^(광산|ㄱㅅ|ㄳ)길드가입\s*/, "").trim();
  if (!guildName) {
    replier.reply("[ 싱봇 광산 ] 사용법: ㄱㅅ길드가입 [길드명]");
    return;
  }

  var guild = mineGuilds[guildName];
  if (!guild) {
    replier.reply("[ 싱봇 광산 ] 존재하지 않는 길드입니다.");
    return;
  }
  if (guild.members.length >= MineData.guild.maxMembers) {
    replier.reply("[ 싱봇 광산 ] 길드 인원이 가득 찼습니다. (" + guild.members.length + "/" + MineData.guild.maxMembers + ")");
    return;
  }

  // 가입 요청 추가
  for (var i = 0; i < guild.joinRequests.length; i++) {
    if (guild.joinRequests[i] === sender) {
      replier.reply("[ 싱봇 광산 ] 이미 가입 요청을 보냈습니다. 길드장의 수락을 기다리세요.");
      return;
    }
  }

  guild.joinRequests.push(sender);
  saveMineGuilds();

  replier.reply("[ 싱봇 광산 ] " + guildName + " 길드에 가입 요청을 보냈습니다!\n길드장 " + guild.leader + "님이 'ㄱㅅ길드수락 " + sender + "'로 수락합니다.");
}

function handleMineGuildAccept(room, msg, sender, replier) {
  var guild = getPlayerGuild(sender);
  if (!guild) { replier.reply("[ 싱봇 광산 ] 길드에 가입되어 있지 않습니다."); return; }
  if (guild.leader !== sender) {
    replier.reply("[ 싱봇 광산 ] 길드장만 수락할 수 있습니다.");
    return;
  }

  var target = msg.replace(/^(광산|ㄱㅅ|ㄳ)길드수락\s*/, "").trim();
  if (!target) {
    // 요청 목록 표시
    if (guild.joinRequests.length === 0) {
      replier.reply("[ 싱봇 광산 ] 가입 요청이 없습니다.");
      return;
    }
    var text = "[ 싱봇 광산 ] 가입 요청 목록:\n";
    for (var i = 0; i < guild.joinRequests.length; i++) {
      text += "  " + (i + 1) + ". " + guild.joinRequests[i] + "\n";
    }
    text += "\n'ㄱㅅ길드수락 [이름]'으로 수락";
    replier.reply(text);
    return;
  }

  // 요청 찾기
  var idx = -1;
  for (var i = 0; i < guild.joinRequests.length; i++) {
    if (guild.joinRequests[i] === target) { idx = i; break; }
  }
  if (idx === -1) {
    replier.reply("[ 싱봇 광산 ] " + target + "님의 가입 요청이 없습니다.");
    return;
  }
  if (guild.members.length >= MineData.guild.maxMembers) {
    replier.reply("[ 싱봇 광산 ] 길드 인원이 가득 찼습니다.");
    return;
  }

  guild.joinRequests.splice(idx, 1);
  guild.members.push(target);

  var targetAccount = loadMineAccount(target);
  if (targetAccount) {
    targetAccount.guild = guild.name;
    saveMineAccount(target, targetAccount);
  }

  saveMineGuilds();
  replier.reply("[ 싱봇 광산 ] 🏰 " + target + "님이 " + guild.name + " 길드에 가입했습니다! (" + guild.members.length + "/" + MineData.guild.maxMembers + ")");
}

function handleMineGuildInfo(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var guild = getPlayerGuild(sender);
  if (!guild) {
    replier.reply("[ 싱봇 광산 ] 길드에 가입되어 있지 않습니다.\n'ㄱㅅ길드생성 [이름]' 또는 'ㄱㅅ길드가입 [길드명]'");
    return;
  }

  var levelExp = MineData.guild.levelUpExp;
  var maxExp = guild.level <= levelExp.length ? levelExp[guild.level - 1] : 999999;
  var bonus = getGuildBonus(account);

  var text = "[ 싱봇 광산 ] 🏰 " + guild.name + "\n";
  text += "━━━━━━━━━━━━━━━━━━\n";
  text += "길드장: " + guild.leader + "\n";
  text += "레벨: " + guild.level + " (경험치: " + guild.exp + "/" + maxExp + ")\n";
  text += "멤버: " + guild.members.length + "/" + MineData.guild.maxMembers + "\n";
  text += "길드 깊이: " + guild.guildDepth + "\n";
  text += "총 채굴: " + guild.totalMined + "\n\n";

  text += "📊 길드 보너스:\n";
  if (bonus.miningPower > 0) text += "  ⛏️ 채굴력 +" + Math.round(bonus.miningPower * 100) + "%\n";
  if (bonus.idleRate > 0) text += "  💤 방치 +" + Math.round(bonus.idleRate * 100) + "%\n";
  if (bonus.luck > 0) text += "  🍀 행운 +" + Math.round(bonus.luck * 100) + "%\n";

  text += "\n👥 멤버:\n";
  for (var i = 0; i < guild.members.length; i++) {
    var m = guild.members[i];
    var mAcc = loadMineAccount(m);
    var prefix = m === guild.leader ? "👑 " : "  ";
    text += prefix + (mAcc ? mAcc.name : m) + "\n";
  }

  if (guild.joinRequests.length > 0) {
    text += "\n📩 가입 요청: " + guild.joinRequests.length + "건";
  }

  replier.reply(text);
}

function handleMineGuildMine(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account) { replier.reply("[ 싱봇 광산 ] 먼저 'ㄱㅅ등록 [이름]'으로 등록하세요!"); return; }

  var guild = getPlayerGuild(sender);
  if (!guild) {
    replier.reply("[ 싱봇 광산 ] 길드에 가입되어 있지 않습니다.");
    return;
  }

  regenStamina(account);
  if (account.stamina <= 0) {
    replier.reply("[ 싱봇 광산 ] 체력이 부족합니다!");
    return;
  }

  account.stamina--;
  account.lastActiveTime = Date.now();

  // 길드 채굴: 개인 파워 기반으로 길드 경험치 + 깊이 기여
  var power = getPickaxePower(account);
  var contribution = Math.floor(power * (1 + Math.random() * 0.5));

  guild.exp += contribution;
  guild.totalMined++;
  guild.guildDepth += 1;

  // 레벨업 체크
  var levelExp = MineData.guild.levelUpExp;
  var leveledUp = false;
  while (guild.level <= levelExp.length && guild.exp >= levelExp[guild.level - 1]) {
    guild.exp -= levelExp[guild.level - 1];
    guild.level++;
    leveledUp = true;
  }

  // 개인 보상 (소량 골드 + 자원)
  var goldReward = Math.floor(10 + power * 0.5);
  account.gold += goldReward;
  account.totalGoldEarned += goldReward;

  saveMineAccount(sender, account);
  saveMineGuilds();

  var text = "[ 싱봇 광산 ] 🏰 길드 채굴!\n\n";
  text += "기여도: +" + contribution + " exp\n";
  text += "개인 보상: +" + goldReward + "G\n";
  text += "길드 깊이: " + guild.guildDepth + "\n";
  text += "체력: " + account.stamina + "/" + account.maxStamina + "\n";

  if (leveledUp) {
    text += "\n🎉 길드 레벨 업! Lv." + guild.level + "\n";
    var bonus = getGuildBonus(account);
    if (bonus.miningPower > 0) text += "  ⛏️ 채굴력 +" + Math.round(bonus.miningPower * 100) + "%\n";
    if (bonus.idleRate > 0) text += "  💤 방치 +" + Math.round(bonus.idleRate * 100) + "%\n";
    if (bonus.luck > 0) text += "  🍀 행운 +" + Math.round(bonus.luck * 100) + "%\n";
  }

  replier.reply(text);
}

function handleMineGuildLeave(room, msg, sender, replier) {
  var account = loadMineAccount(sender);
  if (!account || !account.guild) {
    replier.reply("[ 싱봇 광산 ] 길드에 가입되어 있지 않습니다.");
    return;
  }

  var guild = mineGuilds[account.guild];
  if (!guild) {
    account.guild = null;
    saveMineAccount(sender, account);
    replier.reply("[ 싱봇 광산 ] 길드를 탈퇴했습니다.");
    return;
  }

  if (guild.leader === sender) {
    // 길드장이 탈퇴 → 길드 해산
    for (var i = 0; i < guild.members.length; i++) {
      var mAcc = loadMineAccount(guild.members[i]);
      if (mAcc) {
        mAcc.guild = null;
        saveMineAccount(guild.members[i], mAcc);
      }
    }
    delete mineGuilds[guild.name];
    saveMineGuilds();
    replier.reply("[ 싱봇 광산 ] 길드장 탈퇴로 " + guild.name + " 길드가 해산되었습니다.");
    return;
  }

  // 일반 멤버 탈퇴
  var idx = -1;
  for (var i = 0; i < guild.members.length; i++) {
    if (guild.members[i] === sender) { idx = i; break; }
  }
  if (idx !== -1) guild.members.splice(idx, 1);

  account.guild = null;
  saveMineAccount(sender, account);
  saveMineGuilds();

  replier.reply("[ 싱봇 광산 ] " + guild.name + " 길드를 탈퇴했습니다.");
}

// 길드 보너스를 기존 계산에 반영하는 래퍼
// (getPickaxePower, calculateIdleIncome, doMine에서 이미 prestige/codex/equip 보너스 적용 중)
// 길드 보너스는 채굴 시 추가 적용

// 길드 데이터 초기 로드
try { loadMineGuilds(); } catch (e) {}

// ===== 커맨드 등록 =====

// 광산 → ㄱㅅ/ㄳ 축약어 자동 생성
function _mt(triggers) {
  var result = [];
  for (var i = 0; i < triggers.length; i++) {
    result.push(triggers[i]);
    if (triggers[i].indexOf("광산") === 0) {
      result.push("ㄱㅅ" + triggers[i].substring(2));
      result.push("ㄳ" + triggers[i].substring(2));
    }
  }
  return result;
}

var MINE_COMMANDS = [
  { triggers: _mt(["광산등록"]), handler: handleMineRegister, hasArgs: true },
  { triggers: ["채굴", "ㅊㄱ"], handler: handleMine },
  { triggers: _mt(["광산정보"]).concat(["ㄳㅈㅂ"]), handler: handleMineInfo },
  { triggers: ["곡괭이강화", "ㄱㅎ"], handler: handlePickaxeUpgrade },
  { triggers: ["곡괭이정보", "ㄱㅈㅂ"], handler: handlePickaxeInfo },
  { triggers: _mt(["광산인벤토리", "광산인벤"]).concat(["ㅇㅂ"]), handler: handleMineInventory },
  { triggers: _mt(["광산도감"]).concat(["ㄷㄱ"]), handler: handleMineCodex },
  { triggers: _mt(["광산상점"]).concat(["ㄳㅅㅈ"]), handler: handleMineShop },
  { triggers: _mt(["광산구매"]).concat(["ㄳㅅ"]), handler: handleMineBuy, hasArgs: true },
  { triggers: _mt(["광산판매"]).concat(["ㄳㅍ"]), handler: handleMineSell, hasArgs: true },
  // Phase 2: 장비
  { triggers: _mt(["광산장비"]).concat(["ㅈㅂ"]), handler: handleMineEquipInfo },
  { triggers: _mt(["광산제작목록"]).concat(["ㄳㅁㄹ"]), handler: handleMineCraftList },
  { triggers: _mt(["광산제작"]).concat(["ㄳㅈㅈ"]), handler: handleMineCraft, hasArgs: true },
  { triggers: _mt(["광산해제"]).concat(["ㄳㅎㅈ"]), handler: handleMineUnequip, hasArgs: true },
  // Phase 2: 거래
  { triggers: _mt(["광산거래신청"]), handler: handleMineTradeRequest, hasArgs: true },
  { triggers: _mt(["광산거래수락"]), handler: handleMineTradeAccept },
  { triggers: _mt(["광산거래거절"]), handler: handleMineTradeDecline },
  { triggers: _mt(["광산거래올리기"]), handler: handleMineTradeOffer, hasArgs: true },
  { triggers: _mt(["광산거래골드"]), handler: handleMineTradeGold, hasArgs: true },
  { triggers: _mt(["광산거래확인"]), handler: handleMineTradeConfirm },
  { triggers: _mt(["광산거래취소"]), handler: handleMineTradeCancel },
  // Phase 2: 시장
  { triggers: _mt(["광산시장"]).concat(["ㄳㅅㅅ"]), handler: handleMineMarket },
  { triggers: _mt(["광산시장판매"]).concat(["ㅅㅈㅍ"]), handler: handleMineMarketSell, hasArgs: true },
  // Phase 3: 프레스티지
  { triggers: _mt(["광산환생"]), handler: handleMinePrestige, hasArgs: true },
  { triggers: _mt(["광산환생상점"]), handler: handleMinePrestigeShop },
  { triggers: _mt(["광산환생구매"]), handler: handleMinePrestigeBuy, hasArgs: true },
  // Phase 3: PvP
  { triggers: _mt(["광산대결"]).concat(["ㅂㅌ"]), handler: handleMineDuel, hasArgs: true },
  { triggers: _mt(["광산대결수락"]).concat(["ㅂㅌㅇ"]), handler: handleMineDuelAccept },
  { triggers: _mt(["광산대결거절"]).concat(["ㅂㅌㄴ"]), handler: handleMineDuelDecline },
  { triggers: _mt(["광산캐기"]).concat(["ㅋㄱ"]), handler: handleMineDig },
  { triggers: _mt(["광산항복"]).concat(["ㅎㅂ"]), handler: handleMineSurrender },
  // Phase 3: 랭킹
  { triggers: _mt(["광산랭킹"]).concat(["ㄹㅋ"]), handler: handleMineRanking },
  // Phase 4: 길드
  { triggers: _mt(["광산길드생성"]), handler: handleMineGuildCreate, hasArgs: true },
  { triggers: _mt(["광산길드가입"]), handler: handleMineGuildJoin, hasArgs: true },
  { triggers: _mt(["광산길드수락"]), handler: handleMineGuildAccept, hasArgs: true },
  { triggers: _mt(["광산길드정보"]), handler: handleMineGuildInfo },
  { triggers: _mt(["광산길드채굴"]), handler: handleMineGuildMine },
  { triggers: _mt(["광산길드탈퇴"]), handler: handleMineGuildLeave },
  { triggers: _mt(["광산도움말"]), handler: handleMineHelp },
  // Phase 5: 도박/퀘스트/칭호
  { triggers: _mt(["광산도박"]).concat(["ㄷㅂ"]), handler: handleGamble, hasArgs: true },
  { triggers: _mt(["광산도박기록"]).concat(["ㄷㅂㄱㄹ"]), handler: handleGambleStats },
  { triggers: _mt(["광산퀘스트보상"]).concat(["ㄳㅋㅈ"]), handler: handleDailyQuestClaim },
  { triggers: _mt(["광산퀘스트"]).concat(["ㄳㅋ"]), handler: handleDailyQuest },
  { triggers: _mt(["광산상인구매"]), handler: handleMerchantBuy },
  { triggers: _mt(["광산칭호장착"]), handler: handleTitleEquip, hasArgs: true },
  { triggers: _mt(["광산칭호"]), handler: handleTitleList }
];

for (var _mineCmdIdx = 0; _mineCmdIdx < MINE_COMMANDS.length; _mineCmdIdx++) {
  MINE_COMMANDS[_mineCmdIdx].handler = (function(originalHandler) {
    return function(room, msg, sender, replier) {
      getMineData();
      return originalHandler(room, msg, sender, replier);
    };
  })(MINE_COMMANDS[_mineCmdIdx].handler);
}
// ===== CGV 용아맥 상영 알림 연동 =====

var CGV_NTFY_TOPIC = "kelvin-cgv-imax";
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
// ===== 냥냥이 게임 데이터 =====

var CatData = null;

function getCatData() {
  if (CatData) return CatData;
  CatData = loadJsonData("data/cat_db.json");
  return CatData;
}

function ensureCatDataLoaded() {
  return getCatData();
}
// ===== 싱봇 냥냥이 게임 =====

var CAT_DATA_DIR = DATA_DIR + "cat_data/";
var catAccounts = {};

// === 유틸리티 ===

function saveCatAccount(sender, account) {
  catAccounts[sender] = account;
  var fileName = sanitizeSender(sender) + ".json";
  try {
    FileStream.createDir(CAT_DATA_DIR);
    FileStream.write(CAT_DATA_DIR + fileName, JSON.stringify(account));
  } catch (e) {
    try {
      var folder = new java.io.File(CAT_DATA_DIR);
      if (!folder.exists()) folder.mkdirs();
      var file = new java.io.File(folder, fileName);
      var fos = new java.io.FileOutputStream(file);
      var writer = new java.io.OutputStreamWriter(fos, "UTF-8");
      writer.write(JSON.stringify(account));
      writer.close();
      fos.close();
    } catch (e2) {
      Log.e("냥냥이 저장 오류: " + e2);
    }
  }
}

function loadCatAccount(sender) {
  if (catAccounts[sender]) return catAccounts[sender];
  var fileName = sanitizeSender(sender) + ".json";
  try {
    var raw = FileStream.read(CAT_DATA_DIR + fileName);
    if (raw) {
      catAccounts[sender] = JSON.parse(raw);
      return catAccounts[sender];
    }
  } catch (e) {}
  try {
    var file = new java.io.File(CAT_DATA_DIR, fileName);
    if (file.exists()) {
      var fis = new java.io.FileInputStream(file);
      var reader = new java.io.InputStreamReader(fis, "UTF-8");
      var br = new java.io.BufferedReader(reader);
      var data = "";
      var line;
      while ((line = br.readLine()) != null) data += line;
      br.close();
      reader.close();
      fis.close();
      catAccounts[sender] = JSON.parse(data);
      return catAccounts[sender];
    }
  } catch (e2) {}
  return null;
}

// 초성 단축키 헬퍼
function _ct(triggers) {
  var result = [];
  for (var i = 0; i < triggers.length; i++) {
    result.push(triggers[i]);
    if (triggers[i].indexOf("냥냥이") === 0) {
      result.push("ㄴㄴㅇ" + triggers[i].substring(3));
    }
  }
  return result;
}

// 랜덤 범위 정수
function catRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 가중치 랜덤 선택
function catWeightedPick(items, weightKey) {
  var total = 0;
  for (var i = 0; i < items.length; i++) total += (items[i][weightKey] || 1);
  var r = Math.random() * total;
  var sum = 0;
  for (var i = 0; i < items.length; i++) {
    sum += (items[i][weightKey] || 1);
    if (r < sum) return items[i];
  }
  return items[items.length - 1];
}

// 스탯 바
function catStatBar(value, max) {
  max = max || 100;
  var filled = Math.round((value / max) * 10);
  var bar = "";
  for (var i = 0; i < 10; i++) {
    bar += i < filled ? "■" : "□";
  }
  return "[" + bar + "] " + value;
}

// === 계정 생성 ===

function createCatAccount(sender, name) {
  var data = getCatData();
  var breeds = data.breeds;

  // 품종 가중치 선택
  var breedList = [];
  for (var id in breeds) {
    if (breeds.hasOwnProperty(id)) {
      breedList.push({ id: id, weight: breeds[id].weight });
    }
  }
  var breedPick = catWeightedPick(breedList, "weight");
  var breed = breeds[breedPick.id];

  // 성격 랜덤 생성 (품종 범위 내)
  var personality = {};
  var pKeys = ["curiosity", "affection", "mischief", "bravery", "laziness"];
  for (var i = 0; i < pKeys.length; i++) {
    var range = breed.personality[pKeys[i]];
    personality[pKeys[i]] = catRandInt(range[0], range[1]);
  }

  // 무늬 & 눈색
  var furPattern = pickRandom(data.furPatterns);
  var eyeColor = pickRandom(data.eyeColors);

  // 특성 2개 랜덤
  var shuffled = data.traits.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }
  var traits = [shuffled[0].id, shuffled[1].id];

  return {
    name: name,
    sender: sender,
    createdAt: Date.now(),
    lastInteractTime: Date.now(),
    lastDecayCalc: Date.now(),

    breed: breedPick.id,
    furPattern: furPattern.id,
    eyeColor: eyeColor.id,
    personality: personality,
    traits: traits,

    stage: 0,
    stageProgress: 0,
    hatchCount: 0,
    lastHatchTime: 0,
    ageDays: 0,
    totalInteractions: 0,

    hunger: 80,
    happiness: 70,
    energy: 90,
    trust: 10,
    health: 100,

    fishCoins: data.config.INITIAL_FISH,
    starDust: 0,

    inventory: [],
    wardrobe: [],
    currentOutfit: null,
    discoveredTreasures: {},
    trickBook: [],

    activeAdventure: null,
    adventureLog: [],
    adventureCount: 0,
    uniqueLocations: [],

    catFriends: [],
    rivalCat: null,
    socialCooldown: 0,

    lastDreamCheck: Date.now(),
    dreamJournal: [],

    achievements: [],
    titles: { unlocked: [], equipped: null },
    stats: {
      totalFeedings: 0,
      totalPlays: 0,
      totalAdventures: 0,
      totalTricksLearned: 0,
      totalFishEarned: 0,
      totalTreasuresFound: 0,
      longestStreak: 0,
      currentStreak: 0,
      lastStreakDate: "",
      neglectCount: 0,
      perfectDays: 0
    },
    dailyActions: { date: "", fed: 0, played: 0, trained: 0, adventureSent: 0 },
    pendingEvent: null,
    prestigeCount: 0,
    secretFlags: {}
  };
}

// === 스탯 감소 ===

function applyCatDecay(account) {
  var now = Date.now();
  var elapsed = now - account.lastDecayCalc;
  var hours = elapsed / 3600000;
  if (hours < 0.1) return;

  var cfg = getCatData().config;
  account.hunger = Math.max(0, account.hunger - Math.floor(hours * cfg.HUNGER_DECAY_PER_HOUR));
  account.happiness = Math.max(0, account.happiness - Math.floor(hours * cfg.HAPPINESS_DECAY_PER_HOUR));
  account.energy = Math.min(100, account.energy + Math.floor(hours * cfg.ENERGY_REGEN_PER_HOUR));

  if (hours > cfg.TRUST_DECAY_AFTER_HOURS && account.trust > 0) {
    account.trust = Math.max(0, Math.floor(account.trust - (hours - cfg.TRUST_DECAY_AFTER_HOURS) * cfg.TRUST_DECAY_PER_HOUR));
  }

  if (account.hunger === 0 || account.happiness === 0) {
    var sickTicks = Math.floor(hours / 6);
    if (sickTicks > 0) {
      account.health = Math.max(0, account.health - sickTicks * cfg.HEALTH_DECAY_PER_6H_NEGLECT);
    }
  }

  // 특성: 자가치유
  if (account.traits && account.traits.indexOf("healer") !== -1 && account.health < 100) {
    account.health = Math.min(100, account.health + Math.floor(hours * 0.5));
  }

  account.lastDecayCalc = now;
}

// === 일일 초기화 ===

function resetCatDaily(account) {
  var today = todayString();
  if (account.dailyActions.date !== today) {
    // 스트릭 체크
    var yesterday = account.dailyActions.date;
    if (yesterday) {
      var yd = new Date(yesterday);
      var td = new Date(today);
      var diff = Math.round((td - yd) / 86400000);
      if (diff === 1) {
        account.stats.currentStreak++;
        if (account.stats.currentStreak > account.stats.longestStreak) {
          account.stats.longestStreak = account.stats.currentStreak;
        }
      } else if (diff > 1) {
        account.stats.currentStreak = 1;
      }
    } else {
      account.stats.currentStreak = 1;
    }
    account.stats.lastStreakDate = today;

    // 나이 갱신
    var ageMs = Date.now() - account.createdAt;
    account.ageDays = Math.floor(ageMs / 86400000);

    account.dailyActions = { date: today, fed: 0, played: 0, trained: 0, adventureSent: 0 };
  }
}

// === 꿈 시스템 ===

function checkAndGenerateDream(account) {
  var now = Date.now();
  var idleMs = now - account.lastInteractTime;
  var cfg = getCatData().config;

  if (idleMs < cfg.DREAM_MIN_IDLE_MS) return null;
  if (account.stage === 0) return null;

  var data = getCatData();
  var dreams = data.dreams;

  // 성격 기반 가중치 조정
  var weighted = [];
  for (var i = 0; i < dreams.length; i++) {
    var d = dreams[i];
    var w = d.weight || 5;
    if (d.personalityWeight) {
      var parts = d.personalityWeight.split("_");
      var stat = parts[0];
      var dir = parts[1];
      var val = account.personality[stat] || 50;
      if (dir === "high" && val > 60) w += 5;
      else if (dir === "low" && val < 40) w += 5;
    }
    // 특성: 몽상가 보너스
    var dreamBonus = (account.traits && account.traits.indexOf("dreamer") !== -1) ? 2 : 1;
    weighted.push({ idx: i, weight: w });
  }

  var pick = catWeightedPick(weighted, "weight");
  var dream = dreams[pick.idx];

  var dreamText = dream.text.split("{name}").join(account.name);
  var statValue = dream.value || 0;
  var coins = dream.coins || 0;

  // 몽상가 특성: 보상 2배
  if (account.traits && account.traits.indexOf("dreamer") !== -1) {
    statValue = Math.floor(statValue * 2);
    coins = Math.floor(coins * 2);
  }

  // 스탯 적용
  if (dream.stat && statValue !== 0) {
    account[dream.stat] = Math.max(0, Math.min(100, (account[dream.stat] || 0) + statValue));
  }
  if (coins > 0) {
    account.fishCoins += coins;
    account.stats.totalFishEarned += coins;
  }

  account.lastDreamCheck = now;

  // 꿈 일지 저장 (최근 3개)
  account.dreamJournal.push({ text: dreamText, time: now });
  if (account.dreamJournal.length > 3) account.dreamJournal.shift();

  var msg = "💤 " + account.name + "(이)가 자는 동안 꿈을 꿨어요...\n\n";
  msg += "\"" + dreamText + "\"\n\n";

  var effects = [];
  if (dream.stat && statValue !== 0) {
    var emoji = { hunger: "🍖", happiness: "😊", energy: "⚡", trust: "💕", health: "❤️" };
    effects.push((emoji[dream.stat] || "📊") + " " + dream.stat + " " + (statValue > 0 ? "+" : "") + statValue);
  }
  if (coins > 0) effects.push("🐟 +" + coins);
  if (effects.length > 0) msg += effects.join(" | ");

  return msg;
}

// === 성장 체크 ===

function checkCatStageUp(account) {
  if (account.stage === 0) return null;
  var data = getCatData();
  if (account.stage >= data.stages.length - 1) return null;
  var nextStage = data.stages[account.stage + 1];
  if (!nextStage) return null;
  if (account.stageProgress >= nextStage.xpReq) {
    account.stage++;
    account.stageProgress = 0;
    return { newStage: account.stage, name: nextStage.name, emoji: nextStage.emoji };
  }
  return null;
}

// === 성격 텍스트 ===

function getCatPersonalityText(personality) {
  var traits = [];
  if (personality.curiosity > 70) traits.push("호기심왕");
  else if (personality.curiosity < 30) traits.push("무관심");
  if (personality.affection > 70) traits.push("애교쟁이");
  else if (personality.affection < 30) traits.push("도도함");
  if (personality.mischief > 70) traits.push("장난꾸러기");
  if (personality.bravery > 70) traits.push("겁없는");
  else if (personality.bravery < 30) traits.push("겁쟁이");
  if (personality.laziness > 70) traits.push("게으름뱅이");
  else if (personality.laziness < 30) traits.push("활발한");
  if (traits.length === 0) traits.push("평범한");
  return traits.join(" · ");
}

// === 핸들러: 등록 ===

function handleCatRegister(room, msg, sender, replier) {
  var existing = loadCatAccount(sender);
  if (existing) {
    replier.reply("[ 싱봇 냥냥이 ] 이미 고양이가 있어요!\n'" + existing.name + "' (이)가 기다리고 있어요 🐱");
    return;
  }

  var name = msg.replace(/^(냥냥이등록|ㄴㄴㅇ등록)\s*/, "").trim();
  if (!name) {
    replier.reply("[ 싱봇 냥냥이 ] 이름을 정해주세요!\n예) 냥냥이등록 나비");
    return;
  }
  if (name.length > 10) {
    replier.reply("[ 싱봇 냥냥이 ] 이름은 10자 이하로 해주세요!");
    return;
  }

  var account = createCatAccount(sender, name);
  saveCatAccount(sender, account);

  replier.reply(
    "[ 싱봇 냥냥이 ] 🥚 알이 도착했어요!\n" +
    "━━━━━━━━━━━━━━━━━━\n" +
    "누군가 문 앞에 따뜻한 알을 놓고 갔어요...\n\n" +
    "🥚 ???의 알\n" +
    "이름: " + name + "\n" +
    "무늬가 어렴풋이 보여요... " + getCatData().furPatterns.filter(function(p) { return p.id === account.furPattern; })[0].name + "?\n\n" +
    "'냥냥이돌봐' 로 알을 따뜻하게 해주세요!\n" +
    "3번 돌보면 부화합니다! 🐣"
  );
}

// === 핸들러: 돌봐 (부화 + 쓰다듬기) ===

function handleCatCare(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  // 알 상태: 부화 진행
  if (account.stage === 0) {
    var now = Date.now();
    var cfg = getCatData().config;
    if (account.lastHatchTime && now - account.lastHatchTime < cfg.HATCH_MIN_INTERVAL_MS) {
      var remain = Math.ceil((cfg.HATCH_MIN_INTERVAL_MS - (now - account.lastHatchTime)) / 60000);
      replier.reply("[ 싱봇 냥냥이 ] 🥚 알이 아직 따뜻해요!\n" + remain + "분 후에 다시 돌봐주세요.");
      return;
    }

    account.hatchCount = (account.hatchCount || 0) + 1;
    account.lastHatchTime = now;
    saveCatAccount(sender, account);

    if (account.hatchCount >= cfg.HATCH_INTERACTIONS) {
      // 부화!
      account.stage = 1;
      account.stageProgress = 0;
      saveCatAccount(sender, account);

      var data = getCatData();
      var breed = data.breeds[account.breed];
      var fur = data.furPatterns.filter(function(p) { return p.id === account.furPattern; })[0];
      var eye = data.eyeColors.filter(function(e) { return e.id === account.eyeColor; })[0];
      var traitTexts = [];
      for (var i = 0; i < account.traits.length; i++) {
        var t = data.traits.filter(function(tr) { return tr.id === account.traits[i]; })[0];
        if (t) traitTexts.push("  🏷️ " + t.name + " — " + t.desc);
      }

      replier.reply(
        "[ 싱봇 냥냥이 ] 🐣 부화했어요!\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        breed.emoji + " " + account.name + " (아기 고양이)\n" +
        "품종: " + breed.name + "\n" +
        "무늬: " + fur.emoji + " " + fur.name + "\n" +
        "눈: " + eye.emoji + " " + eye.name + "\n" +
        "성격: " + getCatPersonalityText(account.personality) + "\n\n" +
        "고유 특성:\n" + traitTexts.join("\n") + "\n\n" +
        breed.desc + "\n\n" +
        "'냥냥이' 로 상태를 확인하세요!"
      );
      return;
    }

    var remaining = cfg.HATCH_INTERACTIONS - account.hatchCount;
    var progress = "";
    for (var i = 0; i < account.hatchCount; i++) progress += "🔥";
    for (var i = 0; i < remaining; i++) progress += "⬜";

    replier.reply(
      "[ 싱봇 냥냥이 ] 🥚 알을 따뜻하게 감싸줬어요!\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "부화 진행: " + progress + " (" + account.hatchCount + "/" + cfg.HATCH_INTERACTIONS + ")\n" +
      (remaining === 1 ? "거의 다 됐어요! 한 번만 더!" : remaining + "번 더 돌봐주세요!") + "\n" +
      "(10분 간격으로 돌봐주세요)"
    );
    return;
  }

  // 일반 쓰다듬기
  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  account.happiness = Math.min(100, account.happiness + 5);
  account.trust = Math.min(100, account.trust + 1);
  account.stageProgress += 2;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();
  saveCatAccount(sender, account);

  var reactions = [
    account.name + "(이)가 그르릉거리며 머리를 비벼요 💕",
    account.name + "(이)가 눈을 살짝 감고 편안해했어요 😌",
    account.name + "(이)가 꼬리를 살랑살랑 흔들어요 🐾",
    account.name + "(이)가 배를 보여주며 뒹굴었어요! 😸",
    account.name + "(이)가 손을 핥아줬어요 👅"
  ];

  var text = "[ 싱봇 냥냥이 ] 🐾 쓰다듬기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n😊 행복 +5 | 💕 신뢰 +1";
  replier.reply(text);
}

// === 핸들러: 상태 확인 ===

function handleCatInfo(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (account.stage === 0) {
    var cfg = getCatData().config;
    var progress = (account.hatchCount || 0) + "/" + cfg.HATCH_INTERACTIONS;
    replier.reply(
      "[ 싱봇 냥냥이 ] 🥚 " + account.name + "의 알\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "부화 진행: " + progress + "\n" +
      "'냥냥이돌봐' 로 알을 따뜻하게 해주세요!"
    );
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);
  account.lastInteractTime = Date.now();
  saveCatAccount(sender, account);

  var data = getCatData();
  var breed = data.breeds[account.breed];
  var fur = data.furPatterns.filter(function(p) { return p.id === account.furPattern; })[0];
  var eye = data.eyeColors.filter(function(e) { return e.id === account.eyeColor; })[0];
  var stage = data.stages[account.stage];
  var nextXP = account.stage < data.stages.length - 1 ? data.stages[account.stage + 1].xpReq : "MAX";

  var outfitText = account.currentOutfit ? (" | 👗 " + account.currentOutfit) : "";
  var genText = account.prestigeCount > 0 ? " (" + (account.prestigeCount + 1) + "세대)" : "";

  var text = "[ 싱봇 냥냥이 ] " + breed.emoji + " " + account.name + "\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";

  text += breed.emoji + " " + breed.name + " | " + fur.emoji + fur.name + " | " + eye.emoji + eye.name + "\n";
  if (account.currentOutfit) text += "👗 " + account.currentOutfit + "\n";
  if (account.titles.equipped) text += "🏷️ " + account.titles.equipped + genText + "\n";

  text += "\n📊 상태:\n";
  text += "  🍖 배고픔: " + catStatBar(account.hunger) + "\n";
  text += "  😊 행복:   " + catStatBar(account.happiness) + "\n";
  text += "  ⚡ 에너지: " + catStatBar(account.energy) + "\n";
  text += "  💕 신뢰:   " + catStatBar(account.trust) + "\n";
  text += "  ❤️ 건강:   " + catStatBar(account.health) + "\n";

  text += "\n🐾 " + stage.name + " (Lv." + account.stage + ") — " + account.stageProgress + "/" + nextXP + " XP\n";
  text += "📅 나이: " + account.ageDays + "일";
  if (account.stats.currentStreak > 1) text += " | 🔥 연속 " + account.stats.currentStreak + "일";
  text += "\n";

  text += "\n💰 🐟 " + account.fishCoins;
  if (account.starDust > 0) text += " | ✨ " + account.starDust;
  text += "\n";

  text += "\n🎯 오늘: 밥 " + account.dailyActions.fed + "/" + data.config.MAX_DAILY_FEED;
  text += " | 놀기 " + account.dailyActions.played + "/" + data.config.MAX_DAILY_PLAY;
  text += "\n";

  text += "\n성격: " + getCatPersonalityText(account.personality);

  // 모험 진행 중?
  if (account.activeAdventure) {
    var adv = account.activeAdventure;
    var remain = Math.max(0, Math.ceil((adv.returnTime - Date.now()) / 60000));
    if (remain > 0) {
      text += "\n\n🗺️ " + adv.locationName + " 모험 중! (남은 " + remain + "분)";
    } else {
      text += "\n\n🗺️ 모험 완료! 'ㅁㅎㄱㄱ'로 결과 확인!";
    }
  }

  // 비밀진화 힌트
  var evoHint = getEvolutionHint(account);
  if (evoHint) text += "\n\n🔮 " + evoHint;

  // 비밀진화 체크
  var evo = checkSecretEvolution(account);
  if (evo) {
    account.stage = 5;
    account.secretFlags.evolution = evo.id;
    saveCatAccount(sender, account);
    text += "\n\n━━━━━━━━━━━━━━━━━━\n" + evo.emoji + " 비밀진화! " + evo.name + "!\n" + evo.desc + "\n보너스: " + evo.bonus;
  }

  text += "\n\n'ㅁㅁ' 밥 | 'ㄴㄹ' 놀기 | 'ㅁㅎ' 모험 | 'ㄴㄴㄷ' 도움말";
  replier.reply(text);
}

// === 핸들러: 밥 주기 ===

function handleCatFeed(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 밥을 못 먹어요! 'ㄴㄴㅇ돌봐'로 부화시켜주세요.");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  var data = getCatData();

  // 일일 제한
  if (account.dailyActions.fed >= data.config.MAX_DAILY_FEED) {
    replier.reply("[ 싱봇 냥냥이 ] 오늘은 이미 " + data.config.MAX_DAILY_FEED + "번 먹었어요!\n배가 너무 불러요! 🤢");
    return;
  }

  var foodName = msg.replace(/^(냥냥이밥|ㄴㄴㅇ밥|ㅁㅁ)\s*/, "").trim() || "건사료";
  var food = data.foods[foodName];
  if (!food) {
    var foodList = [];
    for (var fn in data.foods) {
      if (data.foods.hasOwnProperty(fn)) {
        foodList.push("  " + fn + " (" + data.foods[fn].cost + "🐟) — " + data.foods[fn].desc);
      }
    }
    replier.reply(
      "[ 싱봇 냥냥이 ] 🍖 음식 목록\n━━━━━━━━━━━━━━━━━━\n" +
      foodList.join("\n") + "\n\n'ㅁㅁ [음식이름]' 으로 먹여주세요!"
    );
    return;
  }

  // 돈 체크
  if (account.fishCoins < food.cost) {
    replier.reply("[ 싱봇 냥냥이 ] 🐟 물고기코인이 부족해요!\n필요: " + food.cost + " | 보유: " + account.fishCoins);
    return;
  }

  account.fishCoins -= food.cost;

  // 음식 효과 적용
  var hungerGain = food.hunger || 0;
  var happyGain = food.happiness || 0;
  var energyGain = food.energy || 0;
  var trustGain = food.trust || 0;

  // 특성: 먹보 보너스
  if (account.traits && account.traits.indexOf("foodie") !== -1) {
    hungerGain += 5;
  }

  // 특성: 까다로운 입맛
  if (account.traits && account.traits.indexOf("picky") !== -1) {
    if (food.cost < 30) {
      happyGain -= 10;
    } else {
      happyGain += 10;
    }
  }

  // 성격 반응
  var reaction = "";
  if (account.personality.affection > 70) {
    trustGain += 2;
    reaction = account.name + "(이)가 그르릉거리며 맛있게 먹어요 💕";
  } else if (account.personality.mischief > 70) {
    reaction = account.name + "(이)가 " + foodName + "을(를) 가지고 놀다가 먹었어요 😼";
  } else if (account.personality.laziness > 70) {
    reaction = account.name + "(이)가 느긋하게 다가와서... 천천히 먹기 시작했어요 😴";
  } else {
    reaction = account.name + "(이)가 " + foodName + "을(를) 맛있게 먹었어요! 😋";
  }

  account.hunger = Math.min(100, account.hunger + hungerGain);
  account.happiness = Math.max(0, Math.min(100, account.happiness + happyGain));
  account.energy = Math.min(100, account.energy + energyGain);
  account.trust = Math.min(100, account.trust + trustGain);

  // 우유 배탈
  var sickMsg = "";
  if (food.sickChance && Math.random() < food.sickChance) {
    account.health = Math.max(0, account.health - (food.sickDamage || 5));
    sickMsg = "\n⚠️ 배탈이 났어요! 건강 -" + (food.sickDamage || 5);
  }

  // 고급캔 XP 보너스
  var bonusXP = food.bonusXP || 0;
  account.stageProgress += 2 + bonusXP;
  account.dailyActions.fed++;
  account.stats.totalFeedings++;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  // 퀘스트 진행
  generateCatDailyQuests(account);
  updateCatQuestProgress(account, "feed", foodName);

  var stageUp = checkCatStageUp(account);
  var newAchievements = checkCatAchievements(account);

  // 랜덤 이벤트
  var eventMsg = rollCatEvent(account, sender);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🍖 밥 주기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += reaction + "\n\n";
  text += "🍖 배고픔 +" + hungerGain + " → " + account.hunger + "\n";
  if (happyGain !== 0) text += "😊 행복 " + (happyGain > 0 ? "+" : "") + happyGain + " → " + account.happiness + "\n";
  if (energyGain !== 0) text += "⚡ 에너지 +" + energyGain + " → " + account.energy + "\n";
  if (trustGain > 0) text += "💕 신뢰 +" + trustGain + " → " + account.trust + "\n";
  text += "🐟 -" + food.cost + " (잔액: " + account.fishCoins + ")";
  if (sickMsg) text += sickMsg;
  if (bonusXP > 0) text += "\n⬆️ 보너스 XP +" + bonusXP;
  if (stageUp) text += "\n\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += formatAchievementUnlocks(newAchievements);
  if (eventMsg) text += "\n\n" + eventMsg;
  text += "\n\n(오늘 " + account.dailyActions.fed + "/" + getCatData().config.MAX_DAILY_FEED + ")";
  replier.reply(text);
}

// === 핸들러: 놀기 ===

function handleCatPlay(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 아직 놀 수 없어요!");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  var data = getCatData();

  if (account.dailyActions.played >= data.config.MAX_DAILY_PLAY) {
    replier.reply("[ 싱봇 냥냥이 ] 오늘은 이미 " + data.config.MAX_DAILY_PLAY + "번 놀았어요!\n" + account.name + "(이)가 지쳐있어요 😴");
    return;
  }

  var playName = msg.replace(/^(냥냥이놀자|ㄴㄴㅇ놀자|ㄴㄹ)\s*/, "").trim() || "실뭉치";
  var play = data.plays[playName];
  if (!play) {
    var playList = [];
    for (var pn in data.plays) {
      if (data.plays.hasOwnProperty(pn)) {
        var p = data.plays[pn];
        var avail = !p.requireItem || hasItem(account, pn);
        playList.push("  " + (avail ? "✅" : "🔒") + " " + pn + " — " + p.desc);
      }
    }
    replier.reply(
      "[ 싱봇 냥냥이 ] 🧶 놀이 목록\n━━━━━━━━━━━━━━━━━━\n" +
      playList.join("\n") + "\n\n🔒 = 상점에서 구매 필요\n'ㄴㄹ [놀이이름]' 으로 놀아주세요!"
    );
    return;
  }

  // 아이템 필요 체크
  if (play.requireItem && !hasItem(account, playName)) {
    replier.reply("[ 싱봇 냥냥이 ] '" + playName + "'이(가) 없어요!\n'ㄴㄴㅅㅈ'에서 구매하세요.");
    return;
  }

  // 에너지 체크
  var energyCost = Math.abs(play.energy || 0);
  if (account.energy < energyCost) {
    replier.reply("[ 싱봇 냥냥이 ] " + account.name + "(이)가 너무 피곤해요... 😴\n에너지: " + account.energy + " (필요: " + energyCost + ")\n'냥냥이재워'로 쉬게 해주세요!");
    return;
  }

  var happyGain = play.happiness || 0;
  var trustGain = play.trust || 0;

  // 성격 보너스
  if (play.personalityBonus && account.personality[play.personalityBonus] > 60) {
    happyGain += 10;
    trustGain += 1;
  }

  // 특성: 껴안기좋아함
  if (account.traits && account.traits.indexOf("cuddler") !== -1) {
    trustGain += 2;
  }

  account.energy = Math.max(0, account.energy + (play.energy || 0));
  account.happiness = Math.min(100, account.happiness + happyGain);
  account.trust = Math.min(100, account.trust + trustGain);
  account.stageProgress += 5;
  account.dailyActions.played++;
  account.stats.totalPlays++;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  generateCatDailyQuests(account);
  updateCatQuestProgress(account, "play");

  var reactions = [
    account.name + "(이)가 " + playName + "(으)로 신나게 놀았어요! 😸",
    account.name + "(이)가 " + playName + "에 푹 빠졌어요! 🐾",
    account.name + "(이)가 폴짝폴짝 뛰며 즐거워해요! 🎉",
    account.name + "(이)가 꼬리를 팽팽 돌리며 놀아요! 🌀"
  ];

  var stageUp = checkCatStageUp(account);
  var newAchievements = checkCatAchievements(account);
  var eventMsg = rollCatEvent(account, sender);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🧶 놀기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n\n";
  text += "😊 행복 +" + happyGain + " → " + account.happiness + "\n";
  text += "⚡ 에너지 " + (play.energy || 0) + " → " + account.energy + "\n";
  if (trustGain > 0) text += "💕 신뢰 +" + trustGain + " → " + account.trust + "\n";
  if (stageUp) text += "\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += formatAchievementUnlocks(newAchievements);
  if (eventMsg) text += "\n\n" + eventMsg;
  text += "\n\n(오늘 " + account.dailyActions.played + "/" + data.config.MAX_DAILY_PLAY + ")";
  replier.reply(text);
}

// === 핸들러: 재우기 ===

function handleCatSleep(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 이미 자고 있어요!");
    return;
  }

  applyCatDecay(account);

  var sleepBonus = 1;
  if (account.traits && account.traits.indexOf("lazy_sleeper") !== -1) {
    sleepBonus = 2;
  }

  var energyGain = 30 * sleepBonus;
  account.energy = Math.min(100, account.energy + energyGain);
  account.happiness = Math.min(100, account.happiness + 5);
  account.totalInteractions++;
  account.lastInteractTime = Date.now();
  saveCatAccount(sender, account);

  var reactions = [
    account.name + "(이)가 동그랗게 말고 잠들었어요... 💤",
    account.name + "(이)가 이불 속으로 파고들었어요 🛏️",
    account.name + "(이)가 그르릉거리며 눈을 감았어요 😴",
    account.name + "(이)가 하품을 하고 스르르 잠들었어요 🥱"
  ];

  var text = "[ 싱봇 냥냥이 ] 💤 재우기\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n\n";
  text += "⚡ 에너지 +" + energyGain + " → " + account.energy + "\n";
  text += "😊 행복 +5 → " + account.happiness + "\n";
  if (sleepBonus > 1) text += "🏷️ 잠꾸러기 특성: 에너지 회복 2배!";
  text += "\n\n다음에 올 때 꿈을 꿨을지도... 💭";
  replier.reply(text);
}

// === 핸들러: 모험 보내기 ===

function handleCatAdventure(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 모험을 갈 수 없어요!");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);

  var data = getCatData();

  // 이미 모험 중?
  if (account.activeAdventure) {
    var remain = Math.max(0, Math.ceil((account.activeAdventure.returnTime - Date.now()) / 60000));
    if (remain > 0) {
      replier.reply("[ 싱봇 냥냥이 ] 🗺️ 이미 모험 중이에요!\n장소: " + account.activeAdventure.locationName + "\n남은 시간: " + remain + "분\n\n'ㅁㅎㄱㄱ'로 결과를 확인하세요!");
    } else {
      replier.reply("[ 싱봇 냥냥이 ] 🗺️ 모험이 끝났어요!\n'ㅁㅎㄱㄱ'로 결과를 확인하세요!");
    }
    return;
  }

  var locName = msg.replace(/^(냥냥이모험|ㄴㄴㅇ모험|ㅁㅎ)\s*/, "").trim();

  // 장소 목록 보여주기
  if (!locName) {
    var locList = [];
    for (var id in data.adventures) {
      if (!data.adventures.hasOwnProperty(id)) continue;
      var loc = data.adventures[id];
      var unlocked = account.stage >= loc.stageReq && account.trust >= loc.trustReq;
      if (loc.personalityReq) {
        for (var pk in loc.personalityReq) {
          if (account.personality[pk] < loc.personalityReq[pk]) unlocked = false;
        }
      }
      if (loc.traitReq && account.traits.indexOf(loc.traitReq) === -1) unlocked = false;
      var dur = Math.round(loc.duration / 60000);
      locList.push((unlocked ? "✅" : "🔒") + " " + loc.emoji + " " + loc.name + " (" + dur + "분) — 난이도 " + loc.difficulty);
    }
    replier.reply(
      "[ 싱봇 냥냥이 ] 🗺️ 모험 장소\n━━━━━━━━━━━━━━━━━━\n" +
      locList.join("\n") + "\n\n'ㅁㅎ [장소이름]' 으로 보내세요!"
    );
    return;
  }

  // 장소 찾기
  var locId = null;
  var loc = null;
  for (var id in data.adventures) {
    if (data.adventures[id].name === locName) {
      locId = id;
      loc = data.adventures[id];
      break;
    }
  }
  if (!loc) {
    replier.reply("[ 싱봇 냥냥이 ] '" + locName + "' 장소를 찾을 수 없어요!\n'ㅁㅎ'로 장소 목록을 확인하세요.");
    return;
  }

  // 해금 체크
  if (account.stage < loc.stageReq) {
    replier.reply("[ 싱봇 냥냥이 ] 🔒 " + loc.name + "은 성장 단계 " + loc.stageReq + " 이상 필요해요!");
    return;
  }
  if (account.trust < loc.trustReq) {
    replier.reply("[ 싱봇 냥냥이 ] 🔒 " + loc.name + "은 신뢰도 " + loc.trustReq + " 이상 필요해요! (현재: " + account.trust + ")");
    return;
  }

  // 에너지 체크
  if (account.energy < 20) {
    replier.reply("[ 싱봇 냥냥이 ] " + account.name + "(이)가 너무 피곤해요... 😴\n에너지: " + account.energy + " (최소 20 필요)");
    return;
  }

  // 모험 시작
  var duration = loc.duration;
  if (account.traits && account.traits.indexOf("adventurer") !== -1) {
    duration = Math.floor(duration * 0.9);
  }

  account.activeAdventure = {
    locationId: locId,
    locationName: loc.name,
    startTime: Date.now(),
    returnTime: Date.now() + duration,
    difficulty: loc.difficulty
  };
  account.energy -= 20;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();
  account.dailyActions.adventureSent++;
  saveCatAccount(sender, account);

  var durationMin = Math.round(duration / 60000);
  replier.reply(
    "[ 싱봇 냥냥이 ] 🗺️ 모험 출발!\n━━━━━━━━━━━━━━━━━━\n" +
    loc.emoji + " " + account.name + "(이)가 " + loc.name + "(으)로 떠났어요!\n\n" +
    "⏱️ 예상 시간: " + durationMin + "분\n" +
    "⚡ 에너지 -20 → " + account.energy + "\n\n" +
    "돌아오면 'ㅁㅎㄱㄱ'로 결과를 확인하세요! 🐾"
  );
}

// === 핸들러: 모험 결과 ===

function handleCatAdventureResult(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (!account.activeAdventure) {
    replier.reply("[ 싱봇 냥냥이 ] 진행 중인 모험이 없어요!\n'ㅁㅎ [장소]'로 모험을 보내세요.");
    return;
  }

  var now = Date.now();
  var adv = account.activeAdventure;
  if (now < adv.returnTime) {
    var remain = Math.ceil((adv.returnTime - now) / 60000);
    replier.reply("[ 싱봇 냥냥이 ] 🗺️ 아직 모험 중이에요!\n장소: " + adv.locationName + "\n남은 시간: " + remain + "분");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);

  var data = getCatData();
  var loc = data.adventures[adv.locationId];

  // 스토리 생성
  var stories = data.adventureStories[adv.locationId] || [
    "{name}(이)가 " + adv.locationName + "에서 즐거운 시간을 보냈어요! 🐾"
  ];
  var story = pickRandom(stories).split("{name}").join(account.name);

  // 전리품
  var coins = catRandInt(loc.coinRange[0], loc.coinRange[1]);

  // 특성: 사냥본능 보너스
  if (account.traits && account.traits.indexOf("hunter") !== -1) {
    coins = Math.floor(coins * 1.3);
  }

  // 성격 보너스
  if (account.personality.bravery > 70) coins = Math.floor(coins * 1.1);

  var xp = loc.xp || 10;

  account.fishCoins += coins;
  account.stats.totalFishEarned += coins;
  account.stageProgress += xp;
  account.adventureCount++;
  account.stats.totalAdventures++;
  account.happiness = Math.min(100, account.happiness + 10);
  account.trust = Math.min(100, account.trust + 2);

  // 장소 발견
  if (account.uniqueLocations.indexOf(adv.locationId) === -1) {
    account.uniqueLocations.push(adv.locationId);
  }

  account.activeAdventure = null;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  generateCatDailyQuests(account);
  updateCatQuestProgress(account, "adventure");

  var stageUp = checkCatStageUp(account);
  var newAchievements = checkCatAchievements(account);
  var eventMsg = rollCatEvent(account, sender);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🗺️ 모험 결과!\n━━━━━━━━━━━━━━━━━━\n";
  text += "📍 " + loc.emoji + " " + adv.locationName + "\n\n";
  text += "📖 " + account.name + "의 모험 이야기:\n\n";
  text += "\"" + story + "\"\n\n";
  text += "🎁 전리품:\n";
  text += "  🐟 +" + coins + " 물고기코인\n";
  text += "  ⬆️ +" + xp + " XP\n";
  text += "  😊 행복 +10 | 💕 신뢰 +2\n";
  if (stageUp) text += "\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += formatAchievementUnlocks(newAchievements);
  if (eventMsg) text += "\n\n" + eventMsg;
  text += "\n\n(총 모험 " + account.adventureCount + "회)";
  replier.reply(text);
}

// === 핸들러: 상점 ===

function handleCatShop(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var data = getCatData();
  var text = "[ 싱봇 냥냥이 ] 🏪 상점\n━━━━━━━━━━━━━━━━━━\n💰 보유: 🐟 " + account.fishCoins + "\n";
  for (var itemName in data.shopItems) {
    if (!data.shopItems.hasOwnProperty(itemName)) continue;
    var item = data.shopItems[itemName];
    var owned = hasItem(account, itemName) || (account.wardrobe && account.wardrobe.indexOf(itemName) !== -1);
    text += "\n" + (owned ? "✅" : "🏷️") + " " + itemName + " (" + item.cost + "🐟)\n   " + item.desc;
  }
  text += "\n\n'ㄴㄴㄱ [아이템]' 으로 구매!";
  replier.reply(text);
}

// === 핸들러: 구매 ===

function handleCatBuy(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var itemName = msg.replace(/^(냥냥이구매|ㄴㄴㅇ구매|ㄴㄴㄱ)\s*/, "").trim();
  if (!itemName) {
    replier.reply("[ 싱봇 냥냥이 ] 'ㄴㄴㄱ [아이템]' 형식으로 구매하세요!\n'ㄴㄴㅅㅈ'로 상점을 확인하세요.");
    return;
  }

  var data = getCatData();
  var item = data.shopItems[itemName];
  if (!item) {
    replier.reply("[ 싱봇 냥냥이 ] '" + itemName + "'은 상점에 없어요!\n'ㄴㄴㅅㅈ'로 상점을 확인하세요.");
    return;
  }

  // 이미 보유?
  if (item.type === "outfit") {
    if (account.wardrobe && account.wardrobe.indexOf(itemName) !== -1) {
      replier.reply("[ 싱봇 냥냥이 ] 이미 가지고 있어요! 'ㄴㄴㅇ의상 " + itemName + "'으로 입혀보세요.");
      return;
    }
  } else if (item.type === "toy") {
    if (hasItem(account, itemName)) {
      replier.reply("[ 싱봇 냥냥이 ] 이미 가지고 있어요!");
      return;
    }
  }

  if (account.fishCoins < item.cost) {
    replier.reply("[ 싱봇 냥냥이 ] 🐟 물고기코인이 부족해요!\n필요: " + item.cost + " | 보유: " + account.fishCoins);
    return;
  }

  account.fishCoins -= item.cost;

  if (item.type === "outfit") {
    if (!account.wardrobe) account.wardrobe = [];
    account.wardrobe.push(itemName);
  } else if (item.type === "medicine") {
    account.health = Math.min(100, account.health + 50);
  } else if (item.type === "energy") {
    account.energy = Math.min(100, account.energy + 50);
  } else {
    addCatItem(account, itemName);
  }

  saveCatAccount(sender, account);
  replier.reply(
    "[ 싱봇 냥냥이 ] 🛒 구매 완료!\n" +
    "✅ " + itemName + " 획득!\n" +
    "🐟 -" + item.cost + " (잔액: " + account.fishCoins + ")"
  );
}

// === 핸들러: 의상 ===

function handleCatOutfit(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var outfitName = msg.replace(/^(냥냥이의상|ㄴㄴㅇ의상)\s*/, "").trim();

  if (!account.wardrobe || account.wardrobe.length === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 아직 의상이 없어요!\n'ㄴㄴㅅㅈ'에서 구매하세요.");
    return;
  }

  if (!outfitName || outfitName === "벗기") {
    if (outfitName === "벗기") {
      account.currentOutfit = null;
      saveCatAccount(sender, account);
      replier.reply("[ 싱봇 냥냥이 ] 👗 의상을 벗었어요!");
      return;
    }
    var text = "[ 싱봇 냥냥이 ] 👗 의상 목록\n━━━━━━━━━━━━━━━━━━\n";
    for (var i = 0; i < account.wardrobe.length; i++) {
      var mark = account.currentOutfit === account.wardrobe[i] ? "👉 " : "  ";
      text += mark + account.wardrobe[i] + "\n";
    }
    text += "\n'ㄴㄴㅇ의상 [이름]' 으로 입혀보세요!\n'ㄴㄴㅇ의상 벗기' 로 벗기기";
    replier.reply(text);
    return;
  }

  if (account.wardrobe.indexOf(outfitName) === -1) {
    replier.reply("[ 싱봇 냥냥이 ] '" + outfitName + "'은(는) 가지고 있지 않아요!");
    return;
  }

  account.currentOutfit = outfitName;
  saveCatAccount(sender, account);
  replier.reply("[ 싱봇 냥냥이 ] 👗 " + account.name + "(이)가 '" + outfitName + "'을(를) 입었어요! ✨");
}

// === 인벤토리 헬퍼 ===

function hasItem(account, name) {
  if (!account.inventory) return false;
  for (var i = 0; i < account.inventory.length; i++) {
    if (account.inventory[i].name === name && account.inventory[i].count > 0) return true;
  }
  return false;
}

function addCatItem(account, name, count) {
  if (!account.inventory) account.inventory = [];
  count = count || 1;
  for (var i = 0; i < account.inventory.length; i++) {
    if (account.inventory[i].name === name) {
      account.inventory[i].count += count;
      return;
    }
  }
  account.inventory.push({ name: name, count: count });
}

// === 핸들러: 인벤토리 ===

function handleCatInventory(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (!account.inventory || account.inventory.length === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🎒 인벤토리가 비었어요!\n'ㄴㄴㅅㅈ'에서 아이템을 구매하세요.");
    return;
  }

  var text = "[ 싱봇 냥냥이 ] 🎒 인벤토리\n━━━━━━━━━━━━━━━━━━\n";
  for (var i = 0; i < account.inventory.length; i++) {
    var item = account.inventory[i];
    if (item.count > 0) {
      text += "  " + item.name + " x" + item.count + "\n";
    }
  }
  text += "\n💰 🐟 " + account.fishCoins;
  replier.reply(text);
}

// === 기술 훈련 시스템 ===

function getCatTrickLevel(account, trickId) {
  if (!account.trickBook) return 0;
  for (var i = 0; i < account.trickBook.length; i++) {
    if (account.trickBook[i].id === trickId) return account.trickBook[i].level || 1;
  }
  return 0;
}

function hasCatTrick(account, trickId) {
  return getCatTrickLevel(account, trickId) > 0;
}

function handleCatTrain(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 훈련할 수 없어요!");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  var data = getCatData();
  var trickName = msg.replace(/^(냥냥이훈련|ㄴㄴㅇ훈련|ㅎㄹ)\s*/, "").trim();

  if (!trickName) {
    handleCatTricks(room, msg, sender, replier);
    return;
  }

  // 기술 찾기
  var trickId = null;
  var trick = null;
  for (var id in data.tricks) {
    if (data.tricks[id].name === trickName) {
      trickId = id;
      trick = data.tricks[id];
      break;
    }
  }
  if (!trick) {
    replier.reply("[ 싱봇 냥냥이 ] '" + trickName + "' 기술을 찾을 수 없어요!\n'ㄴㄴㅇ기술'로 목록을 확인하세요.");
    return;
  }

  // 이미 습득?
  if (hasCatTrick(account, trickId)) {
    replier.reply("[ 싱봇 냥냥이 ] '" + trickName + "'은(는) 이미 배웠어요! ✅");
    return;
  }

  // 일일 제한
  if (!account.dailyActions.trained) account.dailyActions.trained = 0;
  if (account.dailyActions.trained >= data.config.MAX_DAILY_TRAIN) {
    replier.reply("[ 싱봇 냥냥이 ] 오늘은 훈련을 " + data.config.MAX_DAILY_TRAIN + "번 했어요!\n내일 다시 도전! 💪");
    return;
  }

  // 선행 기술 체크
  if (trick.requires && trick.requires.length > 0) {
    var missing = [];
    for (var i = 0; i < trick.requires.length; i++) {
      if (!hasCatTrick(account, trick.requires[i])) {
        var reqTrick = data.tricks[trick.requires[i]];
        if (reqTrick) missing.push(reqTrick.name);
      }
    }
    if (missing.length > 0) {
      replier.reply("[ 싱봇 냥냥이 ] 🔒 선행 기술이 필요해요!\n필요: " + missing.join(", "));
      return;
    }
  }

  // 신뢰도 체크
  if (account.trust < trick.trustReq) {
    replier.reply("[ 싱봇 냥냥이 ] 💕 신뢰도가 부족해요!\n필요: " + trick.trustReq + " | 현재: " + account.trust);
    return;
  }

  // 에너지 체크
  if (account.energy < trick.energyCost) {
    replier.reply("[ 싱봇 냥냥이 ] ⚡ 에너지가 부족해요!\n필요: " + trick.energyCost + " | 현재: " + account.energy);
    return;
  }

  account.energy -= trick.energyCost;
  account.dailyActions.trained++;
  if (!account.dailyActions.trainAttempt) account.dailyActions.trainAttempt = 0;
  account.dailyActions.trainAttempt++;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  // 성공률 계산
  var rate = trick.baseRate * (1 + account.trust / 200);
  if (trick.personalityBonus && account.personality[trick.personalityBonus] > 60) {
    rate += 0.15;
  }
  rate = Math.min(0.95, rate);

  var success = Math.random() < rate;
  var text = "[ 싱봇 냥냥이 ] 🎓 훈련: " + trickName + "\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";

  if (success) {
    // 습득 성공!
    if (!account.trickBook) account.trickBook = [];
    account.trickBook.push({ id: trickId, name: trickName, level: 1, masteredAt: Date.now() });
    account.stageProgress += trick.xp;
    account.stats.totalTricksLearned = (account.stats.totalTricksLearned || 0) + 1;

    // 보상
    if (trick.reward) {
      if (trick.reward.trust) account.trust = Math.min(100, account.trust + trick.reward.trust);
      if (trick.reward.happiness) account.happiness = Math.min(100, account.happiness + trick.reward.happiness);
      if (trick.reward.coins) account.fishCoins += trick.reward.coins;
      if (trick.reward.starDust) account.starDust = (account.starDust || 0) + trick.reward.starDust;
    }

    // 업적 체크
    var newAchievements = checkCatAchievements(account);

    var stageUp = checkCatStageUp(account);

    text += "🎉 성공! " + account.name + "(이)가 '" + trickName + "'을(를) 배웠어요!\n\n";
    text += "⬆️ +" + trick.xp + " XP\n";
    if (trick.reward && trick.reward.trust) text += "💕 신뢰 +" + trick.reward.trust + "\n";
    if (trick.reward && trick.reward.coins) text += "🐟 +" + trick.reward.coins + "\n";
    if (trick.reward && trick.reward.starDust) text += "✨ +" + trick.reward.starDust + "\n";
    if (trick.passive) text += "\n🎁 패시브 효과: 시간당 " + trick.passive.coinsPerHour + "🐟 자동 수입!";
    if (trick.adventureBonus) text += "\n🎁 모험 전리품 " + trick.adventureBonus + "배!";
    if (stageUp) text += "\n\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
    text += formatAchievementUnlocks(newAchievements);
  } else {
    // 실패
    account.stageProgress += Math.floor(trick.xp * 0.3);
    text += "😿 실패... " + account.name + "(이)가 아직 어려워해요.\n\n";
    text += "성공률: " + Math.round(rate * 100) + "%\n";
    text += "⬆️ +" + Math.floor(trick.xp * 0.3) + " XP (실패 보상)\n";
    text += "다시 도전해보세요! 💪";
  }

  text += "\n\n(오늘 훈련 " + account.dailyActions.trained + "/" + data.config.MAX_DAILY_TRAIN + ")";

  // 랜덤 이벤트 롤
  var eventMsg = rollCatEvent(account, sender);

  saveCatAccount(sender, account);

  if (eventMsg) text += "\n\n" + eventMsg;
  replier.reply(text);
}

// === 핸들러: 기술 목록 ===

function handleCatTricks(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var data = getCatData();
  var text = "[ 싱봇 냥냥이 ] 🎓 기술 트리\n━━━━━━━━━━━━━━━━━━\n";
  var tiers = { 1: "기본기", 2: "중급기", 3: "고급기", 4: "전설기" };

  for (var tier = 1; tier <= 4; tier++) {
    text += "\n【 " + tiers[tier] + " 】\n";
    for (var id in data.tricks) {
      if (!data.tricks.hasOwnProperty(id)) continue;
      var t = data.tricks[id];
      if (t.tier !== tier) continue;
      var learned = hasCatTrick(account, id);
      var canLearn = true;
      if (t.requires) {
        for (var i = 0; i < t.requires.length; i++) {
          if (!hasCatTrick(account, t.requires[i])) canLearn = false;
        }
      }
      if (account.trust < t.trustReq) canLearn = false;
      var icon = learned ? "✅" : (canLearn ? "⬜" : "🔒");
      text += "  " + icon + " " + t.name + " — " + t.desc + "\n";
    }
  }

  var learnedCount = account.trickBook ? account.trickBook.length : 0;
  var totalCount = 0;
  for (var id in data.tricks) { if (data.tricks.hasOwnProperty(id)) totalCount++; }
  text += "\n습득: " + learnedCount + "/" + totalCount + "\n'ㅎㄹ [기술명]' 으로 훈련!";
  replier.reply(text);
}

// === 랜덤 이벤트 시스템 ===

function rollCatEvent(account, sender) {
  var data = getCatData();
  if (!data.events) return null;
  if (Math.random() > data.config.EVENT_CHANCE) return null;

  // 특성: 행운아 보너스 (긍정 이벤트 확률 UP)
  var luckyBonus = (account.traits && account.traits.indexOf("lucky") !== -1);

  var roll = Math.random();
  var msg = "";

  if (roll < (luckyBonus ? 0.60 : 0.50)) {
    // 긍정 이벤트
    var evt = pickRandom(data.events.positive);
    var evtText = evt.text.split("{name}").join(account.name);
    if (evt.hunger) account.hunger = Math.min(100, account.hunger + evt.hunger);
    if (evt.happiness) account.happiness = Math.min(100, account.happiness + evt.happiness);
    if (evt.energy) account.energy = Math.min(100, account.energy + evt.energy);
    if (evt.trust) account.trust = Math.min(100, account.trust + evt.trust);
    if (evt.coins) {
      account.fishCoins += evt.coins;
      account.stats.totalFishEarned += evt.coins;
    }
    msg = "🌟 이벤트!\n" + evtText;
    if (evt.coins > 0) msg += "\n🐟 +" + evt.coins;

  } else if (roll < (luckyBonus ? 0.75 : 0.75)) {
    // 부정 이벤트
    var evt = pickRandom(data.events.negative);
    var evtText = evt.text.split("{name}").join(account.name);
    // 특성: 터프가이 — 피해 감소
    var resist = (account.traits && account.traits.indexOf("tough") !== -1);
    if (evt.happiness) account.happiness = Math.max(0, account.happiness + (resist ? Math.floor(evt.happiness / 2) : evt.happiness));
    if (evt.health) account.health = Math.max(0, account.health + (resist ? Math.floor(evt.health / 2) : evt.health));
    if (evt.braveryCheck && account.personality.bravery < 40) {
      account.happiness = Math.max(0, account.happiness - 10);
    }
    msg = "⚠️ 이벤트!\n" + evtText;
    if (resist) msg += "\n🏷️ 터프가이: 피해 감소!";

  } else {
    // 분기형 이벤트
    var evt = pickRandom(data.events.branching);
    var evtText = evt.text.split("{name}").join(account.name);
    account.pendingEvent = {
      event: evt,
      expireTime: Date.now() + (evt.timeout || 180000)
    };
    msg = "❗ 이벤트 발생!\n" + evtText + "\n\n";
    for (var i = 0; i < evt.options.length; i++) {
      msg += (i + 1) + "️⃣ " + evt.options[i].label + " (" + evt.options[i].desc + ")\n";
    }
    msg += "\n'ㄴㄴㅇ선택 " + (1) + "' 또는 'ㄴㄴㅇ선택 " + (2) + "'\n(3분 안에 선택!)";
  }

  return msg;
}

// === 핸들러: 이벤트 선택 ===

function handleCatEventChoice(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (!account.pendingEvent) {
    replier.reply("[ 싱봇 냥냥이 ] 진행 중인 이벤트가 없어요!");
    return;
  }

  if (Date.now() > account.pendingEvent.expireTime) {
    account.pendingEvent = null;
    saveCatAccount(sender, account);
    replier.reply("[ 싱봇 냥냥이 ] ⏰ 이벤트가 만료됐어요! 자동으로 1번이 선택됐어요.");
    return;
  }

  var choiceNum = parseInt(msg.replace(/^(냥냥이선택|ㄴㄴㅇ선택)\s*/, "").trim());
  var evt = account.pendingEvent.event;

  if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > evt.options.length) {
    replier.reply("[ 싱봇 냥냥이 ] 1~" + evt.options.length + " 중에서 선택해주세요!");
    return;
  }

  var option = evt.options[choiceNum - 1];
  var outcome = null;

  // 성격 기반 결과 결정
  if (option.outcomes.highAffection && account.personality.affection > 60) {
    outcome = option.outcomes.highAffection;
  } else if (option.outcomes.highBravery && account.personality.bravery > 60) {
    outcome = option.outcomes.highBravery;
  } else if (option.outcomes.highCuriosity && account.personality.curiosity > 60) {
    outcome = option.outcomes.highCuriosity;
  } else {
    outcome = option.outcomes["default"];
  }

  var resultText = outcome.text.split("{name}").join(account.name);

  // 결과 적용
  if (outcome.happiness) account.happiness = Math.max(0, Math.min(100, account.happiness + outcome.happiness));
  if (outcome.trust) account.trust = Math.min(100, account.trust + outcome.trust);
  if (outcome.health) account.health = Math.max(0, Math.min(100, account.health + outcome.health));
  if (outcome.energy) account.energy = Math.max(0, Math.min(100, account.energy + outcome.energy));
  if (outcome.coins) {
    account.fishCoins += outcome.coins;
    account.stats.totalFishEarned += outcome.coins;
  }
  if (outcome.bravery_up) {
    account.personality.bravery = Math.min(100, account.personality.bravery + outcome.bravery_up);
  }

  account.pendingEvent = null;
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] ❗ 이벤트 결과\n━━━━━━━━━━━━━━━━━━\n";
  text += "선택: " + option.label + "\n\n";
  text += resultText + "\n";
  if (outcome.happiness) text += "\n😊 행복 " + (outcome.happiness > 0 ? "+" : "") + outcome.happiness;
  if (outcome.trust) text += "\n💕 신뢰 +" + outcome.trust;
  if (outcome.coins) text += "\n🐟 +" + outcome.coins;
  if (outcome.health) text += "\n❤️ 건강 " + (outcome.health > 0 ? "+" : "") + outcome.health;
  replier.reply(text);
}

// === 업적 시스템 ===

function checkCatAchievements(account) {
  var data = getCatData();
  if (!data.achievements) return [];
  if (!account.achievements) account.achievements = [];

  var newUnlocks = [];
  var checks = {
    "first_hatch": account.stage >= 1,
    "first_feed": account.stats.totalFeedings >= 1,
    "first_play": account.stats.totalPlays >= 1,
    "first_adventure": account.stats.totalAdventures >= 1,
    "first_trick": (account.stats.totalTricksLearned || 0) >= 1,
    "feed_10": account.stats.totalFeedings >= 10,
    "feed_50": account.stats.totalFeedings >= 50,
    "play_10": account.stats.totalPlays >= 10,
    "play_50": account.stats.totalPlays >= 50,
    "adventure_10": account.stats.totalAdventures >= 10,
    "adventure_25": account.stats.totalAdventures >= 25,
    "adventure_50": account.stats.totalAdventures >= 50,
    "trust_30": account.trust >= 30,
    "trust_60": account.trust >= 60,
    "trust_90": account.trust >= 90,
    "streak_7": account.stats.currentStreak >= 7,
    "streak_14": account.stats.currentStreak >= 14,
    "streak_30": account.stats.currentStreak >= 30,
    "stage_2": account.stage >= 2,
    "stage_3": account.stage >= 3,
    "stage_4": account.stage >= 4,
    "tricks_3": (account.trickBook ? account.trickBook.length : 0) >= 3,
    "tricks_6": (account.trickBook ? account.trickBook.length : 0) >= 6,
    "tricks_all": (account.trickBook ? account.trickBook.length : 0) >= 11,
    "coins_1000": account.fishCoins >= 1000,
    "all_locations": (account.uniqueLocations ? account.uniqueLocations.length : 0) >= 9
  };

  for (var i = 0; i < data.achievements.length; i++) {
    var ach = data.achievements[i];
    if (account.achievements.indexOf(ach.id) !== -1) continue;
    if (checks[ach.id]) {
      account.achievements.push(ach.id);
      if (ach.coins) {
        account.fishCoins += ach.coins;
        account.stats.totalFishEarned += ach.coins;
      }
      if (ach.starDust) account.starDust = (account.starDust || 0) + ach.starDust;
      if (ach.title) {
        if (!account.titles.unlocked) account.titles.unlocked = [];
        account.titles.unlocked.push(ach.title);
        account.titles.equipped = ach.title;
      }
      newUnlocks.push(ach);
    }
  }

  return newUnlocks;
}

function formatAchievementUnlocks(achievements) {
  if (!achievements || achievements.length === 0) return "";
  var text = "\n\n🏆 업적 달성!";
  for (var i = 0; i < achievements.length; i++) {
    var a = achievements[i];
    text += "\n  " + a.name + " — " + a.desc;
    if (a.coins) text += " (🐟+" + a.coins + ")";
    if (a.starDust) text += " (✨+" + a.starDust + ")";
    if (a.title) text += " [칭호: " + a.title + "]";
  }
  return text;
}

// === 일일퀘스트 시스템 ===

function generateCatDailyQuests(account) {
  var data = getCatData();
  if (!data.dailyQuestPool) return;
  var today = todayString();
  if (account.dailyQuests && account.dailyQuests.date === today) return;

  var seed = todaySeed();
  var pool = data.dailyQuestPool.slice();
  var quests = [];
  for (var i = 0; i < 3 && pool.length > 0; i++) {
    var idx = Math.abs((seed + i * 7) % pool.length);
    var q = pool.splice(idx, 1)[0];
    quests.push({ desc: q.desc, type: q.type, target: q.target, reward: q.reward, progress: 0, claimed: false });
  }
  account.dailyQuests = { date: today, quests: quests, allClaimed: false };
}

function updateCatQuestProgress(account, actionType, detail) {
  if (!account.dailyQuests || !account.dailyQuests.quests) return;
  for (var i = 0; i < account.dailyQuests.quests.length; i++) {
    var q = account.dailyQuests.quests[i];
    if (q.claimed) continue;
    if (q.type === actionType) {
      q.progress++;
    } else if (q.type === "feedSpecific" && actionType === "feed" && detail === q.target) {
      q.progress++;
    } else if (q.type === "trainAttempt" && actionType === "trainAttempt") {
      q.progress++;
    }
  }
}

function handleCatQuest(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  generateCatDailyQuests(account);
  saveCatAccount(sender, account);

  var quests = account.dailyQuests.quests;
  var text = "[ 싱봇 냥냥이 ] 📋 일일퀘스트\n━━━━━━━━━━━━━━━━━━\n";
  var allDone = true;
  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    var done = q.progress >= (typeof q.target === "number" ? q.target : 1);
    var icon = q.claimed ? "✅" : (done ? "🎁" : "⬜");
    if (!done) allDone = false;
    var prog = typeof q.target === "number" ? (Math.min(q.progress, q.target) + "/" + q.target) : (q.progress > 0 ? "완료" : "미완료");
    text += "\n" + icon + " " + q.desc + " (" + prog + ") — " + q.reward + "🐟";
  }

  if (allDone && !account.dailyQuests.allClaimed) {
    text += "\n\n🎉 올클리어 보너스: 100🐟 + 1✨\n'ㄴㄴㅋㅂ'로 보상 수령!";
  } else {
    text += "\n\n완료된 퀘스트는 'ㄴㄴㅋㅂ'로 보상 수령!";
  }
  replier.reply(text);
}

function handleCatQuestClaim(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  generateCatDailyQuests(account);

  var quests = account.dailyQuests.quests;
  var claimed = 0;
  var totalReward = 0;
  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    if (q.claimed) continue;
    var target = typeof q.target === "number" ? q.target : 1;
    if (q.progress >= target) {
      q.claimed = true;
      account.fishCoins += q.reward;
      account.stats.totalFishEarned += q.reward;
      totalReward += q.reward;
      claimed++;
    }
  }

  // 올클리어 보너스
  var allClaimed = true;
  for (var i = 0; i < quests.length; i++) {
    if (!quests[i].claimed) { allClaimed = false; break; }
  }
  var bonusMsg = "";
  if (allClaimed && !account.dailyQuests.allClaimed) {
    account.dailyQuests.allClaimed = true;
    account.fishCoins += 100;
    account.starDust = (account.starDust || 0) + 1;
    account.stats.totalFishEarned += 100;
    bonusMsg = "\n\n🎉 올클리어 보너스! 🐟+100 ✨+1";
  }

  saveCatAccount(sender, account);

  if (claimed === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 수령할 보상이 없어요!\n'ㄴㄴㅋ'로 퀘스트를 확인하세요.");
    return;
  }

  replier.reply(
    "[ 싱봇 냥냥이 ] 📋 퀘스트 보상 수령!\n━━━━━━━━━━━━━━━━━━\n" +
    "✅ " + claimed + "개 완료! 🐟 +" + totalReward + bonusMsg + "\n" +
    "💰 잔액: 🐟 " + account.fishCoins
  );
}

// === 핸들러: 업적 보기 ===

function handleCatAchievements(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var data = getCatData();
  if (!account.achievements) account.achievements = [];

  var text = "[ 싱봇 냥냥이 ] 🏆 업적\n━━━━━━━━━━━━━━━━━━\n";
  var unlocked = 0;
  for (var i = 0; i < data.achievements.length; i++) {
    var a = data.achievements[i];
    var done = account.achievements.indexOf(a.id) !== -1;
    if (done) unlocked++;
    text += (done ? "✅" : "⬜") + " " + a.name + "\n";
  }
  text += "\n달성: " + unlocked + "/" + data.achievements.length;
  replier.reply(text);
}

// === 전체 계정 로드 (랭킹/소셜용) ===

function loadAllCatAccounts() {
  try {
    var dir = new java.io.File(CAT_DATA_DIR);
    if (!dir.exists()) return;
    var files = dir.listFiles();
    if (!files) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f.getName().endsWith(".json")) continue;
      var senderName = f.getName().replace(".json", "");
      if (catAccounts[senderName]) continue;
      try {
        var fis = new java.io.FileInputStream(f);
        var reader = new java.io.InputStreamReader(fis, "UTF-8");
        var br = new java.io.BufferedReader(reader);
        var data = "";
        var line;
        while ((line = br.readLine()) != null) data += line;
        br.close(); reader.close(); fis.close();
        catAccounts[senderName] = JSON.parse(data);
      } catch (e) {}
    }
  } catch (e) {}
}

// === 소셜: 인사 ===

function handleCatGreet(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage < 1) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 인사할 수 없어요!");
    return;
  }

  var targetName = msg.replace(/^(냥냥이인사|ㄴㄴㅇ인사)\s*/, "").trim();
  if (!targetName) {
    replier.reply("[ 싱봇 냥냥이 ] 'ㄴㄴㅇ인사 [상대이름]' 형식으로 입력해주세요!");
    return;
  }

  // 쿨다운 (1시간)
  var now = Date.now();
  if (account.socialCooldown && now - account.socialCooldown < 3600000) {
    var remain = Math.ceil((3600000 - (now - account.socialCooldown)) / 60000);
    replier.reply("[ 싱봇 냥냥이 ] ⏰ " + remain + "분 후에 다시 인사할 수 있어요!");
    return;
  }

  // 상대 찾기
  loadAllCatAccounts();
  var target = null;
  var targetSender = null;
  for (var s in catAccounts) {
    if (!catAccounts.hasOwnProperty(s)) continue;
    if (s === sender) continue;
    if (catAccounts[s].name === targetName) {
      target = catAccounts[s];
      targetSender = s;
      break;
    }
  }

  if (!target) {
    replier.reply("[ 싱봇 냥냥이 ] '" + targetName + "' 고양이를 찾을 수 없어요!");
    return;
  }
  if (target.stage < 1) {
    replier.reply("[ 싱봇 냥냥이 ] " + targetName + "(은)는 아직 알이에요!");
    return;
  }

  applyCatDecay(account);
  account.socialCooldown = now;
  account.totalInteractions++;
  account.lastInteractTime = now;

  // 우정 찾기/생성
  if (!account.catFriends) account.catFriends = [];
  var friendship = null;
  for (var i = 0; i < account.catFriends.length; i++) {
    if (account.catFriends[i].sender === targetSender) {
      friendship = account.catFriends[i];
      break;
    }
  }
  if (!friendship) {
    friendship = { sender: targetSender, catName: target.name, friendship: 0 };
    account.catFriends.push(friendship);
  }

  // 성격 기반 결과
  var myAff = account.personality.affection;
  var myMis = account.personality.mischief;
  var myBrv = account.personality.bravery;
  var theirAff = target.personality.affection;

  var friendGain = 1;
  var happyGain = 10;
  var trustGain = 1;
  var coinsGain = 0;
  var reaction = "";

  // 특성: 매력쟁이
  if (account.traits && account.traits.indexOf("charmer") !== -1) {
    friendGain += 1;
  }

  if (myAff > 60 && theirAff > 60) {
    friendGain += 2;
    happyGain = 20;
    reaction = account.name + "와(과) " + target.name + "(이)가 서로 코를 비비며 인사했어요! 💕🐱🐱💕";
  } else if (myMis > 60) {
    coinsGain = catRandInt(5, 15);
    reaction = account.name + "(이)가 " + target.name + "의 간식을 살짝 뺏었어요! 😼🐟";
  } else if (myBrv > 60 && target.personality.bravery > 60) {
    coinsGain = catRandInt(10, 30);
    happyGain = 15;
    reaction = account.name + "와(과) " + target.name + "(이)가 힘겨루기를 했어요! 💪 승자: " + account.name + "!";
  } else {
    reaction = account.name + "와(과) " + target.name + "(이)가 어색하게 눈인사를 했어요 👀";
  }

  friendship.friendship += friendGain;
  account.happiness = Math.min(100, account.happiness + happyGain);
  account.trust = Math.min(100, account.trust + trustGain);
  if (coinsGain > 0) {
    account.fishCoins += coinsGain;
    account.stats.totalFishEarned += coinsGain;
  }

  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🤝 인사!\n━━━━━━━━━━━━━━━━━━\n";
  text += reaction + "\n\n";
  text += "😊 행복 +" + happyGain + " | 💕 신뢰 +" + trustGain + "\n";
  text += "🤝 " + target.name + "과(와)의 우정: ❤️ " + friendship.friendship + "\n";
  if (coinsGain > 0) text += "🐟 +" + coinsGain + "\n";
  if (friendship.friendship >= 5) text += "\n✨ 우정 Lv.5! 나중에 합동모험이 가능해질 거예요!";
  replier.reply(text);
}

// === 랭킹 ===

function handleCatRanking(room, msg, sender, replier) {
  loadAllCatAccounts();

  var cats = [];
  for (var s in catAccounts) {
    if (!catAccounts.hasOwnProperty(s)) continue;
    var a = catAccounts[s];
    if (a.stage < 1) continue;
    cats.push({
      name: a.name,
      sender: s,
      stage: a.stage,
      xp: a.stageProgress,
      adventures: a.adventureCount || 0,
      tricks: a.trickBook ? a.trickBook.length : 0,
      streak: a.stats.currentStreak || 0
    });
  }

  if (cats.length === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🏆 아직 랭킹에 등록된 고양이가 없어요!");
    return;
  }

  // 성장 기준 정렬
  cats.sort(function(a, b) {
    if (b.stage !== a.stage) return b.stage - a.stage;
    return b.xp - a.xp;
  });

  var data = getCatData();
  var text = "[ 싱봇 냥냥이 ] 🏆 랭킹\n━━━━━━━━━━━━━━━━━━\n";
  var medals = ["🥇", "🥈", "🥉"];
  for (var i = 0; i < Math.min(cats.length, 10); i++) {
    var c = cats[i];
    var medal = i < 3 ? medals[i] : (i + 1) + ".";
    var stageName = data.stages[c.stage] ? data.stages[c.stage].name : "???";
    var isMine = c.sender === sanitizeSender(sender) ? " 👈" : "";
    text += "\n" + medal + " " + c.name + " — " + stageName + " (XP:" + c.xp + ")";
    text += "\n   🗺️" + c.adventures + " 🎓" + c.tricks + " 🔥" + c.streak + "일" + isMine;
  }
  replier.reply(text);
}

// === 비밀진화 ===

function checkSecretEvolution(account) {
  if (account.stage < 4) return null;
  if (account.stage >= 5) return null;

  var tricks = account.trickBook ? account.trickBook.length : 0;
  var locs = account.uniqueLocations ? account.uniqueLocations.length : 0;
  var p = account.personality;

  // 1. 요정고양이: 호기심 90+, 모든 장소, 보물 5+
  var treasureCount = 0;
  if (account.discoveredTreasures) {
    for (var k in account.discoveredTreasures) {
      if (account.discoveredTreasures.hasOwnProperty(k)) treasureCount++;
    }
  }
  if (p.curiosity >= 90 && locs >= 9 && treasureCount >= 5) {
    return { id: "fairy", name: "요정고양이", emoji: "🧚", desc: "신비로운 요정의 힘이 깃들었어요!", bonus: "꿈 보상 3배, 요정의 숲 해금" };
  }

  // 2. 그림자고양이: 장난 90+, 문열기 습득
  if (p.mischief >= 90 && hasCatTrick(account, "dooropen")) {
    return { id: "shadow", name: "그림자고양이", emoji: "🌑", desc: "어둠 속에서 빛나는 눈...", bonus: "모험 시간 50% 단축" };
  }

  // 3. 수호고양이: 신뢰 95+, 방치 0회, 밥 50+
  if (account.trust >= 95 && (account.stats.neglectCount || 0) === 0 && account.stats.totalFeedings >= 50) {
    return { id: "guardian", name: "수호고양이", emoji: "🛡️", desc: "집사를 지키는 수호 정령!", bonus: "부정 이벤트 면역, 패시브 수입" };
  }

  // 4. 모험왕고양이: 용기 90+, 모험 50+
  if (p.bravery >= 90 && (account.stats.totalAdventures || 0) >= 50) {
    return { id: "explorer", name: "모험왕고양이", emoji: "🌟", desc: "전설의 탐험가!", bonus: "전설의 땅 해금, 전리품 3배" };
  }

  // 5. 황금고양이: 모든 기술, 업적 20+, 스트릭 30+
  if (tricks >= 11 && (account.achievements ? account.achievements.length : 0) >= 20 && (account.stats.currentStreak || 0) >= 30) {
    return { id: "golden", name: "황금고양이", emoji: "✨👑", desc: "전설의 황금 고양이!", bonus: "모든 수입 2배, 전설의 칭호" };
  }

  return null;
}

// 상태 확인 시 비밀진화 힌트
function getEvolutionHint(account) {
  if (account.stage < 4) return null;
  if (account.stage >= 5) return null;

  var p = account.personality;
  var hints = [];
  if (p.curiosity >= 80) hints.push("호기심이 뭔가를 감지하고 있어요... ✨");
  if (p.mischief >= 80) hints.push("그림자 속에서 무언가 속삭이는 것 같아요... 🌑");
  if (account.trust >= 85) hints.push("깊은 유대감이 빛나고 있어요... 🛡️");
  if (p.bravery >= 80) hints.push("모험의 부름이 들려오는 것 같아요... 🌟");

  if (hints.length === 0) return null;
  return pickRandom(hints);
}

// === 환생 (프레스티지) ===

function handleCatPrestige(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (account.stage < 4) {
    replier.reply("[ 싱봇 냥냥이 ] 🔒 환생은 장로묘(Lv.4) 이상만 가능해요!\n현재: " + getCatData().stages[account.stage].name);
    return;
  }

  var confirm = msg.replace(/^(냥냥이환생|ㄴㄴㅇ환생)\s*/, "").trim();
  if (confirm !== "확인") {
    var gen = (account.prestigeCount || 0) + 2;
    replier.reply(
      "[ 싱봇 냥냥이 ] 🔄 환생\n━━━━━━━━━━━━━━━━━━\n" +
      account.name + "(이)가 새로운 삶을 시작합니다...\n\n" +
      "【 유지되는 것 】\n" +
      "  ✨ 별먼지: " + (account.starDust || 0) + "\n" +
      "  🏆 업적 " + (account.achievements ? account.achievements.length : 0) + "개\n" +
      "  📖 보물 도감\n" +
      "  💰 영구 수입 보너스 +" + (gen - 1) + "0%\n\n" +
      "【 초기화되는 것 】\n" +
      "  레벨, 스탯, 기술, 인벤토리, 물고기코인\n\n" +
      gen + "세대 고양이가 됩니다!\n\n" +
      "⚠️ 정말 환생하려면: 'ㄴㄴㅇ환생 확인'"
    );
    return;
  }

  // 환생 실행
  var oldName = account.name;
  var preserved = {
    starDust: account.starDust || 0,
    achievements: account.achievements || [],
    discoveredTreasures: account.discoveredTreasures || {},
    prestigeCount: (account.prestigeCount || 0) + 1,
    titles: account.titles || { unlocked: [], equipped: null },
    stats: {
      totalFeedings: account.stats.totalFeedings,
      totalPlays: account.stats.totalPlays,
      totalAdventures: account.stats.totalAdventures,
      totalTricksLearned: account.stats.totalTricksLearned || 0,
      totalFishEarned: account.stats.totalFishEarned,
      totalTreasuresFound: account.stats.totalTreasuresFound || 0,
      longestStreak: account.stats.longestStreak,
      currentStreak: 0,
      lastStreakDate: "",
      neglectCount: account.stats.neglectCount || 0,
      perfectDays: account.stats.perfectDays || 0
    }
  };

  // 새 계정 생성 (같은 이름)
  var newAccount = createCatAccount(sender, oldName);
  newAccount.starDust = preserved.starDust;
  newAccount.achievements = preserved.achievements;
  newAccount.discoveredTreasures = preserved.discoveredTreasures;
  newAccount.prestigeCount = preserved.prestigeCount;
  newAccount.titles = preserved.titles;
  newAccount.stats = preserved.stats;

  // 환생 보너스: 초기 코인 증가
  newAccount.fishCoins = 100 + (preserved.prestigeCount * 50);

  saveCatAccount(sender, newAccount);

  replier.reply(
    "[ 싱봇 냥냥이 ] 🔄 환생 완료!\n━━━━━━━━━━━━━━━━━━\n" +
    oldName + "(이)가 새로운 알로 돌아왔어요! 🥚\n\n" +
    "🌟 " + (preserved.prestigeCount + 1) + "세대 시작!\n" +
    "💰 영구 수입 보너스: +" + (preserved.prestigeCount * 10) + "%\n" +
    "🐟 시작 코인: " + newAccount.fishCoins + "\n\n" +
    "'ㄴㄴㅇ돌봐'로 새 알을 돌봐주세요!"
  );
}

// === 핸들러: 설명서 ===

function handleCatGuide(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 냥냥이 ] 🐱 게임 설명서\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    "카톡에서 나만의 고양이를 키우는 게임!\n" +
    "고양이마다 성격이 달라서 같은 행동도\n" +
    "결과가 달라요. 내 냥이만의 이야기!\n\n" +
    "【 시작 】\n" +
    "ㄴㄴㅇ등록 나비 → 알 도착!\n" +
    "ㄴㄴㅇ돌봐 x3 → 부화! (품종/성격 공개)\n\n" +
    "【 돌봄 】\n" +
    "ㅁㅁ 츄르 → 밥 (7종, 성격별 반응 다름)\n" +
    "ㄴㄹ 실뭉치 → 놀기 (에너지 소모)\n" +
    "ㄴㄴㅇ재워 → 자면 꿈을 꿔요!\n\n" +
    "【 모험 】\n" +
    "ㅁㅎ 뒷마당 → 실시간 탐험 (30분~4시간)\n" +
    "ㅁㅎㄱㄱ → 스토리 + 전리품 확인!\n" +
    "9개 장소, 성장하면 새 장소 해금\n\n" +
    "【 기술 훈련 】\n" +
    "ㅎㄹ 앉아 → 스킬트리 4단계 (11개)\n" +
    "배달부 = 패시브 수입!\n" +
    "보물찾기 = 모험 전리품 2배!\n\n" +
    "【 특별 시스템 】\n" +
    "💤 꿈 — 2시간+ 방치하면 꿈 보상!\n" +
    "❗ 이벤트 — 15% 확률 랜덤 발생\n" +
    "📋 퀘스트 — 매일 3개 (ㄴㄴㅋ)\n" +
    "🏆 업적 — 25개 달성 보상\n" +
    "🤝 소셜 — 다른 냥이와 인사\n\n" +
    "【 엔드게임 】\n" +
    "🐱→🐈→🐈‍⬛장로묘 → 비밀진화 5종!\n" +
    "🔄 환생 → 영구 보너스 + 재시작\n\n" +
    "'ㄴㄴㄷ' 전체 명령어 보기"
  );
}

// === 핸들러: 도움말 ===

function handleCatHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 냥냥이 ] 🐱 도움말\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    "🥚 ㄴㄴㅇ등록 [이름] — 고양이 입양\n" +
    "📊 ㄴㄴ — 상태 확인\n" +
    "🐾 ㄴㄴㅇ돌봐 — 쓰다듬기\n\n" +
    "🍖 ㅁㅁ [음식] — 밥 주기\n" +
    "🧶 ㄴㄹ [놀이] — 놀아주기\n" +
    "💤 ㄴㄴㅇ재워 — 재우기\n\n" +
    "🗺️ ㅁㅎ [장소] — 모험 보내기\n" +
    "📋 ㅁㅎㄱㄱ — 모험 결과\n\n" +
    "🎓 ㅎㄹ [기술] — 훈련\n" +
    "📖 ㄴㄴㅇ기술 — 기술 목록\n\n" +
    "🏪 ㄴㄴㅅㅈ — 상점\n" +
    "🛒 ㄴㄴㄱ [아이템] — 구매\n" +
    "🎒 ㄴㄴㅇㅂ — 인벤토리\n" +
    "👗 ㄴㄴㅇ의상 — 의상\n\n" +
    "📋 ㄴㄴㅋ — 일일퀘스트\n" +
    "🏆 ㄴㄴㅇ업적 — 업적\n\n" +
    "🤝 ㄴㄴㅇ인사 [고양이] — 소셜\n" +
    "🏆 ㄴㄴㄹㅋ — 랭킹\n" +
    "🔄 ㄴㄴㅇ환생 — 환생 (Lv.4+)"
  );
}

// === 명령어 등록 ===

var CAT_COMMANDS = [
  { triggers: _ct(["냥냥이등록"]), handler: handleCatRegister, hasArgs: true },
  { triggers: _ct(["냥냥이돌봐"]), handler: handleCatCare },
  { triggers: _ct(["냥냥이밥"]).concat(["ㅁㅁ"]), handler: handleCatFeed, hasArgs: true },
  { triggers: _ct(["냥냥이놀자"]).concat(["ㄴㄹ"]), handler: handleCatPlay, hasArgs: true },
  { triggers: _ct(["냥냥이재워"]), handler: handleCatSleep },
  { triggers: _ct(["냥냥이모험결과"]).concat(["ㅁㅎㄱㄱ"]), handler: handleCatAdventureResult },
  { triggers: _ct(["냥냥이모험"]).concat(["ㅁㅎ"]), handler: handleCatAdventure, hasArgs: true },
  { triggers: _ct(["냥냥이훈련"]).concat(["ㅎㄹ"]), handler: handleCatTrain, hasArgs: true },
  { triggers: _ct(["냥냥이기술"]), handler: handleCatTricks },
  { triggers: _ct(["냥냥이선택"]), handler: handleCatEventChoice, hasArgs: true },
  { triggers: _ct(["냥냥이퀘보상"]).concat(["ㄴㄴㅋㅂ"]), handler: handleCatQuestClaim },
  { triggers: _ct(["냥냥이퀘스트"]).concat(["ㄴㄴㅋ"]), handler: handleCatQuest },
  { triggers: _ct(["냥냥이업적"]), handler: handleCatAchievements },
  { triggers: _ct(["냥냥이인사"]), handler: handleCatGreet, hasArgs: true },
  { triggers: _ct(["냥냥이랭킹"]).concat(["ㄴㄴㄹㅋ"]), handler: handleCatRanking },
  { triggers: _ct(["냥냥이환생"]), handler: handleCatPrestige, hasArgs: true },
  { triggers: _ct(["냥냥이상점"]).concat(["ㄴㄴㅅㅈ"]), handler: handleCatShop },
  { triggers: _ct(["냥냥이구매"]).concat(["ㄴㄴㄱ"]), handler: handleCatBuy, hasArgs: true },
  { triggers: _ct(["냥냥이인벤"]).concat(["ㄴㄴㅇㅂ"]), handler: handleCatInventory },
  { triggers: _ct(["냥냥이의상"]), handler: handleCatOutfit, hasArgs: true },
  { triggers: _ct(["냥냥이설명"]).concat(["ㄴㄴㅅㅁ"]), handler: handleCatGuide },
  { triggers: _ct(["냥냥이도움말"]).concat(["ㄴㄴㄷ"]), handler: handleCatHelp },
  { triggers: _ct(["냥냥이", "냥냥이정보"]).concat(["ㄴㄴ"]), handler: handleCatInfo }
];
// ===== 정답/힌트/포기 핸들러 =====

function handleAnswer(room, msg, sender, replier) {
  var quiz = roomState[room].activeQuiz;
  var userAnswer = msg.replace(/^정답[\s:]+/, "").trim();

  if (!userAnswer) {
    replier.reply("'정답 [답]' 형식으로 입력해주세요!");
    return;
  }

  var correctAnswer = stripParens(quiz.answer);
  if (normalize(userAnswer) === normalize(correctAnswer)) {
    var elapsed = Math.round((Date.now() - quiz.startTime) / 1000);
    addScore(room, quiz.type, sender, true);

    replier.reply(
      "[ 싱봇 ] 정답입니다! 🎉\n\n" +
      sender + "님 대단해요!\n" +
      "정답: " + quiz.answer + "\n" +
      "소요시간: " + elapsed + "초"
    );

    roomState[room].activeQuiz = null;
  } else {
    addScore(room, quiz.type, sender, false);

    // 맞은 글자 공개
    var normUser = normalize(userAnswer);
    var normCorrect = normalize(correctAnswer);
    if (!quiz.revealedChars) quiz.revealedChars = {};
    for (var i = 0; i < normUser.length && i < normCorrect.length; i++) {
      if (normUser[i] === normCorrect[i]) {
        quiz.revealedChars[i] = normCorrect[i];
      }
    }
    var matchDisplay = "";
    for (var i = 0; i < normCorrect.length; i++) {
      matchDisplay += quiz.revealedChars[i] ? quiz.revealedChars[i] : "○";
    }

    replier.reply("• " + matchDisplay + " 틀렸습니다!");
  }
}

function handleHint(room, msg, sender, replier) {
  var quiz = roomState[room].activeQuiz;
  var correctAnswer = normalize(stripParens(quiz.answer));

  // 이미 공개된 글자가 1/2 이상이면 현재 상태만 보여줌
  var revealedCount = 0;
  if (quiz.revealedChars) {
    for (var k in quiz.revealedChars) {
      if (quiz.revealedChars.hasOwnProperty(k)) revealedCount++;
    }
  }

  if (revealedCount >= Math.ceil(correctAnswer.length / 2)) {
    var current = "";
    for (var i = 0; i < correctAnswer.length; i++) {
      current += (quiz.revealedChars && quiz.revealedChars[i]) ? quiz.revealedChars[i] : "○";
    }
    replier.reply("[ 싱봇 ] 힌트: " + current + "\n이미 절반 이상 공개됐어요!");
    return;
  }

  if (!quiz.revealedChars) quiz.revealedChars = {};

  // 아직 안 공개된 글자 중 랜덤 1개만 추가 공개
  var answerChars = stripParens(quiz.answer).split("");
  var hidden = [];
  for (var i = 0; i < answerChars.length; i++) {
    if (!quiz.revealedChars[i]) hidden.push(i);
  }

  if (hidden.length > 0) {
    var pick = hidden[Math.floor(Math.random() * hidden.length)];
    quiz.revealedChars[pick] = answerChars[pick];
  }

  var display = "";
  for (var i = 0; i < answerChars.length; i++) {
    display += quiz.revealedChars[i] ? quiz.revealedChars[i] : "○";
  }

  replier.reply("[ 싱봇 ] 힌트: " + display);
}

function handleSkip(room, msg, sender, replier) {
  var quiz = roomState[room].activeQuiz;
  var text = "[ 싱봇 ] 정답은 '" + stripParens(quiz.answer) + "' 이었습니다!\n";
  if (quiz.reason) {
    text += "이유: " + quiz.reason + "\n";
  }
  text += "다시 도전하려면 '" + (quiz.type === "nonsense" ? "넌센스" : "캐치마인드") + "'를 입력하세요.";
  replier.reply(text);
  roomState[room].activeQuiz = null;
}

// ===== 도움말 =====

function handleHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 도움말 ]\n\n" +
    "🧩 넌센스 — 넌센스 퀴즈 시작\n" +
    "🎨 캐치마인드 — 단어 맞추기 시작\n" +
    "📖 오늘의한마디 — 오늘의 명언\n" +
    "🔮 운세 성별 생년월일\n" +
    "   예) 운세 여자 19901122\n" +
    "   예) 오늘의운세,남,19901122\n" +
    "⚡ vs 선택지1 선택지2 ...\n" +
    "   예) vs 짜장면 짬뽕 탕수육\n\n" +
    "퀴즈 중 명령어:\n" +
    "  정답 [답] — 정답 제출\n" +
    "  힌트 — 힌트 보기\n" +
    "  포기 — 정답 공개\n\n" +
    "넌센스점수판 / 캐치점수판\n\n" +
    "🤖 ~ <질문> — AI 대화\n" +
    "🔄 대화초기화 — AI 대화 기록 리셋\n\n" +
    "⛏️ ㄱㅅ등록 [이름] — 광산 게임 시작\n" +
    "⛏️ ㄱㅅ도움말 — 광산 명령어 보기\n\n" +
    "🎬 CGV등록 영화 날짜 — 상영 감시 등록\n" +
    "🎬 CGV도움말 — CGV 명령어 보기\n\n" +
    "🐱 ㄴㄴㅇ등록 [이름] — 고양이 키우기\n" +
    "🐱 ㄴㄴㄷ — 냥냥이 도움말"
  );
}

// ===== 싱봇 명령어 라우터 =====

var COMMANDS = [
  { triggers: ["~"], handler: handleChat, hasArgs: true },
  { triggers: ["대화초기화"], handler: handleChatReset },
  { triggers: ["넌센스", "넌센스퀴즈"], handler: handleNonsenseStart },
  { triggers: ["캐치마인드", "캐치"], handler: handleCatchmindStart },
  { triggers: ["오늘의한마디"], handler: handleDailyQuote },
  { triggers: ["운세", "오늘의운세"], handler: handleFortune, hasArgs: true },
  { triggers: ["vs", "VS"], handler: handleVsPick, hasArgs: true },
  { triggers: ["넌센스점수판"], handler: handleNonsenseLeaderboard },
  { triggers: ["캐치점수판"], handler: handleCatchmindLeaderboard },
  { triggers: ["도움말", "명령어"], handler: handleHelp }
];

var CONTEXT_COMMANDS = [
  { prefix: "정답 ", handler: handleAnswer },
  { prefix: "정답:", handler: handleAnswer },
  { triggers: ["힌트"], handler: handleHint },
  { triggers: ["포기", "스킵"], handler: handleSkip }
];

function _response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  var trimmed = msg.trim();

  // 폰 키보드 호환: 명령어 맨 앞의 복합자음 분해형을 결합형으로 정규화 (예: ㄱㅅㅋ → ㄳㅋ)
  var _choPairs = [["ㄱㅅ","ㄳ"],["ㄴㅈ","ㄵ"],["ㄴㅎ","ㄶ"],["ㄹㄱ","ㄺ"],["ㄹㅁ","ㄻ"],["ㄹㅂ","ㄼ"],["ㄹㅅ","ㄽ"],["ㄹㅌ","ㄾ"],["ㄹㅍ","ㄿ"],["ㄹㅎ","ㅀ"],["ㅂㅅ","ㅄ"]];
  for (var _ci = 0; _ci < _choPairs.length; _ci++) {
    if (trimmed.indexOf(_choPairs[_ci][0]) === 0) {
      trimmed = _choPairs[_ci][1] + trimmed.substring(2);
      break;
    }
  }

  // 0. CGV 자동 알림 체크 (2분마다 최대 1회)
  if (typeof checkCgvAutoAlert === "function") {
    var _now = Date.now();
    if (!_response._lastCgvCheck || _now - _response._lastCgvCheck > 120000) {
      _response._lastCgvCheck = _now;
      try { checkCgvAutoAlert(replier); } catch (e) {}
    }
  }

  // 1. 퀴즈 진행 중이면 컨텍스트 명령 먼저
  // 메신저봇R이 같은 카톡방이라도 sender별로 room 문자열을 다르게 전달하는 경우 대응:
  // 현재 room에 활성 퀴즈가 없으면 roomState 전체에서 가장 최근 시작된 활성 퀴즈를 찾음
  var _activeRoom = null;
  if (roomState[room] && roomState[room].activeQuiz) {
    _activeRoom = room;
  } else {
    var _latestStart = 0;
    for (var _rKey in roomState) {
      if (roomState.hasOwnProperty(_rKey) && roomState[_rKey].activeQuiz) {
        var _st = roomState[_rKey].activeQuiz.startTime || 0;
        if (_st > _latestStart) {
          _latestStart = _st;
          _activeRoom = _rKey;
        }
      }
    }
  }

  if (_activeRoom) {
    var _lines = trimmed.split("\n");
    for (var _li = 0; _li < _lines.length; _li++) {
      var _line = _lines[_li].trim();
      if (!_line) continue;
      for (var i = 0; i < CONTEXT_COMMANDS.length; i++) {
        var cmd = CONTEXT_COMMANDS[i];
        if (cmd.prefix && _line.indexOf(cmd.prefix) === 0) {
          cmd.handler(_activeRoom, _line, sender, replier);
          return;
        }
        if (cmd.triggers) {
          for (var j = 0; j < cmd.triggers.length; j++) {
            if (_line === cmd.triggers[j]) {
              cmd.handler(_activeRoom, _line, sender, replier);
              return;
            }
          }
        }
      }
    }
  }

  // 2. 전역 명령 (COMMANDS + MINE_COMMANDS + CGV_COMMANDS)
  var allCommands = COMMANDS;
  if (typeof MINE_COMMANDS !== "undefined") {
    allCommands = COMMANDS.concat(MINE_COMMANDS);
  }
  if (typeof CGV_COMMANDS !== "undefined") {
    allCommands = allCommands.concat(CGV_COMMANDS);
  }
  if (typeof CAT_COMMANDS !== "undefined") {
    allCommands = allCommands.concat(CAT_COMMANDS);
  }
  for (var i = 0; i < allCommands.length; i++) {
    var cmd = allCommands[i];
    for (var j = 0; j < cmd.triggers.length; j++) {
      var trigger = cmd.triggers[j];
      if (cmd.hasArgs) {
        if (trimmed.indexOf(trigger + " ") === 0 || trimmed === trigger) {
          cmd.handler(room, trimmed, sender, replier);
          return;
        }
      } else {
        if (trimmed === trigger) {
          cmd.handler(room, trimmed, sender, replier);
          return;
        }
      }
    }
  }
}

// response()는 loader.js에서 정의 (GitHub 실시간 로드 방식)
// 직접 실행 시에는 아래 주석을 해제하세요:
// function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
//   if (packageName !== "com.kakao.talk") return;
//   try {
//     _response(room, msg, sender, isGroupChat, replier, imageDB, packageName);
//   } catch (e) {
//     Log.e("싱봇 오류: " + e.toString());
//   }
// }
