const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const db = require("../db");

const validateEmail = (email) => {
  const isValid =
    /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|au|mil|co\.uk|org\.uk|ac\.uk|net\.uk|edu\.au|gov\.au|net\.au|org\.au)$/i.test(
      email,
    );
  return isValid;
};

const validateUsername = (username) => {
  const isValid = /^[a-zA-Z0-9]+$/.test(username);
  return isValid;
};

const validateName = (name) => {
  const isValid = /^[a-zA-Z]+$/.test(name);
  return isValid;
};

/* ----- POST ROUTE ----- */
router.post("/", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error:
          "Username, email, password, firstName, and lastName are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    if (!validateName(firstName)) {
      return res.status(400).json({ error: "Invalid first name format" });
    }

    if (!validateName(lastName)) {
      return res.status(400).json({ error: "Invalid last name format" });
    }

    const existingUser = await req.db
      .from("user_accounts")
      .where("email", email)
      .first();
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with that email address already exists" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await req.db.from("user_accounts").insert({
      username,
      email,
      password: hashedPassword,
      salt,
      firstName,
      lastName,
      createdAt: req.db.fn.now(),
      updatedAt: req.db.raw("CURRENT_TIMESTAMP"),
    });

    res
      .status(201)
      .json({ message: "User created successfully", userId: result });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
