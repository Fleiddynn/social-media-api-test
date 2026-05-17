const Follow = require("../models/Follow");
const User = require("../models/User");

exports.followUser = async (req, res) => {
  try {
    const followingId = req.params.id;
    const followerId = req.user.id;

    if (followingId == followerId) {
      return res.status(400).json({ msg: "Kendinizi takip edemezsiniz" });
    }

    const userToFollow = await User.findByPk(followingId);
    if (!userToFollow) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      return res.status(400).json({ msg: "Bu kullanıcıyı zaten takip ediyorsunuz" });
    }

    await Follow.create({ followerId, followingId });
    res.status(201).json({ msg: "Kullanıcı takip edildi" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const followingId = req.params.id;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      return res.status(400).json({ msg: "Bu kullanıcıyı takip etmiyorsunuz" });
    }

    await follow.destroy();
    res.json({ msg: "Takipten çıkıldı" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const followers = await Follow.findAll({
      where: { followingId: req.params.id },
      attributes: ["followerId"],
    });
    res.json(followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const following = await Follow.findAll({
      where: { followerId: req.params.id },
      attributes: ["followingId"],
    });
    res.json(following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};
