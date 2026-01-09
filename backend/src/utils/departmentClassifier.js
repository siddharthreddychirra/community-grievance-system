const keywordMap = {
  electricity: [
    "power",
    "electricity",
    "current",
    "transformer",
    "meter",
    "short circuit",
    "voltage",
  ],

  roads: [
    "road",
    "pothole",
    "street",
    "highway",
    "bridge",
    "traffic",
  ],

  water: [
    "water",
    "leak",
    "pipeline",
    "tap",
    "supply",
    "drinking",
  ],

  sanitation: [
    "garbage",
    "trash",
    "waste",
    "cleaning",
    "drain",
    "sewage",
  ],

  streetlights: [
    "street light",
    "lamp",
    "light not working",
    "pole light",
  ],
};

function detectDepartment(text = "") {
  const lowerText = text.toLowerCase();

  for (const department in keywordMap) {
    for (const keyword of keywordMap[department]) {
      if (lowerText.includes(keyword)) {
        return department;
      }
    }
  }

  return "other";
}

module.exports = detectDepartment;
