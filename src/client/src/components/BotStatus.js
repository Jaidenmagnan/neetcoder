// Place in: /client/src/components/BotStatus.js
import React, { useEffect, useState } from 'react';

export default function BotStatus() {
    const [status, setStatus] = useState({ isOnline: false, discordLink: '' });

    useEffect(() => {
        fetch('/api/bot-status')
            .then(res => res.json())
            .then(data => setStatus(data));
    }, []);

    const barColor = status.isOnline ? '#4CAF50' : '#FF6F6F';
    const statusText = status.isOnline ? 'Online' : 'Offline';

    return (
        <div style={{
            fontFamily: "'Luckiest Guy', cursive, sans-serif",
            background: '#f5e6c8',
            minHeight: '100vh',
            margin: 0,
            padding: 0
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }}>
                <img
                    src="/assets/snoopy.gif"
                    alt="Snoopy"
                    style={{
                        width: 120,
                        marginBottom: 10,
                        zIndex: 2,
                        position: 'relative'
                    }}
                />
                <div style={{
                    width: 350,
                    height: 60,
                    background: barColor,
                    borderRadius: 30,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontFamily: "'Luckiest Guy', cursive, sans-serif",
                    color: '#fff',
                    border: '4px solid #e0c097',
                    marginBottom: 30,
                    marginTop: 0,
                    position: 'relative'
                }}>
                    {statusText}
                </div>
            </div>
            <div style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 40,
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10
            }}>
                <a href={status.discordLink} target="_blank" rel="noopener noreferrer">
                    <button style={{
                        background: '#9CAF88',
                        fontFamily: "'Luckiest Guy', cursive, sans-serif",
                        color: 'white',
                        fontSize: '1.3rem',
                        border: '3px solid #e0c097',
                        borderRadius: 25,
                        padding: '16px 38px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'background 0.2s, transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#8A9C7A'}
                    onMouseOut={e => e.currentTarget.style.background = '#9CAF88'}
                    >
                        Add to Server
                    </button>
                </a>
            </div>
        </div>
    );
}

