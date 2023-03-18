import { ThreadChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import SuggestionHandler from './SuggestionHandler';

export default class ThreadHandler {

    public static OnThread(thread: ThreadChannel) {
        if (thread.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
            SuggestionHandler.OnThread(thread);
        }
    }
}
