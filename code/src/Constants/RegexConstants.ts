export default class RegexConstants {
    public static readonly DISCORD_ID = /^[0-9]{17,20}$/;
    public static readonly MENTION = /<@!?([0-9]*)>/;
    public static readonly CHANNEL = /<#!?([0-9]*)>/;
    public static readonly ROLE = /<@&([0-9]*)>/;
    public static readonly EMOJI = /<:[0-z]+:([0-9]+)>/;
}