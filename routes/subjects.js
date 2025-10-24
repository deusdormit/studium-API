const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

/* ----- GET ROUTES ----- */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const subjects = await req
      .db("subjects")
      .where("user_id", userId)
      .limit(limit)
      .offset(offset);

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error retrieving subjects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ------ POST ROUTE ------ */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { subjectName } = req.body;
    const userId = req.userId;

    if (!subjectName) {
      return res.status(400).json({ error: "Subject name is required" });
    }

    const [result] = await req.db.from("subjects").insert({
      subject_name: subjectName,
      user_id: userId,
    });

    res.status(201).json({
      message: "Subject created successfully",
      subjectId: result[0],
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ------ DELETE ROUTE ------ */
router.delete("/:subjectId", authenticateToken, async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const userId = req.userId;

    await req
      .db("sessions")
      .where({ subject_id: subjectId, user_id: userId })
      .update({ subject_id: null, subject_name: null });

    const result = await req
      .db("subjects")
      .where({ subject_id: subjectId, user_id: userId })
      .del();

    if (result > 0) {
      res.status(200).json({ message: "Subject deleted successfully" });
    } else {
      res.status(404).json({ error: "Subject not found" });
    }
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
