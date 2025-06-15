const { Events } = require("discord.js");
const { Users } = require("../models.js");
const { generateMadLibs } = require("../commands/fun/madlibs.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // console.log("message received");

    if (message.author.bot) return;

    // - DG: Fix x.com links ---
    {
      if (message.content.includes("https://x.com")) {
        let author
        if (message.member.nickname !== null) {
          author = message.member.nickname
        }
        else {
          author = message.author.username
        }

        let xLinkIdx = message.content.indexOf("x.com")
        let before = message.content.slice(0, xLinkIdx)
        let after = message.content.slice(xLinkIdx+5)
        let result = "**" +
                    author +
                    " sent the following X post:**\n" +
                    before +
                    "fixvx.com" + 
                    after;

        await message.channel.send(result)
        await message.delete()
      }
    }
    
    if (message.content == "<@1373490238277550202> reload") {
      // check message author
      const { loadCommands, loadEvents } = require("../index.js");
      if (
        message.author == "314903883874828288" ||
        message.author == "530872774986694656"
      ) {
        console.log("reloading commands & events");
        if (message.author == "314903883874828288") {
          await message.reply("omar is cringe");
        } else {
          await message.reply("wsg gang");
        }
        loadCommands();
        loadEvents();
      } else {
        await message.reply("You can't run this command");
      }
    } else if (
      message.mentions.everyone ||
      message.content == "<@1373490238277550202> story"
    ) {
      try {
        const madLibsStory = generateMadLibs(message.author.id);
        if (madLibsStory && madLibsStory.trim() !== "") {
          await message.channel.send(madLibsStory);
        } else {
          console.error("Empty story generated");
          await message.channel.send(
            "Oops! The story generator had a brain fart. Please try again!"
          );
        }
      } catch (error) {
        console.error("Error in message handler:", error);
        await message.channel.send(
          "Oops! Something went wrong. Please try again!"
        );
      }
    } else if (message.content.trim() == "<@1373490238277550202>") {
      if (message.author == "736025260800868423") {
        await message.reply("Can u leave me alone ur actually weird...");
      } else {
        await message.reply("What do you want from me.");
      }
    } else if (message.author == "345964126096326658") {
      const r = Math.floor(Math.random() * 20);
      if (r == 0) {
        await message.reply("Hi!");
      }
    } else {
      let r = Math.floor(Math.random() * 500);
      if (r == 0) {
        await message.reply("Hi!");
      } else if (
        message.author == "314903883874828288" ||
        message.author == "210133839861907456"
      ) {
        r = Math.floor(Math.random() * 500);
        if (r == 0) {
          await message.reply("ur fat :joy:");
          await message.reply(
            "https://tenor.com/view/hulk-smash-gif-12677792749566644516"
          );
        }
      }
    }

    try {
      await logXp(message);
    } catch (error) {
      console.error("Error logging XP:", error);
    }
  },
};

async function logXp(message) {
  let user = await Users.findOne({
    where: {
      userid: message.author.id,
      guildid: message.guild.id,
    },
  });

  if (!user) {
    user = await Users.create({
      userid: message.author.id,
      guildid: message.guild.id,
      message_count: 0,
      level: 1,
    });
  }
  user.increment("message_count");

  user_level = user.get("level");
  user_message_count = user.get("message_count");

  new_level = calculateLevel(user_message_count);

  if (new_level > user_level) {
    await Users.update(
      { level: new_level },
      {
        where: {
          userid: message.author.id,
          guildid: message.guild.id,
        },
      }
    );

    const userMention = `<@${message.author.id}>`;
    message.channel.send(`${userMention} you leveled up!`);
  }
}

function calculateLevel(message_count) {
  if (message_count < 10) {
    return 1;
  }

  if (message_count < 35) {
    return 2;
  }

  if (message_count < 85) {
    return 3;
  }

  return 4 + Math.floor((message_count - 85) / 100);
}
