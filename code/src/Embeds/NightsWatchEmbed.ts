
import { EmbedBuilder } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';

export default class NightsWatchEmbeds {

    public static GetWelcomeEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.NIGHT)
            .setTitle('De Nachtwacht')
            .setDescription(`De nacht breekt aan, en nu begint mijn wacht. Het zal niet eindigen tot 0${SettingsConstants.TIME.NIGHT_END}:00. Ik zal scherp blijven, geen dutje doen, en niet knikkebollen. Ik zal me focussen op mijn taak en me niet laten afleiden. Ik zal leven op mijn post. Ik ben het zwaard in de duisternis. Ik ben de wachter op het canvas. Ik ben het schild dat het rijk der pixels bewaakt. Ik beloof mijn leven en eer aan de Nachtwacht, voor deze nacht en alle komende nachten.`)
            .addFields({
                name: 'Welkom',
                value: `Dit kanaal is alleen open tussen 0${SettingsConstants.TIME.NIGHT_START}:00 en 0${SettingsConstants.TIME.NIGHT_END}:00, bedoeld voor hen met ~~een slecht slaapritme~~ de passie om ons land te beschermen tot in de nacht. Klik op de knop hieronder om lid te worden van de Nachtwacht, en daarmee ook overdag dit kanaal te kunnen lezen.`,
            });
        return embed;
    }

    public static GetNewMemberEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.NIGHT)
            .setTitle('Welkom bij de Nachtwacht')
            .setImage('https://media.tenor.com/IPLDlGRMZt0AAAAC/and-now-my-watch-begins-nights-watch.gif');

        return embed;
    }
}