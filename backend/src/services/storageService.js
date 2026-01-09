const path = require("path");

function buildFileUrl(file) {
  return `/uploads/${path.basename(file.path)}`;
}

module.exports = { buildFileUrl };
