const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const auth = require("../middlewares/authMiddleware");

router.post("/:id/follow", auth, followController.followUser);
router.delete("/:id/unfollow", auth, followController.unfollowUser);
router.get("/:id/followers", followController.getFollowers);
router.get("/:id/following", followController.getFollowing);

module.exports = router;
