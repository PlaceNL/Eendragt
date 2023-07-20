import { EmbedBuilder } from 'discord.js';
import RolesConstants from '../Constants/RolesConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { RoleType } from '../Enums/RoleType';
import LanguageLoader from '../Utils/LanguageLoader';

export default class OnboardingEmbeds {

    public static GetWelcomeEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(SettingsConstants.SERVER_NAME)
            .addFields(this.GetFields());
        return embed;
    }

    public static GetPlacerEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(LanguageLoader.LangConfig.ONBOARDING_NICE_OF_YOU_TO_COME_HELP)
            .setDescription(`${LanguageLoader.LangConfig.ONBOARDING_YOU_CAN_HELP_IN_THE_FOLLOWING_WAYS}:`)
            .addFields(
                {
                    name: RolesConstants.ROLES[RoleType.Soldier].name,
                    value: RolesConstants.ROLES[RoleType.Soldier].description,
                },
                {
                    name: RolesConstants.ROLES[RoleType.Builder].name,
                    value: RolesConstants.ROLES[RoleType.Builder].description,
                },
                {
                    name: LanguageLoader.LangConfig.ONBOARDING_MORE_ROLES,
                    value: `${LanguageLoader.LangConfig.ONBOARDING_LOOKING_FOR_TALENT
                        .replace('{server}', SettingsConstants.SERVER_NAME)
                        .replace('{rolesChannel}', `<#${SettingsConstants.CHANNELS.MORE_ROLES_ID}>`)}`,
                }
            );
        return embed;
    }

    public static GetFields() {
        if (LanguageLoader.LanguageSetting.includes('en-')) {
            return [
                {
                    name: 'Welcome',
                    value: 'What brings you to our server?'
                }
            ];
        }

        return [{
            name: LanguageLoader.LangConfig.WELCOME,
            value: LanguageLoader.LangConfig.ONBOARDING_WHAT_BRINGS_YOU_TO_THE_SERVER
        },
        {
            name: 'Welcome',
            value: 'What brings you to our server?'
        }];
    }

}
