import IMessageInfo from '../Interfaces/IMessageInfo';
import SettingsConstants from '../Constants/SettingsConstants';
import CommandUtils from '../Utils/CommandUtils';
import { ChatInputCommandInteraction } from 'discord.js';
import OnboardingHandler from './OnboardingHandler';
import ArtHandler from './ArtHandler';
import VariableHandler from './VariableHandler';
import NominationHandler from './NominationHandler';
import DiplomacyHandler from './DiplomacyHandler';
import BillyHandler from './BillyHandler';
import RoleHandler from './RoleHandler';
import ThreadHandler from './ThreadHandler';
import ApplicationHandler from './ApplicationHandler';
import VoteHandler from './VoteHandler';

export default class CommandHandler {

    public static OnCommand(messageInfo: IMessageInfo, content: string) {
        let commandInfo;

        if (messageInfo.interaction != null) {
            commandInfo = CommandUtils.ParseInteractionToCommand(messageInfo.interaction as ChatInputCommandInteraction);
        } else {
            commandInfo = CommandUtils.ParseContentToCommand(content, SettingsConstants.DEFAULT_PREFIX);
        }

        messageInfo.commandInfo = commandInfo;

        if (OnboardingHandler.OnCommand(messageInfo)) {
            return;
        }

        if (VoteHandler.OnCommand(messageInfo)) {
            return;
        }

        if (ArtHandler.OnCommand(messageInfo)) {
            return;
        }

        if (DiplomacyHandler.OnCommand(messageInfo)) {
            return;
        }

        if (RoleHandler.OnCommand(messageInfo)) {
            return;
        }

        if (ApplicationHandler.OnCommand(messageInfo)) {
            return;
        }

        if (ThreadHandler.OnCommand(messageInfo)) {
            return;
        }

        if (VariableHandler.OnCommand(messageInfo)) {
            return;
        }

        if (NominationHandler.OnCommand(messageInfo)) {
            return;
        }

        if (BillyHandler.OnCommand(messageInfo)) {
            return;
        }
    }
}
