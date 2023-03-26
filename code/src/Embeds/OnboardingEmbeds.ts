import { EmbedBuilder } from 'discord.js';
import RolesConstants from '../Constants/RolesConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { RoleType } from '../Enums/RoleType';

export default class OnboardingEmbeds {

    public static GetWelcomeEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('PlaceNL')
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
                    name: RolesConstants.ROLES[RoleType.Soldier].name,
                    value: RolesConstants.ROLES[RoleType.Soldier].name,
                },
                {
                    name: RolesConstants.ROLES[RoleType.Builder].name,
                    value: RolesConstants.ROLES[RoleType.Builder].description,
                },
                {
                    name: 'Nog meer rollen',
                    value: `Bij PlaceNL zijn we op zoek naar talent! Bekijk <#${SettingsConstants.CHANNELS.MORE_ROLES_ID}> voor nog meer rollen!`,
                }
            );
        return embed;
    }

}
