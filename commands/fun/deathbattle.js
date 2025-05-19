const { SlashCommandBuilder } = require('discord.js');
const text = require("./deathbattle.json");

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function rand(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function getHeal() {
    let amt = randInt(5, 16);
    return [amt, rand(text.heal)];
}

function getAttack() {
    let sev = randInt(1, 11);
    if(sev == 1 || sev == 2) {
        // light attack, 1-10 dmg
        let dmg = randInt(1, 11);
        return [dmg, rand(text.attack.light)];
    }
    else if(3 <= sev && sev <= 6) {
        // medium attack, 11-20 dmg
        let dmg = randInt(11, 21);
        return [dmg, rand(text.attack.medium)];
    }
    else if(7 <= sev && sev <= 9) {
        // heavy attack, 21-30 dmg
        let dmg = randInt(21, 31);
        return [dmg, rand(text.attack.heavy)];
    }
    else if(sev == 10) {
        // doomed attack, 31-49 dmg
        let dmg = randInt(31, 50);
        return [dmg, rand(text.attack.doomed)];
    }
    
    return [0, "there was a bug :/"];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deathbattle')
        .setDescription('self explanatory')
        .addUserOption(option =>
            option.setName("userone")
            .setRequired(true)
            .setDescription("first fighter"))
        .addUserOption(option =>
            option.setName("usertwo")
            .setRequired(true)
            .setDescription("second fighter")),
    async execute(interaction) {

        async function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        await interaction.reply("starting battle");

        const f1 = interaction.options.getUser("userone").displayName;
        const f2 = interaction.options.getUser("usertwo").displayName;

        let hp1 = 100;
        let hp2 = 100;
        let count = 1;


        while(hp1 > 0 && hp2 > 0) {
            await interaction.channel.send(`# Round ${count}!`);
            await sleep(1000);

            // user 1 turn
            [dmg, atk] = getAttack();
            atk = atk.replace("ATK", f1).replace("DEF", f2) + ` for **${dmg}** damage!`;
            await interaction.channel.send(atk);
            await sleep(1000);

            hp2 -= dmg;
            if (hp2 <= 0) break;

            // user 2 heal
            let h = randInt(0, 20);
            if(0 <= h && h <= 2) {
                [heal, msg] = getHeal();
                msg = msg.replace("HEAL", f2) + ` for **${heal}** HP!`;
                hp2 += heal;
                await interaction.channel.send(msg);
                await sleep(1000);
            }

            // user 2 attack
            [dmg, atk] = getAttack();
            atk = atk.replace("ATK", f2).replace("DEF", f1) + ` for **${dmg}** damage!`;
            await interaction.channel.send(atk);
            await sleep(1000);

            hp1 -= dmg;
            if(hp1 <= 0) break;

            // user 1 heal
            h = randInt(0, 20);
            if(0 <= h && h <= 2) {
                [heal, msg] = getHeal();
                msg = msg.replace("HEAL", f1) + ` for **${heal}** HP!`;
                hp1 += heal;
                await interaction.channel.send(msg);
                await sleep(1000);
            }

            count += 1;

            await interaction.channel.send(`${f1} has **${hp1}** HP left!`);
            await sleep(1000);
            await interaction.channel.send(`${f2} has **${hp2}** HP left!`);
            await sleep(1000);
        }

        if(hp2 <= 0) {
            let id1 = interaction.options.getUser("userone").id;
            let ava = await interaction.options.getUser("userone").avatarURL();
            await interaction.channel.send(`<@${id1}> wins with **${hp1}** HP left!`);
            await interaction.channel.send("https://www.citypng.com/public/uploads/preview/hd-realistic-gold-king-crown-png-704081695122733mzs7cerwxf.png");
            await interaction.channel.send(`${ava}`);
        } else {
            let id2 = interaction.options.getUser("usertwo").id;
            let ava = await interaction.options.getUser("usertwo").avatarURL();
            await interaction.channel.send(`<@${id2}> wins with **${hp2}** HP left!`);
            await interaction.channel.send("https://www.citypng.com/public/uploads/preview/hd-realistic-gold-king-crown-png-704081695122733mzs7cerwxf.png");
            await interaction.channel.send(`${ava}`);
        }
    }
}