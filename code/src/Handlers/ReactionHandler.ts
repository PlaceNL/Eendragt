import { ChannelType, MessageReaction } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import SuggestionHandler from './SuggestionHandler';

export default class ReactionHandler {

    public static async OnReaction(reaction: MessageReaction) {
        const channel = await reaction.message.channel.fetch();
        if (channel.type == ChannelType.PublicThread) {
            if (channel.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
                SuggestionHandler.OnReaction(reaction, channel);
                return;
            }
        }
    }
}
