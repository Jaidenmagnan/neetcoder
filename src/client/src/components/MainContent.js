function MainContent({ feature, guild }) {
    return (
        <div>
            <h2>Main Content</h2>
            <h2 className="text-lg font-bold mb-2">Selected Guild</h2>
            <pre className="bg-white rounded p-2">{JSON.stringify(guild, null, 2)}</pre>
            <p>Feature: {feature}</p>
        </div>
    );
}

export default MainContent;