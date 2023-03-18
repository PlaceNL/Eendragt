import DiscordService from './DiscordService';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { TextChannel, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, MessageComponentInteraction } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';
import MessageManager from '../Managers/MessageManager';

export default class MessageService {

    public static async ReplyMessage(messageInfo: IMessageInfo, text: string, good?: boolean, mention?: boolean, embed?: EmbedBuilder, components?: Array<ActionRowBuilder>, ephemeral: boolean = false) {
        if (embed && messageInfo.guild) {
            if (!await DiscordService.CheckPermission(messageInfo, PermissionFlagsBits.EmbedLinks)) {
                return;
            }
        }

        if (good != null) {
            text = (good ? EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + text;
        }

        const data: any = {};

        if (text?.isFilled()) {
            data.content = text;
        }

        if (embed != null) {
            data.embeds = [embed];
        }

        if (components != null) {
            data.components = components;
        }

        if (messageInfo.interaction != null) {
            if (good == false || ephemeral) {
                data.ephemeral = true;
            }

            try {
                const interaction = messageInfo.interaction as ChatInputCommandInteraction | MessageComponentInteraction;
                if (interaction.replied) {
                    await interaction.editReply(data);
                } else if (interaction.deferred) {
                    await interaction.followUp(data);
                } else {
                    await interaction.reply(data);
                }
                if (!data.ephemeral) {
                    return await (messageInfo.interaction as ChatInputCommandInteraction | MessageComponentInteraction).fetchReply();
                }
            } catch (error) {
                console.error(error);
                // Ignore error.
            }

            return;
        }

        if (mention) {
            return DiscordService.ReplyMessage(messageInfo.message, data);
        } else {
            return DiscordService.SendMessage(<TextChannel>messageInfo.channel, data);
        }
    }

    public static async ReplyEmbed(messageInfo: IMessageInfo, embed: EmbedBuilder, text?: string, components?: Array<ActionRowBuilder>, reply: boolean = false, ephemeral: boolean = false) {
        if (messageInfo.guild) {
            if (!await DiscordService.CheckPermission(messageInfo, PermissionFlagsBits.EmbedLinks)) {
                return;
            }
        }

        const data: any = { embeds: [embed] };

        if (text?.isFilled()) {
            data.content = text;
        }

        if (components != null) {
            data.components = components;
        }

        if (ephemeral) {
            data.ephemeral = true;
        }

        if (messageInfo.interaction != null) {
            try {
                const interaction = messageInfo.interaction as ChatInputCommandInteraction | MessageComponentInteraction;
                if (interaction.replied) {
                    await interaction.editReply(data);
                } else if (interaction.deferred) {
                    await interaction.followUp(data);
                } else {
                    await interaction.reply(data);
                }

                if (!data.ephemeral) {
                    return await (messageInfo.interaction as ChatInputCommandInteraction | MessageComponentInteraction).fetchReply();
                } else {
                    return;
                }
            } catch (error) {
                // Ignore error.
            }
        }

        if (reply) {
            return await DiscordService.ReplyMessage(messageInfo.message, data);
        } else {
            return await DiscordService.SendMessage(messageInfo.channel, data);
        }
    }

    public static async SendMessageToDM(messageInfo: IMessageInfo, text: string, embed?: EmbedBuilder, good?: boolean) {
        if (good != null) {
            text = (good ? EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + text;
        }

        if (messageInfo.interaction != null) {
            if (messageInfo.channel.id == messageInfo.user.dmChannel?.id) {
                const data: any = {};

                if (text?.isFilled()) {
                    data.content = text;
                }

                if (embed != null) {
                    data.embeds = [embed];
                }

                if (good == false) {
                    data.ephemeral = true;
                }

                try {
                    const interaction = messageInfo.interaction as ChatInputCommandInteraction | MessageComponentInteraction;
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(data);
                    } else {
                        await interaction.reply(data);
                    }

                    if (!data.ephemeral) {
                        return await (messageInfo.interaction as ChatInputCommandInteraction | MessageComponentInteraction).fetchReply();
                    }
                } catch (err) {
                    // Ignore error.
                }

                return;
            }
        }

        const dmChannel = messageInfo.user.dmChannel;
        if (dmChannel == null) {
            try {
                await messageInfo.user.createDM();
            } catch (error) {
                // Can't DM this user.
                return null;
            }
        }

        return await MessageManager.SendMessageToDM(dmChannel, text, embed);
    }

    public static async SendMessageToDMById(id: string, text: string, embed?: EmbedBuilder, good?: boolean) {
        if (good != null) {
            text = (good ? EmojiConstants.STATUS.GOOD : EmojiConstants.STATUS.BAD) + ' ' + text;
        }

        const user = await DiscordService.FindUserById(id);
        if (user != null) {
            const dmChannel = user.dmChannel || await user.createDM();
            return await MessageManager.SendMessageToDM(dmChannel, text, embed);
        }
    }
}
