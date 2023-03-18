import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import Discord from '../Providers/Discord';

export default class CommandManager {

    public static UpdateSlashCommands() {
        const adminFlag = PermissionFlagsBits.Administrator;

        const data = [
            new SlashCommandBuilder()
                .setName('validate')
                .setDescription('Check if your pixel art is valid for the canvas')
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('Your pixel art')
                    .setRequired(true)),
            new SlashCommandBuilder()
                .setName('onboarding')
                .setDescription('Plaats de onboarding berichten in dit kanaal.')
                .setDefaultMemberPermissions(adminFlag)
        ];

        Discord.client.application?.commands.set(data);
    }
}