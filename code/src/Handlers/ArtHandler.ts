import { Attachment, ChatInputCommandInteraction } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import IResultInfo from '../Interfaces/IResultInfo';
import MessageService from '../Services/MessageService';
import { getPixels } from 'ndarray-pixels';
import ArtEmbeds from '../Embeds/ArtEmbeds';
import { Utils } from '../Utils/Utils';
import SuggestionHandler from './SuggestionHandler';
import DiplomacyHandler from './DiplomacyHandler';
import LogService from '../Services/LogService';
import { LogType } from '../Enums/LogType';
import VariableManager from '../Managers/VariableManager';
import { VariableKey } from '../Enums/VariableKey';

const fetch = require('cross-fetch');

export default class ArtHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.VALIDATE:
                this.OnValidate(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    private static async OnValidate(messageInfo: IMessageInfo) {
        try {
            const attachment = (<ChatInputCommandInteraction>messageInfo.interaction).options.get('art')?.attachment;

            if (messageInfo.channel.isThread()) {
                if (messageInfo.channel.parentId == SettingsConstants.CHANNELS.SUGGESTIONS_ID) {
                    const resultInfo = await this.IsLegitArt(attachment);
                    SuggestionHandler.OnValidateArt(messageInfo, resultInfo, attachment);
                    return;
                } else if (messageInfo.channel.parentId == SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID) {
                    const resultInfo = await this.IsLegitArt(attachment, true);
                    DiplomacyHandler.OnValidateArt(messageInfo, resultInfo, attachment);
                    return;
                }
            }

            const resultInfo = await this.IsLegitArt(attachment);
            if (!resultInfo.result) {
                MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetInvalidArtEmbed(resultInfo.reason), null, null, null, true);
                LogService.Log(LogType.ValidateArtBad, messageInfo.member.id, 'Channel', messageInfo.channel.id);
                return;
            }

            await MessageService.ReplyEmbed(messageInfo, ArtEmbeds.GetValidArtEmbed(attachment.url));
            LogService.Log(LogType.ValidateArtGood, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.ValidateArt, messageInfo.member.id, 'Channel', messageInfo.channel.id);
        }
    }

    private static async IsLegitArt(attachment: Attachment, english: boolean = false) {
        const resultInfo: IResultInfo = {
            result : false
        };

        if (!attachment.url.toLowerCase().endsWith('.png')) {
            resultInfo.reason = english ? 'It\'s not in PNG format' : 'Het is geen PNG formaat';
            return resultInfo;
        }

        const bytesIn = await fetch(attachment.url)
            .then((res: any) => res.arrayBuffer())
            .then((arrayBuffer: any) => new Uint8Array(arrayBuffer));

        const pixels = await getPixels(bytesIn, 'image/png');
        let transparent = false;

        for (let x = 0; x < pixels.shape[0]; x++) {
            for (let y = 0; y < pixels.shape[1]; y++) {
                const r = pixels.get(x, y, 0);
                const g = pixels.get(x, y, 1);
                const b = pixels.get(x, y, 2);
                const a = pixels.get(x, y, 3);
                if (a == 0) {
                    transparent = true;
                }

                const hex = Utils.RGBAToHex(r, g,b);

                if (!VariableManager.Get(VariableKey.ValidColors).includes(hex)) {
                    resultInfo.reason = english
                        ? `The color ${hex} at position (${x}, ${y}) is not allowed.`
                        : `De kleur ${hex} op positie (${x}, ${y}) is niet toegestaan.`;
                    return resultInfo;
                }
            }
        }

        if (!transparent) {
            resultInfo.reason = english
                ? 'You don\'t have a transparent background. Is your art square? Give it a transparent border around it.'
                : 'Je hebt geen transparante achtergrond. Is je art vierkant? Geef deze dan een transparante rand eromheen.';
            return resultInfo;
        }

        resultInfo.result = true;
        return resultInfo;
    }
}