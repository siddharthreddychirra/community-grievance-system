const bcrypt = require("bcrypt"); // or "bcryptjs" if bcrypt fails

async function run() {
  const password = "elec123";
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hash);
}

run();
