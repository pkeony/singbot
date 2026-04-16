// ===== 싱봇 냥냥이 게임 =====

var CAT_DATA_DIR = DATA_DIR + "cat_data/";
var catAccounts = {};

// === 유틸리티 ===

function saveCatAccount(sender, account) {
  catAccounts[sender] = account;
  var fileName = sanitizeSender(sender) + ".json";
  try {
    FileStream.createDir(CAT_DATA_DIR);
    FileStream.write(CAT_DATA_DIR + fileName, JSON.stringify(account));
  } catch (e) {
    try {
      var folder = new java.io.File(CAT_DATA_DIR);
      if (!folder.exists()) folder.mkdirs();
      var file = new java.io.File(folder, fileName);
      var fos = new java.io.FileOutputStream(file);
      var writer = new java.io.OutputStreamWriter(fos, "UTF-8");
      writer.write(JSON.stringify(account));
      writer.close();
      fos.close();
    } catch (e2) {
      Log.e("냥냥이 저장 오류: " + e2);
    }
  }
}

function loadCatAccount(sender) {
  if (catAccounts[sender]) return catAccounts[sender];
  var fileName = sanitizeSender(sender) + ".json";
  try {
    var raw = FileStream.read(CAT_DATA_DIR + fileName);
    if (raw) {
      catAccounts[sender] = JSON.parse(raw);
      return catAccounts[sender];
    }
  } catch (e) {}
  try {
    var file = new java.io.File(CAT_DATA_DIR, fileName);
    if (file.exists()) {
      var fis = new java.io.FileInputStream(file);
      var reader = new java.io.InputStreamReader(fis, "UTF-8");
      var br = new java.io.BufferedReader(reader);
      var data = "";
      var line;
      while ((line = br.readLine()) != null) data += line;
      br.close();
      reader.close();
      fis.close();
      catAccounts[sender] = JSON.parse(data);
      return catAccounts[sender];
    }
  } catch (e2) {}
  return null;
}

// 초성 단축키 헬퍼
function _ct(triggers) {
  var result = [];
  for (var i = 0; i < triggers.length; i++) {
    result.push(triggers[i]);
    if (triggers[i].indexOf("냥냥이") === 0) {
      result.push("ㄴㄴㅇ" + triggers[i].substring(3));
    }
  }
  return result;
}

// 랜덤 범위 정수
function catRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 가중치 랜덤 선택
function catWeightedPick(items, weightKey) {
  var total = 0;
  for (var i = 0; i < items.length; i++) total += (items[i][weightKey] || 1);
  var r = Math.random() * total;
  var sum = 0;
  for (var i = 0; i < items.length; i++) {
    sum += (items[i][weightKey] || 1);
    if (r < sum) return items[i];
  }
  return items[items.length - 1];
}

// 스탯 바
function catStatBar(value, max) {
  max = max || 100;
  var filled = Math.round((value / max) * 10);
  var bar = "";
  for (var i = 0; i < 10; i++) {
    bar += i < filled ? "■" : "□";
  }
  return "[" + bar + "] " + value;
}

// === 계정 생성 ===

function createCatAccount(sender, name) {
  var data = getCatData();
  var breeds = data.breeds;

  // 품종 가중치 선택
  var breedList = [];
  for (var id in breeds) {
    if (breeds.hasOwnProperty(id)) {
      breedList.push({ id: id, weight: breeds[id].weight });
    }
  }
  var breedPick = catWeightedPick(breedList, "weight");
  var breed = breeds[breedPick.id];

  // 성격 랜덤 생성 (품종 범위 내)
  var personality = {};
  var pKeys = ["curiosity", "affection", "mischief", "bravery", "laziness"];
  for (var i = 0; i < pKeys.length; i++) {
    var range = breed.personality[pKeys[i]];
    personality[pKeys[i]] = catRandInt(range[0], range[1]);
  }

  // 무늬 & 눈색
  var furPattern = pickRandom(data.furPatterns);
  var eyeColor = pickRandom(data.eyeColors);

  // 특성 2개 랜덤
  var shuffled = data.traits.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }
  var traits = [shuffled[0].id, shuffled[1].id];

  return {
    name: name,
    sender: sender,
    createdAt: Date.now(),
    lastInteractTime: Date.now(),
    lastDecayCalc: Date.now(),

    breed: breedPick.id,
    furPattern: furPattern.id,
    eyeColor: eyeColor.id,
    personality: personality,
    traits: traits,

    stage: 0,
    stageProgress: 0,
    hatchCount: 0,
    lastHatchTime: 0,
    ageDays: 0,
    totalInteractions: 0,

    hunger: 80,
    happiness: 70,
    energy: 90,
    trust: 10,
    health: 100,

    fishCoins: data.config.INITIAL_FISH,
    starDust: 0,

    inventory: [],
    wardrobe: [],
    currentOutfit: null,
    discoveredTreasures: {},
    trickBook: [],

    activeAdventure: null,
    adventureLog: [],
    adventureCount: 0,
    uniqueLocations: [],

    catFriends: [],
    rivalCat: null,
    socialCooldown: 0,

    lastDreamCheck: Date.now(),
    dreamJournal: [],

    achievements: [],
    titles: { unlocked: [], equipped: null },
    stats: {
      totalFeedings: 0,
      totalPlays: 0,
      totalAdventures: 0,
      totalTricksLearned: 0,
      totalFishEarned: 0,
      totalTreasuresFound: 0,
      longestStreak: 0,
      currentStreak: 0,
      lastStreakDate: "",
      neglectCount: 0,
      perfectDays: 0
    },
    dailyActions: { date: "", fed: 0, played: 0, trained: 0, adventureSent: 0 },
    pendingEvent: null,
    prestigeCount: 0,
    secretFlags: {}
  };
}

// === 스탯 감소 ===

function applyCatDecay(account) {
  var now = Date.now();
  var elapsed = now - account.lastDecayCalc;
  var hours = elapsed / 3600000;
  if (hours < 0.1) return;

  var cfg = getCatData().config;
  account.hunger = Math.max(0, account.hunger - Math.floor(hours * cfg.HUNGER_DECAY_PER_HOUR));
  account.happiness = Math.max(0, account.happiness - Math.floor(hours * cfg.HAPPINESS_DECAY_PER_HOUR));
  account.energy = Math.min(100, account.energy + Math.floor(hours * cfg.ENERGY_REGEN_PER_HOUR));

  if (hours > cfg.TRUST_DECAY_AFTER_HOURS && account.trust > 0) {
    account.trust = Math.max(0, Math.floor(account.trust - (hours - cfg.TRUST_DECAY_AFTER_HOURS) * cfg.TRUST_DECAY_PER_HOUR));
  }

  if (account.hunger === 0 || account.happiness === 0) {
    var sickTicks = Math.floor(hours / 6);
    if (sickTicks > 0) {
      account.health = Math.max(0, account.health - sickTicks * cfg.HEALTH_DECAY_PER_6H_NEGLECT);
    }
  }

  // 특성: 자가치유
  if (account.traits && account.traits.indexOf("healer") !== -1 && account.health < 100) {
    account.health = Math.min(100, account.health + Math.floor(hours * 0.5));
  }

  account.lastDecayCalc = now;
}

// === 일일 초기화 ===

function resetCatDaily(account) {
  var today = todayString();
  if (account.dailyActions.date !== today) {
    // 스트릭 체크
    var yesterday = account.dailyActions.date;
    if (yesterday) {
      var yd = new Date(yesterday);
      var td = new Date(today);
      var diff = Math.round((td - yd) / 86400000);
      if (diff === 1) {
        account.stats.currentStreak++;
        if (account.stats.currentStreak > account.stats.longestStreak) {
          account.stats.longestStreak = account.stats.currentStreak;
        }
      } else if (diff > 1) {
        account.stats.currentStreak = 1;
      }
    } else {
      account.stats.currentStreak = 1;
    }
    account.stats.lastStreakDate = today;

    // 나이 갱신
    var ageMs = Date.now() - account.createdAt;
    account.ageDays = Math.floor(ageMs / 86400000);

    account.dailyActions = { date: today, fed: 0, played: 0, trained: 0, adventureSent: 0 };
  }
}

// === 꿈 시스템 ===

function checkAndGenerateDream(account) {
  var now = Date.now();
  var idleMs = now - account.lastInteractTime;
  var cfg = getCatData().config;

  if (idleMs < cfg.DREAM_MIN_IDLE_MS) return null;
  if (account.stage === 0) return null;

  var data = getCatData();
  var dreams = data.dreams;

  // 성격 기반 가중치 조정
  var weighted = [];
  for (var i = 0; i < dreams.length; i++) {
    var d = dreams[i];
    var w = d.weight || 5;
    if (d.personalityWeight) {
      var parts = d.personalityWeight.split("_");
      var stat = parts[0];
      var dir = parts[1];
      var val = account.personality[stat] || 50;
      if (dir === "high" && val > 60) w += 5;
      else if (dir === "low" && val < 40) w += 5;
    }
    // 특성: 몽상가 보너스
    var dreamBonus = (account.traits && account.traits.indexOf("dreamer") !== -1) ? 2 : 1;
    weighted.push({ idx: i, weight: w });
  }

  var pick = catWeightedPick(weighted, "weight");
  var dream = dreams[pick.idx];

  var dreamText = dream.text.split("{name}").join(account.name);
  var statValue = dream.value || 0;
  var coins = dream.coins || 0;

  // 몽상가 특성: 보상 2배
  if (account.traits && account.traits.indexOf("dreamer") !== -1) {
    statValue = Math.floor(statValue * 2);
    coins = Math.floor(coins * 2);
  }

  // 스탯 적용
  if (dream.stat && statValue !== 0) {
    account[dream.stat] = Math.max(0, Math.min(100, (account[dream.stat] || 0) + statValue));
  }
  if (coins > 0) {
    account.fishCoins += coins;
    account.stats.totalFishEarned += coins;
  }

  account.lastDreamCheck = now;

  // 꿈 일지 저장 (최근 3개)
  account.dreamJournal.push({ text: dreamText, time: now });
  if (account.dreamJournal.length > 3) account.dreamJournal.shift();

  var msg = "💤 " + account.name + "(이)가 자는 동안 꿈을 꿨어요...\n\n";
  msg += "\"" + dreamText + "\"\n\n";

  var effects = [];
  if (dream.stat && statValue !== 0) {
    var emoji = { hunger: "🍖", happiness: "😊", energy: "⚡", trust: "💕", health: "❤️" };
    effects.push((emoji[dream.stat] || "📊") + " " + dream.stat + " " + (statValue > 0 ? "+" : "") + statValue);
  }
  if (coins > 0) effects.push("🐟 +" + coins);
  if (effects.length > 0) msg += effects.join(" | ");

  return msg;
}

// === 성장 체크 ===

function checkCatStageUp(account) {
  if (account.stage === 0) return null;
  var data = getCatData();
  if (account.stage >= data.stages.length - 1) return null;
  var nextStage = data.stages[account.stage + 1];
  if (!nextStage) return null;
  if (account.stageProgress >= nextStage.xpReq) {
    account.stage++;
    account.stageProgress = 0;
    return { newStage: account.stage, name: nextStage.name, emoji: nextStage.emoji };
  }
  return null;
}

// === 성격 텍스트 ===

function getCatPersonalityText(personality) {
  var traits = [];
  if (personality.curiosity > 70) traits.push("호기심왕");
  else if (personality.curiosity < 30) traits.push("무관심");
  if (personality.affection > 70) traits.push("애교쟁이");
  else if (personality.affection < 30) traits.push("도도함");
  if (personality.mischief > 70) traits.push("장난꾸러기");
  if (personality.bravery > 70) traits.push("겁없는");
  else if (personality.bravery < 30) traits.push("겁쟁이");
  if (personality.laziness > 70) traits.push("게으름뱅이");
  else if (personality.laziness < 30) traits.push("활발한");
  if (traits.length === 0) traits.push("평범한");
  return traits.join(" · ");
}

// === 핸들러: 등록 ===

function handleCatRegister(room, msg, sender, replier) {
  var existing = loadCatAccount(sender);
  if (existing) {
    replier.reply("[ 싱봇 냥냥이 ] 이미 고양이가 있어요!\n'" + existing.name + "' (이)가 기다리고 있어요 🐱");
    return;
  }

  var name = msg.replace(/^(냥냥이등록|ㄴㄴㅇ등록)\s*/, "").trim();
  if (!name) {
    replier.reply("[ 싱봇 냥냥이 ] 이름을 정해주세요!\n예) 냥냥이등록 나비");
    return;
  }
  if (name.length > 10) {
    replier.reply("[ 싱봇 냥냥이 ] 이름은 10자 이하로 해주세요!");
    return;
  }

  var account = createCatAccount(sender, name);
  saveCatAccount(sender, account);

  replier.reply(
    "[ 싱봇 냥냥이 ] 🥚 알이 도착했어요!\n" +
    "━━━━━━━━━━━━━━━━━━\n" +
    "누군가 문 앞에 따뜻한 알을 놓고 갔어요...\n\n" +
    "🥚 ???의 알\n" +
    "이름: " + name + "\n" +
    "무늬가 어렴풋이 보여요... " + getCatData().furPatterns.filter(function(p) { return p.id === account.furPattern; })[0].name + "?\n\n" +
    "'냥냥이돌봐' 로 알을 따뜻하게 해주세요!\n" +
    "3번 돌보면 부화합니다! 🐣"
  );
}

// === 핸들러: 돌봐 (부화 + 쓰다듬기) ===

function handleCatCare(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  // 알 상태: 부화 진행
  if (account.stage === 0) {
    var now = Date.now();
    var cfg = getCatData().config;
    if (account.lastHatchTime && now - account.lastHatchTime < cfg.HATCH_MIN_INTERVAL_MS) {
      var remain = Math.ceil((cfg.HATCH_MIN_INTERVAL_MS - (now - account.lastHatchTime)) / 60000);
      replier.reply("[ 싱봇 냥냥이 ] 🥚 알이 아직 따뜻해요!\n" + remain + "분 후에 다시 돌봐주세요.");
      return;
    }

    account.hatchCount = (account.hatchCount || 0) + 1;
    account.lastHatchTime = now;
    saveCatAccount(sender, account);

    if (account.hatchCount >= cfg.HATCH_INTERACTIONS) {
      // 부화!
      account.stage = 1;
      account.stageProgress = 0;
      saveCatAccount(sender, account);

      var data = getCatData();
      var breed = data.breeds[account.breed];
      var fur = data.furPatterns.filter(function(p) { return p.id === account.furPattern; })[0];
      var eye = data.eyeColors.filter(function(e) { return e.id === account.eyeColor; })[0];
      var traitTexts = [];
      for (var i = 0; i < account.traits.length; i++) {
        var t = data.traits.filter(function(tr) { return tr.id === account.traits[i]; })[0];
        if (t) traitTexts.push("  🏷️ " + t.name + " — " + t.desc);
      }

      replier.reply(
        "[ 싱봇 냥냥이 ] 🐣 부화했어요!\n" +
        "━━━━━━━━━━━━━━━━━━\n" +
        breed.emoji + " " + account.name + " (아기 고양이)\n" +
        "품종: " + breed.name + "\n" +
        "무늬: " + fur.emoji + " " + fur.name + "\n" +
        "눈: " + eye.emoji + " " + eye.name + "\n" +
        "성격: " + getCatPersonalityText(account.personality) + "\n\n" +
        "고유 특성:\n" + traitTexts.join("\n") + "\n\n" +
        breed.desc + "\n\n" +
        "'냥냥이' 로 상태를 확인하세요!"
      );
      return;
    }

    var remaining = cfg.HATCH_INTERACTIONS - account.hatchCount;
    var progress = "";
    for (var i = 0; i < account.hatchCount; i++) progress += "🔥";
    for (var i = 0; i < remaining; i++) progress += "⬜";

    replier.reply(
      "[ 싱봇 냥냥이 ] 🥚 알을 따뜻하게 감싸줬어요!\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "부화 진행: " + progress + " (" + account.hatchCount + "/" + cfg.HATCH_INTERACTIONS + ")\n" +
      (remaining === 1 ? "거의 다 됐어요! 한 번만 더!" : remaining + "번 더 돌봐주세요!") + "\n" +
      "(10분 간격으로 돌봐주세요)"
    );
    return;
  }

  // 일반 쓰다듬기
  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  account.happiness = Math.min(100, account.happiness + 5);
  account.trust = Math.min(100, account.trust + 1);
  account.stageProgress += 2;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();
  saveCatAccount(sender, account);

  var reactions = [
    account.name + "(이)가 그르릉거리며 머리를 비벼요 💕",
    account.name + "(이)가 눈을 살짝 감고 편안해했어요 😌",
    account.name + "(이)가 꼬리를 살랑살랑 흔들어요 🐾",
    account.name + "(이)가 배를 보여주며 뒹굴었어요! 😸",
    account.name + "(이)가 손을 핥아줬어요 👅"
  ];

  var text = "[ 싱봇 냥냥이 ] 🐾 쓰다듬기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n😊 행복 +5 | 💕 신뢰 +1";
  replier.reply(text);
}

// === 핸들러: 상태 확인 ===

function handleCatInfo(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (account.stage === 0) {
    var cfg = getCatData().config;
    var progress = (account.hatchCount || 0) + "/" + cfg.HATCH_INTERACTIONS;
    replier.reply(
      "[ 싱봇 냥냥이 ] 🥚 " + account.name + "의 알\n" +
      "━━━━━━━━━━━━━━━━━━\n" +
      "부화 진행: " + progress + "\n" +
      "'냥냥이돌봐' 로 알을 따뜻하게 해주세요!"
    );
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);
  account.lastInteractTime = Date.now();
  saveCatAccount(sender, account);

  var data = getCatData();
  var breed = data.breeds[account.breed];
  var fur = data.furPatterns.filter(function(p) { return p.id === account.furPattern; })[0];
  var eye = data.eyeColors.filter(function(e) { return e.id === account.eyeColor; })[0];
  var stage = data.stages[account.stage];
  var nextXP = account.stage < data.stages.length - 1 ? data.stages[account.stage + 1].xpReq : "MAX";

  var outfitText = account.currentOutfit ? (" | 👗 " + account.currentOutfit) : "";
  var genText = account.prestigeCount > 0 ? " (" + (account.prestigeCount + 1) + "세대)" : "";

  var text = "[ 싱봇 냥냥이 ] " + breed.emoji + " " + account.name + "\n";
  text += "━━━━━━━━━━━━━━━━━━\n";

  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";

  text += breed.emoji + " " + breed.name + " | " + fur.emoji + fur.name + " | " + eye.emoji + eye.name + "\n";
  if (account.currentOutfit) text += "👗 " + account.currentOutfit + "\n";
  if (account.titles.equipped) text += "🏷️ " + account.titles.equipped + genText + "\n";

  text += "\n📊 상태:\n";
  text += "  🍖 배고픔: " + catStatBar(account.hunger) + "\n";
  text += "  😊 행복:   " + catStatBar(account.happiness) + "\n";
  text += "  ⚡ 에너지: " + catStatBar(account.energy) + "\n";
  text += "  💕 신뢰:   " + catStatBar(account.trust) + "\n";
  text += "  ❤️ 건강:   " + catStatBar(account.health) + "\n";

  text += "\n🐾 " + stage.name + " (Lv." + account.stage + ") — " + account.stageProgress + "/" + nextXP + " XP\n";
  text += "📅 나이: " + account.ageDays + "일";
  if (account.stats.currentStreak > 1) text += " | 🔥 연속 " + account.stats.currentStreak + "일";
  text += "\n";

  text += "\n💰 🐟 " + account.fishCoins;
  if (account.starDust > 0) text += " | ✨ " + account.starDust;
  text += "\n";

  text += "\n🎯 오늘: 밥 " + account.dailyActions.fed + "/" + data.config.MAX_DAILY_FEED;
  text += " | 놀기 " + account.dailyActions.played + "/" + data.config.MAX_DAILY_PLAY;
  text += "\n";

  text += "\n성격: " + getCatPersonalityText(account.personality);

  // 모험 진행 중?
  if (account.activeAdventure) {
    var adv = account.activeAdventure;
    var remain = Math.max(0, Math.ceil((adv.returnTime - Date.now()) / 60000));
    if (remain > 0) {
      text += "\n\n🗺️ " + adv.locationName + " 모험 중! (남은 " + remain + "분)";
    } else {
      text += "\n\n🗺️ 모험 완료! 'ㅁㅎㄱㄱ'로 결과 확인!";
    }
  }

  text += "\n\n'ㅁㅁ' 밥 | 'ㄴㄹ' 놀기 | 'ㅁㅎ' 모험 | 'ㄴㄴㄷ' 도움말";
  replier.reply(text);
}

// === 핸들러: 밥 주기 ===

function handleCatFeed(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 밥을 못 먹어요! 'ㄴㄴㅇ돌봐'로 부화시켜주세요.");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  var data = getCatData();

  // 일일 제한
  if (account.dailyActions.fed >= data.config.MAX_DAILY_FEED) {
    replier.reply("[ 싱봇 냥냥이 ] 오늘은 이미 " + data.config.MAX_DAILY_FEED + "번 먹었어요!\n배가 너무 불러요! 🤢");
    return;
  }

  var foodName = msg.replace(/^(냥냥이밥|ㄴㄴㅇ밥|ㅁㅁ)\s*/, "").trim() || "건사료";
  var food = data.foods[foodName];
  if (!food) {
    var foodList = [];
    for (var fn in data.foods) {
      if (data.foods.hasOwnProperty(fn)) {
        foodList.push("  " + fn + " (" + data.foods[fn].cost + "🐟) — " + data.foods[fn].desc);
      }
    }
    replier.reply(
      "[ 싱봇 냥냥이 ] 🍖 음식 목록\n━━━━━━━━━━━━━━━━━━\n" +
      foodList.join("\n") + "\n\n'ㅁㅁ [음식이름]' 으로 먹여주세요!"
    );
    return;
  }

  // 돈 체크
  if (account.fishCoins < food.cost) {
    replier.reply("[ 싱봇 냥냥이 ] 🐟 물고기코인이 부족해요!\n필요: " + food.cost + " | 보유: " + account.fishCoins);
    return;
  }

  account.fishCoins -= food.cost;

  // 음식 효과 적용
  var hungerGain = food.hunger || 0;
  var happyGain = food.happiness || 0;
  var energyGain = food.energy || 0;
  var trustGain = food.trust || 0;

  // 특성: 먹보 보너스
  if (account.traits && account.traits.indexOf("foodie") !== -1) {
    hungerGain += 5;
  }

  // 특성: 까다로운 입맛
  if (account.traits && account.traits.indexOf("picky") !== -1) {
    if (food.cost < 30) {
      happyGain -= 10;
    } else {
      happyGain += 10;
    }
  }

  // 성격 반응
  var reaction = "";
  if (account.personality.affection > 70) {
    trustGain += 2;
    reaction = account.name + "(이)가 그르릉거리며 맛있게 먹어요 💕";
  } else if (account.personality.mischief > 70) {
    reaction = account.name + "(이)가 " + foodName + "을(를) 가지고 놀다가 먹었어요 😼";
  } else if (account.personality.laziness > 70) {
    reaction = account.name + "(이)가 느긋하게 다가와서... 천천히 먹기 시작했어요 😴";
  } else {
    reaction = account.name + "(이)가 " + foodName + "을(를) 맛있게 먹었어요! 😋";
  }

  account.hunger = Math.min(100, account.hunger + hungerGain);
  account.happiness = Math.max(0, Math.min(100, account.happiness + happyGain));
  account.energy = Math.min(100, account.energy + energyGain);
  account.trust = Math.min(100, account.trust + trustGain);

  // 우유 배탈
  var sickMsg = "";
  if (food.sickChance && Math.random() < food.sickChance) {
    account.health = Math.max(0, account.health - (food.sickDamage || 5));
    sickMsg = "\n⚠️ 배탈이 났어요! 건강 -" + (food.sickDamage || 5);
  }

  // 고급캔 XP 보너스
  var bonusXP = food.bonusXP || 0;
  account.stageProgress += 2 + bonusXP;
  account.dailyActions.fed++;
  account.stats.totalFeedings++;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  var stageUp = checkCatStageUp(account);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🍖 밥 주기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += reaction + "\n\n";
  text += "🍖 배고픔 +" + hungerGain + " → " + account.hunger + "\n";
  if (happyGain !== 0) text += "😊 행복 " + (happyGain > 0 ? "+" : "") + happyGain + " → " + account.happiness + "\n";
  if (energyGain !== 0) text += "⚡ 에너지 +" + energyGain + " → " + account.energy + "\n";
  if (trustGain > 0) text += "💕 신뢰 +" + trustGain + " → " + account.trust + "\n";
  text += "🐟 -" + food.cost + " (잔액: " + account.fishCoins + ")";
  if (sickMsg) text += sickMsg;
  if (bonusXP > 0) text += "\n⬆️ 보너스 XP +" + bonusXP;
  if (stageUp) text += "\n\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += "\n\n(오늘 " + account.dailyActions.fed + "/" + getCatData().config.MAX_DAILY_FEED + ")";
  replier.reply(text);
}

// === 핸들러: 놀기 ===

function handleCatPlay(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 아직 놀 수 없어요!");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  var data = getCatData();

  if (account.dailyActions.played >= data.config.MAX_DAILY_PLAY) {
    replier.reply("[ 싱봇 냥냥이 ] 오늘은 이미 " + data.config.MAX_DAILY_PLAY + "번 놀았어요!\n" + account.name + "(이)가 지쳐있어요 😴");
    return;
  }

  var playName = msg.replace(/^(냥냥이놀자|ㄴㄴㅇ놀자|ㄴㄹ)\s*/, "").trim() || "실뭉치";
  var play = data.plays[playName];
  if (!play) {
    var playList = [];
    for (var pn in data.plays) {
      if (data.plays.hasOwnProperty(pn)) {
        var p = data.plays[pn];
        var avail = !p.requireItem || hasItem(account, pn);
        playList.push("  " + (avail ? "✅" : "🔒") + " " + pn + " — " + p.desc);
      }
    }
    replier.reply(
      "[ 싱봇 냥냥이 ] 🧶 놀이 목록\n━━━━━━━━━━━━━━━━━━\n" +
      playList.join("\n") + "\n\n🔒 = 상점에서 구매 필요\n'ㄴㄹ [놀이이름]' 으로 놀아주세요!"
    );
    return;
  }

  // 아이템 필요 체크
  if (play.requireItem && !hasItem(account, playName)) {
    replier.reply("[ 싱봇 냥냥이 ] '" + playName + "'이(가) 없어요!\n'ㄴㄴㅅㅈ'에서 구매하세요.");
    return;
  }

  // 에너지 체크
  var energyCost = Math.abs(play.energy || 0);
  if (account.energy < energyCost) {
    replier.reply("[ 싱봇 냥냥이 ] " + account.name + "(이)가 너무 피곤해요... 😴\n에너지: " + account.energy + " (필요: " + energyCost + ")\n'냥냥이재워'로 쉬게 해주세요!");
    return;
  }

  var happyGain = play.happiness || 0;
  var trustGain = play.trust || 0;

  // 성격 보너스
  if (play.personalityBonus && account.personality[play.personalityBonus] > 60) {
    happyGain += 10;
    trustGain += 1;
  }

  // 특성: 껴안기좋아함
  if (account.traits && account.traits.indexOf("cuddler") !== -1) {
    trustGain += 2;
  }

  account.energy = Math.max(0, account.energy + (play.energy || 0));
  account.happiness = Math.min(100, account.happiness + happyGain);
  account.trust = Math.min(100, account.trust + trustGain);
  account.stageProgress += 5;
  account.dailyActions.played++;
  account.stats.totalPlays++;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  var reactions = [
    account.name + "(이)가 " + playName + "(으)로 신나게 놀았어요! 😸",
    account.name + "(이)가 " + playName + "에 푹 빠졌어요! 🐾",
    account.name + "(이)가 폴짝폴짝 뛰며 즐거워해요! 🎉",
    account.name + "(이)가 꼬리를 팽팽 돌리며 놀아요! 🌀"
  ];

  var stageUp = checkCatStageUp(account);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🧶 놀기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n\n";
  text += "😊 행복 +" + happyGain + " → " + account.happiness + "\n";
  text += "⚡ 에너지 " + (play.energy || 0) + " → " + account.energy + "\n";
  if (trustGain > 0) text += "💕 신뢰 +" + trustGain + " → " + account.trust + "\n";
  if (stageUp) text += "\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += "\n\n(오늘 " + account.dailyActions.played + "/" + data.config.MAX_DAILY_PLAY + ")";
  replier.reply(text);
}

// === 핸들러: 재우기 ===

function handleCatSleep(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 이미 자고 있어요!");
    return;
  }

  applyCatDecay(account);

  var sleepBonus = 1;
  if (account.traits && account.traits.indexOf("lazy_sleeper") !== -1) {
    sleepBonus = 2;
  }

  var energyGain = 30 * sleepBonus;
  account.energy = Math.min(100, account.energy + energyGain);
  account.happiness = Math.min(100, account.happiness + 5);
  account.totalInteractions++;
  account.lastInteractTime = Date.now();
  saveCatAccount(sender, account);

  var reactions = [
    account.name + "(이)가 동그랗게 말고 잠들었어요... 💤",
    account.name + "(이)가 이불 속으로 파고들었어요 🛏️",
    account.name + "(이)가 그르릉거리며 눈을 감았어요 😴",
    account.name + "(이)가 하품을 하고 스르르 잠들었어요 🥱"
  ];

  var text = "[ 싱봇 냥냥이 ] 💤 재우기\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n\n";
  text += "⚡ 에너지 +" + energyGain + " → " + account.energy + "\n";
  text += "😊 행복 +5 → " + account.happiness + "\n";
  if (sleepBonus > 1) text += "🏷️ 잠꾸러기 특성: 에너지 회복 2배!";
  text += "\n\n다음에 올 때 꿈을 꿨을지도... 💭";
  replier.reply(text);
}

// === 핸들러: 모험 보내기 ===

function handleCatAdventure(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 모험을 갈 수 없어요!");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);

  var data = getCatData();

  // 이미 모험 중?
  if (account.activeAdventure) {
    var remain = Math.max(0, Math.ceil((account.activeAdventure.returnTime - Date.now()) / 60000));
    if (remain > 0) {
      replier.reply("[ 싱봇 냥냥이 ] 🗺️ 이미 모험 중이에요!\n장소: " + account.activeAdventure.locationName + "\n남은 시간: " + remain + "분\n\n'ㅁㅎㄱㄱ'로 결과를 확인하세요!");
    } else {
      replier.reply("[ 싱봇 냥냥이 ] 🗺️ 모험이 끝났어요!\n'ㅁㅎㄱㄱ'로 결과를 확인하세요!");
    }
    return;
  }

  var locName = msg.replace(/^(냥냥이모험|ㄴㄴㅇ모험|ㅁㅎ)\s*/, "").trim();

  // 장소 목록 보여주기
  if (!locName) {
    var locList = [];
    for (var id in data.adventures) {
      if (!data.adventures.hasOwnProperty(id)) continue;
      var loc = data.adventures[id];
      var unlocked = account.stage >= loc.stageReq && account.trust >= loc.trustReq;
      if (loc.personalityReq) {
        for (var pk in loc.personalityReq) {
          if (account.personality[pk] < loc.personalityReq[pk]) unlocked = false;
        }
      }
      if (loc.traitReq && account.traits.indexOf(loc.traitReq) === -1) unlocked = false;
      var dur = Math.round(loc.duration / 60000);
      locList.push((unlocked ? "✅" : "🔒") + " " + loc.emoji + " " + loc.name + " (" + dur + "분) — 난이도 " + loc.difficulty);
    }
    replier.reply(
      "[ 싱봇 냥냥이 ] 🗺️ 모험 장소\n━━━━━━━━━━━━━━━━━━\n" +
      locList.join("\n") + "\n\n'ㅁㅎ [장소이름]' 으로 보내세요!"
    );
    return;
  }

  // 장소 찾기
  var locId = null;
  var loc = null;
  for (var id in data.adventures) {
    if (data.adventures[id].name === locName) {
      locId = id;
      loc = data.adventures[id];
      break;
    }
  }
  if (!loc) {
    replier.reply("[ 싱봇 냥냥이 ] '" + locName + "' 장소를 찾을 수 없어요!\n'ㅁㅎ'로 장소 목록을 확인하세요.");
    return;
  }

  // 해금 체크
  if (account.stage < loc.stageReq) {
    replier.reply("[ 싱봇 냥냥이 ] 🔒 " + loc.name + "은 성장 단계 " + loc.stageReq + " 이상 필요해요!");
    return;
  }
  if (account.trust < loc.trustReq) {
    replier.reply("[ 싱봇 냥냥이 ] 🔒 " + loc.name + "은 신뢰도 " + loc.trustReq + " 이상 필요해요! (현재: " + account.trust + ")");
    return;
  }

  // 에너지 체크
  if (account.energy < 20) {
    replier.reply("[ 싱봇 냥냥이 ] " + account.name + "(이)가 너무 피곤해요... 😴\n에너지: " + account.energy + " (최소 20 필요)");
    return;
  }

  // 모험 시작
  var duration = loc.duration;
  if (account.traits && account.traits.indexOf("adventurer") !== -1) {
    duration = Math.floor(duration * 0.9);
  }

  account.activeAdventure = {
    locationId: locId,
    locationName: loc.name,
    startTime: Date.now(),
    returnTime: Date.now() + duration,
    difficulty: loc.difficulty
  };
  account.energy -= 20;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();
  account.dailyActions.adventureSent++;
  saveCatAccount(sender, account);

  var durationMin = Math.round(duration / 60000);
  replier.reply(
    "[ 싱봇 냥냥이 ] 🗺️ 모험 출발!\n━━━━━━━━━━━━━━━━━━\n" +
    loc.emoji + " " + account.name + "(이)가 " + loc.name + "(으)로 떠났어요!\n\n" +
    "⏱️ 예상 시간: " + durationMin + "분\n" +
    "⚡ 에너지 -20 → " + account.energy + "\n\n" +
    "돌아오면 'ㅁㅎㄱㄱ'로 결과를 확인하세요! 🐾"
  );
}

// === 핸들러: 모험 결과 ===

function handleCatAdventureResult(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (!account.activeAdventure) {
    replier.reply("[ 싱봇 냥냥이 ] 진행 중인 모험이 없어요!\n'ㅁㅎ [장소]'로 모험을 보내세요.");
    return;
  }

  var now = Date.now();
  var adv = account.activeAdventure;
  if (now < adv.returnTime) {
    var remain = Math.ceil((adv.returnTime - now) / 60000);
    replier.reply("[ 싱봇 냥냥이 ] 🗺️ 아직 모험 중이에요!\n장소: " + adv.locationName + "\n남은 시간: " + remain + "분");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);

  var data = getCatData();
  var loc = data.adventures[adv.locationId];

  // 스토리 생성
  var stories = data.adventureStories[adv.locationId] || [
    "{name}(이)가 " + adv.locationName + "에서 즐거운 시간을 보냈어요! 🐾"
  ];
  var story = pickRandom(stories).split("{name}").join(account.name);

  // 전리품
  var coins = catRandInt(loc.coinRange[0], loc.coinRange[1]);

  // 특성: 사냥본능 보너스
  if (account.traits && account.traits.indexOf("hunter") !== -1) {
    coins = Math.floor(coins * 1.3);
  }

  // 성격 보너스
  if (account.personality.bravery > 70) coins = Math.floor(coins * 1.1);

  var xp = loc.xp || 10;

  account.fishCoins += coins;
  account.stats.totalFishEarned += coins;
  account.stageProgress += xp;
  account.adventureCount++;
  account.stats.totalAdventures++;
  account.happiness = Math.min(100, account.happiness + 10);
  account.trust = Math.min(100, account.trust + 2);

  // 장소 발견
  if (account.uniqueLocations.indexOf(adv.locationId) === -1) {
    account.uniqueLocations.push(adv.locationId);
  }

  account.activeAdventure = null;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  var stageUp = checkCatStageUp(account);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🗺️ 모험 결과!\n━━━━━━━━━━━━━━━━━━\n";
  text += "📍 " + loc.emoji + " " + adv.locationName + "\n\n";
  text += "📖 " + account.name + "의 모험 이야기:\n\n";
  text += "\"" + story + "\"\n\n";
  text += "🎁 전리품:\n";
  text += "  🐟 +" + coins + " 물고기코인\n";
  text += "  ⬆️ +" + xp + " XP\n";
  text += "  😊 행복 +10 | 💕 신뢰 +2\n";
  if (stageUp) text += "\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += "\n\n(총 모험 " + account.adventureCount + "회)";
  replier.reply(text);
}

// === 핸들러: 상점 ===

function handleCatShop(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var data = getCatData();
  var text = "[ 싱봇 냥냥이 ] 🏪 상점\n━━━━━━━━━━━━━━━━━━\n💰 보유: 🐟 " + account.fishCoins + "\n";
  for (var itemName in data.shopItems) {
    if (!data.shopItems.hasOwnProperty(itemName)) continue;
    var item = data.shopItems[itemName];
    var owned = hasItem(account, itemName) || (account.wardrobe && account.wardrobe.indexOf(itemName) !== -1);
    text += "\n" + (owned ? "✅" : "🏷️") + " " + itemName + " (" + item.cost + "🐟)\n   " + item.desc;
  }
  text += "\n\n'ㄴㄴㄱ [아이템]' 으로 구매!";
  replier.reply(text);
}

// === 핸들러: 구매 ===

function handleCatBuy(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var itemName = msg.replace(/^(냥냥이구매|ㄴㄴㅇ구매|ㄴㄴㄱ)\s*/, "").trim();
  if (!itemName) {
    replier.reply("[ 싱봇 냥냥이 ] 'ㄴㄴㄱ [아이템]' 형식으로 구매하세요!\n'ㄴㄴㅅㅈ'로 상점을 확인하세요.");
    return;
  }

  var data = getCatData();
  var item = data.shopItems[itemName];
  if (!item) {
    replier.reply("[ 싱봇 냥냥이 ] '" + itemName + "'은 상점에 없어요!\n'ㄴㄴㅅㅈ'로 상점을 확인하세요.");
    return;
  }

  // 이미 보유?
  if (item.type === "outfit") {
    if (account.wardrobe && account.wardrobe.indexOf(itemName) !== -1) {
      replier.reply("[ 싱봇 냥냥이 ] 이미 가지고 있어요! 'ㄴㄴㅇ의상 " + itemName + "'으로 입혀보세요.");
      return;
    }
  } else if (item.type === "toy") {
    if (hasItem(account, itemName)) {
      replier.reply("[ 싱봇 냥냥이 ] 이미 가지고 있어요!");
      return;
    }
  }

  if (account.fishCoins < item.cost) {
    replier.reply("[ 싱봇 냥냥이 ] 🐟 물고기코인이 부족해요!\n필요: " + item.cost + " | 보유: " + account.fishCoins);
    return;
  }

  account.fishCoins -= item.cost;

  if (item.type === "outfit") {
    if (!account.wardrobe) account.wardrobe = [];
    account.wardrobe.push(itemName);
  } else if (item.type === "medicine") {
    account.health = Math.min(100, account.health + 50);
  } else if (item.type === "energy") {
    account.energy = Math.min(100, account.energy + 50);
  } else {
    addCatItem(account, itemName);
  }

  saveCatAccount(sender, account);
  replier.reply(
    "[ 싱봇 냥냥이 ] 🛒 구매 완료!\n" +
    "✅ " + itemName + " 획득!\n" +
    "🐟 -" + item.cost + " (잔액: " + account.fishCoins + ")"
  );
}

// === 핸들러: 의상 ===

function handleCatOutfit(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var outfitName = msg.replace(/^(냥냥이의상|ㄴㄴㅇ의상)\s*/, "").trim();

  if (!account.wardrobe || account.wardrobe.length === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 아직 의상이 없어요!\n'ㄴㄴㅅㅈ'에서 구매하세요.");
    return;
  }

  if (!outfitName || outfitName === "벗기") {
    if (outfitName === "벗기") {
      account.currentOutfit = null;
      saveCatAccount(sender, account);
      replier.reply("[ 싱봇 냥냥이 ] 👗 의상을 벗었어요!");
      return;
    }
    var text = "[ 싱봇 냥냥이 ] 👗 의상 목록\n━━━━━━━━━━━━━━━━━━\n";
    for (var i = 0; i < account.wardrobe.length; i++) {
      var mark = account.currentOutfit === account.wardrobe[i] ? "👉 " : "  ";
      text += mark + account.wardrobe[i] + "\n";
    }
    text += "\n'ㄴㄴㅇ의상 [이름]' 으로 입혀보세요!\n'ㄴㄴㅇ의상 벗기' 로 벗기기";
    replier.reply(text);
    return;
  }

  if (account.wardrobe.indexOf(outfitName) === -1) {
    replier.reply("[ 싱봇 냥냥이 ] '" + outfitName + "'은(는) 가지고 있지 않아요!");
    return;
  }

  account.currentOutfit = outfitName;
  saveCatAccount(sender, account);
  replier.reply("[ 싱봇 냥냥이 ] 👗 " + account.name + "(이)가 '" + outfitName + "'을(를) 입었어요! ✨");
}

// === 인벤토리 헬퍼 ===

function hasItem(account, name) {
  if (!account.inventory) return false;
  for (var i = 0; i < account.inventory.length; i++) {
    if (account.inventory[i].name === name && account.inventory[i].count > 0) return true;
  }
  return false;
}

function addCatItem(account, name, count) {
  if (!account.inventory) account.inventory = [];
  count = count || 1;
  for (var i = 0; i < account.inventory.length; i++) {
    if (account.inventory[i].name === name) {
      account.inventory[i].count += count;
      return;
    }
  }
  account.inventory.push({ name: name, count: count });
}

// === 핸들러: 인벤토리 ===

function handleCatInventory(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (!account.inventory || account.inventory.length === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🎒 인벤토리가 비었어요!\n'ㄴㄴㅅㅈ'에서 아이템을 구매하세요.");
    return;
  }

  var text = "[ 싱봇 냥냥이 ] 🎒 인벤토리\n━━━━━━━━━━━━━━━━━━\n";
  for (var i = 0; i < account.inventory.length; i++) {
    var item = account.inventory[i];
    if (item.count > 0) {
      text += "  " + item.name + " x" + item.count + "\n";
    }
  }
  text += "\n💰 🐟 " + account.fishCoins;
  replier.reply(text);
}

// === 핸들러: 도움말 ===

function handleCatHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 냥냥이 ] 🐱 도움말\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    "🥚 ㄴㄴㅇ등록 [이름] — 고양이 입양\n" +
    "📊 ㄴㄴ — 상태 확인\n" +
    "🐾 ㄴㄴㅇ돌봐 — 쓰다듬기/알 돌보기\n\n" +
    "🍖 ㅁㅁ [음식] — 밥 주기\n" +
    "🧶 ㄴㄹ [놀이] — 놀아주기\n" +
    "💤 ㄴㄴㅇ재워 — 재우기\n\n" +
    "🗺️ ㅁㅎ [장소] — 모험 보내기\n" +
    "📋 ㅁㅎㄱㄱ — 모험 결과\n\n" +
    "🏪 ㄴㄴㅅㅈ — 상점\n" +
    "🛒 ㄴㄴㄱ [아이템] — 구매\n" +
    "🎒 ㄴㄴㅇㅂ — 인벤토리\n" +
    "👗 ㄴㄴㅇ의상 — 의상 관리"
  );
}

// === 명령어 등록 ===

var CAT_COMMANDS = [
  { triggers: _ct(["냥냥이등록"]), handler: handleCatRegister, hasArgs: true },
  { triggers: _ct(["냥냥이", "냥냥이정보"]).concat(["ㄴㄴ"]), handler: handleCatInfo },
  { triggers: _ct(["냥냥이돌봐"]), handler: handleCatCare },
  { triggers: _ct(["냥냥이밥"]).concat(["ㅁㅁ"]), handler: handleCatFeed, hasArgs: true },
  { triggers: _ct(["냥냥이놀자"]).concat(["ㄴㄹ"]), handler: handleCatPlay, hasArgs: true },
  { triggers: _ct(["냥냥이재워"]), handler: handleCatSleep },
  { triggers: _ct(["냥냥이모험"]).concat(["ㅁㅎ"]), handler: handleCatAdventure, hasArgs: true },
  { triggers: _ct(["냥냥이모험결과"]).concat(["ㅁㅎㄱㄱ"]), handler: handleCatAdventureResult },
  { triggers: _ct(["냥냥이상점"]).concat(["ㄴㄴㅅㅈ"]), handler: handleCatShop },
  { triggers: _ct(["냥냥이구매"]).concat(["ㄴㄴㄱ"]), handler: handleCatBuy, hasArgs: true },
  { triggers: _ct(["냥냥이인벤"]).concat(["ㄴㄴㅇㅂ"]), handler: handleCatInventory },
  { triggers: _ct(["냥냥이의상"]), handler: handleCatOutfit, hasArgs: true },
  { triggers: _ct(["냥냥이도움말"]).concat(["ㄴㄴㄷ"]), handler: handleCatHelp }
];
