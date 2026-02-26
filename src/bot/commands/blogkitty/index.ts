import {
    ChatInputCommandInteraction,
} from 'discord.js';

import { SlashCommandBuilder } from 'discord.js';
import * as monitor from './monitor/monitor';

export const data = new SlashCommandBuilder()
    .setName('blogkitty')
    .setDescription('rss feed monitor')
    .addSubcommand(monitor.data);

export const execute = async (interaction: ChatInputCommandInteraction) => {
    monitor.execute(interaction);
};
