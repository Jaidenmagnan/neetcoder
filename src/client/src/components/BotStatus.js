// Place in: /client/src/components/BotStatus.js
import React, { useEffect, useState } from 'react';

export default function BotStatus() {
    const [status, setStatus] = useState({ isOnline: false, discordLink: '' });

    useEffect(() => {
        fetch('/api/bot-status')
            .then((res) => res.json())
            .then((data) => setStatus(data));
    }, []);

    const barColor = status.isOnline ? '#4CAF50' : '#FF6F6F';
    const statusText = status.isOnline ? 'Online' : 'Offline';

    return (
        <div className="font-luckyguy min-h-screen m-0 p-0">
            <div className="flex flex-col items-center justify-center min-h-screen">
                <img
                    src="/assets/snoopy.gif"
                    alt="Snoopy"
                    className="w-[120px] mb-2.5 relative z-20"
                />
                <div
                    className={`w-[350px] h-[60px] rounded-[30px] shadow-lg flex items-center justify-center text-2xl font-luckyguy text-white border-4 border-[#e0c097] mb-7 mt-0 relative`}
                    style={{ background: barColor }}
                >
                    {statusText}
                </div>
            </div>
            <div className="fixed left-0 right-0 bottom-10 flex justify-center z-10">
                <a
                    href={status.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button className="bg-[#9CAF88] font-luckyguy text-white text-[1.3rem] border-[3px] border-[#e0c097] rounded-[25px] px-10 py-4 shadow-md cursor-pointer transition duration-200 hover:bg-[#8A9C7A] active:scale-95">
                        Add to Server
                    </button>
                </a>
            </div>
        </div>
    );
}
