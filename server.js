const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { connectDB, sequelize } = require("./config/db");
require("dotenv").config();

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Like = require("./models/Like");
const Follow = require("./models/Follow");
const Message = require("./models/Message");

// Associations
User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Comment, { foreignKey: "postId" });
Comment.belongsTo(Post, { foreignKey: "postId" });

User.hasMany(Like, { foreignKey: "userId" });
Like.belongsTo(User, { foreignKey: "userId" });

Post.hasMany(Like, { foreignKey: "postId" });
Like.belongsTo(Post, { foreignKey: "postId" });

User.hasMany(Follow, { foreignKey: "followerId", as: "Following" });
User.hasMany(Follow, { foreignKey: "followingId", as: "Followers" });

User.hasMany(Message, { foreignKey: "senderId", as: "SentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "ReceivedMessages" });

const app = express();

connectDB().then(() => {
  sequelize.sync({ alter: true }).then(() => {
    console.log("Database models synced.");
  });
});

app.use(express.json({ extended: false }));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API",
      version: "1.0.0",
      description: "teste balblabla",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/followRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
}

module.exports = app;
