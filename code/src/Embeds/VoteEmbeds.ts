import { EmbedBuilder } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import LanguageLoader from '../Utils/LanguageLoader';

export default class VoteEmbeds {

    public static GetVotingEmbed(description: string, choices: string, imageUrl: string, time: number) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(LanguageLoader.LangConfig.VOTING_VOTE)
            .setDescription(`${description}
${!choices?.isFilled() ? '' : `\n**${LanguageLoader.LangConfig.VOTING_OPTIONS}**\n~~-------------------~~
${choices}~~-------------------~~`}`)
            .addFields({
                name: LanguageLoader.LangConfig.VOTING_VOTES,
                value: EmojiConstants.VOTE.NUMBERS[0]
            }, {
                name: LanguageLoader.LangConfig.VOTING_TIME,
                value: LanguageLoader.LangConfig.VOTING_VOTE_ENDS_AT
                    .replace('{shortDate}', `<t:${time}:t>`)
                    .replace('{relativeDate}', `<t:${time}:R>`)
            })
            .setImage(imageUrl);
        return embed;
    }

    public static GetVotingResultEmbed(description: string, choices: string, winner: string, imageUrl: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle(LanguageLoader.LangConfig.VOTING_VOTE)
            .setDescription(`${description}

**${LanguageLoader.LangConfig.VOTING_RESULTS}**\n~~-------------------~~
${choices}~~-------------------~~`)
            .addFields({
                name: LanguageLoader.LangConfig.VOTING_WINNER,
                value: winner
            })
            .setImage(imageUrl);
        return embed;
    }
}