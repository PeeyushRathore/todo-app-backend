const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middlewares/auth");

const router = express.Router();

// CREATE
router.post("/", auth, async (req, res) => {
  const todo = await Todo.create({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id,
  });
  res.json(todo);
});

// GET (pagination + search)
router.get("/", auth, async (req, res) => {
  const { page = 1, limit = 5, search = "" } = req.query;

  const todos = await Todo.find({
    user: req.user.id,
    title: { $regex: search, $options: "i" },
  })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(todos);
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  res.json(todo);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ message: "Deleted" });
});

// MARK ALL COMPLETED
router.put("/mark/all", auth, async (req, res) => {
  await Todo.updateMany({ user: req.user.id }, { isCompleted: true });
  res.json({ message: "All marked completed" });
});
// GET single todo (FOR EDIT PAGE)  ✅ MUST EXIST
router.get("/:id", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (err) {
    res.status(400).json({ message: "Invalid todo id" });
  }
});

module.exports = router;
