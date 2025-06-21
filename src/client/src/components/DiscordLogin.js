import React, { useEffect, useState } from "react";

export default function DiscordLogin() {
  const [user, setUser] = useState(null);

  async function getMe() {
    try {
      const response = await fetch("/api/user/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    }
  }

  useEffect(() => {
    getMe();
  }, []);

  const getAvatarUrl = (user) => {
    if (!user || !user.avatar) return null;
    const url = `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
    console.log("Avatar URL:", url);
    return url;
  };

  return (
    <div>
      {user ? (
        <div id="info">
          <img
            src={getAvatarUrl(user)}
            alt="avatar"
            style={{ width: 48, height: 48, borderRadius: "50%" }}
          />
        </div>
      ) : (
        <a
          id="login"
          href="https://discord.com/oauth2/authorize?client_id=1373490238277550202&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsign-in&scope=identify+guilds+email"
        >
          Identify Yourself
        </a>
      )}
    </div>
  );
}
