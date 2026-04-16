// ===== 냥냥이 게임 데이터 =====

var CatData = null;

function getCatData() {
  if (CatData) return CatData;
  CatData = loadJsonData("data/cat_db.json");
  return CatData;
}

function ensureCatDataLoaded() {
  return getCatData();
}
