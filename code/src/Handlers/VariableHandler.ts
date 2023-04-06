import { ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { LogType } from '../Enums/LogType';
import { VariableKey } from '../Enums/VariableKey';
import IMessageInfo from '../Interfaces/IMessageInfo';
import VariableManager from '../Managers/VariableManager';
import LogService from '../Services/LogService';
import LanguageLoader from '../Utils/LanguageLoader';

export default class VariableHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.VARIABLE.COMMAND:
                this.OnVariable(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    private static OnVariable(messageInfo: IMessageInfo) {
        const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
        const subCommand = interaction.options.getSubcommand();

        const commands = CommandConstants.SLASH.VARIABLE;

        switch (subCommand) {
            case commands.SET:
                this.OnSet(messageInfo);
                break;
            case commands.GET:
                this.OnGet(messageInfo);
                break;
            case commands.GETALL:
                this.OnGetAll(messageInfo);
                break;
            default: return false;
        }
    }

    private static async OnSet(messageInfo: IMessageInfo) {
        try {
            const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
            const name = interaction.options.getString('naam');
            const value = interaction.options.getString('waarde');

            const resultInfo = await VariableManager.Set(name as VariableKey, value);

            if (resultInfo.result) {
                await interaction.reply(`\`${name}\` is nu \`${value}\``);
            } else {
                await interaction.reply({
                    content: resultInfo.reason,
                    ephemeral: true
                });
            }

            LogService.Log(LogType.VariableSet, messageInfo.user.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VariableSet, messageInfo.user.id);
        }
    }

    private static async OnGet(messageInfo: IMessageInfo) {
        try {
            const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
            const name = interaction.options.getString('naam');

            const value = await VariableManager.Get(name as VariableKey);

            const text = LanguageLoader.LangConfig.VARIABLES_THE_VALUE_OF_VAR_IS
                .replace('{name}', name)
                .replace('{value}', `${value}`);
            await interaction.reply(text);

            LogService.Log(LogType.VariableSet, messageInfo.user.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VariableSet, messageInfo.user.id);
        }
    }

    private static async OnGetAll(messageInfo: IMessageInfo) {
        try {
            const interaction = <ChatInputCommandInteraction> messageInfo.interaction;

            const values = VariableManager.GetAll();

            let message = '';
            for (const [key, value] of Object.entries(values)) {
                message += `\`${key}\`: \`${value.value}\`\n`;
            }

            await interaction.reply(message);

            LogService.Log(LogType.VariableGetAll, messageInfo.user.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VariableGetAll, messageInfo.user.id);
        }
    }
}