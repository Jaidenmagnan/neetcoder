import { useEffect } from "react";
import axios from "axios";

export default function ListGuilds() {
    useEffect(() => {
        axios.get('/api/list-bot-guilds')
            .then(res => {
                console.log(res.data);
            })
            .catch(err => console.error('Error fetching guilds:', err));
    }, []);

    return (
        <div className="font-luckyguy min-h-screen m-0 p-0">
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-4">List of Guilds</h1>
                <p>Check the console for the list of guilds.</p>
            </div>
        </div>
    );
}
