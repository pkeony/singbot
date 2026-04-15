// ===== 오늘의 한마디 =====

function handleDailyQuote(room, msg, sender, replier) {
  var idx = todaySeed() % QUOTES_DB.length;
  var quote = QUOTES_DB[idx];

  replier.reply(
    "[ 싱봇 오늘의 한마디 ]\n\n" +
    "\"" + quote.text + "\"\n\n" +
    "- " + quote.author + " -"
  );
}
