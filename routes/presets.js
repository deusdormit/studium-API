const express = require("express");
const router = express.Router();

const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

/* ----- GET ROUTE ----- */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // Extract user ID from authentication token
    const { page = 1, limit = 10 } = req.query; // Extract page and limit from query parameters, default to 1 and 10 respectively

    const offset = (page - 1) * limit;

    const rows = await req.db
      .from("custom_session_lengths")
      .where("user_id", userId)
      .limit(limit)
      .offset(offset);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving custom session lengths:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ----- POST ROUTE ----- */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { sessionId, sessionLengthMinutes } = req.body;
    const userId = req.userId;

    await req.db.from("custom_session_lengths").insert({
      user_id: userId,
      session_id: sessionId,
      session_length_minutes: sessionLengthMinutes,
    });

    res.status(201).send("Custom session length added successfully");
  } catch (error) {
    console.error("Error adding custom session length:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ----- DELETE ROUTE ----- */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.userId;

    const result = await req.db
      .from("custom_session_lengths")
      .where({
        session_id: sessionId,
        user_id: userId,
      })
      .del();

    if (result === 0) {
      return res.status(403).json({
        error: "Forbidden: Preset does not belong to the authenticated user",
      });
    }

    res.status(200).send("Custom session length deleted successfully");
  } catch (error) {
    console.error("Error deleting custom session length:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
