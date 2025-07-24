import React, { useEffect, useState } from 'react';
import { getMe } from '../utils/Auth';
import axios from 'axios';

export default function DiscordLogin() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const userData = await getMe();
            setUser(userData);
        }
        fetchUser();
    }, []);

    const getAvatarUrl = (user) => {
        if (!user || !user.avatar) return null;
        const url = `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
        return url;
    };

    return (
        <div className="fixed top-0 right-0 z-[9999] p-4 flex justify-end items-start">
            {user ? (
                <div id="info" className="flex items-center gap-2">
                    <a
                        id="sign-out"
                        href={`${process.env.REACT_APP_SERVER_BASE_URL}/auth/sign-out`}
                        className="mr-2 no-underline text-[#9caf88] font-bold font-luckyguy"
                    >
                        Sign Out
                    </a>
                    <img
                        src={getAvatarUrl(user)}
                        alt="avatar"
                        className="w-12 h-12 rounded-full"
                    />
                </div>
            ) : (
                <a
                    id="sign-in"
                    href={`${process.env.REACT_APP_OAUTH_URL}`}
                    className="mr-2 no-underline text-[#9caf88] font-bold font-luckyguy"
                >
                    Sign In
                </a>
            )}
        </div>
    );
}
