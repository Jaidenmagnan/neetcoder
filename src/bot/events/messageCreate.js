const { Events } = require("discord.js");
const { Users } = require("../../models.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        
		await replaceX(message);
		await omarsWeirdCommand(message);
        await logXp(message);
    },
};

async function omarsWeirdCommand(message) {
    	if (message.content.trim() == "<@1373490238277550202>") {
      		if (message.author == "736025260800868423") {
        		await message.reply("Can u leave me alone ur actually weird...");
      		} else {
        		await message.reply("What do you want from me.");
      		}
    	} else {
      		let r = Math.floor(Math.random() * 500);
      		if (r == 0) {
      		  await message.reply("Hi!");
      		} else if (
      		  message.author == "314903883874828288" || message.author == "210133839861907456"
      		) {
      		  r = Math.floor(Math.random() * 1000);
      		  if (r == 0) {
      		    await message.reply("ur fat :joy:");
      		    await message.reply("https://tenor.com/view/hulk-smash-gif-12677792749566644516");
      		  }
      		}
    	}
}

async function logXp(message) {
	try {
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
    	        { 
    	            level: new_level,
    	        },
    	        {
    	            where: {
    	                userid: message.author.id,
    	                guildid: message.guild.id,
    	            },
    	        },
    	    );

    	    const userMention = `<@${message.author.id}>`;
    	    message.channel.send(`${userMention} you leveled up!`);
    	}
	}
	catch(e) {
		console.log("error logging xp", e);
	}
}

async function replaceX(message) {
        if (message.content.includes("https://x.com")) {
            let author = message.author.username;
            if (message.member.nickname !== null) {
                author = message.member.nickname;
            }
        
            let msg = message.content.replace("x.com", "fixvx.com");
        
			try {
            	let result = "**" +
            	            author +
            	            " shared a tweet:**\n" +
            	            msg;
        
            	await message.channel.send(result);
            	await message.delete();
			}
			catch (error){
				console.log(error);
			}
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
