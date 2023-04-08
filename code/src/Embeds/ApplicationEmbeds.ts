import { EmbedBuilder, User } from 'discord.js';
import RolesConstants from '../Constants/RolesConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { RoleType } from '../Enums/RoleType';
import LanguageLoader from '../Utils/LanguageLoader';

export default class ApplicationEmbeds {

    public static GetRolesEmbed() {
        const server = SettingsConstants.SERVER_NAME;
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(LanguageLoader.LangConfig.EXTRA_ROLES)
            .setDescription(`
${LanguageLoader.LangConfig.WHICH_ROLE_FITS_YOU}

**${RolesConstants.ROLES[RoleType.Builder].name}**
${RolesConstants.ROLES[RoleType.Builder].description}

**${RolesConstants.ROLES[RoleType.Soldier].name}**
${RolesConstants.ROLES[RoleType.Soldier].description}

**${LanguageLoader.LangConfig.APPLICATIONS}**

${LanguageLoader.LangConfig.WE_ARE_LOOKING_FOR_PEOPLE.replace('{server}', server)}

**${RolesConstants.ROLES[RoleType.Support].name}**
${RolesConstants.ROLES[RoleType.Support].description}

**${RolesConstants.ROLES[RoleType.Diplomat].name}**
${RolesConstants.ROLES[RoleType.Diplomat].description}

**${RolesConstants.ROLES[RoleType.Artist].name}**
${RolesConstants.ROLES[RoleType.Artist].description}

**${RolesConstants.ROLES[RoleType.Reporter].name}**
${RolesConstants.ROLES[RoleType.Reporter].description}`);

        return embed;
    }
    public static GetApplicationEmbed(user: User, description: string, data?: any) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(LanguageLoader.LangConfig.APPLICATION)
            .setDescription(LanguageLoader.LangConfig.USER_APPLIED.replace('{user}', `${user}`));

        embed.addFields({
            name: LanguageLoader.LangConfig.APPLICATION_LETTER,
            value: description,
        });

        if (data != null) {
            embed.addFields({
                name: LanguageLoader.LangConfig.ROLES_2022,
                value: data.roles.join(', ')
            });
        }

        return embed;
    }
}
