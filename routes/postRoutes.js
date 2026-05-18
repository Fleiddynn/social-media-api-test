const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Gönderi işlemleri
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Yeni gönderi oluştur
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "String"
 *     responses:
 *       201:
 *         description: Gönderi oluşturuldu
 *       400:
 *         description: İçerik boş olamaz
 */
router.post("/", auth, postController.createPost);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Tüm gönderileri listele
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Kaç gönderi getirileceği"
 *     responses:
 *       200:
 *         description: Gönderi listesi
 */
router.get("/", postController.getPosts);

/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Gönderi ara
 *     tags: [Posts]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: "Arama terimi (BUG: SQL Injection açığı var)"
 *     responses:
 *       200:
 *         description: Arama sonuçları
 *       400:
 *         description: Arama parametresi girilmedi
 */
router.get("/search", postController.searchPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Gönderiyi sil
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gönderi silindi
 *       404:
 *         description: Gönderi bulunamadı
 */
router.delete("/:id", auth, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Gönderiye yorum ekle
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Harika bir gönderi!"
 *     responses:
 *       201:
 *         description: Yorum eklendi
 *       404:
 *         description: Gönderi bulunamadı
 */
router.post("/:id/comments", auth, postController.addComment);

/**
 * @swagger
 * /api/posts/comments/{commentId}:
 *   put:
 *     summary: Yorum düzenle
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "BUG: Sahiplik kontrolü yok, herkes başkasının yorumunu düzenleyebilir"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Güncellenmiş yorum"
 *     responses:
 *       200:
 *         description: Yorum güncellendi
 *       404:
 *         description: Yorum bulunamadı
 */
router.put("/comments/:commentId", auth, postController.editComment);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Gönderiyi beğen / beğeniyi kaldır (toggle)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Gönderi beğenildi
 *       200:
 *         description: Beğeni kaldırıldı
 *       404:
 *         description: Gönderi bulunamadı
 */
router.post("/:id/like", auth, postController.likePost);

module.exports = router;
