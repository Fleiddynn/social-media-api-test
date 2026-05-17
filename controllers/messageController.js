const Message = require("../models/Message");
const User = require("../models/User");
const { Op } = require("sequelize");

exports.sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.userId;
    const senderId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ msg: "Mesaj içeriği boş olamaz" });
    }

    if (receiverId == senderId) {
      return res.status(400).json({ msg: "Kendinize mesaj gönderemezsiniz" });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: "Alıcı bulunamadı" });
    }

    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};
