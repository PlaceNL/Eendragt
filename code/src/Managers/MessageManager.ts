import { DMChannel, EmbedBuilder } from 'discord.js';
import DiscordService from '../Services/DiscordService';

export default class MessageManager {

    public static async SendMessageToDM(dmChannel: DMChannel, text: string, embed?: EmbedBuilder) {
        const data: any = {};

        if (text?.isFilled()) {
            data.content = text;
        }

        if (embed != null) {
            data.embeds = [embed];
        }

        return await DiscordService.SendMessage(dmChannel, data);
    }
}