import { ActionRowBuilder, Attachment, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ChatInputCommandInteraction, ContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction, OverwriteType, PermissionFlagsBits, TextChannel, TextInputBuilder, TextInputStyle, ThreadChannel, UserSelectMenuBuilder, UserSelectMenuInteraction, VoiceState } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import ArtEmbeds from '../Embeds/ArtEmbeds';
import DiplomacyEmbeds from '../Embeds/DiplomacyEmbeds';
import { LogType } from '../Enums/LogType';
import { TreatyType } from '../Enums/TreatyType';
import { VariableKey } from '../Enums/VariableKey';
import IMessageInfo from '../Interfaces/IMessageInfo';
import IResultInfo from '../Interfaces/IResultInfo';
import VariableManager from '../Managers/VariableManager';
import { Redis } from '../Providers/Redis';
import DiscordService from '../Services/DiscordService';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';
import SimilarityService from '../Services/SimilarityService';
import { Utils } from '../Utils/Utils';
const { createCanvas, loadImage, registerFont } = require('canvas');

export default class DiplomacyHandler {

    private static readonly keyReports: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.DIPLOMACY}${RedisConstants.KEYS.REPORT}`;
    private static readonly keyThreads: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.DIPLOMACY}${RedisConstants.KEYS.THREADS}`;
    private static readonly keyCooldown: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.DIPLOMACY}${RedisConstants.KEYS.COOLDOWN}`;

    public static OnCommand(messageInfo: IMessageInfo) {
        const commandsSlash = CommandConstants.SLASH;
        const commandsMenu = CommandConstants.MENU;

        switch (messageInfo.commandInfo.command) {
            case commandsSlash.VOICE:
                this.OnVoiceCommand(messageInfo);
                break;
            case commandsSlash.TREATY:
                this.OnTreaty(messageInfo);
                break;
            case commandsMenu.PEEK:
                this.OnJoin(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static async OnStartDiplomacy(messageInfo: IMessageInfo) {
        try {
            const interaction = <ModalSubmitInteraction>messageInfo.interaction;
            interaction.deferUpdate();
            const name = interaction.fields.getTextInputValue('name');
            const size = interaction.fields.getTextInputValue('size');
            const description = interaction.fields.getTextInputValue('description');

            if (!interaction.inCachedGuild()) {
                return;
            }

            await interaction.member.roles.add(SettingsConstants.ROLES.DIPLOMAT_ID);

            await Utils.Sleep(.25);

            const diplomacyThreadsChannel = (await DiscordService.FindChannelById(SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID)) as TextChannel;
            const thread = await diplomacyThreadsChannel.threads.create({
                name: name,
                autoArchiveDuration: Utils.GetHoursInMinutes(24),
                type: ChannelType.PrivateThread,
                invitable: false
            });

            const similarities = await SimilarityService.FindSimiliarThreads(thread, this.keyThreads, true,
                0, VariableManager.Get(VariableKey.SimilarDiplomacy));

            Redis.hset(this.keyThreads, thread.id, thread.name);

            const time = new Date().toLocaleTimeString('nl-NL', { timeZone: 'Europe/Amsterdam' });

            let formattedTime: string = null;
            const timeParts = time.split(':');
            const hours = parseInt(timeParts[0]);
            if (hours >= SettingsConstants.TIME.NIGHT_START && hours < SettingsConstants.TIME.NIGHT_END) {
                formattedTime = `${timeParts[0]}:${timeParts[1]} AM`;
            }

            const components = new ActionRowBuilder<UserSelectMenuBuilder>()
                .addComponents(new UserSelectMenuBuilder()
                    .setCustomId('diplomacy_invite')
                    .setMaxValues(2));

            const message = await thread.send({
                content: `${messageInfo.user}!`,
                allowedMentions: { users: [messageInfo.user.id] },
                embeds: [DiplomacyEmbeds.GetWelcomeEmbed(messageInfo.user.username, name, size, description, formattedTime)],
                components: [components]
            });

            message.pin();

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`diplomacy_claim_${thread.id}`)
                        .setLabel('Ik pak dit op!')
                        .setStyle(ButtonStyle.Primary),
                );

            const diplomacyDispatchChannel = (await DiscordService.FindChannelById(SettingsConstants.CHANNELS.DIPLOMACY_DISPATCH_ID)) as TextChannel;
            await diplomacyDispatchChannel.send({
                embeds: [DiplomacyEmbeds.GetDispatchEmbed(name, size, description, message.url, similarities)],
                components: [actionRow]
            });
            LogService.Log(LogType.OnboardingDiplomat, messageInfo.user.id, 'Thread', thread.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingDiplomat, messageInfo.user.id);
        }
    }

    public static async OnVoiceCommand(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction>messageInfo.interaction;
        if (!interaction.inCachedGuild()) {
            return;
        }

        try {
            if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLONL_ID)) {
                interaction.reply({
                    content: 'Je hebt geen toegang tot dit commando.',
                    ephemeral: true
                });
                return;
            }

            const thread = interaction.channel;
            if (!thread.isThread()!) {
                interaction.reply({
                    content: 'Je kan dit commando alleen in de diplomatieke threads gebruiken.',
                    ephemeral: true
                });
                return;
            }

            if (interaction.channel.parentId != SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID) {
                interaction.reply({
                    content: 'Je kan dit commando alleen in de diplomatieke threads gebruiken.',
                    ephemeral: true
                });
                return;
            }

            const category = interaction.channel.parent.parent;
            const guild = interaction.guild;

            const permissionOverwrites = [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    type: OverwriteType.Role
                },
                {
                    id: SettingsConstants.ROLES.DIPLOMOD_ID,
                    allow: [PermissionFlagsBits.ViewChannel],
                    type: OverwriteType.Role
                },
            ];

            const members = (await thread.members.fetch()).values();

            for (const member of members) {
                permissionOverwrites.push({
                    id: member.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                    type: OverwriteType.Member
                });
            }

            const channel = await guild.channels.create({
                name: `${interaction.channel.name}`,
                type: ChannelType.GuildVoice,
                parent: category,
                permissionOverwrites
            });

            interaction.reply({
                content: `I created a temporary voicechannel: ${channel}\nAfter someone has joined it will automatically be deleted when it's empty.`,
            });

            LogService.Log(LogType.DiplomacyVoiceCreate, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyVoiceCreate, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    public static async OnVoiceUpdate(oldState: VoiceState, newState: VoiceState) {
        if (oldState.channel?.parentId != SettingsConstants.CATEGORIES.DIPLOMACY_ID) {
            return;
        }

        if (oldState.channel?.id == SettingsConstants.CHANNELS.DIPLOMCACY_VOICE_CHANNEL_ID) {
            return;
        }

        try {
            console.log(oldState.channel.members.size);
            if (oldState.channel.members.size > 0) {
                return;
            }

            await Utils.Sleep(1);

            oldState.channel.delete();

            LogService.Log(LogType.DiplomacyVoiceDelete, oldState.member.id, 'Channel', oldState.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyVoiceDelete, oldState.member.id, 'Channel', oldState.channel.id);
        }
    }

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
            const interaction = <ButtonInteraction>messageInfo.interaction;

            if (!interaction.inCachedGuild()) {
                return;
            }

            const keyCooldown = `${this.keyCooldown}${messageInfo.user.id}`;
            const cooldown = await Redis.get(keyCooldown);

            if (cooldown) {
                interaction.reply({
                    content: 'Je hebt recent al een diplomatie-thread opgepakt. Wacht even voordat je er weer een oppakt.',
                    ephemeral: true,
                });

                return;
            }

            const message = interaction.message;
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

            if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMOD_ID)) {
                Redis.set(keyCooldown, 1, 'EX', VariableManager.Get(VariableKey.DiplomacyCooldown));
            }

            interaction.deferUpdate();

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
            const cooldown = await Redis.get(`${this.keyReports}${messageInfo.channel.id}`);
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
            Redis.set(`${this.keyReports}${messageInfo.channel.id}`, '1', 'EX', 3600);

            const interaction = <ModalSubmitInteraction>messageInfo.interaction;
            interaction.reply({
                content: 'Your report has been sent to the moderators.',
                ephemeral: true
            });

            const description = interaction.fields.getTextInputValue('description');

            const reportChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNELS.DIPLOMACY_REPORTS_ID);

            reportChannel.send({
                embeds: [DiplomacyEmbeds.GetReportEmbed((<ThreadChannel>messageInfo.channel).name, messageInfo.member.user.tag, description, messageInfo.channel.url)]
            });

            LogService.Log(LogType.DiplomacyReport, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyReport, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    public static async OnTreaty(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction>messageInfo.interaction;

        if (!interaction.inCachedGuild()) {
            return;
        }

        if (!interaction.channel.isThread()) {
            return;
        }

        try {
            if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMOD_ID)) {
                interaction.reply({
                    content: 'Je hebt geen toegang tot dit commando.',
                    ephemeral: true
                });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            const type = interaction.options.getString('type');
            const duration = interaction.options.getString('hoelang') || 'the duration of r/place 2023';

            const image = await loadImage(`assets/treaty_of_${type}.png`);

            const font = SettingsConstants.TREATY_FONT_NAME;

            registerFont(`assets/${font}.ttf`, { family: font });

            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            ctx.font = `24px ${font}`;

            const date = new Date();
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const dateString = `${day}-${month}-${year}`;

            ctx.fillText(dateString, 305, 710);

            ctx.font = `38px ${font}`;

            const name = interaction.channel.name;
            let text;

            if (type == TreatyType.Partnership) {
                text = `Hear ye, hear ye! Let it be known that the Kingdom of PlaceNL and ${name} doth understand the worth of solidarity \
and alliance upon the realm of r/place. Thus, we doth hereby agree that PlaceNL shall render aid to ${name} in the creation \
of their artwork, and in turn, ${name} shall pledge their support to defend PlaceNL. Let this treaty be made known to all, and may it stand fast for ${duration}.`;
            } else if (type == TreatyType.Harmony) {
                text = `Be it known to those who doth gaze upon this parchment, \
that the Kingdom of PlaceNL and the community of ${name} doth recognizing the value \
of a peaceful and collaborative environment on r/place, doth hereby agree not to place \
pixels upon each other's ground. Let this Treaty remain in force for a period of ${duration}, \
and may it be renewed by mutual agreement of the parties.`;
            } else if (type == TreatyType.Acquisition) {
                text = `Let it be proclaimed to all that the Kingdom of PlaceNL and ${name} have \
come to a mutual understanding regarding the division of lands on r/place. For it is PlaceNL that \
shall lay claim to the ground where ${name} presently resides, and in exchange, PlaceNL shall pledge \
to lend their assistance in the relocation of ${name} to new land.`;
            }

            Utils.WrapText(ctx, text, 80, 340, 580, 330, font, 2);
            ctx.textAlign = 'center';
            Utils.WrapText(ctx, name, 535, 752, 260, 60, font, 2);

            interaction.followUp({
                content: 'Hier is het verdrag. Onderteken het eerst zelf, en stuur het daarna naar de andere partij.',
                files: [{ attachment: canvas.toBuffer(), name: `treaty_of_${type}_${interaction.channel.name}.png`}],
                ephemeral: true,
            });

            LogService.Log(LogType.DiplomacyTreaty, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyTreaty, messageInfo.user.id, 'Thread', messageInfo.channel.id);
        }
    }

    private static async OnJoin(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ContextMenuCommandInteraction;

            if (!interaction.inCachedGuild()) {
                return;
            }

            if (interaction.channelId != SettingsConstants.CHANNELS.DIPLOMACY_DISPATCH_ID) {
                interaction.reply({
                    content: `Je kan deze actie alleen uitvoeren in <#${SettingsConstants.CHANNELS.DIPLOMACY_DISPATCH_ID}>.`,
                    ephemeral: true
                });
                return;
            }

            const message = await (<TextChannel> messageInfo.channel).messages.fetch(interaction.targetId);
            const embed = message.embeds[0];

            if (embed == null) {
                return;
            }

            const match = embed.description.match(/https:\/\/discord.com\/channels\/\d+?\/(\d+?)\/(\d+)/);
            if (match == null) {
                interaction.reply({
                    content: 'Je kan deze actie niet op dit bericht uitvoeren.',
                    ephemeral: true
                });
                return;
            }

            const threadChannel = <ThreadChannel> await DiscordService.FindChannelById(match[1]);
            const starterMessage = await threadChannel.messages.fetch(match[2]);

            if (starterMessage == null) {
                interaction.reply({
                    content: 'Er is iets fouts gegaan. Sorry.',
                    ephemeral: true
                });
                return;
            }

            starterMessage.edit({
                content: `${interaction.user}`
            });

            Utils.Sleep(.5);

            starterMessage.edit({
                content: ''
            });

            interaction.reply({
                content: 'Je kan nu in de thread kijken.',
                ephemeral: true
            });

            LogService.Log(LogType.DiplomacyPeek, messageInfo.user.id, 'Thread', threadChannel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.DiplomacyPeek, messageInfo.user.id, 'Message', messageInfo.message.id);
            return;
        }
    }
}