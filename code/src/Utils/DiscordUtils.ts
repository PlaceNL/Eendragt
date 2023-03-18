import { Channel, GuildMember, Interaction, Message, PermissionResolvable, PermissionsBitField, User } from 'discord.js';
import IMessageInfo from '../Interfaces/IMessageInfo';
import RegexConstants from '../Constants/RegexConstants';
import DiscordService from '../Services/DiscordService';

export default class DiscordUtils {

    public static IsId(id: string) {
        return id.match(RegexConstants.DISCORD_ID) != null;
    }

    public static GetMemberId(id: string) {
        if (this.IsId(id)) { return id; }

        const match = id.match(RegexConstants.MENTION);

        if (match) {
            return match[1];
        }

        return null;
    }

    public static GetChannelId(id: string) {
        if (this.IsId(id)) { return id; }

        const match = id.match(RegexConstants.CHANNEL);

        if (match) {
            return match[1];
        }

        return null;
    }

    public static GetRoleId(id: string) {
        if (this.IsId(id)) { return id; }

        const match = id.match(RegexConstants.ROLE);

        if (match) {
            return match[1];
        }

        return null;
    }

    public static ParseMessageToInfo(message: Message, user: User) {
        const info: IMessageInfo = {
            user: user,
            channel: message.channel as Channel,
            message: message,
            member: message.member || null,
            guild: message.guild || null,
        };

        return info;
    }

    public static async ParseInteractionToInfo(interaction: Interaction) {
        const info: IMessageInfo = {
            user: interaction.user,
            channel: await DiscordService.FindChannelById(interaction.channelId),
            guild: interaction.guildId ? await DiscordService.FindGuildById(interaction.guildId) : null,
            member: interaction.member == null ? null : interaction.member as GuildMember,
            interaction: interaction,
        };

        return info;
    }

    public static ParseChannelMentionsToIds(channels: Array<string>) {
        const ret = new Array<string>();

        for (let i = 0; i < channels.length; i++) {
            const id = this.GetChannelId(channels[i]);
            if (id) {
                ret.push(id);
            }
        }

        return ret;
    }

    public static GetUserFriendlyPermissionText(permission: PermissionResolvable) {
        const bitField = new PermissionsBitField();
        const permissionString = bitField.add(permission).toArray()[0];

        switch (permissionString) {
            case 'EmbedLinks': return 'send embedded messages';
        }

        return permissionString.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    }
}