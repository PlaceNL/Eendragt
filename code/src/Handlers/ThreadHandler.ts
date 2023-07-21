import { ActionRowBuilder, ChannelType, ChatInputCommandInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, ThreadChannel } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import SuggestionHandler from './SuggestionHandler';
import LanguageLoader from '../Utils/LanguageLoader';

export default class ThreadHandler {

    private static readonly protectedTags = [
        SettingsConstants.TAGS.NOMINATED_ID,
        SettingsConstants.TAGS.APPRECIATED_ID,
        SettingsConstants.TAGS.VALID_ART_ID,
    ];

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.THREAD.COMMAND:
                this.OnThreadCommand(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static OnThread(thread: ThreadChannel) {
        if (thread.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
            SuggestionHandler.OnThread(thread);
        }
    }

    public static async OnTagsSelect(messageInfo: IMessageInfo) {
        const interaction = <StringSelectMenuInteraction> messageInfo.interaction;

        if (!interaction.inCachedGuild()) {
            return;
        }

        const thread = <ThreadChannel> interaction.channel;
        if (thread.parent.type != ChannelType.GuildForum) {
            return;
        }

        try {
            const desiredTags = interaction.values;
            const currentTags = thread.appliedTags;

            let counter = 0;

            for (const tag of this.protectedTags) {
                if (currentTags.includes(tag)) {
                    desiredTags.push(tag);
                    counter += 1;
                }
            }

            if (desiredTags.length > 5) {
                const tagCount = 5 - counter;
                interaction.reply({
                    content: LanguageLoader.LangConfig.THREADS_TAG_COUNT.replace('{tagCount}', `${tagCount}`),
                    ephemeral: true,
                });

                return;
            }

            await thread.setAppliedTags(desiredTags);

            interaction.reply({
                content: LanguageLoader.LangConfig.THREADS_TAGS_HAVE_CHANGED,
                ephemeral: true,
            });

            LogService.Log(LogType.ThreadTags, interaction.user.id, 'Thread', thread.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.ThreadTags, interaction.user.id, 'Thread', thread.id);
        }
    }

    private static OnThreadCommand(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
        const subCommand = interaction.options.getSubcommand();

        const commands = CommandConstants.SLASH.THREAD;

        switch (subCommand) {
            case commands.CLOSE:
                this.OnCloseCommand(messageInfo);
                break;
            case commands.LOCK:
                this.OnLockCommand(messageInfo);
                break;
            case commands.TAGS:
                this.OnTagsCommand(messageInfo);
                break;
            default: return false;
        }
    }

    private static OnCloseCommand(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;

        try {
            const reason = interaction.options.getString('reden');
            if (!interaction.inCachedGuild()) {
                return;
            }

            const thread = interaction.channel;
            if (!thread.isThread()) {
                interaction.reply({
                    content: LanguageLoader.LangConfig.THREADS_COMMAND_CAN_ONLY_BE_USED_IN,
                    ephemeral: true,
                });
                return;
            }

            const parentId = thread.parentId;

            if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.MODERATOR_ID) &&
                !interaction.member.roles.cache.has(SettingsConstants.ROLES.COMMUNITY_SUPPORT_ID)) {
                if (parentId == SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID) {
                    if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMAT_ID) &&
                        !interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMOD_ID)) {
                        interaction.reply({
                            content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                            ephemeral: true
                        });
                        return;
                    }
                } else if (parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
                    if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.ART_DIRECTOR_ID) ||
                       !interaction.member.roles.cache.has(SettingsConstants.ROLES.COMMUNITY_SUPPORT_ID)) {
                        interaction.reply({
                            content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                            ephemeral: true
                        });

                        return;
                    }
                } else {
                    interaction.reply({
                        content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                        ephemeral: true
                    });
                    return;
                }
            }

            if (thread.archived) {
                interaction.reply({
                    content: LanguageLoader.LangConfig.THREADS_ALREADY_ARCHIVED,
                    ephemeral: true
                });

                return;
            }

            thread.setArchived(true);

            interaction.reply({
                content: LanguageLoader.LangConfig.THREADS_ARCHIVED,
                ephemeral: true
            });

            LogService.Log(LogType.ThreadClose, messageInfo.user.id, reason);
        } catch (error) {
            console.error(error);
            LogService.Log(LogType.ThreadClose, messageInfo.user.id);
        }
    }

    private static OnLockCommand(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;

        try {
            const reason = interaction.options.getString('reden');
            if (!interaction.inCachedGuild()) {
                return;
            }

            const thread = interaction.channel;
            if (!thread.isThread()) {
                interaction.channel.send(LanguageLoader.LangConfig.THREADS_COMMAND_CAN_ONLY_BE_USED_IN);
                return;
            }

            const parentId = thread.parentId;

            if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.MODERATOR_ID)) {
                if (parentId == SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID) {
                    if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMOD_ID)) {
                        interaction.reply({
                            content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                            ephemeral: true
                        });
                        return;
                    }
                } else {
                    if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.COMMUNITY_SUPPORT_ID)) {
                        interaction.reply({
                            content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                            ephemeral: true,
                        });
                        return;
                    }
                }
            }

            const locked = thread.locked;

            thread.setLocked(!locked);
            thread.setArchived(!locked);

            interaction.reply({
                content: LanguageLoader.LangConfig.THREADS_LOCK_STATE
                    .replace('{state}', `${locked ? LanguageLoader.LangConfig.REOPENED : LanguageLoader.LangConfig.CLOSED}`),
                ephemeral: true,
            });

            LogService.Log(LogType.ThreadLock, messageInfo.user.id, reason);
        } catch (error) {
            console.error(error);
            LogService.Log(LogType.ThreadLock, messageInfo.user.id);
        }
    }

    private static OnTagsCommand(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;

        try {
            if (!interaction.inCachedGuild()) {
                return;
            }

            const thread = interaction.channel;
            if (!thread.isThread()) {
                interaction.channel.send(LanguageLoader.LangConfig.THREADS_COMMAND_CAN_ONLY_BE_USED_IN);
                return;
            }

            if (thread.parent.type != ChannelType.GuildForum) {
                interaction.channel.send(LanguageLoader.LangConfig.FORUMS_COMMAND_CAN_ONLY_BE_USED_IN);
                return;
            }

            if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.MODERATOR_ID) &&
                !interaction.member.roles.cache.has(SettingsConstants.ROLES.COMMUNITY_SUPPORT_ID)) {
                if (thread.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
                    if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.ART_DIRECTOR_ID)) {
                        interaction.reply({
                            content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                            ephemeral: true
                        });
                        return;
                    }
                } else if (thread.parentId == SettingsConstants.CHANNELS.DIPLOMACY_DISPATCH_ID) {
                    if (!interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLONL_ID) &&
                        !interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMOD_ID) ) {
                        interaction.reply({
                            content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                            ephemeral: true
                        });
                        return;
                    }
                } else {
                    interaction.reply({
                        content: LanguageLoader.LangConfig.UNAUTHORISED_COMMAND_EXEC,
                        ephemeral: true
                    });
                    return;
                }
            }

            let tags = thread.parent.availableTags;

            tags = tags.filter(t => !this.protectedTags.includes(t.id));

            const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder().
                        setCustomId('thread_tags').
                        setPlaceholder(LanguageLoader.LangConfig.THREADS_SELECT_TAGS_FOR_THREAD)
                        .setMinValues(1)
                        .setMaxValues(Math.min(5, tags.length))
                        .addOptions(
                            tags.map(t => new StringSelectMenuOptionBuilder().setLabel(`${t.emoji.name} ${t.name}`).setValue(t.id))
                        )
                );

            interaction.reply({
                content: LanguageLoader.LangConfig.THREADS_SELECT_TAGS_FOR_THREAD,
                components: [actionRow],
                ephemeral: true,
            });
        } catch (error) {
            console.error(error);
            LogService.Log(LogType.ThreadTagsStart, messageInfo.user.id);
        }
    }
}
