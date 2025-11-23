export default function FeatureList({ selectedFeature, onSelectFeature }) {
    const features = [
        'Leaderboard',
        'Configuration Logs',
        'Role Groups',
        'Feature Flags',
    ];

    return (
        <div className="flex flex-col items-center justify-top h-full w-full">
            <ul className="w-full">
                {features.map((feature, index) => (
                    <li
                        key={index}
                        className={`text-[#4a4a4a] font-luckyguy px-4 py-2 w-full cursor-pointer transition-colors
                            ${selectedFeature === feature ? 'bg-[#9caf8a]' : ''}
                            hover:bg-[#9caf8a]`}
                        onClick={() => onSelectFeature(feature)}
                    >
                        {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export { FeatureList };
