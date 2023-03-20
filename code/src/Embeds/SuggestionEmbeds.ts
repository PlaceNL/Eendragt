import { EmbedBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import EmojiConstants from '../Constants/EmojiConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import TagConstants from '../Constants/TagConstants';
import IResultInfo from '../Interfaces/IResultInfo';
import CommandService from '../Services/CommandService';

export default class SuggestionEmbeds {

    public static GetSuggestionArtEmbed(similarities: IResultInfo, multiple: boolean, lookingForArtist: boolean) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Bedankt voor je suggestie!')
            .setDescription(`${multiple ? 'Je hebt meerdere tags geselecteerd. Ik heb de andere tags voor je verwijderd.\n\n' : ''} \
De suggestie heeft twee tags nodig om naar de stembus te gaan:

**${TagConstants.TAGS.APPRECIATED}**
Een hoog aantal stemmen, met een goede upvote/downvote ratio.

**${TagConstants.TAGS.ART}**
Valide pixelart van \`PNG\` formaat met alleen de juiste kleuren, 1:1 scaling, en een transparante achtergrond.

${lookingForArtist
        ? `De artist die je suggestie tekent moet het commando ${CommandService.GetCommandString(CommandConstants.SLASH.VALIDATE)} \
gebruiken om hun art te valideren en de ${TagConstants.TAGS.ART} tag aan deze post te geven.`
        : `Gebruik het commando ${CommandService.GetCommandString(CommandConstants.SLASH.VALIDATE)} om je art te valideren en de \
${TagConstants.TAGS.ART} tag te ontvangen.

Heb je zelf geen art? Geef je post dan de ${TagConstants.TAGS.ARTIST} tag om een pixel-artist te vinden die je kan helpen.`}

${similarities.result ? this.GetSimilaritiesString(similarities.data.list) : ''}`);
        return embed;
    }

    public static GetSuggestionOtherEmbed(similarities: IResultInfo, multiple: boolean) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Bedankt voor je suggestie!')
            .setDescription(`${multiple ? 'Je hebt meerdere tags geselecteerd. Ik heb de andere tags voor je verwijderd.\n\n' : ''} \
De suggestie heeft de **${TagConstants.TAGS.APPRECIATED}** tag nodig om naar de stembus te gaan. Deze wordt __automatisch__ aan je \
post toegewezen bij een hoog aantal stemmen, met een goede upvote/downvote ratio.

${similarities.result ? this.GetSimilaritiesString(similarities.data.list) : ''}`);
        return embed;
    }

    public static GetSuggestionDuplicateEmbed(thread: any) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setTitle(TagConstants.TAGS.DUPLICATE)
            .setDescription(`Deze suggestie is al gedaan:
[${thread.name}](${thread.url})

Deze post wordt om die reden gesloten. Neem contact op met een moderator als dit niet klopt.`);
        return embed;
    }

    public static GetAppreciatedTagEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle(TagConstants.TAGS.APPRECIATED);
        embed.setDescription(`Deze suggestie heeft veel ${EmojiConstants.STATUS.GOOD} stemmen ontvangen, maar heeft nog valide art nodig om genomineerd te worden.`);

        return embed;
    }

    public static GetDeniedTagEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setTitle(TagConstants.TAGS.DENIED);
        embed.setDescription(`Deze suggestie heeft veel ${EmojiConstants.STATUS.BAD} stemmen ontvangen, en daarom wordt deze thread nu gesloten.`);

        return embed;
    }

    public static GetValidArtEmbed(first: boolean, url: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle('Goedgekeurd')
            .setImage(url);

        if (first) {
            embed.setDescription(`Deze post heeft nu de ${TagConstants.TAGS.ART} tag gekregen.`);
        }

        return embed;
    }

    public static GetNominatedEmbed(url: string, art: boolean) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.GOOD)
            .setTitle('Genomineerd!')
            .setDescription(`Deze suggestie is naar de <#${SettingsConstants.CHANNELS.NOMINATION_ID}> gestuurd. Deze wordt zo snel mogelijk afgehandeld.
        ${art ? '\nTot die tijd kan je nog steeds nieuwe art uploaden. Als er meerdere art is geupload, maar er is nog geen duidelijke favoriete versie, \
dan zal een moderator een keuze maken.' : ''}
\n[Link naar de nominatie](${url})`);

        return embed;
    }

    private static GetSimilaritiesString(similarities: Array<any>) {
        let str = `**Vergelijkbare suggestie${similarities.length > 1 ? 's' : ''}**\n`;

        for (const similarity of similarities) {
            str += `[${similarity.name}](${similarity.url})\n`;
        }

        return str;
    }
}
