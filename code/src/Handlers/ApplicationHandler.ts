import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import RolesConstants from '../Constants/RolesConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { LogType } from '../Enums/LogType';
import { RoleType } from '../Enums/RoleType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import { Utils } from '../Utils/Utils';
import MemberData from '../Data/members.json';
import ApplicationEmbeds from '../Embeds/ApplicationEmbeds';
import RedisConstants from '../Constants/RedisConstants';
import { Redis } from '../Providers/Redis';

export default class ApplicationHandler {

    private static readonly keyApplication: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.APPLICATION}`;

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.ROLES:
                this.OnRoles(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static async OnRoles(messageInfo: IMessageInfo) {
        try {
            const actionRowSelect = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('onboarding_roles')
                        .setPlaceholder('Selecteer een rol')
                        .setMinValues(1)
                        .setMaxValues(2)
                        .addOptions(
                            {
                                label: 'Soldaat',
                                value: 'soldaat'
                            },
                            {
                                label: 'Bouwer',
                                value: 'bouwer'
                            },
                        )
                );

            const actionRowButtons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`application_${RoleType.Support}`)
                        .setLabel(RolesConstants.ROLES[RoleType.Support].name)
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`application_${RoleType.Diplomat}`)
                        .setLabel(RolesConstants.ROLES[RoleType.Diplomat].name)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`application_${RoleType.Artist}`)
                        .setLabel(RolesConstants.ROLES[RoleType.Artist].name)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`application_${RoleType.Reporter}`)
                        .setLabel(RolesConstants.ROLES[RoleType.Reporter].name)
                        .setStyle(ButtonStyle.Secondary)
                );

            const interaction = messageInfo.interaction as ChatInputCommandInteraction;

            await interaction.channel.send({
                embeds: [ApplicationEmbeds.GetRolesEmbed()],
                components: [actionRowSelect, actionRowButtons]
            });

            interaction.reply({
                content: 'Done!',
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingCreate, messageInfo.user.id);
            return;
        }

        LogService.Log(LogType.OnboardingCreate, messageInfo.user.id);
    }

    public static async OnApplicationStart(messageInfo: IMessageInfo, role: RoleType) {
        try {
            const interaction = messageInfo.interaction as ButtonInteraction;

            const application = await Redis.get(`${this.keyApplication}${role}:${messageInfo.user.id}`);

            if (application) {
                interaction.reply({
                    content: 'Je hebt al een sollicitatie ingediend voor deze rol.',
                    ephemeral: true
                });

                return;
            }

            const modal = new ModalBuilder()
                .setCustomId(`application_${role}`)
                .setTitle(`Sollicitatie ${RolesConstants.ROLES[role].name}`);

            const description = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Sollicitatiebrief')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(100)
                .setMaxLength(250);

            if (role === RoleType.Artist) {
                description.setLabel('Link naar iets dat je hebt gemaakt')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(25)
                    .setMaxLength(150);
            }

            modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(description));

            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.ApplicationStart, messageInfo.user.id);
            return;
        }
    }

    public static OnApplicationFinish(messageInfo: IMessageInfo, role: RoleType) {
        const interaction = messageInfo.interaction as ModalSubmitInteraction;

        let logType: LogType;

        switch (role) {
            case RoleType.Support:
                logType = LogType.ApplicationSubmitSupport;
                break;
            case RoleType.Artist:
                logType = LogType.ApplicationSubmitArtist;
                break;
            case RoleType.Reporter:
                logType = LogType.ApplicationSubmitReporter;
                break;
            case RoleType.Diplomat:
                logType = LogType.ApplicationSubmitDiplomat;
                break;
        }

        if (!interaction.inCachedGuild()) {
            return;
        }

        try {
            let channelId;

            if (role == RoleType.Support) {
                channelId = SettingsConstants.CHANNELS.SUPPORT_APPLICATIONS_ID;
            } else if (role === RoleType.Artist) {
                channelId = SettingsConstants.CHANNELS.ARTIST_APPLICATIONS_ID;

                setTimeout(() => {
                    interaction.member.roles.add(SettingsConstants.ROLES.ARTIST_ID);
                }, Utils.GetMinutesInMiliSeconds(2));
            } else if (role === RoleType.Reporter) {
                channelId = SettingsConstants.CHANNELS.REPORTER_APPLICATIONS_ID;
            } else if (role == RoleType.Diplomat) {
                channelId = SettingsConstants.CHANNELS.DIPLOMAT_APPLICATIONS_ID;
            }

            const channel = interaction.guild.channels.cache.get(channelId) as TextChannel;

            const data = MemberData.find((x: any) => x.id === interaction.user.id);

            const description = interaction.fields.getTextInputValue('description');

            channel.send({
                embeds: [ApplicationEmbeds.GetApplicationEmbed(interaction.user, description, data)]
            });

            Redis.set(`${this.keyApplication}${role}:${messageInfo.user.id}`, 1, 'EX', Utils.GetHoursInSeconds(24));

            interaction.reply({
                content: 'Je sollicitatie is verzonden!',
                ephemeral: true,
            });
            LogService.Log(logType, messageInfo.user.id);
        } catch (error) {
            console.error(error);
            LogService.Error(logType, messageInfo.user.id);
            return;
        }
    }
}