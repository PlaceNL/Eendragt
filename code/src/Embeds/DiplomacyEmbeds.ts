import { EmbedBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IResultInfo from '../Interfaces/IResultInfo';
import CommandService from '../Services/CommandService';
import LanguageLoader from '../Utils/LanguageLoader';

export default class DiplomacyEmbeds {

    public static GetWelcomeEmbed(username: string, communityName: string, size: string, description: string, time: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(`Welcome ${username} - Diplomat of ${communityName}`)
            .setDescription(`One of our diplomats will be with you as soon as possible.${time == null ?  '' : `

Note that it's currently ${time} in the Netherlands, and therefore it might take a while before one of our diplomats are available to help you.`}

In the mean time, you can use this thread to further describe what you would like to discuss, and provide images if necessary. \
If you have pixel art for us to help build, please validate it using the command ${CommandService.GetCommandString(CommandConstants.SLASH.VALIDATE)}.

Please __provide proof__ that you are an __official diplomat__ by sending an invite link of your community's Discord server. Alternatively, send a screenshot of your roles in that server. If it is not possible for you to provide these things, please explain why.

**Community size**
${size}

**Your message**
${description}

**Invite associates**
You can click the button below to get a dropdown, which allows you to add up to ${SettingsConstants.DIPLOMACY_ASSOCIATE_INVITE_MAX} people from your community to this thread. __Do not abuse this__ \
by adding people who are not part of your community, as it can result in a ban. You can do this __one time only__, \
so make sure you add both at once (if needed). If you don't have any associates, you can ignore this.`);
        return embed;
    }

    public static GetDispatchEmbed(communityName: string, size: string, description: string, threadUrl: string, similarities: IResultInfo) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle(communityName)
            .setDescription(`
**${LanguageLoader.LangConfig.DIPLOMACY_COMMUNITY_SIZE}**
${size}
            
**${LanguageLoader.LangConfig.DIPLOMACY_MESSAGE}**
${description}

[${LanguageLoader.LangConfig.LINK_TO_THREAD}](${threadUrl})

${similarities.result ? this.GetSimilaritiesString(similarities.data.list) : ''}`);

        return embed;
    }

    public static GetDiplomatArrivedEmbed(username: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.DEFAULT)
            .setTitle('Diplomat arrived')
            .setDescription(`${username} arrived as your personal diplomat.
            
If at any point you feel like your diplomat is not doing their job properly, or they have stopped responding for more than \
an hour without notice, you can use the button below to contact the moderators to help you out.

__Do not abuse this.__ The diplomat disagreeing with you is not reason enough to contact the moderators.`);

        return embed;
    }

    public static GetReportEmbed(communityName: string, username: string, description: string, threadUrl: string) {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.BAD)
            .setAuthor({ name: username })
            .setTitle(communityName)
            .setDescription(`${description}
            
[${LanguageLoader.LangConfig.LINK_TO_THREAD}](${threadUrl})`);

        return embed;
    }

    private static GetSimilaritiesString(similarities: Array<any>) {
        let str = `**${LanguageLoader.LangConfig.DIPLOMACY_SIMILAR_DIPLOMATS
            .replace('{singleOrPlural}', `${similarities.length > 1 ? LanguageLoader.LangConfig.DIPLOMAT_PLURAL : LanguageLoader.LangConfig.DIPLOMAT_SINGLE}`)}**\n`;

        for (const similarity of similarities) {
            str += `[${similarity.name}](${similarity.url})\n`;
        }

        return str;
    }
}
