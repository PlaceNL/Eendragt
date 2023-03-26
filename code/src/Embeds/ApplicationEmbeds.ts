import { EmbedBuilder, User } from 'discord.js';
import RolesConstants from '../Constants/RolesConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import { RoleType } from '../Enums/RoleType';

export default class ApplicationEmbeds {

    public static GetRolesEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Extra rollen')
            .setDescription(`
Welke rol past het beste bij jou?

**${RolesConstants.ROLES[RoleType.Builder].name}**
${RolesConstants.ROLES[RoleType.Builder].description}

**${RolesConstants.ROLES[RoleType.Soldier].name}**
${RolesConstants.ROLES[RoleType.Soldier].description}

**Sollicitaties**

Bij PlaceNL zijn we op zoek naar talent! Voel jij je aangesproken bij een van de volgende rollen? Solliciteer met een korte beschrijving waarom je geschikt bent.

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
            .setTitle('Sollicitatie')
            .setDescription(`${user} heeft gesolliciteerd.`);

        embed.addFields({
            name: 'Sollicitatiebrief',
            value: description,
        });

        if (data != null) {
            embed.addFields({
                name: 'Rollen 2022',
                value: data.roles.join(', ')
            });
        }

        return embed;
    }
}