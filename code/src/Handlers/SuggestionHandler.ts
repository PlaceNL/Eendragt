import { Attachment, Channel, ChannelType, GuildMember, Message, MessageReaction, ThreadChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import DiscordService from '../Services/DiscordService';
import MessageService from '../Services/MessageService';
import { Utils } from '../Utils/Utils';
import IResultInfo from '../Interfaces/IResultInfo';
import SuggestionEmbeds from '../Embeds/SuggestionEmbeds';
import EmojiConstants from '../Constants/EmojiConstants';
import DiscordUtils from '../Utils/DiscordUtils';
import { Redis } from '../Providers/Redis';
import RedisConstants from '../Constants/RedisConstants';
import TagConstants from '../Constants/TagConstants';
import ArtEmbeds from '../Embeds/ArtEmbeds';
import LogService from '../Services/LogService';
import { LogType } from '../Enums/LogType';
import VariableManager from '../Managers/VariableManager';
import { VariableKey } from '../Enums/VariableKey';
const stringSimilarity = require('string-similarity');

export default class SuggestionHandler {

    private static readonly threadsKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.SUGGESTION}${RedisConstants.KEYS.THREADS}`;

    public static OnReaction(reaction: MessageReaction, channel: Channel) {
        if (reaction.emoji.name == EmojiConstants.STATUS.GOOD || reaction.emoji.name == EmojiConstants.STATUS.BAD) {
            this.OnVote(reaction, channel);
        }
    }

    public static async OnThread(thread: ThreadChannel) {
        let message: Message;

        try {
            message = await thread.fetchStarterMessage();
            const tags = this.FindMultipleTags(thread);

            if (tags.data == null) {
                MessageService.ReplyMessage(DiscordUtils.ParseMessageToInfo(message, message.author),
                    `Zorg dat je exact één van de volgende tags toevoegt aan je post:
    ${TagConstants.TAGS.NEW_ART}
    ${TagConstants.TAGS.UPGRADE_ART}
    ${TagConstants.TAGS.LAYOUT}
    ${TagConstants.TAGS.OTHER}`);

                thread.setLocked(true);
                LogService.Log(LogType.SuggestionNoTags, message.author.id, 'Thread', thread.id);
                return;
            }

            const similarities = await this.FindSimiliarThreads(thread, tags.data.tag == SettingsConstants.TAGS.UPGRADE_ART_ID);

            if (similarities.result && similarities.data.identical) {
                await MessageService.ReplyEmbed(DiscordUtils.ParseMessageToInfo(message, message.author), SuggestionEmbeds.GetSuggestionDuplicateEmbed(similarities.data.thread));
                thread.setLocked(true);
                LogService.Log(LogType.SuggestionDuplicate, message.author.id, 'Thread', thread.id);
                return;
            }

            // TODO: Keep track of threads being edited or removed.
            Redis.hset(this.threadsKey, thread.id, thread.name);

            const messageInfo: IMessageInfo = DiscordUtils.ParseMessageToInfo(message, message.author);

            const artTags = [SettingsConstants.TAGS.NEW_ART_ID, SettingsConstants.TAGS.UPGRADE_ART_ID];

            if (artTags.includes(tags.data.tag)) {
                MessageService.ReplyEmbed(messageInfo, SuggestionEmbeds.GetSuggestionArtEmbed(
                    similarities,
                    tags.data.multiple,
                    thread.appliedTags.includes(SettingsConstants.TAGS.ARTIST_SEARCH_ID)));
            } else {
                MessageService.ReplyEmbed(messageInfo, SuggestionEmbeds.GetSuggestionOtherEmbed(similarities, tags.data.multiple));
            }

            await Utils.Sleep(.2);
            await message.react(EmojiConstants.VOTE.UPVOTE);
            await Utils.Sleep(1);
            await message.react(EmojiConstants.VOTE.DOWNVOTE);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.SuggestionCreated, message?.author.id, 'Thread', thread.id);
            return;
        }

        LogService.Log(LogType.SuggestionCreated, message.author.id, 'Thread', thread.id);
    }

    public static async OnValidateArt(messageInfo: IMessageInfo, resultInfo: IResultInfo, attachment: Attachment) {
        try {
            if (!this.IsLegitArtSubmitter(messageInfo)) {
                MessageService.ReplyMessage(messageInfo, `Je mag dit commando alleen in je eigen thread gebruiken, of wanneer je de Artist rol hebt.
    Vraag een Artist rol aan in #kanaal.`, false, true);
                LogService.Log(LogType.ValidateArtIllegitimate, messageInfo.user.id, 'Thread', messageInfo.interaction.channelId);
                return;
            }

            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.user.id, 'Thread', messageInfo.interaction.channelId);
                return;
            }

            if (messageInfo.interaction.channel.type == ChannelType.PublicThread) {
                const appliedTags = messageInfo.interaction.channel.appliedTags;

                if (appliedTags.includes(SettingsConstants.TAGS.ARTIST_SEARCH_ID)) {
                    appliedTags.slice(appliedTags.indexOf(SettingsConstants.TAGS.ARTIST_SEARCH_ID), 1);
                }

                let first = false;

                if (!appliedTags.includes(SettingsConstants.TAGS.VALID_ART_ID)) {
                    appliedTags.push(SettingsConstants.TAGS.VALID_ART_ID);
                    first = true;
                }

                await messageInfo.interaction.channel.setAppliedTags(appliedTags);

                const message = await MessageService.ReplyEmbed(messageInfo, SuggestionEmbeds.GetValidArtEmbed(first, attachment.url));
                message.pin();
            }

            LogService.Log(LogType.ValidateArtGood, messageInfo.user.id, 'Thread', messageInfo.interaction.channelId);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.ValidateArt, messageInfo.user.id, 'Thread', messageInfo.interaction.channelId);
        }
    }

    private static async OnVote(reaction: MessageReaction, channel: Channel) {
        try {
            if (channel.type != ChannelType.PublicThread) {
                return;
            }

            if (channel.locked) {
                return;
            }

            const appliedTags = channel.appliedTags;

            if (appliedTags.includes(SettingsConstants.TAGS.APPRECIATED_ID) || appliedTags.includes(SettingsConstants.TAGS.DISLIKED_ID)) {
                return;
            }

            const starterMessage = await channel.fetchStarterMessage();
            if (starterMessage.id != reaction.message.id) {
                return;
            }

            const reactions = starterMessage.reactions.cache;
            const goodReaction = reactions.get(EmojiConstants.STATUS.GOOD);
            const badReaction = reactions.get(EmojiConstants.STATUS.BAD);

            const goodReactionCount = goodReaction.count;
            const badReactionCount = goodReaction.count;
            const ratio = goodReactionCount / (goodReactionCount + badReactionCount);

            if (goodReaction.count >= VariableManager.Get(VariableKey.GoodAmount)) {
                if (ratio > VariableManager.Get(VariableKey.Ratio)) {
                    appliedTags.push(SettingsConstants.TAGS.APPRECIATED_ID);
                    await channel.setAppliedTags(appliedTags);
                    const messageInfo: IMessageInfo = {
                        channel: channel,
                        user: reaction.message.author,
                    };

                    MessageService.ReplyEmbed(messageInfo, SuggestionEmbeds.GetAppreciatedTagEmbed());
                    LogService.Log(LogType.SuggestionAppreciated, reaction.message.author.id, 'Thread', channel.id);
                }
            }

            if (badReaction.count >= VariableManager.Get(VariableKey.BadAmount)) {
                if (ratio < (1 - VariableManager.Get(VariableKey.Ratio))) {
                    appliedTags.push(SettingsConstants.TAGS.DISLIKED_ID);
                    await channel.setAppliedTags(appliedTags);
                    const messageInfo: IMessageInfo = {
                        channel: reaction.message.channel,
                        user: reaction.message.author,
                    };

                    MessageService.ReplyEmbed(messageInfo, SuggestionEmbeds.GetDeniedTagEmbed());
                    channel.setLocked(true);
                    LogService.Log(LogType.SuggestionDisliked, reaction.message.author.id, 'Thread', channel.id);
                }
            }
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.SuggestionVote, reaction.message.author.id, 'Thread', channel.id);
        }
    }

    private static IsLegitArtSubmitter(messageInfo: IMessageInfo) {
        const member = messageInfo.member;
        if (DiscordService.IsMemberMod(member)) {
            return true;
        }

        if (this.IsPixelArtist(member)) {
            return true;
        }

        if (messageInfo.message.channel.type == ChannelType.PublicThread) {
            return messageInfo.message.channel.ownerId == member.id;
        }

        return false;
    }

    private static IsPixelArtist(member: GuildMember) {
        return member.roles.cache.has(SettingsConstants.ROLES.ARTIST_ID);
    }

    private static FindMultipleTags(thread: ThreadChannel) {
        const resultInfo: IResultInfo = {
            result: false,
        };

        const appliedTags = thread.appliedTags;

        const tagsOnlyOneAllowed = [
            SettingsConstants.TAGS.NEW_ART_ID,
            SettingsConstants.TAGS.UPGRADE_ART_ID,
            SettingsConstants.TAGS.LAYOUT_ID,
            SettingsConstants.TAGS.OTHER_ID,
        ];

        let foundTag: string = null;
        let multiple = false;

        for (let i = appliedTags.length - 1; i >= 0; i--) {
            const tag = appliedTags[i];
            if (tagsOnlyOneAllowed.includes(tag)) {
                if (foundTag === null) {
                    foundTag = tag;
                } else {
                    multiple = true;
                    appliedTags.splice(i, 1);
                }
            }
        }

        if (foundTag == null) {
            if (appliedTags.includes(SettingsConstants.TAGS.ARTIST_SEARCH_ID)) {
                foundTag = SettingsConstants.TAGS.NEW_ART_ID;
                appliedTags.push(foundTag);
                thread.setAppliedTags(appliedTags);
                resultInfo.data = { tag: foundTag };
                resultInfo.result = true;
            } else {
                resultInfo.reason = `Zorg dat je exact één van de volgende tags toevoegt aan je post:
    ${TagConstants.TAGS.NEW_ART}
    ${TagConstants.TAGS.UPGRADE_ART}
    ${TagConstants.TAGS.LAYOUT}
    ${TagConstants.TAGS.OTHER}`;
                return resultInfo;
            }
        } else {
            resultInfo.data = { tag: foundTag };
            resultInfo.result = true;
        }

        if (multiple) {
            thread.setAppliedTags(appliedTags);
            resultInfo.data.multiple = true;
        }

        return resultInfo;
    }

    private static async FindSimiliarThreads(thread: ThreadChannel, ignoreDuplicate: boolean) {
        const resultInfo: IResultInfo = {
            result: false
        };

        const threads = await Redis.hgetall(this.threadsKey);
        if (threads == null) {
            return resultInfo;
        }

        const titles = Object.values(threads);

        const similarities = stringSimilarity.findBestMatch(thread.name, titles);
        if (similarities.bestMatch.rating < VariableManager.Get(VariableKey.Similar)) {
            return resultInfo;
        }

        resultInfo.result = true;
        resultInfo.data = {};

        if (!ignoreDuplicate && similarities.bestMatch.rating >= VariableManager.Get(VariableKey.Identical)) {
            resultInfo.data.identical = true;
            for (const [key, value] of Object.entries(threads)) {
                if (value == similarities.bestMatch.target) {
                    resultInfo.data.thread = {
                        name: value,
                        url: `${SettingsConstants.SUGGESTION_THREAD_BASE_URL}${key}`
                    };

                    return resultInfo;
                }
            }
        }

        const list = [];

        for (const rating of similarities.ratings) {
            if (rating.rating >= VariableManager.Get(VariableKey.Similar)) {
                for (const [key, value] of Object.entries(threads)) {
                    if (value == rating.target) {
                        list.push({
                            name: value,
                            url: `${SettingsConstants.SUGGESTION_THREAD_BASE_URL}${key}`
                        });
                    }
                }
            }
        }

        resultInfo.data.list = list;
        return resultInfo;

    }
}