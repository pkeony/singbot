// CGV 감시 등록/조회용 Discord 봇 — 슬래시 커맨드 핸들러
// 기존 GCP API (watchlist / search) 를 그대로 래핑.

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const CGV_API_BASE = process.env.CGV_API_BASE || "http://35.212.161.13:8080";
const CGV_API_KEY = process.env.CGV_API_KEY || "singbot-cgv-2026";

if (!TOKEN || !APP_ID || !GUILD_ID) {
  console.error("DISCORD_BOT_TOKEN / DISCORD_APP_ID / DISCORD_GUILD_ID 환경변수가 모두 필요합니다.");
  process.exit(1);
}

// 서울 CGV 극장 목록 (src/features/cgv.js 와 동일)
const SEOUL_THEATERS = [
  { siteNo: "0056", name: "강남" },
  { siteNo: "0001", name: "강변" },
  { siteNo: "0229", name: "건대입구" },
  { siteNo: "0010", name: "구로" },
  { siteNo: "0063", name: "대학로" },
  { siteNo: "0252", name: "동대문" },
  { siteNo: "0230", name: "등촌" },
  { siteNo: "0009", name: "명동" },
  { siteNo: "0011", name: "목동" },
  { siteNo: "0057", name: "미아" },
  { siteNo: "0030", name: "불광" },
  { siteNo: "0046", name: "상봉" },
  { siteNo: "0300", name: "성신여대입구" },
  { siteNo: "0088", name: "송파" },
  { siteNo: "0276", name: "수유" },
  { siteNo: "0150", name: "신촌아트레온" },
  { siteNo: "0040", name: "압구정" },
  { siteNo: "0112", name: "여의도" },
  { siteNo: "0059", name: "영등포" },
  { siteNo: "0074", name: "왕십리" },
  { siteNo: "0013", name: "용산아이파크몰" },
  { siteNo: "0131", name: "중계" },
  { siteNo: "0199", name: "천호" },
  { siteNo: "0107", name: "청담씨네시티" },
  { siteNo: "0223", name: "피카디리1958" },
  { siteNo: "0164", name: "하계" },
  { siteNo: "0191", name: "홍대" },
];

function findTheater(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  return SEOUL_THEATERS.find((t) => t.name.toLowerCase().includes(q)) || null;
}

async function apiReq(method, pathAndQuery, body) {
  const sep = pathAndQuery.indexOf("?") === -1 ? "?" : "&";
  const url =
    CGV_API_BASE + pathAndQuery + sep + "key=" + encodeURIComponent(CGV_API_KEY);
  const opts = { method, headers: { Accept: "application/json" } };
  if (body) {
    opts.headers["Content-Type"] = "application/json; charset=UTF-8";
    opts.body = JSON.stringify(body);
  }
  try {
    const r = await fetch(url, opts);
    return await r.json();
  } catch (e) {
    return { error: e.message || String(e) };
  }
}

function formatDate(d) {
  if (!d || d.length !== 8) return d;
  return d.substring(0, 4) + "-" + d.substring(4, 6) + "-" + d.substring(6, 8);
}

// ===== 슬래시 커맨드 정의 =====
const commands = [
  new SlashCommandBuilder()
    .setName("cgv")
    .setDescription("CGV 상영 알림 관리")
    .addSubcommand((s) =>
      s
        .setName("등록")
        .setDescription("영화 감시 등록")
        .addStringOption((o) =>
          o.setName("영화").setDescription("영화명").setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("날짜")
            .setDescription("YYYYMMDD 또는 MMDD")
            .setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("극장").setDescription("극장명 (생략 시 용산아이파크몰)")
        )
    )
    .addSubcommand((s) =>
      s
        .setName("삭제")
        .setDescription("감시 목록에서 영화 제거")
        .addStringOption((o) =>
          o.setName("영화").setDescription("영화명").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s.setName("목록").setDescription("현재 감시 중인 영화 목록")
    )
    .addSubcommand((s) =>
      s
        .setName("검색")
        .setDescription("CGV 상영작 검색")
        .addStringOption((o) =>
          o.setName("영화").setDescription("영화명").setRequired(true)
        )
    ),
].map((c) => c.toJSON());

// ===== 커맨드 핸들러 =====
async function handleRegister(interaction) {
  const movie = interaction.options.getString("영화");
  const rawDate = interaction.options.getString("날짜");
  const theaterQuery = interaction.options.getString("극장");

  let date;
  if (/^\d{8}$/.test(rawDate)) date = rawDate;
  else if (/^\d{4}$/.test(rawDate))
    date = new Date().getFullYear().toString() + rawDate;
  else {
    return interaction.reply({
      content: "❌ 날짜 형식이 잘못됐어요. `YYYYMMDD` 또는 `MMDD` 로 입력해주세요.",
      ephemeral: true,
    });
  }

  let theater = theaterQuery ? findTheater(theaterQuery) : null;
  if (theaterQuery && !theater) {
    return interaction.reply({
      content: `❌ 극장 '${theaterQuery}' 을(를) 찾을 수 없어요. \`/cgv 목록\` 근처에 극장 리스트 있음.`,
      ephemeral: true,
    });
  }
  if (!theater) theater = { siteNo: "0013", name: "용산아이파크몰" };

  await interaction.deferReply();

  const searchResult = await apiReq(
    "GET",
    "/search?q=" + encodeURIComponent(movie)
  );
  if (searchResult.error)
    return interaction.editReply(`❌ API 오류: ${searchResult.error}`);
  if (!searchResult.results || !searchResult.results.length)
    return interaction.editReply(
      `❌ '${movie}' 검색 결과 없음 (해당 극장 상영 중인 영화만 검색됨)`
    );

  let match = null;
  if (searchResult.results.length === 1) match = searchResult.results[0];
  else
    match =
      searchResult.results.find(
        (m) => m.movNm.toLowerCase() === movie.toLowerCase()
      ) || null;

  if (!match) {
    const list = searchResult.results
      .slice(0, 5)
      .map((m, i) => `${i + 1}. ${m.movNm}`)
      .join("\n");
    return interaction.editReply(
      `여러 영화 검색됨:\n${list}\n\n정확한 영화명으로 다시 시도해주세요.`
    );
  }

  const result = await apiReq("POST", "/watchlist", {
    movNo: match.movNo,
    movNm: match.movNm,
    dates: [date],
    siteNo: theater.siteNo,
    siteNm: theater.name,
  });
  if (result.error) return interaction.editReply(`❌ 등록 실패: ${result.error}`);

  return interaction.editReply(
    `✅ **등록 완료**\n🏢 ${theater.name}\n🎬 ${match.movNm}\n📅 ${formatDate(date)}\n\n새 상영 뜨면 이 채널로 자동 알림!`
  );
}

async function handleRemove(interaction) {
  const movie = interaction.options.getString("영화");
  await interaction.deferReply();

  const listResult = await apiReq("GET", "/watchlist");
  if (listResult.error)
    return interaction.editReply(`❌ API 오류: ${listResult.error}`);

  const list = listResult.watchList || [];
  const found = list.find(
    (w) =>
      w.movNm.toLowerCase().includes(movie.toLowerCase()) || w.movNo === movie
  );
  if (!found)
    return interaction.editReply(`❌ '${movie}' 감시 목록에 없음`);

  const result = await apiReq(
    "DELETE",
    "/watchlist?movNo=" + found.movNo
  );
  if (result.error) return interaction.editReply(`❌ 삭제 실패: ${result.error}`);

  return interaction.editReply(`✅ 삭제 완료: **${found.movNm}**`);
}

async function handleList(interaction) {
  await interaction.deferReply();

  const result = await apiReq("GET", "/watchlist");
  if (result.error) return interaction.editReply(`❌ API 오류: ${result.error}`);

  const list = result.watchList || [];
  if (!list.length)
    return interaction.editReply(
      "📋 감시 목록 비어있음.\n`/cgv 등록` 으로 추가하세요."
    );

  const lines = list.map((w) => {
    const dates = (w.dates || []).map(formatDate).join(", ");
    return `🎬 **${w.movNm}**\n🏢 ${w.siteNm || "용산아이파크몰"}\n📅 ${dates}`;
  });

  return interaction.editReply(
    `📋 **감시 목록**\n━━━━━━━━━━━━━━━━━━\n\n${lines.join("\n\n")}\n\n━━━━━━━━━━━━━━━━━━\n30초마다 자동 체크 중 🔄`
  );
}

async function handleSearch(interaction) {
  const query = interaction.options.getString("영화");
  await interaction.deferReply();

  const result = await apiReq(
    "GET",
    "/search?q=" + encodeURIComponent(query)
  );
  if (result.error) return interaction.editReply(`❌ API 오류: ${result.error}`);

  const results = result.results || [];
  if (!results.length)
    return interaction.editReply(
      `🔍 '${query}' 검색 결과 없음 (해당 극장 상영작만 검색됨)`
    );

  const list = results
    .slice(0, 10)
    .map((m, i) => `${i + 1}. ${m.movNm}`)
    .join("\n");
  return interaction.editReply(
    `🔍 **검색 결과**\n━━━━━━━━━━━━━━━━━━\n${list}\n\n\`/cgv 등록\` 으로 감시 추가!`
  );
}

// ===== 봇 세팅 =====
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`[discord-bot] 로그인 성공: ${client.user.tag}`);
  try {
    const rest = new REST({ version: "10" }).setToken(TOKEN);
    await rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), {
      body: commands,
    });
    console.log("[discord-bot] 슬래시 커맨드 등록 완료 (guild scope)");
  } catch (e) {
    console.error("[discord-bot] 커맨드 등록 실패:", e.message);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "cgv") return;

  try {
    const sub = interaction.options.getSubcommand();
    if (sub === "등록") await handleRegister(interaction);
    else if (sub === "삭제") await handleRemove(interaction);
    else if (sub === "목록") await handleList(interaction);
    else if (sub === "검색") await handleSearch(interaction);
  } catch (e) {
    console.error("[discord-bot] 커맨드 처리 중 에러:", e);
    const msg = `❌ 내부 오류: ${e.message || e}`;
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg).catch(() => {});
    } else {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

client.login(TOKEN);
