// ─── Campaign Routes ───

const express = require("express");
const router = express.Router();
const { create, getAll, getOne, update, remove, getMine } = require("../controllers/campaigns");
const { authenticate, optionalAuthenticate } = require("../middleware/auth");

// FIX (Flaw #1): Campaigns are PUBLIC — use optionalAuthenticate so guests
// can browse, but role-aware filtering still works when logged in.
router.get("/", optionalAuthenticate, getAll);

// /mine must be defined BEFORE /:id so it is not swallowed as a param
router.get("/mine", authenticate, getMine);

// Single campaign — public with optional auth for role-aware display
router.get("/:id", optionalAuthenticate, getOne);

const upload = require("../middleware/upload");

// Authenticated actions
router.post("/", authenticate, upload.single("image"), create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

module.exports = router;
