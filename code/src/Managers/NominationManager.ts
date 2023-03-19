import { PublicThreadChannel, TextChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import NominationEmbeds from '../Embeds/NominationEmbeds';
import DiscordService from '../Services/DiscordService';

export default class NominationManager {

    public static async Nominate(channel: PublicThreadChannel, category: string) {
        const nominationChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNELS.NOMINATION_ID);
        const embed = NominationEmbeds.GetNominationEmbed(channel.name, category, channel.url);

        return await nominationChannel.send({
            embeds: [embed]
        });
    }
}

