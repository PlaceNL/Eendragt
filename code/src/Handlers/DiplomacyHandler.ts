import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle, ThreadChannel, UserSelectMenuInteraction } from 'discord.js';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import ArtEmbeds from '../Embeds/ArtEmbeds';
import DiplomacyEmbeds from '../Embeds/DiplomacyEmbeds';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import IResultInfo from '../Interfaces/IResultInfo';
import { Redis } from '../Providers/Redis';
import DiscordService from '../Services/DiscordService';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';

export default class DiplomacyHandler {

    private static readonly reportKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.DIPLOMACY}${RedisConstants.KEYS.REPORT}`;

    public static async OnInvite(messageInfo: IMessageInfo) {
        try {
            if (!messageInfo.channel.isThread()) {
                return;
            }

            let message = '';

            const interaction = <UserSelectMenuInteraction>messageInfo.interaction;
            for (const value of interaction.values) {
                const user = interaction.guild.members.cache.get(value);
                if (user) {
                    await user.roles.add(SettingsConstants.ROLES.DIPLOMAT_ID);
                    message += `${user} `;
                }
            }

            message += `\n${messageInfo.member.displayName} added you to the diplomacy team of ${messageInfo.channel.name}.\nIf this is not correct, please contact a moderator.`;

            interaction.reply(message);

            (<UserSelectMenuInteraction>messageInfo.interaction).message.edit({ components: []});
            LogService.Log(LogType.DiplomacyInvite, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyInvite, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    public static async OnClaim(messageInfo: IMessageInfo, threadId: string) {
        try {
            const message = (<ButtonInteraction>messageInfo.interaction).message;
            message.edit({ content: `Opgepakt door ${messageInfo.user}`, components: []});

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('diplomacy_report')
                        .setLabel('Help')
                        .setStyle(ButtonStyle.Danger),
                );

            const threadChannel = <ThreadChannel> await DiscordService.FindChannelById(threadId);
            threadChannel.send({
                content: `${messageInfo.user}`,
                embeds: [DiplomacyEmbeds.GetDiplomatArrivedEmbed(messageInfo.member.displayName)],
                allowedMentions: { users: [messageInfo.user.id] },
                components: [actionRow]
            });

            LogService.Log(LogType.DiplomacyClaim, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyClaim, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    public static async OnValidateArt(messageInfo: IMessageInfo, resultInfo: IResultInfo, attachment: Attachment) {
        try {
            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEnglishEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.user.id, 'Thread', messageInfo.channel.id);
                return;
            }

            const message = await MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetValidArtEmbed(attachment.url, true));
            message.pin();
            LogService.Log(LogType.ValidateArtGood, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.ValidateArt, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    public static async OnStartReport(messageInfo: IMessageInfo) {
        try {
            const cooldown = await Redis.get(`${this.reportKey}${messageInfo.channel.id}`);
            if (cooldown != null) {
                (<ButtonInteraction>messageInfo.interaction).reply({
                    content: 'Please wait at least an hour before reporting again.',
                    ephemeral: true
                });

                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('diplomacy_report')
                .setTitle('Report');

            const description = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Describe your problem')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(500);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(description);

            modal.addComponents(row);

            (messageInfo.interaction as ButtonInteraction).showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyReportStart, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    public static async OnFinishReport(messageInfo: IMessageInfo) {
        try {
            Redis.set(`${this.reportKey}${messageInfo.channel.id}`, '1', 'EX', 3600);

            const interaction = <ModalSubmitInteraction>messageInfo.interaction;
            interaction.reply({
                content: 'Your report has been sent to the moderators.',
                ephemeral: true
            });

            const description = interaction.fields.getTextInputValue('description');

            const reportChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNELS.DIPLOMACY_REPORTS_ID);

            reportChannel.send({
                embeds: [DiplomacyEmbeds.GetReportEmbed((<ThreadChannel>messageInfo.channel).name, messageInfo.member.displayName, description, messageInfo.channel.url)]
            });

            LogService.Log(LogType.DiplomacyReport, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyReport, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }
}