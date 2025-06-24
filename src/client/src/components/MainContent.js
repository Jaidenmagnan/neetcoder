import Leaderboard from "./Leaderboard";
function MainContent({ feature, guild }) {
    if (!guild) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <img
                    src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTRqOTZycjBsdHB3c2hmYTl3OTI0aDZ1YjZndHc0N2pjdzNqaDg1byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6vXVgYm3DeGfjlS3IQ/giphy.gif"
                    alt="Snoopy"
                    className="mb-4 w-72 h-72 object-contain"
                />
                <h1
                    className="text-4xl font-bold mb-4 font-luckyguy"
                >
                    Select a Guild!
                </h1>
            </div>
        );
    }
    if (!feature) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <img
                    src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTRqOTZycjBsdHB3c2hmYTl3OTI0aDZ1YjZndHc0N2pjdzNqaDg1byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/6vXVgYm3DeGfjlS3IQ/giphy.gif"
                    alt="Snoopy"
                    className="mb-4 w-72 h-72 object-contain"
                />
                <h1
                    className="text-4xl font-bold mb-4 font-luckyguy"
                >
                    Select a Feature!
                </h1>
            </div>
        );
    }

    switch (feature) {
        case "Leaderboard":
            return <Leaderboard guildId={guild.id} />;
        default:
            return (
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <h1 className="text-4xl font-bold mb-4 font-luckyguy">Feature Not Implemented</h1>
                    <p className="text-lg text-gray-600 font-luckyguy">This feature is coming soon!</p>
                </div>
            );
    }
}

export default MainContent;