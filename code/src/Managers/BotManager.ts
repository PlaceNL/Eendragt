import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, ThreadChannel, MessageReaction, User, VoiceState, SelectMenuInteraction } from 'discord.js';
import DiscordUtils from '../Utils/DiscordUtils';
import ThreadHandler from '../Handlers/ThreadHandler';
import ReactionHandler from '../Handlers/ReactionHandler';
import OnboardingHandler from '../Handlers/OnboardingHandler';
import DiplomacyHandler from '../Handlers/DiplomacyHandler';
import NightsWatchManager from './NightsWatchManager';
import NightsWatchHandler from '../Handlers/NightsWatchHandler';
import VariableManager from './VariableManager';
import CommandManager from './CommandManager';
import LogService from '../Services/LogService';
import { LogType } from '../Enums/LogType';
import NominationHandler from '../Handlers/NominationHandler';
import { NominationAction } from '../Enums/NominationAction';
import ArtHandler from '../Handlers/ArtHandler';
import { RoleType } from '../Enums/RoleType';
import ApplicationHandler from '../Handlers/ApplicationHandler';
import VoteHandler from '../Handlers/VoteHandler';
import VoteManager from './VoteManager';
import AutoplacerManager from './AutoplacerManager';

export default class BotManager {

    public static async OnReady() {
        console.log('Eendragt: Connected');
        await VariableManager.InitializeVariables();
        NightsWatchManager.CreateNightCheckInterval();
        VoteManager.CheckOngoingVote();
        AutoplacerManager.Start();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    public static OnReactionAdd(reaction: MessageReaction, user: User) {
        ReactionHandler.OnReaction(reaction);
    }

    public static OnThreadCreate(thread: ThreadChannel) {
        ThreadHandler.OnThread(thread);
    }

    public static async OnInteractionSlashCommand(interaction: ChatInputCommandInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);

        if (interaction.commandName == 'update') {
            CommandManager.UpdateCommands();
            interaction.reply({
                content: 'Done!',
                ephemeral: true
            });

            LogService.Log(LogType.CommandsUpdate, messageInfo.user.id);
            return;
        }

        CommandHandler.OnCommand(messageInfo, '');
    }

    public static async OnInteractionButton(interaction: ButtonInteraction) {
    const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
    const id_parts = interaction.customId.split('_');
    switch(id_parts[0]) {
        case 'onboarding': {
            switch(id_parts[1]) {
                case 'help': OnboardingHandler.OnPlacer(messageInfo);
                case 'diplomacy': OnboardingHandler.OnStartDiplomacyOnboarding(messageInfo);
                case 'observe': OnboardingHandler.OnObserver(messageInfo);
                case 'development': OnboardingHandler.OnDevelopment(messageInfo);
            }
        }
        case 'diplomacy': {
            switch(id_parts[1]) {
                case 'invite': DiplomacyHandler.OnInviteButton(messageInfo);
                case 'peek': DiplomacyHandler.OnPeek(messageInfo);
                case 'report': DiplomacyHandler.OnStartReport(messageInfo);
                case 'claim': DiplomacyHandler.OnClaim(messageInfo, id_parts[2]);
            }
        }
        case 'vote': {
            switch(id_parts[1]) {
                case 'confirm': VoteHandler.OnCreateConfirm(messageInfo, id_parts[2]);
                case 'destroy': VoteHandler.OnDestroy(messageInfo, id_parts[2]);
                case 'choose': VoteHandler.OnChoose(messageInfo, [id_parts[2]], id_parts[3]);
            }
        }
        case 'application': ApplicationHandler.OnApplicationStart(messageInfo, id_parts[1] as RoleType);
        case 'nightswatch': NightsWatchHandler.OnButton(messageInfo);
        case 'coordinate': ArtHandler.OnClaimPixel(messageInfo, id_parts[2]);
        }
    }

    public static async OnInteractionModal(interaction: ModalSubmitInteraction) {
    const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
    const id_parts = interaction.customId.split('_');
    switch(id_parts[0]) {
        case 'onboarding': OnboardingHandler.OnFinishDiplomacyOnboarding(messageInfo);
        case 'diplomacy': DiplomacyHandler.OnFinishReport(messageInfo);
        case 'vote': VoteHandler.OnCreatePreview(messageInfo, id_parts[2]);
        case 'nomination': NominationHandler.OnModal(messageInfo, id_parts[1] as NominationAction, id_parts[2]);
        case 'application': ApplicationHandler.OnApplicationFinish(messageInfo, id_parts[1] as RoleType);
        }
    }

    public static async OnInteractionSelectMenu(interaction: SelectMenuInteraction) {
    const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
    const id_parts = interaction.customId.split('_');
    switch(id_parts[0]) {
        case 'diplomacy': DiplomacyHandler.OnInvite(messageInfo);
        case 'onboarding': OnboardingHandler.OnRoleSelect(messageInfo);
        case 'thread': ThreadHandler.OnTagsSelect(messageInfo);
        case 'vote': VoteHandler.OnChoose(messageInfo, interaction.values, id_parts[2]);
        }
    }

    public static async OnInteractionContextMenuCommand(interaction: SelectMenuInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        CommandHandler.OnCommand(messageInfo, '');
    }

    public static OnVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        DiplomacyHandler.OnVoiceUpdate(oldState, newState);
    }
}
