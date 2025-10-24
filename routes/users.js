const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

/* ----- GET ROUTE ----- */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await req.db
      .from("user_accounts")
      .select(
        "user_id",
        "username",
        "email",
        "firstName",
        "lastName",
        "password",
      )
      .where("user_id", userId)
      .limit(limit)
      .offset(offset);

    const totalCount = await req
      .db("user_accounts")
      .where("user_id", userId)
      .count("* as total")
      .first();

    const totalPages = Math.ceil(totalCount.total / limit);

    res.json({
      page: parseInt(page),
      totalPages,
      users,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ----- PUT ROUTE ----- */
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const { username, email, password, firstName, lastName } = req.body;

    if (!username && !email && !password && !firstName && !lastName) {
      return res
        .status(400)
        .json({ error: "At least one field to update is required" });
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;

    const result = await req
      .db("user_accounts")
      .where("user_id", userId)
      .update({
        ...updateFields,
        updatedAt: req.db.raw("CURRENT_TIMESTAMP"),
      });

    if (result > 0) {
      res.status(200).json({ message: "User data updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ----- DELETE ROUTE ----- */
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    await req.db.from("custom_session_lengths").where("user_id", userId).del();
    await req.db.from("sessions").where("user_id", userId).del();
    await req.db.from("subjects").where("user_id", userId).del();

    const result = await req.db
      .from("user_accounts")
      .where("user_id", userId)
      .del();

    if (result > 0) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
