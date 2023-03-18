import { Channel, Guild, GuildMember, Interaction, Message, User } from 'discord.js';
import ICommandInfo from './ICommandInfo';

export default interface IMessageInfo {
    guild?: Guild;
    channel: Channel,
    user: User;
    member?: GuildMember;
    message?: Message;
    commandInfo?: ICommandInfo;
    interaction?: Interaction;
}