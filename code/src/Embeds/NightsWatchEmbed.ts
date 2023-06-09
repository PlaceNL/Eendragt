
import { EmbedBuilder } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import LanguageLoader from "../Utils/LanguageLoader";

export default class NightsWatchEmbeds {

    public static GetWelcomeEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.NIGHT)
            .setTitle(LanguageLoader.LangConfig.NIGHTWATCH)
            .setImage(SettingsConstants.NIGHTS_WATCH_IMAGE_URL)
            .setDescription(LanguageLoader.LangConfig.NIGHTWATCH_MESSAGE.replace('{timeEnd}', `${SettingsConstants.TIME.NIGHT_END}`))
            .addFields({
                name: LanguageLoader.LangConfig.WELCOME,
                value: LanguageLoader.LangConfig.NIGHTWATCH_OPENING_TIMES
                    .replace('{timeEnd}', `${SettingsConstants.TIME.NIGHT_END}`)
                    .replace('{timeStart}', `${SettingsConstants.TIME.NIGHT_START}`),
            });
        return embed;
    }

    public static GetNewMemberEmbed() {
        const embed = new EmbedBuilder()
            .setColor(SettingsConstants.COLORS.NIGHT)
            .setTitle(LanguageLoader.LangConfig.NIGHTWATCH_WELCOME)
            .setImage('https://media.tenor.com/IPLDlGRMZt0AAAAC/and-now-my-watch-begins-nights-watch.gif');

        return embed;
    }
}