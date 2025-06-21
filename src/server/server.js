const express = require("express");
const { UserAuth } = require("../models.js");
const axios = require("axios");
require("dotenv").config();
const path = require("path");
const { sign } = require("jsonwebtoken");
const cors = require("cors");
const authenticate = require("./middlewares/authenticate");
const cookieParser = require("cookie-parser");

async function isBotOnline() {
  const BOT_HEALTH_PORT = process.env.BOT_HEALTH_PORT || 4000;
  const url = `http://localhost:${BOT_HEALTH_PORT}/health`;

  try {
    const response = await axios.get(url, { timeout: 1000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(
    cors({
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(authenticate);

  if (process.env.NODE_ENV === "production") {
    const buildPath = path.join(__dirname, "../client/build");
    app.use(express.static(buildPath));
  }

  app.get("/api/bot-status", async (_, res) => {
    const isOnline = await isBotOnline();
    const clientId = process.env.CLIENT_ID;
    const discordLink = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
    res.json({
      isOnline,
      discordLink,
    });
  });

  app.get("/api/user/me", (req, res) => {
    res.json(req.user);
  });

  app.get("/auth/sign-out", (req, res) => {
    res.clearCookie("token");
    res.redirect(process.env.CLIENT_REDIRECT_URL);
  });

  app.get("/auth/sign-in", async ({ query }, response) => {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const PORT = process.env.PORT;

    const { code } = query;

    if (code) {
      try {
        const tokenRes = await axios.post(
          "https://discord.com/api/oauth2/token",
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/auth/sign-in",
            scope: "identify",
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const oauthData = tokenRes.data;
        console.log(oauthData);

        const userRes = await axios.get("https://discord.com/api/users/@me", {
          headers: {
            authorization: `${oauthData.token_type} ${oauthData.access_token}`,
          },
        });
        console.log(userRes.data);
        const { id, username, avatar } = userRes.data;

        let user = await UserAuth.findOne({ where: { discordId: id } });

        if (user) {
            user.userName = username;
            user.avatar = avatar;
            await user.save();
        }
        else {
            user = await UserAuth.create({
                discordId: id,
                userName: username,
                avatar: avatar || "",
            });
        }

        const token = await sign({ sub: id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        response.cookie("token", token);
        response.redirect(process.env.CLIENT_REDIRECT_URL);
      } catch (error) {
        console.error(error);
      }
    }
  });

  app.get("/test", (req, res) => {
    res.send("test");
  });

  if (process.env.NODE_ENV === "production") {
    app.get("/{*any}", (_, res) => {
      res.sendFile(path.resolve(buildPath, "index.html"));
    });
  }

  const server = app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
  });

  return { app, server };
}

const { app, server } = createServer();
