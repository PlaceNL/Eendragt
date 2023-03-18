import SettingsConstants from './SettingsConstants';

export default class EmojiConstants {

    public static readonly STATUS = {
        GOOD: '✅',
        BAD: '❌',
    };

    public static readonly VOTE = {
        UPVOTE: SettingsConstants.EMOJI.UPVOTE_ID,
        DOWNVOTE: SettingsConstants.EMOJI.DOWNVOTE_ID,
    };

    public static readonly ARROW = '➜';
}
