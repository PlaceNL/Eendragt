import { EmbedBuilder } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';

export default class OnboardingEmbeds {

    public static GetWelcomeEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Place NL')
            .addFields(
                {
                    name: 'Welkom',
                    value: 'Waarvoor ben je in de server?'

                },
                {
                    name: 'Welcome',
                    value: 'What brings you to our server?'

                }
            );
        return embed;
    }

}
