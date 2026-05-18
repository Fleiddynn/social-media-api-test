const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kimlik doğrulama işlemleri
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Kayıt başarılı, JWT token döner
 *       400:
 *         description: Eksik alan veya kullanıcı zaten mevcut
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Giriş başarılı, JWT token döner
 *       400:
 *         description: Geçersiz kimlik bilgileri
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Oturum açmış kullanıcının profili
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profil bilgileri
 *       401:
 *         description: Yetkisiz erişim
 */
router.get("/profile", auth, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Kullanıcı profilini güncelle
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: "BUG: role alanı da değiştirilebiliyor (Mass Assignment)"
 *     responses:
 *       200:
 *         description: Profil güncellendi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put("/profile", auth, authController.updateProfile);

module.exports = router;
