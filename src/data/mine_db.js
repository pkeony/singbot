// ===== 광산 게임 데이터 =====

var MineData = null;

function ensureMineDataLoaded() {
  if (MineData) return MineData;

  MineData = loadJsonData("data/mine_db.json");

  if (!MineData.resourceIdMap) MineData.resourceIdMap = {};
  for (var id in MineData.resources) {
    if (MineData.resources.hasOwnProperty(id)) {
      MineData.resourceIdMap[MineData.resources[id].name] = id;
    }
  }

  return MineData;
}
