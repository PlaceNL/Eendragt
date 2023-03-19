
import { EmbedBuilder } from 'discord.js';
import NominationConstants from '../Constants/NominationConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { NominationAction } from '../Enums/NominationAction';

export default class NominationEmbeds {

    public static GetNominationEmbed(title: string, category: string, url: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor({ name: category })
            .setTitle(title)
            .setDescription(`[Link naar de thread](${url})`);

        return embed;
    }

    public static GetActionEmbed(title: string, category: string, description: string, action: NominationAction, addition: string) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: category })
            .setTitle(title)
            .setDescription(description);

        let fieldName = '';

        if (action == NominationAction.Approve) {
            embed.setColor(SettingsConstants.COLORS.GOOD);
            fieldName = NominationConstants.TITLES.APPROVED;
        } else if (action == NominationAction.Decline) {
            embed.setColor(SettingsConstants.COLORS.BAD);
            fieldName = NominationConstants.TITLES.DECLINED;
        } else if (action == NominationAction.Delay) {
            embed.setColor(SettingsConstants.COLORS.GRAY);
            fieldName = NominationConstants.TITLES.DELAYED;
        } else if (action == NominationAction.Vote) {
            embed.setColor(SettingsConstants.COLORS.BLUE);
            fieldName = NominationConstants.TITLES.VOTE;
        }

        embed.addFields({
            name: fieldName,
            value: addition
        });

        return embed;
    }
}