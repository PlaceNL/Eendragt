import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import Discord from '../Providers/Discord';
import VariableManager from './VariableManager';

export default class CommandManager {

    private static readonly adminFlag = PermissionFlagsBits.Administrator;

    public static UpdateSlashCommands() {
        const data = [
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.UDPATE)
                .setDMPermission(false)
                .setDescription('Update de slash commands')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VALIDATE)
                .setDMPermission(false)
                .setDescription('Check if your pixel art is valid for the canvas')
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('Your pixel art')
                    .setRequired(true)),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.ONBOARDING)
                .setDMPermission(false)
                .setDescription('Plaats het onboarding bericht in dit kanaal.')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VARIABLE)
                .setDMPermission(false)
                .setDescription('Verander de waarde van een variabele. Splits arrays met een komma.')
                .setDefaultMemberPermissions(this.adminFlag)
                .addStringOption(option => option
                    .setName('naam')
                    .setDescription('De naam van de variabele')
                    .setRequired(true)
                    .addChoices(...VariableManager.GetChoices()))
                .addStringOption(option => option
                    .setName('waarde')
                    .setDescription('De waarde van de variabele')
                    .setRequired(true)),
            new ContextMenuCommandBuilder()
                .setName(CommandConstants.MENU.VOTE)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag),
            new ContextMenuCommandBuilder()
                .setName(CommandConstants.MENU.DELAY)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag),
            new ContextMenuCommandBuilder()
                .setName(CommandConstants.MENU.APPROVE)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag),
            new ContextMenuCommandBuilder()
                .setName(CommandConstants.MENU.DECLINE)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag),
        ];

        Discord.client.application?.commands.set(data);
    }
}