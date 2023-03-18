
import { EmbedBuilder } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';

export default class ArtEmbeds {

    public static GetInvalidArtEmbed(reason: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setTitle('Afgekeurde art')
            .setDescription(`Reden voor afkeuring: ${reason}

Je art moet aan de volgende eisen voldoen:
- PNG formaat
- 1:1 scaling
- Transparante achtergrond
- Alleen de beschikbare kleuren`
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
            .setTitle(english ? 'Valid art' : 'Valide art')
            .setImage(url);
        return embed;
    }
}