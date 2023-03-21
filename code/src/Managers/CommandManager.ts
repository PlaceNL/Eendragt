import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { VariableKey } from '../Enums/VariableKey';
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
                .setName(CommandConstants.SLASH.VOICE)
                .setDMPermission(false)
                .setDescription('Create a temporary voice channel for diplomacy'),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.COORDINATE)
                .setDMPermission(false)
                .setDescription('Start een gecoördineerde plaatsing van pixel art op het canvas')
                .setDefaultMemberPermissions(this.adminFlag)
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('De pixel art')
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('x')
                    .setDescription('De x-coördinaat van de linkerbovenhoek van de pixelart')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasWidth))
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('y')
                    .setDescription('De y-coördinaat van de linkerbovenhoek van de pixelart')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasHeight))
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('tijd')
                    .setDescription('Optioneel: Hoe laat de pixel art moet worden geplaatst (bijv: 14:15)')
                    .setMinLength(5)
                    .setMaxLength(5)
                    .setRequired(false)),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.TEMPLATE)
                .setDMPermission(false)
                .setDescription('Maak een template afbeelding voor je pixel art')
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('De afbeelding die je wilt toevoegen aan de template')
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('x')
                    .setDescription('De x-coördinaat van de linkerbovenhoek van de pixelart')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasWidth))
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('y')
                    .setDescription('De y-coördinaat van de linkerbovenhoek van de pixelart')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasHeight))
                    .setRequired(true)),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.ONBOARDING)
                .setDMPermission(false)
                .setDescription('Plaats het onboarding bericht in dit kanaal.')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VARIABLE.COMMAND)
                .setDescription('Variabelen')
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag)
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.VARIABLE.SET)
                    .setDescription('Verander de waarde van een variabele. Splits arrays met een komma.')
                    .addStringOption(option => option
                        .setName('naam')
                        .setDescription('De naam van de variabele')
                        .setRequired(true)
                        .addChoices(...VariableManager.GetChoices()))
                    .addStringOption(option => option
                        .setName('waarde')
                        .setDescription('De waarde van de variabele')
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.VARIABLE.GET)
                    .setDescription('Krijg de waarde van een variabele')
                    .addStringOption(option => option
                        .setName('naam')
                        .setDescription('De naam van de variabele')
                        .setRequired(true)
                        .addChoices(...VariableManager.GetChoices())))
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.VARIABLE.GETALL)
                    .setDescription('Krijg een lijst van de waardes van alle variabelen')),
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