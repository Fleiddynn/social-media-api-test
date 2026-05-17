const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Lütfen tüm alanları doldurun" });
    }

    // case insensitive değil
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: "Kullanıcı zaten mevcut" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // "Muzo@Test.com" ile kayıt olan kullanıcı "muzo@test.com" ile giriş yapamaz -> case sensitive
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Geçersiz kimlik bilgileri (Kullanıcı bulunamadı)" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ msg: "Geçersiz kimlik bilgileri (Şifre uyuşmuyor)" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu hatası");
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sunucu Hatası");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Kullanıcı bulunamadı" });
    }

    // user istediği her şeyi değiştirebiliyor (role dahil)
    await user.update(req.body);

    res.json({
      msg: "Profil güncellendi",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Profile Update Error: ", err);
    res.status(500).json({ msg: "Sunucu Hatası", error: err.message });
  }
};
