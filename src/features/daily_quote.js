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
