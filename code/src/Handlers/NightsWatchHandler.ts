import { ButtonInteraction } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import NightsWatchEmbeds from '../Embeds/NightsWatchEmbed';
import IMessageInfo from '../Interfaces/IMessageInfo';

export default class NightsWatchHandler {

    public static async OnButton(messageInfo: IMessageInfo) {
        const member = messageInfo.member;
        if (member.roles.cache.has(SettingsConstants.ROLES.NIGHTS_WATCH_ID)) {
            (<ButtonInteraction>messageInfo.interaction).reply({
                content: 'Je hebt de rol al.',
                ephemeral: true
            });
            return;
        }

        await member.roles.add(SettingsConstants.ROLES.NIGHTS_WATCH_ID);

        (<ButtonInteraction>messageInfo.interaction).reply({
            embeds: [NightsWatchEmbeds.GetNewMemberEmbed()],
            ephemeral: true
        });
    }
}