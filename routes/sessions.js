const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");

const db = require("../db");

/* ----- GET ROUTE ----- */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const rows = await req.db
      .from("sessions")
      .where("user_id", userId)
      .limit(limit)
      .offset(offset)
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ Message: "Database error - Could not get data" });
      });

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving sessions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ----- POST ROUTE ----- */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const {
      sessionStart,
      sessionEnd,
      subjectId,
      sessionDuration,
      subjectName,
    } = req.body;

    const [result] = await req.db
      .from("sessions")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        session_start: sessionStart,
        session_end: sessionEnd,
        duration: sessionDuration,
        subject_name: subjectName,
      })
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ Message: "Database error - Could not add data" });
      });

    if (result) {
      res.status(201).json({
        message: "Session created successfully",
        sessionId: result,
      });
    } else {
      res.status(500).json({ error: "Failed to create session" });
    }
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ------ DELETE ROUTE ----- */
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;

    const result = await req.db
      .from("sessions")
      .where({ user_id: userId, session_id: sessionId })
      .del()
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ Message: "Database error - Could not delete data" });
      });

    if (result > 0) {
      res.status(200).json({ message: "Session deleted successfully" });
    } else {
      res
        .status(404)
        .json({ error: "Session not found for the authenticated user" });
    }
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ----- DELETE ALL SESSIONS ROUTE ----- */
router.delete("/all", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await req.db
      .from("sessions")
      .where({ user_id: userId })
      .del()
      .catch((err) => {
        console.log(err);
        res
          .status(500)
          .json({ Message: "Database error - Could not delete data" });
      });

    if (result > 0) {
      res.status(200).json({ message: "All sessions deleted successfully" });
    } else {
      res
        .status(404)
        .json({ error: "No sessions found for the authenticated user" });
    }
  } catch (error) {
    console.error("Error deleting sessions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
