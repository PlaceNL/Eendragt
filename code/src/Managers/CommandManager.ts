import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import Discord from '../Providers/Discord';
import VariableManager from './VariableManager';

export default class CommandManager {

    public static UpdateSlashCommands() {
        const adminFlag = PermissionFlagsBits.Administrator;

        const data = [
            new SlashCommandBuilder()
                .setName(CommandConstants.COMMANDS.UDPATE)
                .setDMPermission(false)
                .setDescription('Update de slash commands')
                .setDefaultMemberPermissions(adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.COMMANDS.VALIDATE)
                .setDMPermission(false)
                .setDescription('Check if your pixel art is valid for the canvas')
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('Your pixel art')
                    .setRequired(true)),
            new SlashCommandBuilder()
                .setName(CommandConstants.COMMANDS.ONBOARDING)
                .setDMPermission(false)
                .setDescription('Plaats het onboarding bericht in dit kanaal.')
                .setDefaultMemberPermissions(adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.COMMANDS.VARIABLE)
                .setDMPermission(false)
                .setDescription('Verander de waarde van een variabele. Splits arrays met een komma.')
                .setDefaultMemberPermissions(adminFlag)
                .addStringOption(option => option
                    .setName('naam')
                    .setDescription('De naam van de variabele')
                    .setRequired(true)
                    .addChoices(...VariableManager.GetChoices()))
                .addStringOption(option => option
                    .setName('waarde')
                    .setDescription('De waarde van de variabele')
                    .setRequired(true))
        ];

        Discord.client.application?.commands.set(data);
    }
}