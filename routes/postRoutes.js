const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, postController.createPost);
router.get("/", postController.getPosts);
router.delete("/:id", auth, postController.deletePost);

router.get("/search", postController.searchPosts);
router.post("/:id/comments", auth, postController.addComment);
router.put("/comments/:commentId", auth, postController.editComment);
router.post("/:id/like", auth, postController.likePost);

module.exports = router;
