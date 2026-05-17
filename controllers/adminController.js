const User = require("../models/User");
const Post = require("../models/Post");

exports.getStats = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "Bu işlem için admin yetkisi gereklidir" });
    }

    const totalUsers = await User.count();
    const totalPosts = await Post.count();

    res.json({
      totalUsers,
      totalPosts,
      systemStatus: "Healthy",
      database: "PostgreSQL",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};
