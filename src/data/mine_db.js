// ===== 광산 게임 데이터 =====

var MineData = {

  // --- 자원 정의 ---
  resources: {
    stone:     { name: "돌",       tier: 1, sellPrice: 2,    emoji: "🪨" },
    copperOre: { name: "구리광석", tier: 1, sellPrice: 5,    emoji: "🟤" },
    ironOre:   { name: "철광석",   tier: 1, sellPrice: 10,   emoji: "⬛" },
    silverOre: { name: "은광석",   tier: 2, sellPrice: 25,   emoji: "⬜" },
    goldOre:   { name: "금광석",   tier: 2, sellPrice: 50,   emoji: "🟡" },
    crystal:   { name: "수정",     tier: 2, sellPrice: 80,   emoji: "🔮" },
    ruby:      { name: "루비",     tier: 3, sellPrice: 200,  emoji: "🔴" },
    sapphire:  { name: "사파이어", tier: 3, sellPrice: 250,  emoji: "🔵" },
    diamond:   { name: "다이아몬드", tier: 3, sellPrice: 500, emoji: "💎" },
    abyssStone:{ name: "심연석",   tier: 3, sellPrice: 1000, emoji: "🌑" }
  },

  // 이름 → ID 역매핑
  resourceIdMap: {},

  // --- 광산 지역 ---
  areas: [
    {
      name: "초보 광산",
      emoji: "⛏���",
      depthRange: [1, 50],
      unlockDepth: 0,
      unlockPickaxe: 0,
      unlockPrestige: 0,
      drops: [
        { id: "stone",     rate: 0.80, min: 2, max: 6 },
        { id: "copperOre", rate: 0.15, min: 1, max: 2 }
      ],
      goldRange: [5, 15]
    },
    {
      name: "구리 광산",
      emoji: "🟤",
      depthRange: [51, 100],
      unlockDepth: 50,
      unlockPickaxe: 0,
      unlockPrestige: 0,
      drops: [
        { id: "stone",     rate: 0.60, min: 2, max: 5 },
        { id: "copperOre", rate: 0.50, min: 2, max: 5 },
        { id: "ironOre",   rate: 0.10, min: 1, max: 2 }
      ],
      goldRange: [10, 30]
    },
    {
      name: "철 광산",
      emoji: "⬛",
      depthRange: [101, 200],
      unlockDepth: 100,
      unlockPickaxe: 5,
      unlockPrestige: 0,
      drops: [
        { id: "stone",     rate: 0.50, min: 3, max: 8 },
        { id: "copperOre", rate: 0.35, min: 2, max: 5 },
        { id: "ironOre",   rate: 0.25, min: 1, max: 3 },
        { id: "silverOre", rate: 0.08, min: 1, max: 2 },
        { id: "goldOre",   rate: 0.02, min: 1, max: 1 }
      ],
      goldRange: [15, 40]
    },
    {
      name: "금 광산",
      emoji: "🟡",
      depthRange: [201, 350],
      unlockDepth: 200,
      unlockPickaxe: 10,
      unlockPrestige: 0,
      drops: [
        { id: "stone",     rate: 0.40, min: 3, max: 6 },
        { id: "ironOre",   rate: 0.35, min: 2, max: 4 },
        { id: "silverOre", rate: 0.25, min: 1, max: 3 },
        { id: "goldOre",   rate: 0.18, min: 1, max: 2 },
        { id: "crystal",   rate: 0.05, min: 1, max: 1 }
      ],
      goldRange: [30, 80]
    },
    {
      name: "수정 동굴",
      emoji: "🔮",
      depthRange: [351, 500],
      unlockDepth: 350,
      unlockPickaxe: 18,
      unlockPrestige: 0,
      drops: [
        { id: "ironOre",   rate: 0.30, min: 2, max: 4 },
        { id: "silverOre", rate: 0.25, min: 2, max: 3 },
        { id: "goldOre",   rate: 0.20, min: 1, max: 3 },
        { id: "crystal",   rate: 0.15, min: 1, max: 2 },
        { id: "ruby",      rate: 0.05, min: 1, max: 1 },
        { id: "sapphire",  rate: 0.03, min: 1, max: 1 }
      ],
      goldRange: [50, 120]
    },
    {
      name: "용암 갱도",
      emoji: "🌋",
      depthRange: [501, 700],
      unlockDepth: 500,
      unlockPickaxe: 25,
      unlockPrestige: 0,
      drops: [
        { id: "silverOre", rate: 0.25, min: 2, max: 4 },
        { id: "goldOre",   rate: 0.20, min: 2, max: 3 },
        { id: "crystal",   rate: 0.15, min: 1, max: 3 },
        { id: "ruby",      rate: 0.08, min: 1, max: 2 },
        { id: "sapphire",  rate: 0.06, min: 1, max: 1 },
        { id: "diamond",   rate: 0.03, min: 1, max: 1 }
      ],
      goldRange: [80, 200]
    },
    {
      name: "심연 광맥",
      emoji: "🌑",
      depthRange: [701, 999],
      unlockDepth: 700,
      unlockPickaxe: 35,
      unlockPrestige: 1,
      drops: [
        { id: "goldOre",    rate: 0.25, min: 2, max: 4 },
        { id: "crystal",    rate: 0.20, min: 2, max: 3 },
        { id: "ruby",       rate: 0.12, min: 1, max: 2 },
        { id: "sapphire",   rate: 0.10, min: 1, max: 2 },
        { id: "diamond",    rate: 0.06, min: 1, max: 1 },
        { id: "abyssStone", rate: 0.03, min: 1, max: 1 }
      ],
      goldRange: [150, 500]
    }
  ],

  // --- 곡괭이 이미지 ---
  pickaxeImageBase: "https://pkeony.github.io/singbot-images",

  // --- 곡괭이 티어 ---
  pickaxeTiers: [
    { name: "나무 곡괭이",   emoji: "🪓", levels: [1, 5],   basePower: 1,   growth: 1,   image: "pickaxe_wood"       },
    { name: "돌 곡괭이",     emoji: "⛏️", levels: [6, 10],  basePower: 7,   growth: 2,   image: "pickaxe_stone"      },
    { name: "구리 곡괭이",   emoji: "🔧", levels: [11, 15], basePower: 18,  growth: 3,   image: "pickaxe_iron"       },
    { name: "철 곡괭이",     emoji: "⚒️", levels: [16, 20], basePower: 35,  growth: 4,   image: "pickaxe_steel"      },
    { name: "은 곡괭이",     emoji: "🔨", levels: [21, 25], basePower: 60,  growth: 6,   image: "pickaxe_mithril"    },
    { name: "금 곡괭이",     emoji: "✨", levels: [26, 30], basePower: 100, growth: 8,   image: "pickaxe_orichalcum" },
    { name: "수정 곡괭이",   emoji: "💜", levels: [31, 35], basePower: 155, growth: 11,  image: "pickaxe_runic"      },
    { name: "다이아 곡괭이", emoji: "💎", levels: [36, 40], basePower: 230, growth: 18,  image: "pickaxe_ultimate"   }
  ],

  // --- 깊이 보스 ---
  depthBosses: {
    50:  { name: "바위 골렘",     requiredPower: 5,   reward: { gold: 200 }  },
    100: { name: "구리 수호자",   requiredPower: 15,  reward: { gold: 500 }  },
    200: { name: "철갑 거북",     requiredPower: 40,  reward: { gold: 1500 } },
    350: { name: "수정 정령",     requiredPower: 80,  reward: { gold: 4000 } },
    500: { name: "용암 드래곤",   requiredPower: 130, reward: { gold: 10000 } },
    700: { name: "심연의 파수꾼", requiredPower: 200, reward: { gold: 30000 } }
  },

  // --- NPC 상점 ---
  shopItems: [
    { name: "에너지 음료",  price: 500,  desc: "체력 +5 즉시 회복",        effect: "stamina", value: 5   },
    { name: "행운의 부적",  price: 2000, desc: "희귀 드롭률 +30% (10회)", effect: "luck",    value: 10  },
    { name: "깊이 폭탄",   price: 3000, desc: "깊이 +10 즉시 진행",       effect: "depth",   value: 10  },
    { name: "광부 도시락",  price: 1000, desc: "방치 수입 +50% (2시간)",   effect: "idle",    value: 120 }
  ],

  // --- 도감 보상 ---
  codexRewards: [
    { threshold: 3,  desc: "행운 +5%",          bonus: "luck",       value: 0.05 },
    { threshold: 5,  desc: "방치 수입 +20%",    bonus: "idle",       value: 0.20 },
    { threshold: 7,  desc: "채굴력 +10%",       bonus: "power",      value: 0.10 },
    { threshold: 10, desc: "스태미나 +10 & 전용 스킨", bonus: "stamina", value: 10 }
  ],

  // --- 장비 ---
  equipment: {
    helmet: [
      { name: "가죽 안전모",   tier: 1, emoji: "🪖", image: "helmet_1", staminaBonus: 3,  pvpDef: 5,   cost: { gold: 2000,  resources: [{ name: "철광석", count: 15 }, { name: "구리광석", count: 20 }] } },
      { name: "강철 안전모",   tier: 2, emoji: "⛑️", image: "helmet_2", staminaBonus: 6,  pvpDef: 12,  cost: { gold: 15000, resources: [{ name: "은광석", count: 10 }, { name: "철광석", count: 30 }] } },
      { name: "다이아 안전모", tier: 3, emoji: "👑", image: "helmet_3", staminaBonus: 10, pvpDef: 25,  cost: { gold: 80000, resources: [{ name: "다이아몬드", count: 3 }, { name: "금광석", count: 20 }] } }
    ],
    lamp: [
      { name: "양초 램프",     tier: 1, emoji: "🕯️", image: "lamp_1", luckBonus: 0.05,  cost: { gold: 1500,  resources: [{ name: "구리광석", count: 15 }, { name: "돌", count: 30 }] } },
      { name: "가스 램프",     tier: 2, emoji: "🔦", image: "lamp_2", luckBonus: 0.12,  cost: { gold: 12000, resources: [{ name: "금광석", count: 8 }, { name: "수정", count: 5 }] } },
      { name: "수정 램프",     tier: 3, emoji: "💡", image: "lamp_3", luckBonus: 0.25,  cost: { gold: 70000, resources: [{ name: "수정", count: 15 }, { name: "루비", count: 3 }] } }
    ],
    boots: [
      { name: "가죽 장화",     tier: 1, emoji: "🥾", image: "boots_1", idleBonus: 0.15, depthBonus: 1,  cost: { gold: 1800,  resources: [{ name: "철광석", count: 10 }, { name: "구리광석", count: 15 }] } },
      { name: "강철 장화",     tier: 2, emoji: "👢", image: "boots_2", idleBonus: 0.30, depthBonus: 2,  cost: { gold: 14000, resources: [{ name: "은광석", count: 8 }, { name: "금광석", count: 5 }] } },
      { name: "용암 장화",     tier: 3, emoji: "🔥", image: "boots_3", idleBonus: 0.50, depthBonus: 3,  cost: { gold: 75000, resources: [{ name: "루비", count: 5 }, { name: "사파이어", count: 3 }] } }
    ]
  },

  // --- 프레스티지 상점 ---
  prestigeShop: [
    { id: "miningPower", name: "채굴 효율",   maxLevel: 5, costs: [5, 10, 20, 40, 80],  desc: "채굴력 +10%/레벨" },
    { id: "idleRate",    name: "방치 수입",   maxLevel: 5, costs: [5, 10, 20, 40, 80],  desc: "방치 수입 +20%/레벨" },
    { id: "luck",        name: "행운",       maxLevel: 5, costs: [3, 8, 15, 30, 60],   desc: "희귀 드롭률 +5%/레벨" },
    { id: "stamina",     name: "체력 증가",   maxLevel: 3, costs: [5, 15, 35],          desc: "최대 체력 +5/레벨" },
    { id: "startDepth",  name: "시작 보너스", maxLevel: 3, costs: [8, 20, 50],          desc: "환생 후 깊이 25/50/100 시작" }
  ],

  prestigeStartDepths: [0, 25, 50, 100],

  // --- 프레스티지 조건 ---
  prestigeRequirements: { minDepth: 500, minPickaxe: 25 },

  // --- 시장 기본가 (일일 변동 기준) ---
  marketBasePrices: {
    stone: 2, copperOre: 5, ironOre: 10, silverOre: 25,
    goldOre: 50, crystal: 80, ruby: 200, sapphire: 250,
    diamond: 500, abyssStone: 1000
  },

  // --- 길드 ---
  guild: {
    createCost: 50000,
    createPrestigeReq: 3,
    maxMembers: 10,
    levelUpExp: [1000, 3000, 6000, 10000, 16000, 24000, 35000, 50000, 70000, 100000],
    perks: {
      miningPower: 0.02,  // 레벨당 +2%
      idleRate: 0.05,     // 2레벨당 +5%
      luck: 0.03          // 3레벨당 +3%
    }
  },

  // --- 채굴 이벤트 ---
  miningEvents: {
    chance: 0.12,
    types: [
      { id: "treasure_chest", name: "보물 상자",    emoji: "🎁", weight: 30, goldRange: [100, 1000] },
      { id: "trap",           name: "함정!",        emoji: "💥", weight: 20, goldLossPercent: [0.03, 0.08], maxLoss: 2000 },
      { id: "merchant",       name: "떠돌이 상인",  emoji: "🧙", weight: 15 },
      { id: "rich_vein",      name: "풍부한 광맥",  emoji: "✨", weight: 25 },
      { id: "mysterious_ore",  name: "신비한 광석",  emoji: "🌀", weight: 10 }
    ]
  },

  // --- 도박장 ---
  gambling: {
    minBet: 100,
    maxBet: 50000,
    cooldownMs: 30000,
    roulette: [
      { label: "💀 꽝",     multiplier: 0,   weight: 38 },
      { label: "😢 반타",   multiplier: 0.5, weight: 20 },
      { label: "😊 1.5배", multiplier: 1.5, weight: 20 },
      { label: "🎉 2배",   multiplier: 2,   weight: 12 },
      { label: "🔥 3배",   multiplier: 3,   weight: 7 },
      { label: "💎 5배",   multiplier: 5,   weight: 3 }
    ]
  },

  // --- 일일퀘스트 ---
  dailyQuests: {
    questsPerDay: 3,
    completionBonusGold: 800,
    completionBonusStarFragments: 1,
    tierMultiplier: [0.5, 0.5, 1.0, 1.0, 1.5, 1.5, 2.0, 2.0], // 곡괭이 티어별 보상 배율
    types: [
      { id: "mine_count",      desc: "채굴 {n}회 하기",           paramRange: [3, 8],     rewardGold: [150, 300] },
      { id: "collect_resource", desc: "{resource} {n}개 수집하기", paramRange: [5, 15],    rewardGold: [200, 400] },
      { id: "earn_gold",       desc: "골드 {n}G 획득하기",         paramRange: [500, 2000], rewardGold: [150, 300] },
      { id: "reach_depth",     desc: "깊이 {n} 도달하기",          paramRange: [10, 50],   rewardGold: [250, 500] }
    ]
  },

  // --- 칭호 ---
  titles: [
    { id: "novice_miner",  name: "초보 광부",     emoji: "⛏️",  condition: { type: "totalMined", value: 10 },          desc: "총 10회 채굴" },
    { id: "veteran_miner", name: "베테랑 광부",   emoji: "⛏️",  condition: { type: "totalMined", value: 100 },         desc: "총 100회 채굴" },
    { id: "legend_miner",  name: "전설의 광부",   emoji: "⛏️",  condition: { type: "totalMined", value: 1000 },        desc: "총 1000회 채굴" },
    { id: "max_pickaxe",   name: "만렙 광부",     emoji: "💎",  condition: { type: "pickaxeLevel", value: 40 },        desc: "곡괭이 Lv.40" },
    { id: "explorer_100",  name: "탐험가",        emoji: "🗺️", condition: { type: "maxDepthReached", value: 100 },     desc: "깊이 100 도달" },
    { id: "explorer_500",  name: "심층 탐험가",   emoji: "🧭",  condition: { type: "maxDepthReached", value: 500 },    desc: "깊이 500 도달" },
    { id: "explorer_999",  name: "심연 정복자",   emoji: "🌑",  condition: { type: "maxDepthReached", value: 999 },    desc: "깊이 999 도달" },
    { id: "rich_10k",      name: "부자",          emoji: "💰",  condition: { type: "totalGoldEarned", value: 10000 },  desc: "총 10,000G 획득" },
    { id: "rich_100k",     name: "갑부",          emoji: "💰",  condition: { type: "totalGoldEarned", value: 100000 }, desc: "총 100,000G 획득" },
    { id: "rich_1m",       name: "재벌",          emoji: "👑",  condition: { type: "totalGoldEarned", value: 1000000 },desc: "총 1,000,000G 획득" },
    { id: "pvp_5wins",     name: "결투사",        emoji: "⚔️",  condition: { type: "pvpWins", value: 5 },              desc: "PvP 5승" },
    { id: "pvp_20wins",    name: "PvP 마스터",    emoji: "🏆",  condition: { type: "pvpWins", value: 20 },             desc: "PvP 20승" },
    { id: "prestige_1",    name: "환생자",        emoji: "⭐",  condition: { type: "prestigeCount", value: 1 },        desc: "첫 환생" },
    { id: "prestige_5",    name: "윤회의 달인",   emoji: "🌟",  condition: { type: "prestigeCount", value: 5 },        desc: "5회 환생" },
    { id: "codex_full",    name: "수집왕",        emoji: "📖",  condition: { type: "codexCount", value: 10 },          desc: "도감 완성" },
    { id: "gambler",       name: "도박꾼",        emoji: "🎲",  condition: { type: "gamblingTotal", value: 50000 },    desc: "총 도박 50,000G" },
    { id: "quest_master",  name: "퀘스트 마스터", emoji: "📋",  condition: { type: "questsCompleted", value: 30 },     desc: "퀘스트 30회 완료" }
  ],

  // --- 상수 ---
  config: {
    MAX_STAMINA_BASE: 20,
    STAMINA_REGEN_MS: 120000,        // 2분
    IDLE_CAP_MS: 8 * 3600000,        // 8시간
    IDLE_RATE_BASE: 0.5,             // 분당 기본 자원
    UPGRADE_BASE_COST: 100,
    UPGRADE_COST_MULTIPLIER: 1.35,
    UPGRADE_SUCCESS_RATE: [1.0, 1.0, 0.8, 0.8, 0.6, 0.6, 0.4, 0.4], // 곡괭이 티어별 강화 성공률
    DEPTH_GAIN_MIN: 1,
    DEPTH_GAIN_MAX: 3,
    STARTING_GOLD: 100
  }
};

// 역매핑 생성
(function() {
  for (var id in MineData.resources) {
    if (MineData.resources.hasOwnProperty(id)) {
      MineData.resourceIdMap[MineData.resources[id].name] = id;
    }
  }
})();
