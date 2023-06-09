
import { EmbedBuilder, HexColorString } from 'discord.js';
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

    public static GetCoordinateEmbed(url: string, x: number, y: number, time: number, total?: number, claimed?: number) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setAuthor({name: `(${x}, ${y})`})
            .setTitle('Gecoördineerd pixels plaatsen')
            .setDescription(`Klik op de knop hieronder om een pixel te claimen voor deze afbeelding.

${time == 0 ? 'Deze mag je __direct__ plaatsen!' : `__Wacht__ tot **<t:${time}:t>** (<t:${time}:R>) met het plaatsen van je pixel!`}`)
            .setImage(url);

        if (total != null) {
            embed.addFields({
                name: 'Aantal geclaimde pixels',
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
                ? '\nJe mag deze pixel __direct__ plaatsen'
                : `\nWacht tot __<t:${time}:t>__ (<t:${time}:R>) met het plaatsen van deze pixel.
                
__Klik dit bericht niet weg__, of onthoud de coördinaten en kleur!`}`)
            .setImage(colorImageUrl);
        return embed;
    }
}