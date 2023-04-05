import { ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import LanguageLoader from '../Utils/LanguageLoader';

export default class BillyHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.BILLY:
                this.OnBilly(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static OnBilly(messageInfo: IMessageInfo) {
        const time = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' });

        // Convert AM/PM to 24-hours
        const timeParts = time.split(' ');
        const timeParts2 = timeParts[0].split(':');
        if (timeParts[1] === 'PM') {
            if (timeParts2[0] != '12') {
                timeParts2[0] = (parseInt(timeParts2[0]) + 12).toString();
            }
        } else {
            if (timeParts2[0] === '12') {
                timeParts2[0] = '00';
            }
        }

        const time24 = timeParts2.join(':');

        const interaction = <ChatInputCommandInteraction>messageInfo.interaction;
        const picture = interaction.options.getBoolean('foto') || false;

        const texts = LanguageLoader.LangConfig.BILLY_TIME_JOKES;
        const text = texts[Math.floor(Math.random() * texts.length)].replace('{time}', `${time24}`);

        const data: any = {
            content: text
        };

        if (picture) {
            data.content += '\nhttps://cdn.discordapp.com/attachments/817036396790939718/1088648554697994270/image.png';
            data.ephemeral = true;
        }

        (<ChatInputCommandInteraction>messageInfo.interaction).reply(
            data
        );

        LogService.Log(LogType.BillyTime, messageInfo.user.id, 'Picture', picture.toString());
    }
}