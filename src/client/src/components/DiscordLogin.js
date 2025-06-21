import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DiscordLogin() {
  const [user, setUser] = useState(null);

  async function getMe() {
    try {
      const response = await axios.get("/api/user/me", {
        withCredentials: true,
      });

      setUser(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setUser(null);
        return;
      }
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
            href={`${process.env.REACT_APP_SERVER_BASE_URL}/auth/sign-out`}
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
          href={`${process.env.REACT_APP_OAUTH_URL}`}
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
