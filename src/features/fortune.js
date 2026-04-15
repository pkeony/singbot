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

    result += "총운: \"" + FORTUNE_WORD[s1 % FORTUNE_WORD.length] + "\"\n\n";
    result += FORTUNE_INTRO[s2 % FORTUNE_INTRO.length] + " ";
    result += FORTUNE_BODY[s3 % FORTUNE_BODY.length] + " ";
    result += FORTUNE_CLOSING[s4 % FORTUNE_CLOSING.length];
  }

  result += "\n\n━━━━━━━━━━━━━━━━━━\n";

  var s5 = Math.abs(hashCode(name + year + month + day + gender + todayString() + "luck"));
  result += "🔮 행운지수: " + generateBar((s5 % 100) + 1) + " " + ((s5 % 100) + 1) + "점\n";
  result += "🎨 행운의 색: " + LUCKY_COLORS[Math.abs(hashCode(name + year + todayString() + "color")) % LUCKY_COLORS.length] + "\n";
  result += "🔢 행운의 숫자: " + ((Math.abs(hashCode(name + day + todayString() + "num")) % 45) + 1);

  replier.reply(result);
}
