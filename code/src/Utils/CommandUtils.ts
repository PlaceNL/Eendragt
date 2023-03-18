import { ChatInputCommandInteraction } from 'discord.js';
import ICommandInfo from '../Interfaces/ICommandInfo';

export default class CommandUtils {

    public static ParseContentToCommand(content: string, prefix: string) {
        const words = content.replace(/\s+/g, ' ').split(' ');
        let command = words[0].substr(prefix.length).toLowerCase();
        if (content.includes('\n')) {
            const commandSplit = words[0].substr(prefix.length).split('\n');
            command = commandSplit[0].toLowerCase();

            content = content.replace('\n', ' ');

            words.shift();
        } else {
            words.shift();
        }

        if (content.trim().includes(' ')) {
            content = content.slice(content.indexOf(' ')).trim();
        } else {
            content = '';
        }

        if (content.startsWith('[') && content.endsWith(']')) {
            content = content.slice(1, content.length - 1);
        }

        const info: ICommandInfo = {
            command: command,
            commands: [],
            args: words,
            content: content,
        };

        return info;
    }

    public static ParseInteractionToCommand(interaction: ChatInputCommandInteraction) {
        const info: ICommandInfo = {
            command: interaction.commandName,
            commands: [],
            args: [],
            options: interaction.options,
            content: '',
        };

        return info;
    }

    public static GetCommaArgs(content: string) {
        const commaArgs = content.split(',');
        for (let i = 0; i < commaArgs.length; i++) {
            commaArgs[i] = commaArgs[i].trim();
        }
        return commaArgs;
    }

    public static GetNumberedArguments(content: string) {
        const obj: any = {};
        let success = false;

        const commaArgs = content.split(',');
        for (let i = 0; i < commaArgs.length; i++) {
            let arg = commaArgs[i].trim();
            const countMatch = arg.match(/^(\w+)/);
            if (countMatch) {
                success = true;
                const count = countMatch[1];
                const countNumber = parseInt(count);

                const nan = isNaN(countNumber);
                if (!nan && countNumber <= 0) {
                    continue;
                }

                if (count == 'all' || (!nan)) {
                    arg = arg.substring(count.length, arg.length).trim();
                    obj[arg] = count;
                } else {
                    obj[arg] = 1;
                }
            }
        }

        if (!success) {
            return null;
        }

        return obj;
    }

    public static GetSingleNumberedArgument(content: string) {
        const obj: any = {};

        const commaArgs = content.split(',');
        let arg = commaArgs[0].trim();
        obj.name = arg;

        const countMatch = arg.match(/^(\w+)/);
        if (countMatch) {
            const count = countMatch[1];
            const countNumber = parseInt(count);

            const nan = isNaN(countNumber);
            if (!nan && countNumber <= 0) {
                return {};
            }

            if (count == 'all' || (!nan)) {
                arg = arg.substring(count.length, arg.length).trim();
                obj.name = arg;
                obj.amount = count;
            } else {
                obj.amount = 1;
            }
        } else {
            return null;
        }

        return obj;
    }

    public static GetAssignedArguments(content: string) {
        const obj: any = {};
        const assignedArgs = (' ' + content).split(' -').slice(1);

        for (let i = 0; i < assignedArgs.length; i++) {
            const arg = assignedArgs[i].trim();

            const argumentNameMatch = arg.match(/^(\w+)/);
            if (argumentNameMatch) {
                const name = argumentNameMatch[1];
                const value = arg.substring(name.length).trim();
                obj[name] = value;
            } else {
                return null;
            }
        }

        return obj;
    }

    public static ValidateArguments(args: any) {
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const val = arg.value;

            if (arg.required) {
                if (val == null) {
                    return false;
                }
            }

            if (arg.numeric) {
                const n = parseInt(val);
                if (n != null && args.numeric == false) {
                    // No number
                    return false;
                } else if (n == null && args.numeric == true) {
                    return false;
                }
            }

            if (args.regex) {
                const match = val.match(arg.regex);
                if (match == null) {
                    return false;
                }
            }
        }
        return true;
    }
}