const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Social Media API",
    version: "1.0.0",
    description: "Dökümantasyon",
  },
  host: "localhost:5000",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: 'JWT token. Örnek: "Bearer &lt;token&gt;"',
    },
  },
  definitions: {
    RegisterBody: {
      username: "string",
      email: "string",
      password: "string",
    },
    LoginBody: {
      email: "string",
      password: "string",
    },
    UpdateProfileBody: {
      username: "string",
    },
    CreatePostBody: {
      content: "string",
    },
    CommentBody: {
      text: "string",
    },
    MessageBody: {
      content: "string",
    },
  },
};

const outputFile = "./swagger-output.json";
const routes = [
  "./routes/authRoutes.js",
  "./routes/postRoutes.js",
  "./routes/followRoutes.js",
  "./routes/messageRoutes.js",
  "./routes/adminRoutes.js",
];

swaggerAutogen(outputFile, routes, doc);
