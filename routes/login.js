const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const db = require("../db");

//* ------ POST ROUTE ------ */
router.post("/", async (req, res) => {
  const secret = process.env.JWT_SECRET;

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userData = await req
      .db("user_accounts")
      .select(
        "user_id",
        "username",
        "email",
        "password",
        "salt",
        "firstName",
        "lastName",
      )
      .where("email", email)
      .limit(1);

    if (!userData.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userData[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.user_id }, secret, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
    console.log(`Successfully logged in as: ${user.firstName}`);
  } catch (error) {
    // Handle any errors
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
