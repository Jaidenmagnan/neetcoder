const wordLists = {
    ONLINE_GREETING: [
        "Sup, nerds? 👋", "Greetings, fellow gamers! 🎮", "Hewwo? Is this thing on? 🎤",
        "Alright, chat, settle down. 🤫", "It is I, your favorite [NOUN_GENERIC]! 👑",
        "Listen up, fives, a ten is speaking. 💅", "Y'all hear sumn'? 👂", "Engage! 🚀",
        "What's cookin', good lookin'? 👨‍🍳", "Ahoy, internet! 🏴‍☠️", "PSA for all you [PLURAL_NOUN_GENERIC]! 📢",
        "Ayo, what's the vibe? 🎵", "How DARE you enter my [PLACE]? 😤", "Konichiwa, senpai! 🎌",
        "Welcome to the [NOUN_GENERIC] show! 🎪", "Is this mic on or am I just [VERB_ING_ACTION_WEIRD]? 🎙️"
    ],
    ANIMAL: [
        "capybara 🦫", "axolotl 🦎", "seagull 🦅", "raccoon 🦝", "blobfish 🐟", "sentient sock puppet 🧦",
        "kiwi bird 🥝", "pangolin 🦔", "red panda 🐼", "tardigrade 🦠", "glitchy squirrel 🐿️", "philosophical frog 🐸",
        "chonky cat 🐱", "doge 🐕", "IKEA shark (Blåhaj) 🦈", "long furby 🧸", "confused pug 🐶",
        "business goose 🦢", "emotional support possum 🦡", "Skibidi-fied hamster 🐹", "mewing cat 😺"
    ],
    VERB_ING_ACTION_WEIRD: [
        "aggressively yodeling 🗣️", "beatboxing badly 🎵", "levitating suspiciously 🪄", "tap-dancing furiously 💃",
        "photosynthesizing dramatically 🌱", "glitching uncontrollably 💻", "explaining NFTs with interpretive dance 💸",
        "mewing majestically 😺", "whispering secrets to a toaster 🍞", "collecting digital lint aggressively 🧹",
        "trying to divide by zero ➗", "arguing with a rubber duck 🦆", "composing a symphony for [PLURAL_NOUN_GENERIC] 🎼",
        "fervently shitposting 💩", "achieving peak brainrot 🧠", "trying to Fanum tax a cloud ☁️",
        "doing the Griddy on the moon 🌙", "quantum leaping into a [NOUN_GENERIC] ⚛️", "rizz-training a [ANIMAL] 💪"
    ],
    PLACE: [
        "the internet 🌐", "a Discord server 💬", "Ohio 🗺️", "the backrooms 🚪", "my FYP 📱",
        "a fever dream 🌡️", "level 7 of this simulation 🎮", "the void 🌌", "a suspiciously damp basement 🏠",
        "the comments section 💭", "a parallel universe 🌌", "inside a TikTok trend 📱", "Brazil 🇧🇷",
        "Kanye's mind palace 🏰", "Trump's golf course ⛳", "the Skibidi-verse 🚽", "a Grimace Shake dimension 🥤",
        "my Minecraft server ⛏️", "the uncanny valley 😶", "a zoom call with [ANIMAL]s 📹"
    ],
    REACTION_CRINGE: [
        "Big YIKES. 😬", "My brother in Christ, what is this? 🙏", "I can't even... 😶",
        "That's a bit sus. 🕵️", "This ain't it, chief. 👎", "The secondhand embarrassment is real. 😳",
        "Delete this, fam. 🗑️", "Major L. 😔", "It's giving ✨cringe✨. 😖", "Please touch grass. 🌱",
        "I'm logging off. 👋", "My soul just shriveled a bit. 💀", "Bruh moment detected. 🤦", "That's enough internet for today. 🌙",
        "Sir, this is a Wendy's. 🍔", "The ick is strong with this one. 🤢", "My disappointment is immeasurable, and my day is ruined. 😭",
        "You're cooked, my guy. 🔥", "That's a beige flag if I ever saw one. 🚩"
    ],
    MEME_QUESTION: [
        "Are we the baddies? 🤔", "But why, though? 🤷", "Understandable, have a great day? 👋",
        "Is this a pigeon? 🐦", "You guys are getting paid for this? 💰", "What in the actual [NOUN_GENERIC] is going on? 🤨",
        "We live in a society? 🏙️", "Do you even lift, bro? 💪", "Is this the real life, or is this just fantasy? 🎭",
        "How many layers of irony are you on? 🎭", "What's the lore here? 📚", "Am I delulu or...? 🤪",
        "Can I get a ' 변경된 내용 없음' in the chat? 🇰🇷", "Is it cake? 🎂", "What if we kissed in the [PLACE]? 😳"
    ],
    BRAINROT_CATCHPHRASE: [
        "Skibidi dop dop yes yes. 🚽", "Rizzin' up the [NOUN_GENERIC]! 💫", "Ohio final boss music intensifies. 🎵",
        "What the sigma doin'? 🧐", "Just mewing, don't mind me. 😺", "It's the confused [ANIMAL] for me, no cap. 🧢",
        "Tralalero tralalala! 🎵", "The algorithm is algorithming with a side of [PLURAL_NOUN_GENERIC]. 🤖",
        "My aura is currently fluorescent beige. ✨", "Gyatt to make a [NOUN_GENERIC] statement. 💪",
        "Sending it to the backrooms with a Grimace Shake. 🥤", "Brain not braining today, it's just [VERB_ING_ACTION_WEIRD]. 🧠",
        "Zero thoughts, head empty, just [ANIMAL] vibes. 🎵", "Let him cook (the [ADJECTIVE_MODERN_SLANG] [NOUN_GENERIC]). 👨‍🍳",
        "This is my canon event, I fear. 📖", "Delulu is the solulu until it's not. 🤪", "Fanum taxing your [NOUN_GENERIC]. 💸",
        "Bro is NOT the main character, he's the [NOUN_SIDE_CHARACTER]. 🎭"
    ],
    ONLINE_CALL_TO_ACTION: [
        "Go touch some grass (or at least a [PLANT_NOUN]). 🌱", "Smash that like button (or don't, I'm not your [NOUN_FAMILY_MEMBER]). 👍",
        "Normalize [VERB_ING_ACTION_WEIRD]! 📢", "Read the room, sweetie, it's giving [ADJECTIVE_MODERN_SLANG]. 📖",
        "Let them cook (or they'll set the [PLACE] on fire)! 🔥", "Don't feed the trolls, feed a [ANIMAL]. 🍽️",
        "Stay hydrated, gamers, with that G-Fuel of life. 💧", "Secure the bag (of [PLURAL_NOUN_GENERIC]). 💰", "Google it, respectfully, before I [VERB_MODERN_SLANG]. 🔍",
        "Do a flip (metaphorically, unless you're a [PROFESSION_MODERN])! 🤸", "Send memes, not DMs, unless they're [ADJECTIVE_MODERN_SLANG]. 📱",
        "Unplug and vibe with a [NOUN_GENERIC]. 🔌", "Manifest a W, or at least a [ADJECTIVE_MODERN_SLANG] [NOUN_GENERIC]. ✨"
    ],
    PLURAL_NOUN_GENERIC: ["beans 🫘", "pixels 🖼️", "vibes ✨", "memes 😂", "braincells 🧠", "notifications 🔔", "hot takes 🔥", "doomscrolls 📱", "aura points ✨", "rizz particles 💫", "Skibidi toilets 🚽", "delulu thoughts 🤪", "sigma moments 💪", "canon events 📖"],
    NOUN_GENERIC: ["algorithm 🤖", "vibe ✨", "meme 😂", "internet 🌐", "simulation 🎮", "timeline ⏳", "discourse 💭", "brainrot 🧠", "rizz 💫", "aura ✨", "delulu 🤪", "sigma grindset 💪", "canon event 📖", "main character energy 👑", "side quest 🎮", "NPC behavior 🤖", "lore drop 📚"],
    KANYE_QUOTE_MEME: [
        "I am a god. 👑", "My greatest pain in life is that I will never be able to see me perform live. 🎤",
        "George Bush doesn't care about black people. 🎭", "I'mma let you finish, but... 🎤",
        "Listen to the kids, bro! 👶", "You ain't got the answers, Sway! 🤷", "I need a room full of mirrors so I can be surrounded by winners. 🪞",
        "Sometimes I get emotional over fonts. 😢", "I still think I am the greatest. 👑", "This is a god dream. 💭"
    ],
    TRUMP_QUOTE_MEME: [
        "It's gonna be HUGE. 📈", "Believe me. 🤝", "Fake news! 📰", "Sad! 😢", "Build the wall (around the [PLACE]). 🧱",
        "You're fired (from the [NOUN_GENERIC] committee). 🔥", "Make [PLURAL_NOUN_GENERIC] great again! 🇺🇸", "Nobody knows [PLURAL_NOUN_GENERIC] better than me. 🧠",
        "Sounds good, doesn't work. 🤷", "Frankly, we did win this [NOUN_GENERIC]. 🏆", "Bing bing bong bong. 🎵"
    ],
    ITALIAN_BRAINROT_ELEMENT: [
        "Tralalero Tralalá 🎵", "Bombardino Crocodilo 🐊", "Chimpanzini Bananini 🐒", "a blue-sneakered shark 🦈",
        "a distorted Italian opera 🎭", "neon explosions 💥", "pixelated [ANIMAL] 🖼️", "a talking [ANIMAL] 🗣️",
        "Lirilì Larilà 🎵", "Tung Tung Tung Sahur 🥁", "Ballerina Cappuccina 💃", "AI-generated chaos 🤖"
    ],
    MODERN_SLANG_ADJECTIVE: [
        "rizzful 💫", "delulu 🤪", "sus 🕵️", "mid ⭐", "goated 🐐", "bussin' 🔥", "cooked 👨‍🍳", "uncooked 🥩",
        "based 💯", "cringe 😬", "glowed-up ✨", "aura-filled ✨", "beige-flagged 🚩", "NPC-coded 🤖", "terminally online 💻", "chronically offline 📴"
    ],
    MODERN_SLANG_NOUN: [
        "rizz 💫", "aura ✨", "delulu 🤪", "sigma 💪", "canon event 📖", "the ick 🤢", "beige flag 🚩", "main character 👑",
        "side quest 🎮", "NPC 🤖", "glitch 💻", "lore 📚", "brainrot 🧠", "Fanum tax 💸", "Skibidi 🚽", "gyatt 💪", "looksmaxxing 💅"
    ],
    MODERN_SLANG_VERB: [
        "to rizz (up) 💫", "to mew 😺", "to looksmax 💅", "to Fanum tax 💸", "to Skibidi 🚽", "to go goblin mode 🧌",
        "to touch grass 🌱", "to be cooked 👨‍🍳", "to let them cook 👨‍🍳", "to leave no crumbs 🍞", "to spill the tea ☕",
        "to throw shade 🌑", "to gaslight (ironically) 💡", "to gatekeep (ironically) 🚪", "to girlboss 👩‍💼", "to simp (for a [NOUN_GENERIC]) 😍"
    ],
    NOUN_SIDE_CHARACTER: ["NPC 🤖", "random villager 👥", "background extra 🎭", "guy in the red shirt 👕", "forgotten sidekick 🦸", "that one dude 👤", "the intern 📝"],
    PLANT_NOUN: ["cactus 🌵", "sentient fern 🌿", "overwatered succulent 💧", "venus fly trap 🪴", "plastic ficus 🎋", "bonsai tree 🌳", "dandelion 🌼"],
    NOUN_FAMILY_MEMBER: ["mom 👩", "dad 👨", "weird uncle 👨‍👦", "annoying cousin 👥", "sentient Roomba 🤖", "pet [ANIMAL] 🐾", "long-lost twin 👯"],
    PROFESSION_MODERN: ["TikTok influencer 📱", "eSports champion 🎮", "crypto bro 💸", "AI ethicist 🤖", "prompt engineer 💻", "VTuber 🎥", "professional [ANIMAL] walker 🦮", "meme historian 📚"]
};

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

                let story = `"${words[0]}" 🫣 <@${pingerId}> just @everyone'd. "A wild **${words[1]}** 🦄 is **${words[2]}** 💨 in **${words[3]}** 🏰!" ${words[4]} 💀`;

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

const { SlashCommandBuilder } = require('discord.js');

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