import { EmbedBuilder } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';
import SettingsConstants from '../Constants/SettingsConstants';

export default class VoteEmbeds {

    public static GetVotingEmbed(description: string, choices: string, imageUrl: string, time: number) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Stemming')
            .setDescription(`${description}
${!choices?.isFilled() ? '' : `\n**Opties**\n~~-------------------~~
${choices}~~-------------------~~`}`)
            .addFields({
                name: 'Stemmen',
                value: EmojiConstants.VOTE.NUMBERS[0]
            }, {
                name: 'Tijd',
                value: `Deze stemming eindigt om **<t:${time}:t>** (<t:${time}:R>)`
            })
            .setImage(imageUrl);
        return embed;
    }

    public static GetVotingResultEmbed(description: string, choices: string, winner: string, imageUrl: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle('Stemming')
            .setDescription(`${description}

**Resultaten**\n~~-------------------~~
${choices}~~-------------------~~`)
            .addFields({
                name: 'Winnaar 🎉',
                value: winner
            })
            .setImage(imageUrl);
        return embed;
    }
}