const Department = require("../models/Department");

async function categorizeByKeywords(text) {
  if (!text) return "others";
  const depts = await Department.find({}).lean();
  const lower = text.toLowerCase();
  let best = { name: "others", priority: 9999 };
  for (const d of depts) {
    const kws = d.keywords || [];
    for (const kw of kws) {
      if (!kw) continue;
      if (lower.includes(kw.toLowerCase())) {
        const p = d.priority != null ? d.priority : 1;
        if (p < best.priority) best = { name: d.name, priority: p };
        else if (p === best.priority && best.name === "others") best = { name: d.name, priority: p };
      }
    }
  }
  return best.name || "others";
}

module.exports = { categorizeByKeywords };
