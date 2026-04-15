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
