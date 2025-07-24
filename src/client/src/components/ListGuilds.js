import axios from 'axios';

import { useEffect, useState } from 'react';

export default function ListGuilds({ onSelectGuild }) {
    const [guilds, setGuilds] = useState([]);
    const [selectedGuildId, setSelectedGuildId] = useState('');

    useEffect(() => {
        axios
            .get('/api/list-guilds')
            .then((res) => {
                setGuilds(res.data);
            })
            .catch((err) => console.error('Error fetching guilds:', err));
    }, []);

    const handleChange = (e) => {
        setSelectedGuildId(e.target.value);
        const selectedGuild = guilds.find(
            (guild) => guild.id === e.target.value
        );
        if (onSelectGuild) {
            onSelectGuild(selectedGuild);
        }
        console.log('Selected Guild ID:', e.target.value);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <select
                value={selectedGuildId}
                onChange={handleChange}
                className="list-guilds-select bg-transparent outline-none border-none text-gray-800 w-full h-full font-luckyguy pr-8"
                style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    color: '#4a4a4a',
                    backgroundColor: 'transparent',
                    width: '100%',
                    paddingRight: '2rem',
                }}
            >
                <option value="" disabled className="text-gray-400">
                    Select a guild
                </option>
                {guilds.map((guild) => (
                    <option
                        key={guild.id}
                        value={guild.id}
                        className="text-[#4a4a4a] font-luckyguy"
                        style={{
                            backgroundColor: '#fff',
                            color: '#9caf88',
                        }}
                    >
                        {guild.name}
                    </option>
                ))}
            </select>
            <span
                style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9caf88',
                    fontSize: '1.25rem',
                }}
            >
                ▼
            </span>
        </div>
    );
}
