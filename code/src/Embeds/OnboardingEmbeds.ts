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

    public static GetPlacerEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Fijn dat je komt meehelpen!')
            .setDescription('Meehelpen kan op de volgende manieren:')
            .addFields(
                {
                    name: 'Soldaat',
                    value: 'Ben jij een strijder voor het Vaderlandt? Help dan mee met het verdedigen van onze glorie op het canvas.'

                },
                {
                    name: 'Bouwer',
                    value: 'Vind je het leuk om mee te werken aan nieuwe creaties? Of heet je Bob? Of Frans? Dan is deze rol voor jou!'
                },
                {
                    name: 'Nieuwsredactie',
                    value: 'Ben jij op de hoogte van wat er allemaal speelt op en rond het canvas? Vind jij het leuk om content te maken voor het journaal? Word dan Aspirant Nieuwsredacteur!'
                }
            );
        return embed;
    }

}
