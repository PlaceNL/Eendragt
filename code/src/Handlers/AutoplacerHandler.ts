import { ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import AutoplacerManager from '../Managers/AutoplacerManager';

export default class BillyHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.ORDER:
                this.OnOrder(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static OnOrder(messageInfo: IMessageInfo) {
        AutoplacerManager.GetLatestOrder();
        (<ChatInputCommandInteraction>messageInfo.interaction).reply('Done.');
    }
}