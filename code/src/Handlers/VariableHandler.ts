import { ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { LogType } from '../Enums/LogType';
import { VariableKey } from '../Enums/VariableKey';
import IMessageInfo from '../Interfaces/IMessageInfo';
import VariableManager from '../Managers/VariableManager';
import LogService from '../Services/LogService';

export default class VariableHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.COMMANDS;

        switch (messageInfo.commandInfo.command) {
            case commands.VARIABLE:
                this.OnVariable(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    private static async OnVariable(messageInfo: IMessageInfo) {
        try {
            const interaction = <ChatInputCommandInteraction> messageInfo.interaction;
            const name = interaction.options.getString('naam');
            const value = interaction.options.getString('waarde');

            const resultInfo = await VariableManager.Set(name as VariableKey, value);

            if (resultInfo.result) {
                await interaction.reply(`${name} is nu ${value}`);
            } else {
                await interaction.reply({
                    content: resultInfo.reason,
                    ephemeral: true
                });
            }

            LogService.Log(LogType.VariableUpdate, messageInfo.user.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VariableUpdate, messageInfo.user.id);
        }
    }
}