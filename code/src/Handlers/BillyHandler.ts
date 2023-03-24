import { ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import { Utils } from '../Utils/Utils';

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
            timeParts2[0] = (parseInt(timeParts2[0]) + 12).toString();
        }
        const time24 = timeParts2.join(':');

        const interaction = <ChatInputCommandInteraction>messageInfo.interaction;
        const picture = interaction.options.getBoolean('foto') || false;

        const texts = [
            `Zeg Billy, hoe laat is het bij jou?\nBilly: ${time24}`,
            `"DING DONG!" zegt de klok bij Billy. "It is currently ${time24} over here!`,
            `Zoals het klokje in San Francisco tikt, tik het precies ${time24}.`,
            `Zoals het klokje thuis tikt, tikt het niet in San Francisco. Want daar is het ${time24}.`,
            `Ik heb de computer van Billy gehackt, en gezien dat het daar exact ${time24} is`,
            `Het is heel simpel. Je pakt de huidige Nederlandse tijd, telt daar 5 bij op, haalt er 2 vanaf, deelt het door 3, draai het een kwartslag, zing een liedje, en dan zou je ongeveer op ${time24} uitkomen.`,
        ];

        const text = texts[Math.floor(Math.random() * texts.length)];

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