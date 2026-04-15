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
