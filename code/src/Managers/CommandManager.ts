import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { VariableKey } from '../Enums/VariableKey';
import Discord from '../Providers/Discord';
import VariableManager from './VariableManager';
import LanguageLoader from '../Utils/LanguageLoader';

export default class CommandManager {

    private static readonly adminFlag = PermissionFlagsBits.ManageGuild;

    public static UpdateCommands() {
        const data = [
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.UDPATE)
                .setDMPermission(false)
                .setDescription(LanguageLoader.LangConfig.COMMANDS_UPDATE_SLASH_COMMAND)
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.APPLICATIONS)
                .setDMPermission(false)
                .setDescription(LanguageLoader.LangConfig.COMMANDS_OPEN_OR_CLOSE_APPLICATIONS)
                .setDefaultMemberPermissions(this.adminFlag)
                .addStringOption(option => option
                    .setName('categorie')
                    .setDescription(LanguageLoader.LangConfig.COMMANDS_FOR_WHICH_ROLE_TO_CLOSE_APPLICATIONS)
                    .setRequired(true)
                    .addChoices({
                        name: LanguageLoader.LangConfig.ROLES_DIPLOMATS,
                        value: 'diplomat'
                    },
                    {
                        name: LanguageLoader.LangConfig.ROLES_PIXEL_ARTISTS,
                        value: 'artist'
                    },
                    {
                        name: LanguageLoader.LangConfig.ROLES_COMMUNITY_SUPPORT,
                        value: 'support'
                    },
                    {
                        name: LanguageLoader.LangConfig.ROLES_EDITOR,
                        value: 'reporter'
                    }
                    ))
                .addStringOption(option => option
                    .setName('actie')
                    .setDescription(LanguageLoader.LangConfig.COMMANDS_APPLICATIONS_OPEN_OR_CLOSED)
                    .setRequired(true)
                    .addChoices({
                        name: LanguageLoader.LangConfig.COMMANDS_OPEN_IT,
                        value: 'open'
                    },
                    {
                        name: LanguageLoader.LangConfig.COMMANDS_CLOSE_IT,
                        value: 'take'
                    })),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VOTE)
                .setDescription(LanguageLoader.LangConfig.COMMANDS_CREATE_A_VOTE)
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag)
                .addAttachmentOption(option => option
                    .setName('image')
                    .setDescription(LanguageLoader.LangConfig.COMMANDS_THE_IMAGE_THAT_BELONGS_TO_THE_VOTE)
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('duration')
                    .setDescription(LanguageLoader.LangConfig.COMMANDS_HOW_LONG_SHOULD_THE_VOTE_TAKE)
                    .setMinValue(1)
                    .setMaxValue(60)
                    .setRequired(false)),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.BILLY)
                .setDMPermission(false)
                .setDescription(LanguageLoader.LangConfig.COMMANDS_CHECK_BILLY_TIME)
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
                .setDescription(LanguageLoader.LangConfig.COMMANDS_GIVE_OR_TAKE_ROLE)
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.ROLE.ARTIST)
                    .setDescription(LanguageLoader.LangConfig.COMMANDS_MODIFY_PIXEL_ARTIST_ROLE)
                    .addUserOption(option => option
                        .setName('wie')
                        .setDescription(LanguageLoader.LangConfig.COMMANDS_WHO_TO_GIVE_ROLE_OR_TAKE_ROLE)
                        .setRequired(true))
                    .addStringOption(option => option
                        .setName('actie')
                        .setRequired(true)
                        .setDescription(LanguageLoader.LangConfig.COMMANDS_DO_YOU_WANT_TO_TAKE_OR_GIVE_ROLE)
                        .addChoices({
                            name: LanguageLoader.LangConfig.COMMANDS_GIVE,
                            value: 'give'
                        },
                        {
                            name: LanguageLoader.LangConfig.COMMANDS_TAKE,
                            value: 'take'
                        }))
                    .addStringOption(option => option
                        .setName('reden')
                        .setDescription(LanguageLoader.LangConfig.COMMANDS_REASON_FOR_MODIFYING_ROLE)
                        .setMinLength(10)
                        .setMaxLength(500)
                        .setRequired(true)))
                .addSubcommand(subcommand => subcommand
                    .setName(CommandConstants.SLASH.ROLE.DIPLOMAT)
                    .setDescription(LanguageLoader.LangConfig.COMMANDS_MODIFY_DIPLOMAT_ROLE)
                    .addUserOption(option => option
                        .setName('wie')
                        .setDescription(LanguageLoader.LangConfig.COMMANDS_WHO_TO_GIVE_ROLE_OR_TAKE_ROLE)
                        .setRequired(true))
                    .addStringOption(option => option
                        .setName('actie')
                        .setRequired(true)
                        .setDescription(LanguageLoader.LangConfig.COMMANDS_DO_YOU_WANT_TO_TAKE_OR_GIVE_ROLE)
                        .addChoices({
                            name: LanguageLoader.LangConfig.COMMANDS_GIVE,
                            value: 'give'
                        },
                        {
                            name: LanguageLoader.LangConfig.COMMANDS_TAKE,
                            value: 'take'
                        }))
                    .addStringOption(option => option
                        .setName('reden')
                        .setDescription(LanguageLoader.LangConfig.COMMANDS_REASON_FOR_MODIFYING_ROLE)
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
                            name: 'Non-Aggression',
                            value: 'non-agression',
                        },
                        {
                            name: 'Mutual Defense',
                            value: 'mutual-defense',
                        },
                        {
                            name: 'Solidarity',
                            value: 'solidarity',
                        },
                        {
                            name: 'Friendship',
                            value: 'friendship',
                        },
                        {
                            name: 'Acquisition',
                            value: 'acquisition',
                        },
                        {
                            name: 'Custom',
                            value: 'custom',
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
                    .setDescription('De pixel art die je wilt toevoegen aan de template')
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
                .setName(CommandConstants.SLASH.GRID)
                .setDescription('Creëer een grid voor je pixel art')
                .setDMPermission(false)
                .addAttachmentOption(option => option
                    .setName('art')
                    .setDescription('De pixel art waar je een grid van wilt hebben')
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