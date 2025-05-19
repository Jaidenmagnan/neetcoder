const wordLists = require('./madlibs.json');
const { SlashCommandBuilder } = require('discord.js');

function getRandomWord(category) {
    const words = wordLists[category];
    if (!words) {
        console.error(`Error: Word category "${category}" not found.`);
        return `[${category}_ERROR]`;
    }
    return words[Math.floor(Math.random() * words.length)];
}

function replaceAllPlaceholders(text) {
    try {
        return text
            .replace(/\[PLURAL_NOUN_GENERIC\]/g, () => getRandomWord('PLURAL_NOUN_GENERIC'))
            .replace(/\[NOUN_GENERIC\]/g, () => getRandomWord('NOUN_GENERIC'))
            .replace(/\[ANIMAL\]/g, () => getRandomWord('ANIMAL'))
            .replace(/\[PLACE\]/g, () => getRandomWord('PLACE'))
            .replace(/\[VERB_ING_ACTION_WEIRD\]/g, () => getRandomWord('VERB_ING_ACTION_WEIRD'))
            .replace(/\[ADJECTIVE_MODERN_SLANG\]/g, () => getRandomWord('MODERN_SLANG_ADJECTIVE'))
            .replace(/\[NOUN_FAMILY_MEMBER\]/g, () => getRandomWord('NOUN_FAMILY_MEMBER'))
            .replace(/\[PLANT_NOUN\]/g, () => getRandomWord('PLANT_NOUN'))
            .replace(/\[PROFESSION_MODERN\]/g, () => getRandomWord('PROFESSION_MODERN'))
            .replace(/\[NOUN_SIDE_CHARACTER\]/g, () => getRandomWord('NOUN_SIDE_CHARACTER'))
            .replace(/\[VERB_MODERN_SLANG\]/g, () => getRandomWord('MODERN_SLANG_VERB'))
            .replace(/\[NOUN_MODERN_SLANG\]/g, () => getRandomWord('MODERN_SLANG_NOUN'));
    } catch (error) {
        console.error('Error in replaceAllPlaceholders:', error);
        return "Oops! Something went wrong with the story generation. Please try again!";
    }
}

const madLibsTemplates = [
    {
        name: "The @everyone ULTIMATE Disaster",
        storyFormat: (pingerUsername, pingerId) => {
            try {
                const words = [
                    getRandomWord('ONLINE_GREETING'),
                    getRandomWord('ITALIAN_BRAINROT_ELEMENT'),
                    getRandomWord('VERB_ING_ACTION_WEIRD'),
                    getRandomWord('PLACE'),
                    getRandomWord('BRAINROT_CATCHPHRASE')
                ];

                let story = `${words[0]} 🫣 <@${pingerId}> just @everyone'd. A wild **${words[1]}** 🦄 is **${words[2]}** 💨 in **${words[3]}** 🏰! ${words[4]} 💀`;

                const finalStory = replaceAllPlaceholders(story);
                
                if (!finalStory || finalStory.trim() === '') {
                    console.error('Empty story generated');
                    return "Oops! The story generator had a brain fart. Please try again!";
                }

                return finalStory;
            } catch (error) {
                console.error('Error in storyFormat:', error);
                return "Oops! Something went wrong with the story generation. Please try again!";
            }
        }
    }
];

function generateMadLibs(pingerUsername, pingerId) {
    try {
        const randomTemplate = madLibsTemplates[Math.floor(Math.random() * madLibsTemplates.length)];
        const story = randomTemplate.storyFormat(pingerUsername, pingerId);
        
        if (!story || story.trim() === '') {
            console.error('Empty story returned from generateMadLibs');
            return "Oops! The story generator had a brain fart. Please try again!";
        }
        
        return story;
    } catch (error) {
        console.error('Error in generateMadLibs:', error);
        return "Oops! Something went wrong with the story generation. Please try again!";
    }
}

const data = new SlashCommandBuilder()
    .setName('madlibs')
    .setDescription('Generates a random Mad Libs story');

async function execute(interaction) {
    const story = generateMadLibs(interaction.user.username, interaction.user.id);
    await interaction.reply(story);
}

module.exports = { 
    generateMadLibs,
    data,
    execute
};