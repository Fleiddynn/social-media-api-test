const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Mesajlaşma işlemleri
 */

/**
 * @swagger
 * /api/messages/{userId}:
 *   post:
 *     summary: Kullanıcıya mesaj gönder
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mesaj gönderilecek kullanıcının ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Merhaba, nasılsın?"
 *     responses:
 *       201:
 *         description: Mesaj gönderildi
 *       404:
 *         description: Alıcı kullanıcı bulunamadı
 */
router.post("/:userId", auth, messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{userId}:
 *   get:
 *     summary: Belirli bir kullanıcıyla olan mesajları getir
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Konuşma yapılan kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Mesaj geçmişi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get("/:userId", auth, messageController.getMessages);

module.exports = router;
