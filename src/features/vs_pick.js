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
