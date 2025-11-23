import DiscordLogin from '../components/DiscordLogin';
import FeatureList from '../components/FeatureList';
import ListGuilds from '../components/ListGuilds';
import { useState } from 'react';
import MainContent from '../components/MainContent';

//function Dashboard() {
//  return (
//    <div>
//      <DiscordLogin />
//      <ListGuilds />
//      <p>"dashboard! this is a WIP"</p>
//    </div>
//  );
//}
//
//export default Dashboard;

export default function Dashboard() {
    const [selectedGuild, setSelectedGuild] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);

    const handleSelectGuild = (guild) => {
        setSelectedGuild(guild);
    };

    const handleSelectFeature = (feature) => {
        setSelectedFeature(feature);
    };

    return (
        <div
            className="bg-[#f5e6c8] flex flex-col overflow-hidden"
            style={{ height: '100vh', minHeight: '100vh' }}
        >
            {/* Top Bar */}
            <div
                className="flex items-center justify-between px-8 py-4 bg-[#f5e6c8]"
                style={{ flex: '0 0 72px', minHeight: 72, maxHeight: 72 }}
            >
                {/* Dropdown Placeholder */}
                <div
                    className="h-12 bg-[#faf7f0] text-[#4a4a4a] rounded-md shadow flex items-center px-4"
                    style={{ width: '14rem' }}
                >
                    <ListGuilds onSelectGuild={handleSelectGuild} />
                </div>
                {/* Sign Out and Avatar */}
                <div
                    className="flex items-center gap-4"
                    style={{ minWidth: 0 }}
                >
                    <DiscordLogin />
                </div>
            </div>
            {/* Main Content */}
            <div
                className="flex flex-1 px-8 pb-8 gap-8 overflow-hidden"
                style={{ minHeight: 0 }}
            >
                {/* Sidebar */}
                <div
                    className="w-56 bg-[#faf7f0] text-[#4a4a4a] rounded-md shadow h-full mt-0 flex flex-col items-center py-4"
                    style={{ minHeight: 0 }}
                >
                    {/* Put your sidebar content here */}
                    <FeatureList
                        selectedFeature={selectedFeature}
                        onSelectFeature={handleSelectFeature}
                    />
                </div>
                {/* Main Panel */}
                <div
                    className="flex-1 text-[#4a4a4a] bg-[#faf7f0] rounded-md shadow h-full flex flex-col p-4"
                    style={{ minWidth: 0, minHeight: 0, overflow: 'hidden' }}
                >
                    {/* "neetcoder" text on top left of the main panel */}
                    <MainContent
                        guild={selectedGuild}
                        feature={selectedFeature}
                    />
                </div>
            </div>
        </div>
    );
}
