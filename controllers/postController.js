const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ msg: "İçerik boş olamaz" });
    }

    const post = await Post.create({
      content,
      userId: req.user.id,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.getPosts = async (req, res) => {
  try {
    let limit = req.query.limit ? parseInt(req.query.limit) : null;

    const posts = await Post.findAll({
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    const detailedPosts = [];
    for (let post of posts) {
      // N+1 her post için kullanıcıyı tek tek çekiyor
      const user = await User.findByPk(post.userId, {
        attributes: ["username"],
      });

      // N+1 her post için yorumları tek tek çekiyor
      const comments = await Comment.findAll({ where: { postId: post.id } });

      const detailedComments = [];
      for (let comment of comments) {
        // N+2 her yorum için kullanıcıyı tek tek çekiyor
        const commentUser = await User.findByPk(comment.userId, {
          attributes: ["username"],
        });
        detailedComments.push({
          id: comment.id,
          text: comment.text,
          createdAt: comment.createdAt,
          User: commentUser,
        });
      }

      detailedPosts.push({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        User: user,
        Comments: detailedComments,
      });
    }

    res.json(detailedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Gönderi bulunamadı" });
    }

    await post.destroy();
    res.json({ msg: "Gönderi silindi" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ msg: "Arama parametresi girilmedi" });
    }

    // "deletedAt" IS NULL kontrolü yok
    // lullanıcı girdisi direkt sorguya yapıştırılıyor sql injection var
    const query = `SELECT * FROM "Posts" WHERE content LIKE '%${q}%'`;
    const posts = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.json(posts);
  } catch (err) {
    // Postgre mesajı direkt dönyüor
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Gönderi bulunamadı" });
    }

    const comment = await Comment.create({
      text: req.body.text,
      userId: req.user.id,
      postId: post.id,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.editComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: "Yorum bulunamadı" });
    }

    // "comment.userId === req.user.id" yko
    comment.text = req.body.text;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ msg: "Gönderi bulunamadı" });
    }

    const like = await Like.findOne({ where: { postId, userId } });

    if (like) {
      await like.destroy();
      return res.json({ msg: "Beğeni kaldırıldı", postId, userId });
    } else {
      await Like.create({ postId, userId });
      return res.status(201).json({ msg: "Gönderi beğenildi", postId, userId });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};
