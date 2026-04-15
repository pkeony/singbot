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
