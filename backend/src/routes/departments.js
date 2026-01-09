const express = require("express");
const router = express.Router();
const departments = require("../constants/departments");

router.get("/", (req, res) => {
  res.json({ 
    departments: departments,
    count: departments.length 
  });
});

module.exports = router;
