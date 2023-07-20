import { ButtonInteraction } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import NightsWatchEmbeds from '../Embeds/NightsWatchEmbed';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import LanguageLoader from '../Utils/LanguageLoader';

export default class NightsWatchHandler {

    public static async OnButton(messageInfo: IMessageInfo) {
        try {
            const member = messageInfo.member;
            if (member.roles.cache.has(SettingsConstants.ROLES.NIGHTS_WATCH_ID)) {
                await member.roles.remove(SettingsConstants.ROLES.NIGHTS_WATCH_ID);
                (<ButtonInteraction>messageInfo.interaction).reply({
                    content: LanguageLoader.LangConfig.YOU_DONT_HAVE_THIS_ROLE_ANYMORE,
                    ephemeral: true
                });
                return;
            }

            await member.roles.add(SettingsConstants.ROLES.NIGHTS_WATCH_ID);

            (<ButtonInteraction>messageInfo.interaction).reply({
                embeds: [NightsWatchEmbeds.GetNewMemberEmbed()],
                ephemeral: true
            });

            LogService.Log(LogType.NightsWatchRole, messageInfo.user.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.NightsWatchRole, messageInfo.user.id);
        }
    }
}
