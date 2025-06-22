import axios from "axios";
import { useEffect, useState } from "react";
export default function ListGuilds() {
    const [guilds, setGuilds] = useState([]);
    const [selectedGuildId, setSelectedGuildId] = useState("");

    useEffect(() => {
        axios.get('/api/list-guilds')
            .then(res => {
                setGuilds(res.data);
            })
            .catch(err => console.error('Error fetching guilds:', err));
    }, []);

    const handleChange = (e) => {
        setSelectedGuildId(e.target.value);
        console.log("Selected Guild ID:", e.target.value);
    };

    return (
        <select
            value={selectedGuildId}
            onChange={handleChange}
            className="bg-transparent outline-none border-none text-gray-800 w-full h-full font-luckyguy"
            style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                color: selectedGuildId ? "#4a4a4a" : "#333",
                // Prevent default highlight color (teal) on option selection
                // This only affects the select itself, not the dropdown options
                backgroundColor: "transparent"
            }}
        >
            <option value="" disabled className="text-gray-400">Select a guild</option>
            {guilds.map(guild => (
                <option
                    key={guild.id}
                    value={guild.id}
                    className="text-[#4a4a4a] font-luckyguy"
                    style={{
                        backgroundColor: "#fff", // Set option highlight background
                        color: "#9caf88"
                    }}
                >
                    {guild.name}
                </option>
            ))}
        </select>
    );
}
