const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Follow
 *   description: Takip işlemleri
 */

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Kullanıcıyı takip et
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Takip edilecek kullanıcının ID'si
 *     responses:
 *       201:
 *         description: Takip işlemi başarılı
 *       400:
 *         description: Zaten takip ediliyor veya kendinizi takip edemezsiniz
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.post("/:id/follow", auth, followController.followUser);

/**
 * @swagger
 * /api/users/{id}/unfollow:
 *   delete:
 *     summary: Kullanıcıyı takipten çık
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Takipten çıkılacak kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Takipten çıkıldı
 *       400:
 *         description: Zaten takip edilmiyor
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.delete("/:id/unfollow", auth, followController.unfollowUser);

/**
 * @swagger
 * /api/users/{id}/followers:
 *   get:
 *     summary: Kullanıcının takipçilerini listele
 *     tags: [Follow]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Takipçi listesi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get("/:id/followers", followController.getFollowers);

/**
 * @swagger
 * /api/users/{id}/following:
 *   get:
 *     summary: Kullanıcının takip ettiklerini listele
 *     tags: [Follow]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Takip edilen kullanıcı listesi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get("/:id/following", followController.getFollowing);

module.exports = router;
