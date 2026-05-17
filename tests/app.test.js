const request = require("supertest");
const app = require("../server");
const { sequelize } = require("../config/db");

let token;
let postId;

describe("Social Media API Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("Auth Endpoints", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should not register a user with an existing email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser2",
        email: "test@test.com",
        password: "password123",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Kullanıcı zaten mevcut");
    });

    it("should login successfully and return a token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "password123",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      token = res.body.token;
    });

    it("should block login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "wrongpassword",
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Geçersiz kimlik bilgileri (Şifre uyuşmuyor)");
    });

    it("should block empty login attempts", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe("Post Endpoints", () => {
    it("should prevent unauthorized access to create a post", async () => {
      const res = await request(app)
        .post("/api/posts")
        .send({ content: "test" });
      expect(res.statusCode).toEqual(401);
    });

    it("should create a post when authenticated", async () => {
      const res = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "My first post" });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
      postId = res.body.id;
    });

    it("should retrieve all posts", async () => {
      const res = await request(app).get("/api/posts");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Comment Endpoints", () => {
    it("should prevent unauthorized access to add comment", async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .send({ text: "nice" });
      expect(res.statusCode).toEqual(401);
    });

    it("should add a comment to a post when authenticated", async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${token}`)
        .send({ text: "Great post!" });
      expect(res.statusCode).toBe(201);
    });
  });

  describe("Like, Follow, and Message Endpoints", () => {
    it("should toggle a like on a post", async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set("Authorization", `Bearer ${token}`);
      expect([200, 201]).toContain(res.statusCode);
    });

    it("should not allow following oneself", async () => {
      const res = await request(app)
        .post("/api/users/1/follow")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe("Kendinizi takip edemezsiniz");
    });

    it("should require auth to send a message", async () => {
      const res = await request(app)
        .post("/api/messages/2")
        .send({ content: "hi" });
      expect(res.statusCode).toBe(401);
    });
  });

  describe("General & Security Endpoints", () => {
    it("should return a 404 for a non-existent endpoint", async () => {
      const res = await request(app).get("/api/unknown-endpoint");
      expect(res.statusCode).toEqual(404);
    });

    it("should prevent unauthorized access to admin stats", async () => {
      const res = await request(app).get("/api/admin/stats");
      expect(res.statusCode).toEqual(401);
    });
  });
});
