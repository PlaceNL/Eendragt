
import { EmbedBuilder, HexColorString } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import LanguageLoader from '../Utils/LanguageLoader';

export default class ArtEmbeds {

    public static GetInvalidArtEmbed(reason: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setTitle(LanguageLoader.LangConfig.ART_REJECTED_ART)
            .setDescription(`${LanguageLoader.LangConfig.ART_REASON_FOR_REJECTION.replace('{reason}', reason)}

${LanguageLoader.LangConfig.ART_ARTWORK_REQUIREMENTS
        .replace('{format}', LanguageLoader.LangConfig.ART_FILE_FORMAT)
        .replace('{scale}', '1:1')
}`
            );
        return embed;
    }

    public static GetInvalidArtEnglishEmbed(reason: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setTitle('Invalid art')
            .setDescription(`Reason: ${reason}

Your art must meet the following requirements:
- PNG format
- 1:1 scaling
- Transparant background
- Only the available colors`
            );
        return embed;
    }

    public static GetValidArtEmbed(url: string, english: boolean = false) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle(english ? 'Valid art' : LanguageLoader.LangConfig.ART_VALID_ART)
            .setImage(url);
        return embed;
    }

    public static GetCoordinateEmbed(url: string, x: number, y: number, time: number, total?: number, claimed?: number) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor({name: `(${x}, ${y})`})
            .setTitle(LanguageLoader.LangConfig.ART_PLACING_COORDINATED_PIXELS)
            .setDescription(`${LanguageLoader.LangConfig.ART_PRESS_BUTTON_TO_CLAIM_PIXEL}

${time == 0 ? LanguageLoader.LangConfig.ART_PLACE_PIXEL_RIGHT_AWAY : LanguageLoader.LangConfig.ART_WAIT_UNTIL_TIME_TO_PLACE_PIXEL
        .replace('{shortTime}', `<t:${time}:t>`)
        .replace('{relativeTime}', `<t:${time}:R>`)}`
            )
            .setImage(url);

        if (total != null) {
            embed.addFields({
                name: LanguageLoader.LangConfig.ART_AMOUNT_OF_CLAIMED_PIXELS,
                value: `${claimed} / ${total}`,
            });
        }
        return embed;
    }

    public static GetClaimPixelEmbed(x: number, y: number, color: HexColorString, colorImageUrl: string, time?: number) {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('Pixel')
            .setDescription(`**x=${x}, y=${y}**${ time == 0
                ? `\n${LanguageLoader.LangConfig.ART_PLACE_PIXEL_RIGHT_AWAY}`
                : `\n${LanguageLoader.LangConfig.ART_WAIT_UNTIL_TIME_TO_PLACE_PIXEL
                    .replace('{shortTime}', `<t:${time}:t>`)
                    .replace('{relativeTime}', `<t:${time}:R>`)}
                
${LanguageLoader.LangConfig.ART_DO_NOT_DISMISS_OR_REMEMBER_COLOUR}`}`)
            .setImage(colorImageUrl);
        return embed;
    }
}