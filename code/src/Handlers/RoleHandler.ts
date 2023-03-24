import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import DiscordService from '../Services/DiscordService';
import LogService from '../Services/LogService';

export default class RoleHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.ROLE.COMMAND:
                this.OnRole(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    private static OnRole(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
        const subCommand = interaction.options.getSubcommand();

        const commands = CommandConstants.SLASH.ROLE;

        switch (subCommand) {
            case commands.DIPLOMAT:
                this.OnManageRole(messageInfo, SettingsConstants.ROLES.DIPLOMAT_ID, SettingsConstants.ROLES.DIPLOMAT_ID, SettingsConstants.CHANNELS.DIPLOMACY_LOG_ID);
                break;
            case commands.ARTIST:
                this.OnManageRole(messageInfo, SettingsConstants.ROLES.ART_DIRECTOR_ID, SettingsConstants.ROLES.ARTIST_ID, SettingsConstants.CHANNELS.ARTIST_LOG_ID);
                break;
            default: return false;
        }
    }

    private static async OnManageRole(messageInfo: IMessageInfo, modRoleId: string, roleId: string, logChannelId: string) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
        const roleName = interaction.options.getSubcommand().toTitleCase();
        const user = interaction.options.getUser('wie');
        const action = interaction.options.getString('actie');
        const take = action == 'take';

        let logType;

        if (roleName == 'Diplomaat') {
            logType = take ? LogType.RoleDiplomatRemove : LogType.RoleDiplomatAdd;
        } else {
            logType = take ? LogType.RoleArtistRemove : LogType.RoleArtistAdd;
        }

        try {
            const reason = interaction.options.getString('reden');

            if (!interaction.inCachedGuild()) {
                return;
            }

            if (user.id == messageInfo.user.id) {
                await interaction.reply({
                    content: 'Je kunt deze rol niet aan jezelf geven/afpakken',
                    ephemeral: true
                });

                return;
            }

            const targetMember = await DiscordService.FindMemberById(user.id, messageInfo.guild);

            if (!messageInfo.member.roles.cache.has(modRoleId)) {
                await interaction.reply({
                    content: 'Je hebt geen toegang tot dit commando',
                    ephemeral: true
                });

                return;
            }

            if (targetMember.roles.cache.has(roleId)) {
                if (!take) {
                    await interaction.reply({
                        content: `${targetMember} heeft deze rol al`,
                        ephemeral: true
                    });

                    return;
                } else {
                    targetMember.roles.remove(roleId);

                    await interaction.reply({
                        content: `Ik heb de rol ${roleName} **afgepakt** van ${targetMember}`,
                        ephemeral: true
                    });
                }
            } else {
                if (take) {
                    await interaction.reply({
                        content: `${targetMember} heeft deze rol niet`,
                        ephemeral: true
                    });

                    return;
                } else {
                    targetMember.roles.add(roleId);

                    await interaction.reply({
                        content: `Ik heb de rol ${roleName} **gegeven** aan ${targetMember}`,
                        ephemeral: true
                    });
                }
            }

            const logChannel = <TextChannel> await DiscordService.FindChannelById(logChannelId);

            if (logChannel) {
                logChannel.send({
                    content: `${messageInfo.member} heeft de rol ${roleName} ${take ? 'afgepakt van' : 'gegeven aan'} ${targetMember}
    Reden: ${reason}`,
                    allowedMentions: { users: [] }
                });
            }

            LogService.Log(logType, messageInfo.user.id, 'Target', targetMember.id, reason);
        } catch (error) {
            console.error(error);
            LogService.Error(logType, messageInfo.user.id, 'Target', user.id);
        }
    }
}