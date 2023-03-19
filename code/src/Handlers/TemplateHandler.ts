import { ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import { LogType } from '../Enums/LogType';
import { VariableKey } from '../Enums/VariableKey';
import IMessageInfo from '../Interfaces/IMessageInfo';
import VariableManager from '../Managers/VariableManager';
import LogService from '../Services/LogService';
const { createCanvas, loadImage } = require('canvas');

export default class TemplateHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.TEMPLATE:
                this.OnTemplate(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    private static async OnTemplate(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ChatInputCommandInteraction;
            const image = interaction.options.get('image')?.attachment;
            const x = interaction.options.getNumber('x');
            const y = interaction.options.getNumber('y');

            const imageObject = await loadImage(image.url);

            const canvas = createCanvas(VariableManager.Get(VariableKey.CanvasWidth), VariableManager.Get(VariableKey.CanvasHeight));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imageObject, x, y);

            interaction.reply({
                content: 'Alsjeblieft :)',
                files: [{ attachment: canvas.toBuffer(), name: `template_${image.name}`}]
            });

            LogService.Log(LogType.TemplateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.TemplateCreate, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }
}