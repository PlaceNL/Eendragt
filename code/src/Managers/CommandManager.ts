import { ApplicationCommandType, ContextMenuCommandBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { VariableKey } from '../Enums/VariableKey';
import Discord from '../Providers/Discord';
import VariableManager from './VariableManager';

export default class CommandManager {

    private static readonly adminFlag = PermissionFlagsBits.ManageGuild;

    public static UpdateCommands() {
        const data = [
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.UDPATE)
                .setDMPermission(false)
                .setDescription('Update de slash commands')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.CANVAS)
                .setDMPermission(false)
                .setDescription('Creëer een place canvas')
                .setDefaultMemberPermissions(this.adminFlag),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.PLACE)
                .setDMPermission(false)
                .setDescription('Plaats een pixel')
                .addIntegerOption(option => option
                    .setName('x')
                    .setDescription('X-coördinaat')
                    .setMinValue(0)
                    .setMaxValue(99)
                    .setRequired(true))
                .addIntegerOption(option => option
                    .setName('y')
                    .setDescription('Y-coördinaat')
                    .setMinValue(0)
                    .setMaxValue(99)
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('kleur')
                    .setDescription('Kies een kleur')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: '#222222 (Zwart)',
                            value: '222222'
                        },
                        {
                            name: '#e50000 (Rood)',
                            value: 'e50000'
                        },
                        {
                            name: '#a06a42 (Bruin)',
                            value: 'a06a42'
                        },
                        {
                            name: '#02be01 (Groen)',
                            value: '02be01'
                        },
                        {
                            name: '#e59500 (Oranje)',
                            value: 'e59500'
                        },
                        {
                            name: '#e5d900 (Geel)',
                            value: 'e5d900'
                        },
                        {
                            name: '#94e044 (Lime)',
                            value: '94e044'
                        },
                        {
                            name: '#0000ea (Donkerblauw)',
                            value: '0000ea'
                        },
                        {
                            name: '#0083c7 (Blauw)',
                            value: '0083c7'
                        },
                        {
                            name: '#00d3dd (Lichtblauw)',
                            value: '00d3dd'
                        },
                        {
                            name: '#820080 (Donkerpaars)',
                            value: '820080'
                        },
                        {
                            name: '#cf6ee4 (Paars)',
                            value: 'cf6ee4'
                        },
                        {
                            name: '#ffa7d1 (Roze)',
                            value: 'ffa7d1'
                        },
                        {
                            name: '#888888 (Grijs)',
                            value: '888888'
                        },
                        {
                            name: '#e4e4e4 (Lichtgrijs)',
                            value: 'e4e4e4'
                        },
                        {
                            name: '#ffffff (Wit)',
                            value: 'ffffff'
                        })
                ),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.APPLICATIONS)
                .setDMPermission(false)
                .setDescription('Zet de sollicitaties open of dicht')
                .setDefaultMemberPermissions(this.adminFlag)
                .addStringOption(option => option
                    .setName('categorie')
                    .setDescription('Voor welke rol je de sollicitaties wilt openen of sluiten')
                    .setRequired(true)
                    .addChoices({
                        name: 'Diplomaten',
                        value: 'diplomat'
                    },
                    {
                        name: 'Pixel Artists',
                        value: 'artist'
                    },
                    {
                        name: 'Community Support',
                        value: 'support'
                    },
                    {
                        name: 'Redacteur',
                        value: 'reporter'
                    }
                    ))
                .addStringOption(option => option
                    .setName('actie')
                    .setDescription('Wil je de sollicitaties openen of sluiten?')
                    .setRequired(true)
                    .addChoices({
                        name: 'Openen',
                        value: 'open'
                    },
                    {
                        name: 'Sluiten',
                        value: 'take'
                    })),
            new SlashCommandBuilder()
                .setName(CommandConstants.SLASH.VOTE)
                .setDescription('Creëer een stemming')
                .setDMPermission(false)
                .setDefaultMemberPermissions(this.adminFlag)
                .addAttachmentOption(option => option
                    .setName('image')
                    .setDescription('De afbeelding die bij de stemming hoort')
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('duration')
                    .setDescription('Optioneel: Hoe lang de stemming moet duren in minuten. Standaard 5 minuten.')
                    .setMinValue(1)
                    .setMaxValue(60)
                    .setRequired(false)),
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