import { EmbedBuilder } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';

export default class GeneralEmbeds {

    public static GetHelpEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Help')
            .setDescription('Help');
        return embed;
    }
}
