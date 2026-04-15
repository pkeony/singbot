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
    "⛏️ ㄱㅅ도움말 — 광산 명령어 보기"
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

  // 1. 퀴즈 진행 중이면 컨텍스트 명령 먼저
  if (roomState[room] && roomState[room].activeQuiz) {
    for (var i = 0; i < CONTEXT_COMMANDS.length; i++) {
      var cmd = CONTEXT_COMMANDS[i];
      if (cmd.prefix && trimmed.indexOf(cmd.prefix) === 0) {
        cmd.handler(room, trimmed, sender, replier);
        return;
      }
      if (cmd.triggers) {
        for (var j = 0; j < cmd.triggers.length; j++) {
          if (trimmed === cmd.triggers[j]) {
            cmd.handler(room, trimmed, sender, replier);
            return;
          }
        }
      }
    }
  }

  // 2. 전역 명령 (COMMANDS + MINE_COMMANDS)
  var allCommands = COMMANDS;
  if (typeof MINE_COMMANDS !== "undefined") {
    allCommands = COMMANDS.concat(MINE_COMMANDS);
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

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if (packageName !== "com.kakao.talk") return;
  try {
    _response(room, msg, sender, isGroupChat, replier, imageDB, packageName);
  } catch (e) {
    Log.e("싱봇 오류: " + e.toString());
  }
}
