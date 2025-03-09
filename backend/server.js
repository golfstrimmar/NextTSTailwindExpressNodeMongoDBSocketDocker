import express from "express";
import http from "http";
import { connectDB } from "./config/db.js";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import Auction from "./models/Auction.js";
import User from "./models/User.js";
import axios from "axios";

dotenv.config();
const app = express();
connectDB();
const server = http.createServer(app);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ===========================
// Подключаем Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
// ===========================
// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(
    `Incoming request: method=${req.method} url=${
      req.url
    } body=${JSON.stringify(req.body, null, 2)}`,
  );
  next();
});
// ===========================
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Code is required");
  }
  try {
    // Обмен кода на токены
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET, // Добавьте секрет в .env
      redirect_uri: "http://localhost:5000/auth/google/callback", // Измените на порт сервера
      grant_type: "authorization_code",
    });
    const { access_token, id_token } = response.data;
    // Верификация id_token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const userName = payload.name;
    const googleId = payload.sub;
    const avatarUrl = payload.picture || null;
    // Проверка или создание пользователя
    let user = await User.findOne({ email });
    if (!user) {
      const avatarBase64 = avatarUrl
        ? await downloadAvatarAsBase64(avatarUrl)
        : null;
      user = new User({
        email,
        userName,
        avatar: avatarBase64,
        googleId,
      });
      await user.save();
    }
    // Генерация JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" },
    );
    // Перенаправление на фронтенд с токеном
    res.redirect(`http://localhost:3000/dashboard?token=${jwtToken}`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).send("Authentication failed");
  }
});
// ===========================
// Маршрут для получения всех активных аукционов
app.get("/api/auctions", async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "active" });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// ===========================
// Слушаем подключение клиентов через WebSocket
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  // ===============================
  socket.on("getAuctions", async () => {
    const auctions = await Auction.find({ status: "active" });
    socket.emit("auctionsList", auctions);
  });
  // ===============================
  socket.on("addAuction", async (payload) => {
    console.log("===Adding new auction:====", payload);
    // Извлекаем auctionData и token
    const { auctionData, token } = payload;
    const data = auctionData || payload; // На случай, если структура отличается
    console.log("===Extracted data:====", data);
    // Проверяем токен
    if (!token) {
      console.log("===Validation error:====", "Token is required");
      return io.emit("erroraddingauction", "Authentication required");
    }
    let creatorId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      creatorId = decoded.userId;
      const creator = await User.findById(creatorId);
      if (!creator) {
        console.log("===Validation error:====", "User not found");
        return io.emit("erroraddingauction", "User not found");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return io.emit("erroraddingauction", "Invalid token");
    }
    const sanitizedData = {
      title: String(data.title),
      startPrice: Number(data.startPrice),
      endTime: new Date(data.endTime),
      imageUrl: data.imageUrl || "",
      creator: creatorId, // Добавляем creator
    };
    try {
      const existingAuction = await Auction.findOne({
        title: sanitizedData.title,
        status: "active",
      });
      if (existingAuction) {
        const errorMessage = `Auction with title "${sanitizedData.title}" already exists`;
        console.log("===Validation error:====", errorMessage);
        return io.emit("erroraddingauction", errorMessage);
      }
      const newAuction = new Auction(sanitizedData);
      console.log("===New auction instance:====", newAuction);
      await newAuction.save();
      console.log("===Auction saved:====", newAuction);
      const auctions = await Auction.find({ status: "active" }).populate(
        "creator",
        "userName",
      );
      console.log("===Sending auctions list:====", auctions);
      io.emit("auctionsList", auctions);
      io.emit("auctionAdded", { message: "Auction added successfully" });
    } catch (error) {
      console.error("Error adding auction:", error);
      io.emit("erroraddingauction", error.message);
    }
  });
  // ===============================
  socket.on("register", async (data) => {
    const { username, email, password } = data;
    console.log("===--- register ---====", email, password, username);
    if (!email || !password || !username) {
      socket.emit("registrationError", {
        message: "All fields are required to be filled in.",
      });
      return;
    }
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        socket.emit("registrationError", {
          message: "The user with this email already exists.",
        });
        return;
      }
      // Хеширование пароля перед сохранением
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        email: email,
        userName: username,
        passwordHash: hashedPassword,
        avatar: "",
        googleId: email,
      });
      await newUser.save();
      socket.emit("registrationSuccess", {
        message: "Registration was successful!",
        user: newUser,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      socket.emit("registrationError", {
        message: "Error during registration.",
        error: error.message,
      });
    }
  });
  // ===============================
  const downloadAvatarAsBase64 = async (url) => {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      return `data:image/jpeg;base64,${Buffer.from(response.data).toString(
        "base64",
      )}`;
    } catch (error) {
      console.error("Failed to download avatar:", error);
      return null; // Возвращаем null, если аватар недоступен
    }
  };
  socket.on("googleRegister", async (data) => {
    const { token } = data;
    if (!token) {
      socket.emit("registrationError", { message: "Token is required." });
      return;
    }
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const userName = payload.name;
      const googleId = payload.sub;
      const avatarUrl = payload.picture || null;
      let user = await User.findOne({ email });
      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
        socket.emit("googleRegisterSuccess", {
          message: "User already exists. Account linked with Google.",
          user,
        });
        return;
      }
      // Новый пользователь → требуем пароль
      socket.emit("requirePassword", {
        message: "You need to set a password to complete registration.",
        email,
        userName,
        googleId,
        avatarUrl,
      });
    } catch (error) {
      console.error("Google registration error:", error);
      socket.emit("registrationError", {
        message: "Error during Google registration.",
      });
    }
  });
  // ===================================
  socket.on("setPassword", async (data) => {
    const { email, password, userName, googleId, avatarUrl } = data;
    if (!email || !password) {
      socket.emit("registrationError", {
        message: "Email and password are required.",
      });
      return;
    }
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        socket.emit("registrationError", { message: "User already exists." });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      let avatarBase64 = null;
      if (avatarUrl) {
        avatarBase64 = await downloadAvatarAsBase64(avatarUrl);
      }
      const newUser = new User({
        userName,
        email,
        passwordHash: hashedPassword,
        avatar: avatarBase64,
        googleId,
      });
      await newUser.save();
      console.log("User saved to DB:", newUser); // Проверяем, что сохранилось
      const savedUser = await User.findOne({ email });
      console.log("User from DB:", savedUser); // Проверяем, что реально в базе
      const jwtToken = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "10h" },
      );
      socket.emit("googleRegisterSuccess", {
        message: "Registration successful!",
        user: newUser,
        token: jwtToken,
      });
    } catch (error) {
      console.error("Error setting password:", error);
      socket.emit("registrationError", { message: "Error setting password." });
    }
  });
  // ===============================
  socket.on("login", async (data) => {
    const { email, password } = data;
    console.log("===--- login ---====", email, password);
    if (!email || !password) {
      socket.emit("loginError", {
        message: "Both email and password are required.",
      });
      return;
    }
    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        socket.emit("loginError", {
          message: "User with this email does not exist.",
        });
        return;
      }
      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.passwordHash,
      );
      if (!isPasswordValid) {
        socket.emit("loginError", {
          message: "Incorrect password.",
        });
        return;
      }
      // Генерация JWT токена
      const token = jwt.sign(
        { userId: existingUser._id, email: existingUser.email },
        process.env.JWT_SECRET, // Это должен быть ваш секретный ключ
        { expiresIn: "10h" }, // Срок действия токена — 10 час
      );
      socket.emit("loginSuccess", {
        message: "Login successful!",
        user: existingUser,
        token: token,
      });
    } catch (error) {
      console.error("Error during login:", error);
      socket.emit("loginError", {
        message: "Error during login from server. ",
        currentemail: email,
        passwordrequired: true,
      });
    }
  });
  socket.on("googleLogin", async (data) => {
    const { token } = data; // Получаем токен от клиента
    if (!token) {
      socket.emit("loginError", { message: "Token is required." });
      return;
    }
    try {
      // Верификация токена через Google API
      const ticket = await client.verifyIdToken({
        idToken: token, // Токен от клиента
        audience: process.env.GOOGLE_CLIENT_ID, // Ваш Google Client ID
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const userName = payload.name;
      const googleId = payload.sub;
      const avatarUrl = payload.picture || null; // Получаем URL аватара
      // Проверка, существует ли пользователь в базе данных
      let user = await User.findOne({ email });
      if (!user) {
        // Если пользователь не существует, создаем нового
        let avatarBase64 = null;
        if (avatarUrl) {
          avatarBase64 = await downloadAvatarAsBase64(avatarUrl); // Скачиваем аватар
        }
        user = new User({
          email,
          userName,
          avatar: avatarBase64, // Сохраняем аватар в Base64
          googleId,
        });
        await user.save();
      } else {
        // Если пользователь существует, но у него нет Google ID, объединяем учетные записи
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
        // Если у пользователя уже есть аватар, используем его
        if (!user.avatar && avatarUrl) {
          user.avatar = await downloadAvatarAsBase64(avatarUrl); // Скачиваем аватар
          await user.save();
        }
      }
      // Генерация JWT токена для аутентификации пользователя
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "10h" },
      );
      console.log("===--- googleLogin ---====", user, jwtToken);
      // Отправка успешного ответа с данными пользователя и JWT токеном
      socket.emit("googleLoginSuccess", {
        message: "Google login successful!",
        user: user,
        token: jwtToken,
      });
    } catch (error) {
      console.error("Google login error:", error);
      socket.emit("googleLoginError", {
        message: "Error during Google login.",
        error: error.message,
      });
    }
  });
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
// ===========================
// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
