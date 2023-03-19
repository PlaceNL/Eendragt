import { LogType } from '../Enums/LogType';
import { TextChannel } from 'discord.js';
import DiscordService from './DiscordService';
import SettingsConstants from '../Constants/SettingsConstants';
import { Utils } from '../Utils/Utils';

export default class LogService {

    private static logChannel: TextChannel;

    public static async Log(logType: LogType, userId?: string, idName?: string, id?: string) {
        await this.LoadLogChannel();

        await this.logChannel.send({
            content: this.GetString(logType, userId, idName, id),
            allowedMentions: { users: []}
        });
    }

    public static async Error(logType: LogType, userId?: string, idName?: string, id?: string) {
        await this.LoadLogChannel();

        await this.logChannel.send(`${this.GetString(logType, userId, idName, id)} | ERROR! <@${SettingsConstants.MASTER_ID}>`);
    }

    private static async LoadLogChannel() {
        if (this.logChannel != null) {
            return;
        }

        this.logChannel = <TextChannel> await DiscordService.FindChannelById(SettingsConstants.CHANNELS.LOG_ID);
    }

    private static GetString(logType: LogType, userId?: string, idName?: string, id?: string) {
        const date = Utils.GetNowString();
        let str = `${date} - ${logType}`;
        if (userId != null) {
            str += ` | User: ${userId} (<@${userId}>)`;
        }

        if (idName != null && id != null) {
            str += ` | ${idName}: ${id}`;
        }

        return str;
    }
}