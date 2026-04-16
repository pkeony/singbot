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

  // 비밀진화 힌트
  var evoHint = getEvolutionHint(account);
  if (evoHint) text += "\n\n🔮 " + evoHint;

  // 비밀진화 체크
  var evo = checkSecretEvolution(account);
  if (evo) {
    account.stage = 5;
    account.secretFlags.evolution = evo.id;
    saveCatAccount(sender, account);
    text += "\n\n━━━━━━━━━━━━━━━━━━\n" + evo.emoji + " 비밀진화! " + evo.name + "!\n" + evo.desc + "\n보너스: " + evo.bonus;
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

  // 퀘스트 진행
  generateDailyQuests(account);
  updateCatQuestProgress(account, "feed", foodName);

  var stageUp = checkCatStageUp(account);
  var newAchievements = checkCatAchievements(account);

  // 랜덤 이벤트
  var eventMsg = rollCatEvent(account, sender);
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
  text += formatAchievementUnlocks(newAchievements);
  if (eventMsg) text += "\n\n" + eventMsg;
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

  generateDailyQuests(account);
  updateCatQuestProgress(account, "play");

  var reactions = [
    account.name + "(이)가 " + playName + "(으)로 신나게 놀았어요! 😸",
    account.name + "(이)가 " + playName + "에 푹 빠졌어요! 🐾",
    account.name + "(이)가 폴짝폴짝 뛰며 즐거워해요! 🎉",
    account.name + "(이)가 꼬리를 팽팽 돌리며 놀아요! 🌀"
  ];

  var stageUp = checkCatStageUp(account);
  var newAchievements = checkCatAchievements(account);
  var eventMsg = rollCatEvent(account, sender);
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🧶 놀기\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";
  text += pickRandom(reactions) + "\n\n";
  text += "😊 행복 +" + happyGain + " → " + account.happiness + "\n";
  text += "⚡ 에너지 " + (play.energy || 0) + " → " + account.energy + "\n";
  if (trustGain > 0) text += "💕 신뢰 +" + trustGain + " → " + account.trust + "\n";
  if (stageUp) text += "\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
  text += formatAchievementUnlocks(newAchievements);
  if (eventMsg) text += "\n\n" + eventMsg;
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

  generateDailyQuests(account);
  updateCatQuestProgress(account, "adventure");

  var stageUp = checkCatStageUp(account);
  var newAchievements = checkCatAchievements(account);
  var eventMsg = rollCatEvent(account, sender);
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
  text += formatAchievementUnlocks(newAchievements);
  if (eventMsg) text += "\n\n" + eventMsg;
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

// === 기술 훈련 시스템 ===

function getCatTrickLevel(account, trickId) {
  if (!account.trickBook) return 0;
  for (var i = 0; i < account.trickBook.length; i++) {
    if (account.trickBook[i].id === trickId) return account.trickBook[i].level || 1;
  }
  return 0;
}

function hasCatTrick(account, trickId) {
  return getCatTrickLevel(account, trickId) > 0;
}

function handleCatTrain(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 훈련할 수 없어요!");
    return;
  }

  applyCatDecay(account);
  resetCatDaily(account);
  var dreamMsg = checkAndGenerateDream(account);

  var data = getCatData();
  var trickName = msg.replace(/^(냥냥이훈련|ㄴㄴㅇ훈련|ㅎㄹ)\s*/, "").trim();

  if (!trickName) {
    handleCatTricks(room, msg, sender, replier);
    return;
  }

  // 기술 찾기
  var trickId = null;
  var trick = null;
  for (var id in data.tricks) {
    if (data.tricks[id].name === trickName) {
      trickId = id;
      trick = data.tricks[id];
      break;
    }
  }
  if (!trick) {
    replier.reply("[ 싱봇 냥냥이 ] '" + trickName + "' 기술을 찾을 수 없어요!\n'ㄴㄴㅇ기술'로 목록을 확인하세요.");
    return;
  }

  // 이미 습득?
  if (hasCatTrick(account, trickId)) {
    replier.reply("[ 싱봇 냥냥이 ] '" + trickName + "'은(는) 이미 배웠어요! ✅");
    return;
  }

  // 일일 제한
  if (!account.dailyActions.trained) account.dailyActions.trained = 0;
  if (account.dailyActions.trained >= data.config.MAX_DAILY_TRAIN) {
    replier.reply("[ 싱봇 냥냥이 ] 오늘은 훈련을 " + data.config.MAX_DAILY_TRAIN + "번 했어요!\n내일 다시 도전! 💪");
    return;
  }

  // 선행 기술 체크
  if (trick.requires && trick.requires.length > 0) {
    var missing = [];
    for (var i = 0; i < trick.requires.length; i++) {
      if (!hasCatTrick(account, trick.requires[i])) {
        var reqTrick = data.tricks[trick.requires[i]];
        if (reqTrick) missing.push(reqTrick.name);
      }
    }
    if (missing.length > 0) {
      replier.reply("[ 싱봇 냥냥이 ] 🔒 선행 기술이 필요해요!\n필요: " + missing.join(", "));
      return;
    }
  }

  // 신뢰도 체크
  if (account.trust < trick.trustReq) {
    replier.reply("[ 싱봇 냥냥이 ] 💕 신뢰도가 부족해요!\n필요: " + trick.trustReq + " | 현재: " + account.trust);
    return;
  }

  // 에너지 체크
  if (account.energy < trick.energyCost) {
    replier.reply("[ 싱봇 냥냥이 ] ⚡ 에너지가 부족해요!\n필요: " + trick.energyCost + " | 현재: " + account.energy);
    return;
  }

  account.energy -= trick.energyCost;
  account.dailyActions.trained++;
  if (!account.dailyActions.trainAttempt) account.dailyActions.trainAttempt = 0;
  account.dailyActions.trainAttempt++;
  account.totalInteractions++;
  account.lastInteractTime = Date.now();

  // 성공률 계산
  var rate = trick.baseRate * (1 + account.trust / 200);
  if (trick.personalityBonus && account.personality[trick.personalityBonus] > 60) {
    rate += 0.15;
  }
  rate = Math.min(0.95, rate);

  var success = Math.random() < rate;
  var text = "[ 싱봇 냥냥이 ] 🎓 훈련: " + trickName + "\n━━━━━━━━━━━━━━━━━━\n";
  if (dreamMsg) text += dreamMsg + "\n━━━━━━━━━━━━━━━━━━\n";

  if (success) {
    // 습득 성공!
    if (!account.trickBook) account.trickBook = [];
    account.trickBook.push({ id: trickId, name: trickName, level: 1, masteredAt: Date.now() });
    account.stageProgress += trick.xp;
    account.stats.totalTricksLearned = (account.stats.totalTricksLearned || 0) + 1;

    // 보상
    if (trick.reward) {
      if (trick.reward.trust) account.trust = Math.min(100, account.trust + trick.reward.trust);
      if (trick.reward.happiness) account.happiness = Math.min(100, account.happiness + trick.reward.happiness);
      if (trick.reward.coins) account.fishCoins += trick.reward.coins;
      if (trick.reward.starDust) account.starDust = (account.starDust || 0) + trick.reward.starDust;
    }

    // 업적 체크
    var newAchievements = checkCatAchievements(account);

    var stageUp = checkCatStageUp(account);

    text += "🎉 성공! " + account.name + "(이)가 '" + trickName + "'을(를) 배웠어요!\n\n";
    text += "⬆️ +" + trick.xp + " XP\n";
    if (trick.reward && trick.reward.trust) text += "💕 신뢰 +" + trick.reward.trust + "\n";
    if (trick.reward && trick.reward.coins) text += "🐟 +" + trick.reward.coins + "\n";
    if (trick.reward && trick.reward.starDust) text += "✨ +" + trick.reward.starDust + "\n";
    if (trick.passive) text += "\n🎁 패시브 효과: 시간당 " + trick.passive.coinsPerHour + "🐟 자동 수입!";
    if (trick.adventureBonus) text += "\n🎁 모험 전리품 " + trick.adventureBonus + "배!";
    if (stageUp) text += "\n\n🎉 성장! " + stageUp.emoji + " " + stageUp.name + "이(가) 되었어요!";
    text += formatAchievementUnlocks(newAchievements);
  } else {
    // 실패
    account.stageProgress += Math.floor(trick.xp * 0.3);
    text += "😿 실패... " + account.name + "(이)가 아직 어려워해요.\n\n";
    text += "성공률: " + Math.round(rate * 100) + "%\n";
    text += "⬆️ +" + Math.floor(trick.xp * 0.3) + " XP (실패 보상)\n";
    text += "다시 도전해보세요! 💪";
  }

  text += "\n\n(오늘 훈련 " + account.dailyActions.trained + "/" + data.config.MAX_DAILY_TRAIN + ")";

  // 랜덤 이벤트 롤
  var eventMsg = rollCatEvent(account, sender);

  saveCatAccount(sender, account);

  if (eventMsg) text += "\n\n" + eventMsg;
  replier.reply(text);
}

// === 핸들러: 기술 목록 ===

function handleCatTricks(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var data = getCatData();
  var text = "[ 싱봇 냥냥이 ] 🎓 기술 트리\n━━━━━━━━━━━━━━━━━━\n";
  var tiers = { 1: "기본기", 2: "중급기", 3: "고급기", 4: "전설기" };

  for (var tier = 1; tier <= 4; tier++) {
    text += "\n【 " + tiers[tier] + " 】\n";
    for (var id in data.tricks) {
      if (!data.tricks.hasOwnProperty(id)) continue;
      var t = data.tricks[id];
      if (t.tier !== tier) continue;
      var learned = hasCatTrick(account, id);
      var canLearn = true;
      if (t.requires) {
        for (var i = 0; i < t.requires.length; i++) {
          if (!hasCatTrick(account, t.requires[i])) canLearn = false;
        }
      }
      if (account.trust < t.trustReq) canLearn = false;
      var icon = learned ? "✅" : (canLearn ? "⬜" : "🔒");
      text += "  " + icon + " " + t.name + " — " + t.desc + "\n";
    }
  }

  var learnedCount = account.trickBook ? account.trickBook.length : 0;
  var totalCount = 0;
  for (var id in data.tricks) { if (data.tricks.hasOwnProperty(id)) totalCount++; }
  text += "\n습득: " + learnedCount + "/" + totalCount + "\n'ㅎㄹ [기술명]' 으로 훈련!";
  replier.reply(text);
}

// === 랜덤 이벤트 시스템 ===

function rollCatEvent(account, sender) {
  var data = getCatData();
  if (!data.events) return null;
  if (Math.random() > data.config.EVENT_CHANCE) return null;

  // 특성: 행운아 보너스 (긍정 이벤트 확률 UP)
  var luckyBonus = (account.traits && account.traits.indexOf("lucky") !== -1);

  var roll = Math.random();
  var msg = "";

  if (roll < (luckyBonus ? 0.60 : 0.50)) {
    // 긍정 이벤트
    var evt = pickRandom(data.events.positive);
    var evtText = evt.text.split("{name}").join(account.name);
    if (evt.hunger) account.hunger = Math.min(100, account.hunger + evt.hunger);
    if (evt.happiness) account.happiness = Math.min(100, account.happiness + evt.happiness);
    if (evt.energy) account.energy = Math.min(100, account.energy + evt.energy);
    if (evt.trust) account.trust = Math.min(100, account.trust + evt.trust);
    if (evt.coins) {
      account.fishCoins += evt.coins;
      account.stats.totalFishEarned += evt.coins;
    }
    msg = "🌟 이벤트!\n" + evtText;
    if (evt.coins > 0) msg += "\n🐟 +" + evt.coins;

  } else if (roll < (luckyBonus ? 0.75 : 0.75)) {
    // 부정 이벤트
    var evt = pickRandom(data.events.negative);
    var evtText = evt.text.split("{name}").join(account.name);
    // 특성: 터프가이 — 피해 감소
    var resist = (account.traits && account.traits.indexOf("tough") !== -1);
    if (evt.happiness) account.happiness = Math.max(0, account.happiness + (resist ? Math.floor(evt.happiness / 2) : evt.happiness));
    if (evt.health) account.health = Math.max(0, account.health + (resist ? Math.floor(evt.health / 2) : evt.health));
    if (evt.braveryCheck && account.personality.bravery < 40) {
      account.happiness = Math.max(0, account.happiness - 10);
    }
    msg = "⚠️ 이벤트!\n" + evtText;
    if (resist) msg += "\n🏷️ 터프가이: 피해 감소!";

  } else {
    // 분기형 이벤트
    var evt = pickRandom(data.events.branching);
    var evtText = evt.text.split("{name}").join(account.name);
    account.pendingEvent = {
      event: evt,
      expireTime: Date.now() + (evt.timeout || 180000)
    };
    msg = "❗ 이벤트 발생!\n" + evtText + "\n\n";
    for (var i = 0; i < evt.options.length; i++) {
      msg += (i + 1) + "️⃣ " + evt.options[i].label + " (" + evt.options[i].desc + ")\n";
    }
    msg += "\n'ㄴㄴㅇ선택 " + (1) + "' 또는 'ㄴㄴㅇ선택 " + (2) + "'\n(3분 안에 선택!)";
  }

  return msg;
}

// === 핸들러: 이벤트 선택 ===

function handleCatEventChoice(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (!account.pendingEvent) {
    replier.reply("[ 싱봇 냥냥이 ] 진행 중인 이벤트가 없어요!");
    return;
  }

  if (Date.now() > account.pendingEvent.expireTime) {
    account.pendingEvent = null;
    saveCatAccount(sender, account);
    replier.reply("[ 싱봇 냥냥이 ] ⏰ 이벤트가 만료됐어요! 자동으로 1번이 선택됐어요.");
    return;
  }

  var choiceNum = parseInt(msg.replace(/^(냥냥이선택|ㄴㄴㅇ선택)\s*/, "").trim());
  var evt = account.pendingEvent.event;

  if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > evt.options.length) {
    replier.reply("[ 싱봇 냥냥이 ] 1~" + evt.options.length + " 중에서 선택해주세요!");
    return;
  }

  var option = evt.options[choiceNum - 1];
  var outcome = null;

  // 성격 기반 결과 결정
  if (option.outcomes.highAffection && account.personality.affection > 60) {
    outcome = option.outcomes.highAffection;
  } else if (option.outcomes.highBravery && account.personality.bravery > 60) {
    outcome = option.outcomes.highBravery;
  } else if (option.outcomes.highCuriosity && account.personality.curiosity > 60) {
    outcome = option.outcomes.highCuriosity;
  } else {
    outcome = option.outcomes["default"];
  }

  var resultText = outcome.text.split("{name}").join(account.name);

  // 결과 적용
  if (outcome.happiness) account.happiness = Math.max(0, Math.min(100, account.happiness + outcome.happiness));
  if (outcome.trust) account.trust = Math.min(100, account.trust + outcome.trust);
  if (outcome.health) account.health = Math.max(0, Math.min(100, account.health + outcome.health));
  if (outcome.energy) account.energy = Math.max(0, Math.min(100, account.energy + outcome.energy));
  if (outcome.coins) {
    account.fishCoins += outcome.coins;
    account.stats.totalFishEarned += outcome.coins;
  }
  if (outcome.bravery_up) {
    account.personality.bravery = Math.min(100, account.personality.bravery + outcome.bravery_up);
  }

  account.pendingEvent = null;
  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] ❗ 이벤트 결과\n━━━━━━━━━━━━━━━━━━\n";
  text += "선택: " + option.label + "\n\n";
  text += resultText + "\n";
  if (outcome.happiness) text += "\n😊 행복 " + (outcome.happiness > 0 ? "+" : "") + outcome.happiness;
  if (outcome.trust) text += "\n💕 신뢰 +" + outcome.trust;
  if (outcome.coins) text += "\n🐟 +" + outcome.coins;
  if (outcome.health) text += "\n❤️ 건강 " + (outcome.health > 0 ? "+" : "") + outcome.health;
  replier.reply(text);
}

// === 업적 시스템 ===

function checkCatAchievements(account) {
  var data = getCatData();
  if (!data.achievements) return [];
  if (!account.achievements) account.achievements = [];

  var newUnlocks = [];
  var checks = {
    "first_hatch": account.stage >= 1,
    "first_feed": account.stats.totalFeedings >= 1,
    "first_play": account.stats.totalPlays >= 1,
    "first_adventure": account.stats.totalAdventures >= 1,
    "first_trick": (account.stats.totalTricksLearned || 0) >= 1,
    "feed_10": account.stats.totalFeedings >= 10,
    "feed_50": account.stats.totalFeedings >= 50,
    "play_10": account.stats.totalPlays >= 10,
    "play_50": account.stats.totalPlays >= 50,
    "adventure_10": account.stats.totalAdventures >= 10,
    "adventure_25": account.stats.totalAdventures >= 25,
    "adventure_50": account.stats.totalAdventures >= 50,
    "trust_30": account.trust >= 30,
    "trust_60": account.trust >= 60,
    "trust_90": account.trust >= 90,
    "streak_7": account.stats.currentStreak >= 7,
    "streak_14": account.stats.currentStreak >= 14,
    "streak_30": account.stats.currentStreak >= 30,
    "stage_2": account.stage >= 2,
    "stage_3": account.stage >= 3,
    "stage_4": account.stage >= 4,
    "tricks_3": (account.trickBook ? account.trickBook.length : 0) >= 3,
    "tricks_6": (account.trickBook ? account.trickBook.length : 0) >= 6,
    "tricks_all": (account.trickBook ? account.trickBook.length : 0) >= 11,
    "coins_1000": account.fishCoins >= 1000,
    "all_locations": (account.uniqueLocations ? account.uniqueLocations.length : 0) >= 9
  };

  for (var i = 0; i < data.achievements.length; i++) {
    var ach = data.achievements[i];
    if (account.achievements.indexOf(ach.id) !== -1) continue;
    if (checks[ach.id]) {
      account.achievements.push(ach.id);
      if (ach.coins) {
        account.fishCoins += ach.coins;
        account.stats.totalFishEarned += ach.coins;
      }
      if (ach.starDust) account.starDust = (account.starDust || 0) + ach.starDust;
      if (ach.title) {
        if (!account.titles.unlocked) account.titles.unlocked = [];
        account.titles.unlocked.push(ach.title);
        account.titles.equipped = ach.title;
      }
      newUnlocks.push(ach);
    }
  }

  return newUnlocks;
}

function formatAchievementUnlocks(achievements) {
  if (!achievements || achievements.length === 0) return "";
  var text = "\n\n🏆 업적 달성!";
  for (var i = 0; i < achievements.length; i++) {
    var a = achievements[i];
    text += "\n  " + a.name + " — " + a.desc;
    if (a.coins) text += " (🐟+" + a.coins + ")";
    if (a.starDust) text += " (✨+" + a.starDust + ")";
    if (a.title) text += " [칭호: " + a.title + "]";
  }
  return text;
}

// === 일일퀘스트 시스템 ===

function generateDailyQuests(account) {
  var data = getCatData();
  if (!data.dailyQuestPool) return;
  var today = todayString();
  if (account.dailyQuests && account.dailyQuests.date === today) return;

  var seed = todaySeed();
  var pool = data.dailyQuestPool.slice();
  var quests = [];
  for (var i = 0; i < 3 && pool.length > 0; i++) {
    var idx = Math.abs((seed + i * 7) % pool.length);
    var q = pool.splice(idx, 1)[0];
    quests.push({ desc: q.desc, type: q.type, target: q.target, reward: q.reward, progress: 0, claimed: false });
  }
  account.dailyQuests = { date: today, quests: quests, allClaimed: false };
}

function updateCatQuestProgress(account, actionType, detail) {
  if (!account.dailyQuests || !account.dailyQuests.quests) return;
  for (var i = 0; i < account.dailyQuests.quests.length; i++) {
    var q = account.dailyQuests.quests[i];
    if (q.claimed) continue;
    if (q.type === actionType) {
      q.progress++;
    } else if (q.type === "feedSpecific" && actionType === "feed" && detail === q.target) {
      q.progress++;
    } else if (q.type === "trainAttempt" && actionType === "trainAttempt") {
      q.progress++;
    }
  }
}

function handleCatQuest(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  generateDailyQuests(account);
  saveCatAccount(sender, account);

  var quests = account.dailyQuests.quests;
  var text = "[ 싱봇 냥냥이 ] 📋 일일퀘스트\n━━━━━━━━━━━━━━━━━━\n";
  var allDone = true;
  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    var done = q.progress >= (typeof q.target === "number" ? q.target : 1);
    var icon = q.claimed ? "✅" : (done ? "🎁" : "⬜");
    if (!done) allDone = false;
    var prog = typeof q.target === "number" ? (Math.min(q.progress, q.target) + "/" + q.target) : (q.progress > 0 ? "완료" : "미완료");
    text += "\n" + icon + " " + q.desc + " (" + prog + ") — " + q.reward + "🐟";
  }

  if (allDone && !account.dailyQuests.allClaimed) {
    text += "\n\n🎉 올클리어 보너스: 100🐟 + 1✨\n'ㄴㄴㅋㅂ'로 보상 수령!";
  } else {
    text += "\n\n완료된 퀘스트는 'ㄴㄴㅋㅂ'로 보상 수령!";
  }
  replier.reply(text);
}

function handleCatQuestClaim(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  generateDailyQuests(account);

  var quests = account.dailyQuests.quests;
  var claimed = 0;
  var totalReward = 0;
  for (var i = 0; i < quests.length; i++) {
    var q = quests[i];
    if (q.claimed) continue;
    var target = typeof q.target === "number" ? q.target : 1;
    if (q.progress >= target) {
      q.claimed = true;
      account.fishCoins += q.reward;
      account.stats.totalFishEarned += q.reward;
      totalReward += q.reward;
      claimed++;
    }
  }

  // 올클리어 보너스
  var allClaimed = true;
  for (var i = 0; i < quests.length; i++) {
    if (!quests[i].claimed) { allClaimed = false; break; }
  }
  var bonusMsg = "";
  if (allClaimed && !account.dailyQuests.allClaimed) {
    account.dailyQuests.allClaimed = true;
    account.fishCoins += 100;
    account.starDust = (account.starDust || 0) + 1;
    account.stats.totalFishEarned += 100;
    bonusMsg = "\n\n🎉 올클리어 보너스! 🐟+100 ✨+1";
  }

  saveCatAccount(sender, account);

  if (claimed === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 수령할 보상이 없어요!\n'ㄴㄴㅋ'로 퀘스트를 확인하세요.");
    return;
  }

  replier.reply(
    "[ 싱봇 냥냥이 ] 📋 퀘스트 보상 수령!\n━━━━━━━━━━━━━━━━━━\n" +
    "✅ " + claimed + "개 완료! 🐟 +" + totalReward + bonusMsg + "\n" +
    "💰 잔액: 🐟 " + account.fishCoins
  );
}

// === 핸들러: 업적 보기 ===

function handleCatAchievements(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  var data = getCatData();
  if (!account.achievements) account.achievements = [];

  var text = "[ 싱봇 냥냥이 ] 🏆 업적\n━━━━━━━━━━━━━━━━━━\n";
  var unlocked = 0;
  for (var i = 0; i < data.achievements.length; i++) {
    var a = data.achievements[i];
    var done = account.achievements.indexOf(a.id) !== -1;
    if (done) unlocked++;
    text += (done ? "✅" : "⬜") + " " + a.name + "\n";
  }
  text += "\n달성: " + unlocked + "/" + data.achievements.length;
  replier.reply(text);
}

// === 전체 계정 로드 (랭킹/소셜용) ===

function loadAllCatAccounts() {
  try {
    var dir = new java.io.File(CAT_DATA_DIR);
    if (!dir.exists()) return;
    var files = dir.listFiles();
    if (!files) return;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!f.getName().endsWith(".json")) continue;
      var senderName = f.getName().replace(".json", "");
      if (catAccounts[senderName]) continue;
      try {
        var fis = new java.io.FileInputStream(f);
        var reader = new java.io.InputStreamReader(fis, "UTF-8");
        var br = new java.io.BufferedReader(reader);
        var data = "";
        var line;
        while ((line = br.readLine()) != null) data += line;
        br.close(); reader.close(); fis.close();
        catAccounts[senderName] = JSON.parse(data);
      } catch (e) {}
    }
  } catch (e) {}
}

// === 소셜: 인사 ===

function handleCatGreet(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }
  if (account.stage < 1) {
    replier.reply("[ 싱봇 냥냥이 ] 🥚 알은 인사할 수 없어요!");
    return;
  }

  var targetName = msg.replace(/^(냥냥이인사|ㄴㄴㅇ인사)\s*/, "").trim();
  if (!targetName) {
    replier.reply("[ 싱봇 냥냥이 ] 'ㄴㄴㅇ인사 [상대이름]' 형식으로 입력해주세요!");
    return;
  }

  // 쿨다운 (1시간)
  var now = Date.now();
  if (account.socialCooldown && now - account.socialCooldown < 3600000) {
    var remain = Math.ceil((3600000 - (now - account.socialCooldown)) / 60000);
    replier.reply("[ 싱봇 냥냥이 ] ⏰ " + remain + "분 후에 다시 인사할 수 있어요!");
    return;
  }

  // 상대 찾기
  loadAllCatAccounts();
  var target = null;
  var targetSender = null;
  for (var s in catAccounts) {
    if (!catAccounts.hasOwnProperty(s)) continue;
    if (s === sender) continue;
    if (catAccounts[s].name === targetName) {
      target = catAccounts[s];
      targetSender = s;
      break;
    }
  }

  if (!target) {
    replier.reply("[ 싱봇 냥냥이 ] '" + targetName + "' 고양이를 찾을 수 없어요!");
    return;
  }
  if (target.stage < 1) {
    replier.reply("[ 싱봇 냥냥이 ] " + targetName + "(은)는 아직 알이에요!");
    return;
  }

  applyCatDecay(account);
  account.socialCooldown = now;
  account.totalInteractions++;
  account.lastInteractTime = now;

  // 우정 찾기/생성
  if (!account.catFriends) account.catFriends = [];
  var friendship = null;
  for (var i = 0; i < account.catFriends.length; i++) {
    if (account.catFriends[i].sender === targetSender) {
      friendship = account.catFriends[i];
      break;
    }
  }
  if (!friendship) {
    friendship = { sender: targetSender, catName: target.name, friendship: 0 };
    account.catFriends.push(friendship);
  }

  // 성격 기반 결과
  var myAff = account.personality.affection;
  var myMis = account.personality.mischief;
  var myBrv = account.personality.bravery;
  var theirAff = target.personality.affection;

  var friendGain = 1;
  var happyGain = 10;
  var trustGain = 1;
  var coinsGain = 0;
  var reaction = "";

  // 특성: 매력쟁이
  if (account.traits && account.traits.indexOf("charmer") !== -1) {
    friendGain += 1;
  }

  if (myAff > 60 && theirAff > 60) {
    friendGain += 2;
    happyGain = 20;
    reaction = account.name + "와(과) " + target.name + "(이)가 서로 코를 비비며 인사했어요! 💕🐱🐱💕";
  } else if (myMis > 60) {
    coinsGain = catRandInt(5, 15);
    reaction = account.name + "(이)가 " + target.name + "의 간식을 살짝 뺏었어요! 😼🐟";
  } else if (myBrv > 60 && target.personality.bravery > 60) {
    coinsGain = catRandInt(10, 30);
    happyGain = 15;
    reaction = account.name + "와(과) " + target.name + "(이)가 힘겨루기를 했어요! 💪 승자: " + account.name + "!";
  } else {
    reaction = account.name + "와(과) " + target.name + "(이)가 어색하게 눈인사를 했어요 👀";
  }

  friendship.friendship += friendGain;
  account.happiness = Math.min(100, account.happiness + happyGain);
  account.trust = Math.min(100, account.trust + trustGain);
  if (coinsGain > 0) {
    account.fishCoins += coinsGain;
    account.stats.totalFishEarned += coinsGain;
  }

  saveCatAccount(sender, account);

  var text = "[ 싱봇 냥냥이 ] 🤝 인사!\n━━━━━━━━━━━━━━━━━━\n";
  text += reaction + "\n\n";
  text += "😊 행복 +" + happyGain + " | 💕 신뢰 +" + trustGain + "\n";
  text += "🤝 " + target.name + "과(와)의 우정: ❤️ " + friendship.friendship + "\n";
  if (coinsGain > 0) text += "🐟 +" + coinsGain + "\n";
  if (friendship.friendship >= 5) text += "\n✨ 우정 Lv.5! 나중에 합동모험이 가능해질 거예요!";
  replier.reply(text);
}

// === 랭킹 ===

function handleCatRanking(room, msg, sender, replier) {
  loadAllCatAccounts();

  var cats = [];
  for (var s in catAccounts) {
    if (!catAccounts.hasOwnProperty(s)) continue;
    var a = catAccounts[s];
    if (a.stage < 1) continue;
    cats.push({
      name: a.name,
      sender: s,
      stage: a.stage,
      xp: a.stageProgress,
      adventures: a.adventureCount || 0,
      tricks: a.trickBook ? a.trickBook.length : 0,
      streak: a.stats.currentStreak || 0
    });
  }

  if (cats.length === 0) {
    replier.reply("[ 싱봇 냥냥이 ] 🏆 아직 랭킹에 등록된 고양이가 없어요!");
    return;
  }

  // 성장 기준 정렬
  cats.sort(function(a, b) {
    if (b.stage !== a.stage) return b.stage - a.stage;
    return b.xp - a.xp;
  });

  var data = getCatData();
  var text = "[ 싱봇 냥냥이 ] 🏆 랭킹\n━━━━━━━━━━━━━━━━━━\n";
  var medals = ["🥇", "🥈", "🥉"];
  for (var i = 0; i < Math.min(cats.length, 10); i++) {
    var c = cats[i];
    var medal = i < 3 ? medals[i] : (i + 1) + ".";
    var stageName = data.stages[c.stage] ? data.stages[c.stage].name : "???";
    var isMine = c.sender === sanitizeSender(sender) ? " 👈" : "";
    text += "\n" + medal + " " + c.name + " — " + stageName + " (XP:" + c.xp + ")";
    text += "\n   🗺️" + c.adventures + " 🎓" + c.tricks + " 🔥" + c.streak + "일" + isMine;
  }
  replier.reply(text);
}

// === 비밀진화 ===

function checkSecretEvolution(account) {
  if (account.stage < 4) return null;
  if (account.stage >= 5) return null;

  var tricks = account.trickBook ? account.trickBook.length : 0;
  var locs = account.uniqueLocations ? account.uniqueLocations.length : 0;
  var p = account.personality;

  // 1. 요정고양이: 호기심 90+, 모든 장소, 보물 5+
  var treasureCount = 0;
  if (account.discoveredTreasures) {
    for (var k in account.discoveredTreasures) {
      if (account.discoveredTreasures.hasOwnProperty(k)) treasureCount++;
    }
  }
  if (p.curiosity >= 90 && locs >= 9 && treasureCount >= 5) {
    return { id: "fairy", name: "요정고양이", emoji: "🧚", desc: "신비로운 요정의 힘이 깃들었어요!", bonus: "꿈 보상 3배, 요정의 숲 해금" };
  }

  // 2. 그림자고양이: 장난 90+, 문열기 습득
  if (p.mischief >= 90 && hasCatTrick(account, "dooropen")) {
    return { id: "shadow", name: "그림자고양이", emoji: "🌑", desc: "어둠 속에서 빛나는 눈...", bonus: "모험 시간 50% 단축" };
  }

  // 3. 수호고양이: 신뢰 95+, 방치 0회, 밥 50+
  if (account.trust >= 95 && (account.stats.neglectCount || 0) === 0 && account.stats.totalFeedings >= 50) {
    return { id: "guardian", name: "수호고양이", emoji: "🛡️", desc: "집사를 지키는 수호 정령!", bonus: "부정 이벤트 면역, 패시브 수입" };
  }

  // 4. 모험왕고양이: 용기 90+, 모험 50+
  if (p.bravery >= 90 && (account.stats.totalAdventures || 0) >= 50) {
    return { id: "explorer", name: "모험왕고양이", emoji: "🌟", desc: "전설의 탐험가!", bonus: "전설의 땅 해금, 전리품 3배" };
  }

  // 5. 황금고양이: 모든 기술, 업적 20+, 스트릭 30+
  if (tricks >= 11 && (account.achievements ? account.achievements.length : 0) >= 20 && (account.stats.currentStreak || 0) >= 30) {
    return { id: "golden", name: "황금고양이", emoji: "✨👑", desc: "전설의 황금 고양이!", bonus: "모든 수입 2배, 전설의 칭호" };
  }

  return null;
}

// 상태 확인 시 비밀진화 힌트
function getEvolutionHint(account) {
  if (account.stage < 4) return null;
  if (account.stage >= 5) return null;

  var p = account.personality;
  var hints = [];
  if (p.curiosity >= 80) hints.push("호기심이 뭔가를 감지하고 있어요... ✨");
  if (p.mischief >= 80) hints.push("그림자 속에서 무언가 속삭이는 것 같아요... 🌑");
  if (account.trust >= 85) hints.push("깊은 유대감이 빛나고 있어요... 🛡️");
  if (p.bravery >= 80) hints.push("모험의 부름이 들려오는 것 같아요... 🌟");

  if (hints.length === 0) return null;
  return pickRandom(hints);
}

// === 환생 (프레스티지) ===

function handleCatPrestige(room, msg, sender, replier) {
  var account = loadCatAccount(sender);
  if (!account) {
    replier.reply("[ 싱봇 냥냥이 ] 먼저 'ㄴㄴㅇ등록 [이름]'으로 등록하세요!");
    return;
  }

  if (account.stage < 4) {
    replier.reply("[ 싱봇 냥냥이 ] 🔒 환생은 장로묘(Lv.4) 이상만 가능해요!\n현재: " + getCatData().stages[account.stage].name);
    return;
  }

  var confirm = msg.replace(/^(냥냥이환생|ㄴㄴㅇ환생)\s*/, "").trim();
  if (confirm !== "확인") {
    var gen = (account.prestigeCount || 0) + 2;
    replier.reply(
      "[ 싱봇 냥냥이 ] 🔄 환생\n━━━━━━━━━━━━━━━━━━\n" +
      account.name + "(이)가 새로운 삶을 시작합니다...\n\n" +
      "【 유지되는 것 】\n" +
      "  ✨ 별먼지: " + (account.starDust || 0) + "\n" +
      "  🏆 업적 " + (account.achievements ? account.achievements.length : 0) + "개\n" +
      "  📖 보물 도감\n" +
      "  💰 영구 수입 보너스 +" + (gen - 1) + "0%\n\n" +
      "【 초기화되는 것 】\n" +
      "  레벨, 스탯, 기술, 인벤토리, 물고기코인\n\n" +
      gen + "세대 고양이가 됩니다!\n\n" +
      "⚠️ 정말 환생하려면: 'ㄴㄴㅇ환생 확인'"
    );
    return;
  }

  // 환생 실행
  var oldName = account.name;
  var preserved = {
    starDust: account.starDust || 0,
    achievements: account.achievements || [],
    discoveredTreasures: account.discoveredTreasures || {},
    prestigeCount: (account.prestigeCount || 0) + 1,
    titles: account.titles || { unlocked: [], equipped: null },
    stats: {
      totalFeedings: account.stats.totalFeedings,
      totalPlays: account.stats.totalPlays,
      totalAdventures: account.stats.totalAdventures,
      totalTricksLearned: account.stats.totalTricksLearned || 0,
      totalFishEarned: account.stats.totalFishEarned,
      totalTreasuresFound: account.stats.totalTreasuresFound || 0,
      longestStreak: account.stats.longestStreak,
      currentStreak: 0,
      lastStreakDate: "",
      neglectCount: account.stats.neglectCount || 0,
      perfectDays: account.stats.perfectDays || 0
    }
  };

  // 새 계정 생성 (같은 이름)
  var newAccount = createCatAccount(sender, oldName);
  newAccount.starDust = preserved.starDust;
  newAccount.achievements = preserved.achievements;
  newAccount.discoveredTreasures = preserved.discoveredTreasures;
  newAccount.prestigeCount = preserved.prestigeCount;
  newAccount.titles = preserved.titles;
  newAccount.stats = preserved.stats;

  // 환생 보너스: 초기 코인 증가
  newAccount.fishCoins = 100 + (preserved.prestigeCount * 50);

  saveCatAccount(sender, newAccount);

  replier.reply(
    "[ 싱봇 냥냥이 ] 🔄 환생 완료!\n━━━━━━━━━━━━━━━━━━\n" +
    oldName + "(이)가 새로운 알로 돌아왔어요! 🥚\n\n" +
    "🌟 " + (preserved.prestigeCount + 1) + "세대 시작!\n" +
    "💰 영구 수입 보너스: +" + (preserved.prestigeCount * 10) + "%\n" +
    "🐟 시작 코인: " + newAccount.fishCoins + "\n\n" +
    "'ㄴㄴㅇ돌봐'로 새 알을 돌봐주세요!"
  );
}

// === 핸들러: 설명서 ===

function handleCatGuide(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 냥냥이 ] 🐱 게임 설명서\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    "카톡에서 나만의 고양이를 키우는 게임!\n" +
    "고양이마다 성격이 달라서 같은 행동도\n" +
    "결과가 달라요. 내 냥이만의 이야기!\n\n" +
    "【 시작 】\n" +
    "ㄴㄴㅇ등록 나비 → 알 도착!\n" +
    "ㄴㄴㅇ돌봐 x3 → 부화! (품종/성격 공개)\n\n" +
    "【 돌봄 】\n" +
    "ㅁㅁ 츄르 → 밥 (7종, 성격별 반응 다름)\n" +
    "ㄴㄹ 실뭉치 → 놀기 (에너지 소모)\n" +
    "ㄴㄴㅇ재워 → 자면 꿈을 꿔요!\n\n" +
    "【 모험 】\n" +
    "ㅁㅎ 뒷마당 → 실시간 탐험 (30분~4시간)\n" +
    "ㅁㅎㄱㄱ → 스토리 + 전리품 확인!\n" +
    "9개 장소, 성장하면 새 장소 해금\n\n" +
    "【 기술 훈련 】\n" +
    "ㅎㄹ 앉아 → 스킬트리 4단계 (11개)\n" +
    "배달부 = 패시브 수입!\n" +
    "보물찾기 = 모험 전리품 2배!\n\n" +
    "【 특별 시스템 】\n" +
    "💤 꿈 — 2시간+ 방치하면 꿈 보상!\n" +
    "❗ 이벤트 — 15% 확률 랜덤 발생\n" +
    "📋 퀘스트 — 매일 3개 (ㄴㄴㅋ)\n" +
    "🏆 업적 — 25개 달성 보상\n" +
    "🤝 소셜 — 다른 냥이와 인사\n\n" +
    "【 엔드게임 】\n" +
    "🐱→🐈→🐈‍⬛장로묘 → 비밀진화 5종!\n" +
    "🔄 환생 → 영구 보너스 + 재시작\n\n" +
    "'ㄴㄴㄷ' 전체 명령어 보기"
  );
}

// === 핸들러: 도움말 ===

function handleCatHelp(room, msg, sender, replier) {
  replier.reply(
    "[ 싱봇 냥냥이 ] 🐱 도움말\n" +
    "━━━━━━━━━━━━━━━━━━\n\n" +
    "🥚 ㄴㄴㅇ등록 [이름] — 고양이 입양\n" +
    "📊 ㄴㄴ — 상태 확인\n" +
    "🐾 ㄴㄴㅇ돌봐 — 쓰다듬기\n\n" +
    "🍖 ㅁㅁ [음식] — 밥 주기\n" +
    "🧶 ㄴㄹ [놀이] — 놀아주기\n" +
    "💤 ㄴㄴㅇ재워 — 재우기\n\n" +
    "🗺️ ㅁㅎ [장소] — 모험 보내기\n" +
    "📋 ㅁㅎㄱㄱ — 모험 결과\n\n" +
    "🎓 ㅎㄹ [기술] — 훈련\n" +
    "📖 ㄴㄴㅇ기술 — 기술 목록\n\n" +
    "🏪 ㄴㄴㅅㅈ — 상점\n" +
    "🛒 ㄴㄴㄱ [아이템] — 구매\n" +
    "🎒 ㄴㄴㅇㅂ — 인벤토리\n" +
    "👗 ㄴㄴㅇ의상 — 의상\n\n" +
    "📋 ㄴㄴㅋ — 일일퀘스트\n" +
    "🏆 ㄴㄴㅇ업적 — 업적\n\n" +
    "🤝 ㄴㄴㅇ인사 [고양이] — 소셜\n" +
    "🏆 ㄴㄴㄹㅋ — 랭킹\n" +
    "🔄 ㄴㄴㅇ환생 — 환생 (Lv.4+)"
  );
}

// === 명령어 등록 ===

var CAT_COMMANDS = [
  { triggers: _ct(["냥냥이등록"]), handler: handleCatRegister, hasArgs: true },
  { triggers: _ct(["냥냥이돌봐"]), handler: handleCatCare },
  { triggers: _ct(["냥냥이밥"]).concat(["ㅁㅁ"]), handler: handleCatFeed, hasArgs: true },
  { triggers: _ct(["냥냥이놀자"]).concat(["ㄴㄹ"]), handler: handleCatPlay, hasArgs: true },
  { triggers: _ct(["냥냥이재워"]), handler: handleCatSleep },
  { triggers: _ct(["냥냥이모험결과"]).concat(["ㅁㅎㄱㄱ"]), handler: handleCatAdventureResult },
  { triggers: _ct(["냥냥이모험"]).concat(["ㅁㅎ"]), handler: handleCatAdventure, hasArgs: true },
  { triggers: _ct(["냥냥이훈련"]).concat(["ㅎㄹ"]), handler: handleCatTrain, hasArgs: true },
  { triggers: _ct(["냥냥이기술"]), handler: handleCatTricks },
  { triggers: _ct(["냥냥이선택"]), handler: handleCatEventChoice, hasArgs: true },
  { triggers: _ct(["냥냥이퀘보상"]).concat(["ㄴㄴㅋㅂ"]), handler: handleCatQuestClaim },
  { triggers: _ct(["냥냥이퀘스트"]).concat(["ㄴㄴㅋ"]), handler: handleCatQuest },
  { triggers: _ct(["냥냥이업적"]), handler: handleCatAchievements },
  { triggers: _ct(["냥냥이인사"]), handler: handleCatGreet, hasArgs: true },
  { triggers: _ct(["냥냥이랭킹"]).concat(["ㄴㄴㄹㅋ"]), handler: handleCatRanking },
  { triggers: _ct(["냥냥이환생"]), handler: handleCatPrestige, hasArgs: true },
  { triggers: _ct(["냥냥이상점"]).concat(["ㄴㄴㅅㅈ"]), handler: handleCatShop },
  { triggers: _ct(["냥냥이구매"]).concat(["ㄴㄴㄱ"]), handler: handleCatBuy, hasArgs: true },
  { triggers: _ct(["냥냥이인벤"]).concat(["ㄴㄴㅇㅂ"]), handler: handleCatInventory },
  { triggers: _ct(["냥냥이의상"]), handler: handleCatOutfit, hasArgs: true },
  { triggers: _ct(["냥냥이설명"]).concat(["ㄴㄴㅅㅁ"]), handler: handleCatGuide },
  { triggers: _ct(["냥냥이도움말"]).concat(["ㄴㄴㄷ"]), handler: handleCatHelp },
  { triggers: _ct(["냥냥이", "냥냥이정보"]).concat(["ㄴㄴ"]), handler: handleCatInfo }
];
