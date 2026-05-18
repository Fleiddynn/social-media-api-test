const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin işlemleri
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Platform istatistiklerini getir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     description: "BUG: Sadece admin rolündeki kullanıcılar erişebilmeli, ancak rol kontrolü eksik"
 *     responses:
 *       200:
 *         description: Platform istatistikleri (toplam kullanıcı, post, yorum sayısı vb.)
 *       401:
 *         description: Yetkisiz erişim
 */
router.get("/stats", auth, adminController.getStats);

module.exports = router;
