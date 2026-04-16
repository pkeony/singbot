#!/bin/bash
# singbot 빌드 스크립트 - src/ 파일들을 main.js로 합침
# 대용량 DB 본문은 data/*.json 으로 분리되어 있고, src/data/*.js 는 lazy loader 스텁만 포함

OUTPUT="main.js"

cat \
  src/core/polyfills.js \
  src/data/quotes_db.js \
  src/data/nonsense_db.js \
  src/data/catchmind_db.js \
  src/data/fortune_db.js \
  src/core/utils.js \
  src/core/state.js \
  src/features/vs_pick.js \
  src/features/daily_quote.js \
  src/features/nonsense_quiz.js \
  src/features/catchmind.js \
  src/features/fortune.js \
  src/features/chat.js \
  src/data/mine_db.js \
  src/features/mine.js \
  src/features/cgv.js \
  src/core/router.js \
  > "$OUTPUT" 2>/dev/null

echo "빌드 완료: $OUTPUT ($(wc -l < "$OUTPUT") 줄)"
