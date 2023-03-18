import { CacheType, CommandInteractionOptionResolver } from 'discord.js';

export default interface ICommandInfo {
    command: string;
    commands: Array<string>
    content: string;
    args: Array<string>;
    options?: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>
}