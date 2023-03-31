import SettingsConstants from './SettingsConstants';

export default class EmojiConstants {

    public static readonly STATUS = {
        GOOD: '✅',
        BAD: '❌',
    };

    public static readonly VOTE = {
        UPVOTE: SettingsConstants.EMOJI.UPVOTE_ID,
        DOWNVOTE: SettingsConstants.EMOJI.DOWNVOTE_ID,
        NUMBERS: [
            '0️⃣',
            '1️⃣',
            '2️⃣',
            '3️⃣',
            '4️⃣',
            '5️⃣',
            '6️⃣',
            '7️⃣',
            '8️⃣',
            '9️⃣',
        ]
    };

    public static readonly ARROW = '➜';
}
