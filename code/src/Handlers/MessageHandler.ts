import { ThreadChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import SuggestionHandler from './SuggestionHandler';

export default class MessageHandler {

    public static OnThread(thread: ThreadChannel) {
        if (thread.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
            SuggestionHandler.OnThread(thread);
        }
    }

    public static OnMessage(messageInfo: IMessageInfo) {
        if (messageInfo.channel.id != SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
            return;
        }
    }
}
