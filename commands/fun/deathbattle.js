const { AttachmentBuilder, SlashCommandBuilder } = require('discord.js');
const text = require("./deathbattle.json");
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function addCrown(avaURL) {
    const canvas = Canvas.createCanvas(128, 128);
    const context = canvas.getContext('2d');

    const { body } = await request(avaURL);
    const avatar = await Canvas.loadImage(await body.arrayBuffer());   
    // crown = 100 by 58
    const crown = await Canvas.loadImage('./assets/crown.png');
    
    context.drawImage(avatar, 0, 0, canvas.width, canvas.height);
    context.drawImage(crown, 30, 5, 69, 40);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'winner.png' });
    return attachment;
}

function attack(attacker, defender, hp) {
    // user 1 turn
    let nhp = hp;
    let edits = [];
    [dmg, atk] = getAttack();
    s = atk.replace("ATK", attacker).replace("DEF", defender) + ` for **${dmg}** damage!\n`;
    edits.push(s);

    nhp -= dmg;
    if(nhp <= 0) return [edits, 0];
    
    // user 2 heal
    let h = randInt(0, 20);
    if(0 <= h && h <= 2) {
        [heal, msg] = getHeal();
        msg = msg.replace("HEAL", defender) + ` for **${heal}** hp!\n`
        nhp += heal;
        edits.push(msg);
    }
    
    return [edits, nhp];
}

function turn(hp1, hp2, f1, f2) {
    let first = Math.random();
    let nhp1 = hp1;
    let nhp2 = hp2;
    // player 1 goes first
    if(first < 0.5) {
        [edits, nhp2] = attack(f1, f2, hp2);
        if(nhp2 <= 0) {
            return [edits, nhp1, nhp2];
        }
        
        [edits2, nhp1] = attack(f2, f1, hp1);
        edits = edits.concat(edits2);
        return [edits, nhp1, nhp2];
    }
    // player 2 goes first
    else {
        [edits, nhp1] = attack(f2, f1, hp1);
        if(nhp1 <= 0) {
            return [edits, nhp1, nhp2];
        }
        
        [edits2, nhp2] = attack(f1, f2, hp2);
        edits = edits.concat(edits2);
        return [edits, nhp1, nhp2];
    }
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
        let s = "starting battle\n";
        const ref = await interaction.reply(s);
        
        const f1 = await interaction.options.getUser("userone").displayName;
        const f2 = await interaction.options.getUser("usertwo").displayName;

        let hp1 = 100;
        let hp2 = 100;
        let count = 1;

        while(hp1 > 0 && hp2 > 0) {
            s += `# Round ${count}!\n`;
            await ref.edit(s);
            await sleep(1000);

            [edits, hp1, hp2] = turn(hp1, hp2, f1, f2);

            for(let i = 0; i < edits.length; i++) {
                s += edits[i];
                await ref.edit(s);
                await sleep(1000);
            }

            if(hp1 == 0 || hp2 == 0) break;

            s += `${f1} has **${hp1}** HP left!\n`;
            await ref.edit(s);
            await sleep(1000);

            s += `${f2} has **${hp2}** HP left!\n`;
            await ref.edit(s);
            await sleep(1000);

            count++;
        }

        let id = await interaction.options.getUser("userone").id;
        let ava = await interaction.options.getUser("userone").displayAvatarURL({ extension: 'jpg' });
        let hp = hp1;

        if(hp1 <= 0) {
            id = await interaction.options.getUser("usertwo").id;
            ava = await interaction.options.getUser("usertwo").displayAvatarURL({ extension: 'jpg' });
            hp = hp2;
        }

        await interaction.channel.send(`<@${id}> wins with **${hp}** HP left!`);
        let cAva = await addCrown(ava);
        await interaction.channel.send({ files: [cAva] });
    }
}