import IMessageInfo from '../Interfaces/IMessageInfo';
import SettingsConstants from '../Constants/SettingsConstants';
import CommandConstants from '../Constants/CommandConstants';
import CommandUtils from '../Utils/CommandUtils';
import { ChatInputCommandInteraction } from 'discord.js';
import OnboardingHandler from './OnboardingHandler';
import ArtHandler from './ArtHandler';

export default class CommandHandler {

    public static OnCommand(messageInfo: IMessageInfo, content: string) {
        let commandInfo;

        if (messageInfo.interaction != null) {
            commandInfo = CommandUtils.ParseInteractionToCommand(messageInfo.interaction as ChatInputCommandInteraction);
        } else {
            commandInfo = CommandUtils.ParseContentToCommand(content, SettingsConstants.DEFAULT_PREFIX);
        }

        messageInfo.commandInfo = commandInfo;

        const command = this.GetCommand(commandInfo.command);

        if (command == null) {
            return;
        }

        commandInfo.command = command[0];
        commandInfo.commands = command;

        if (OnboardingHandler.OnCommand(messageInfo)) {
            return;
        } else if (ArtHandler.OnCommand(messageInfo)) {
            return;
        }
    }

    public static GetCommand(command: string) {
        const commandConstants = <{ [key: string]: any }>CommandConstants;

        for (const commandConstantKey in commandConstants) {
            const commandGroup = <{ [key: string]: Array<string> }>commandConstants[commandConstantKey];
            for (const commandGroupKey in commandGroup) {
                if (commandGroup[commandGroupKey].includes(command)) {
                    return commandGroup[commandGroupKey];
                }
            }
        }

        return null;
    }
}
