const wordLists = require('./madlibs.json');
const { SlashCommandBuilder } = require('discord.js');

function getRandomWord(category) {
    const words = wordLists['WORDS'][category];
    if (!words) {
        console.error(`Error: Word category "${category}" not found.`);
        return `[${category}_ERROR]`;
    }
    return words[Math.floor(Math.random() * words.length)];
}

function getRandomStory() {
    const stories = wordLists['STORIES'];
    return stories[Math.floor(Math.random() * stories.length)];
}

function replaceAllPlaceholders(text, pingerId) {
    let categories = Object.keys(wordLists['WORDS']);
    try {
        let ret = text;
        // run it like 4 times
        for (let i = 0; i < 4; i++) {
            categories.forEach((category) => {
                ret = ret.replace(category, getRandomWord(category));
            });
        }
        // get rid of brackets
        ret = ret.replace('[', '').replace(']', '');
        // replace ping id
        ret = ret.replace('PINGER_ID', `<@${pingerId}>`);
        return ret;
    } catch (error) {
        console.error('Error in replaceAllPlaceholders:', error);
        return 'Oops! Something went wrong with the story generation. Please try again!';
    }
}

const madLibsTemplates = [
    {
        name: 'The @everyone ULTIMATE Disaster',
        storyFormat: (pingerId) => {
            try {
                let story = getRandomStory();
                const finalStory = replaceAllPlaceholders(story, pingerId);

                if (!finalStory || finalStory.trim() === '') {
                    console.error('Empty story generated');
                    return 'Oops! The story generator had a brain fart. Please try again!';
                }

                return finalStory;
            } catch (error) {
                console.error('Error in storyFormat:', error);
                return 'Oops! Something went wrong with the story generation. Please try again!';
            }
        },
    },
];

function generateMadLibs(pingerId) {
    try {
        const randomTemplate =
            madLibsTemplates[
                Math.floor(Math.random() * madLibsTemplates.length)
            ];
        const story = randomTemplate.storyFormat(pingerId);

        if (!story || story.trim() === '') {
            console.error('Empty story returned from generateMadLibs');
            return 'Oops! The story generator had a brain fart. Please try again!';
        }

        return story;
    } catch (error) {
        console.error('Error in generateMadLibs:', error);
        return 'Oops! Something went wrong with the story generation. Please try again!';
    }
}

const data = new SlashCommandBuilder()
    .setName('madlibs')
    .setDescription('Generates a random Mad Libs story');

async function execute(interaction) {
    const story = generateMadLibs(interaction.user.id);
    await interaction.reply(story);
}

module.exports = {
    generateMadLibs,
    data,
    execute,
};
