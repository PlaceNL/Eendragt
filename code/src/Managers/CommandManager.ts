import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { VariableKey } from '../Enums/VariableKey';
import Discord from '../Providers/Discord';
import VariableManager from './VariableManager';

export default class CommandManager {

    private static readonly adminFlag = PermissionFlagsBits.ManageGuild;

    public static UpdateSlashCommands() {
        const data = [
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.UDPATE)
                .setDMPermission(false)
                .setDescription('Update de slash commands')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.BILLY)
                .setDMPermission(false)
                .setDescription('Kijk hoe laat het bij Billy is')
                .addBooleanOption(option => option
                    .setName('foto')
                    .setDescription(':)')),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VALIDATE)
                .setDMPermission(false)
                .setDescription('Check if your pixel art is valid for the canvas')
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('Your pixel art')
                    .setRequired(true)),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.ROLE.COMMAND)
                .setDMPermission(false)
                .setDescription('Geef iemand een rol, of pak een rol af')
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.ROLE.ARTIST)
                    .setDescription('Geef iemand de rol van pixelaar, of pak deze af')
                    .addUserOption(option => option
                        .setName('wie')
                        .setDescription('Wie die je de rol wilt geven/afpakken')
                        .setRequired(true))
                    .addStringOption(option => option
                        .setName('actie')
                        .setRequired(true)
                        .setDescription('Wil je de rol geven of afpakken?')
                        .addChoices({
                            name: 'Geven',
                            value: 'give'
                        },
                        {
                            name: 'Afpakken',
                            value: 'take'
                        }))
                    .addStringOption(option => option
                        .setName('reden')
                        .setDescription('De reden waarom je de rol geeft/afpakt')
                        .setMinLength(10)
                        .setMaxLength(500)
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.ROLE.DIPLOMAT)
                    .setDescription('Geef iemand de rol van diplomaat, of pak deze af')
                    .addUserOption(option => option
                        .setName('wie')
                        .setDescription('Wie je de rol wilt geven/afpakken')
                        .setRequired(true))
                    .addStringOption(option => option
                        .setName('actie')
                        .setRequired(true)
                        .setDescription('Wil je de rol geven of afpakken?')
                        .addChoices({
                            name: 'Geven',
                            value: 'give'
                        },
                        {
                            name: 'Afpakken',
                            value: 'take'
                        }))
                    .addStringOption(option => option
                        .setName('reden')
                        .setDescription('De reden waarom je de rol geeft/afpakt')
                        .setMinLength(10)
                        .setMaxLength(500)
                        .setRequired(true))),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.THREAD.COMMAND)
                .setDMPermission(false)
                .setDescription('Beheer threads')
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.THREAD.CLOSE)
                    .setDescription('Archiveer een thread, wordt automatisch geopend als iemand weer praat')
                    .addStringOption(option => option
                        .setName('reden')
                        .setDescription('Optioneel: Waarom je deze thread sluit')
                        .setMinLength(10)
                        .setMaxLength(500)
                        .setRequired(false)))
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.THREAD.LOCK)
                    .setDescription('Sluit een thread, niemand kan meer praten')
                    .addStringOption(option => option
                        .setName('reden')
                        .setDescription('Optioneel: De reden waarom je de thread sluit')
                        .setMinLength(10)
                        .setMaxLength(500)
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.THREAD.TAGS)
                    .setDescription('Pas de tags aan van een forum post')),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VOICE)
                .setDMPermission(false)
                .setDescription('Diplomaten: Maak een tijdelijk voicekanaal aan'),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.TREATY)
                .setDMPermission(false)
                .setDescription('Maak een verdrag dat beide partijen moeten ondertekenen')
                .addStringOption(option => option
                    .setName('type')
                    .setDescription('Het type verdrag')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'Partnership',
                            value: 'partnership',
                        },
                        {
                            name: 'Harmony',
                            value: 'harmony',
                        },
                        {
                            name: 'Acquisition',
                            value: 'acquisition',
                        }
                    )
                )
                .addStringOption(option => option
                    .setName('hoelang')
                    .setRequired(false)
                    .setDescription('Optioneel: Hoelang het verdrag geldig is, in het Engels (bijv: 3 hours, 1 day, etc.)')),
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
                    .setDescription('De x-coördinaat van de linkerbovenhoek van de pixel art')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasWidth))
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('y')
                    .setDescription('De y-coördinaat van de linkerbovenhoek van de pixel art')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasHeight))
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('tijd')
                    .setDescription('Optioneel: Hoe laat de pixel art moet worden geplaatst in HH:MM format (bijv: 14:15)')
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
                    .setDescription('De x-coördinaat van de linkerbovenhoek van de pixel art')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasWidth))
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('y')
                    .setDescription('De y-coördinaat van de linkerbovenhoek van de pixel art')
                    .setMinValue(0)
                    .setMaxValue(VariableManager.Get(VariableKey.CanvasHeight))
                    .setRequired(true)),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.ONBOARDING)
                .setDMPermission(false)
                .setDescription('Plaats het onboarding bericht in dit kanaal')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.ROLES)
                .setDMPermission(false)
                .setDescription('Plaats het rollen bericht in dit kanaal')
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
            new ContextMenuCommandBuilder()
                .setName(CommandConstants.MENU.PEEK)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
        ];

        Discord.client.application?.commands.set(data);
    }
}