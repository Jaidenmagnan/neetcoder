import React, { useEffect, useState } from 'react';

export default function DiscordLogin() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    const tokenType = fragment.get('token_type');

    if (!accessToken) {
      setShowLogin(true);
      return;
    }

    fetch('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    })
      .then(result => result.json())
      .then(response => setUser(response))
      .catch(console.error);
  }, []);

  return (
    <div>
      <div id="info">
        {user && ` ${user.username}#${user.discriminator}`}
      </div>
      {showLogin && (
        <a
          id="login"
          href="https://discord.com/oauth2/authorize?client_id=1373490238277550202&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fsign-in&scope=identify+guilds+email"
        >
          Identify Yourself
        </a>
      )}
    </div>
  );
}