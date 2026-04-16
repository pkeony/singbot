// ===== Gemma AI 대화 =====

var GEMMA_API_KEY = (function() {
  try {
    var raw = FileStream.read(DATA_DIR + "api_key.txt");
    return raw ? raw.trim() : "";
  } catch (e) {
    return "";
  }
})();
var GEMMA_MODEL = "gemma-4-31b-it";
var GEMMA_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMMA_MODEL + ":generateContent?key=" + GEMMA_API_KEY;

var chatHistory = {};

function handleChat(room, msg, sender, replier) {
  var prompt = msg.replace(/^~\s*/, "").trim();
  if (!prompt) {
    replier.reply("사용법: ~ <질문>\n예) ~ 오늘 뭐 먹지?");
    return;
  }

  if (!GEMMA_API_KEY) {
    replier.reply("API 키가 설정되지 않았어요.\n" + DATA_DIR + "api_key.txt 파일에 키를 넣어주세요.");
    return;
  }

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
