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
    return url;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "auto",
        height: "auto",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        zIndex: 9999,
        padding: 16,
      }}
    >
      {user ? (
        <div id="info" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <a
            id="sign-out"
            href="http://localhost:3000/auth/sign-out"
            style={{
              marginRight: 8,
              textDecoration: "none",
              color: "#9caf88",
              fontFamily: "'Luckiest Guy', cursive, sans-serif",
              fontWeight: "bold",
            }}
          >
            Sign Out
          </a>
          <img
            src={getAvatarUrl(user)}
            alt="avatar"
            style={{ width: 48, height: 48, borderRadius: "50%" }}
          />
        </div>
      ) : (
        <a
          id="sign-in"
          href="https://discord.com/oauth2/authorize?client_id=1373490238277550202&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fsign-in&scope=identify+guilds+email"
          style={{
              marginRight: 8,
              textDecoration: "none",
              color: "#9caf88",
              fontFamily: "'Luckiest Guy', cursive, sans-serif",
              fontWeight: "bold",
            }}
        >
         Sign In 
        </a>
      )}
    </div>
  );
}
