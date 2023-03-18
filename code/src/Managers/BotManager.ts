import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { Message, ButtonInteraction, ChannelType, ModalSubmitInteraction, ChatInputCommandInteraction, ThreadChannel, MessageReaction, User, SelectMenuInteraction } from 'discord.js';
import DiscordUtils from '../Utils/DiscordUtils';
import SettingsConstants from '../Constants/SettingsConstants';
import MessageService from '../Services/MessageService';
import MessageHandler from '../Handlers/MessageHandler';
import CommandManager from './CommandManager';
import ReactionHandler from '../Handlers/ReactionHandler';
import OnboardingHandler from '../Handlers/OnboardingHandler';
import DiplomacyHandler from '../Handlers/DiplomacyHandler';

export default class BotManager {

    public static OnReady() {
        console.log('Eendragt: Connected');
    }

    public static OnMessageCreate(message: Message) {
        const messageInfo: IMessageInfo = DiscordUtils.ParseMessageToInfo(message, message.author);

        if (messageInfo.channel.type == ChannelType.DM) {
            if (messageInfo.user.id == SettingsConstants.MASTER_ID) {
                if (messageInfo.message.content == '>update-slash-commands') {
                    CommandManager.UpdateSlashCommands();
                    MessageService.ReplyMessage(messageInfo, 'Done!');
                }
            }
            return;
        }

        const content = message.content.trim();

        if (!content.startsWith(SettingsConstants.DEFAULT_PREFIX)) {
            MessageHandler.OnMessage(messageInfo);
            return;
        }

        CommandHandler.OnCommand(messageInfo, content);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    public static OnReactionAdd(reaction: MessageReaction, user: User) {
        ReactionHandler.OnReaction(reaction);
    }

    public static OnThreadCreate(thread: ThreadChannel) {
        MessageHandler.OnThread(thread);
    }

    public static async OnInteractionCommand(interaction: ChatInputCommandInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);

        if (messageInfo.channel == null) {
            MessageService.ReplyMessage(messageInfo, 'Oeps, dat ging fout.');
            return;
        }
        CommandHandler.OnCommand(messageInfo, '');
    }

    public static async OnInteractionButton(interaction: ButtonInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        if (interaction.customId == 'onboarding_help') {
            OnboardingHandler.OnPlacer(messageInfo);
        } else if (interaction.customId == 'onboarding_diplomacy') {
            OnboardingHandler.OnStartDiplomacyOnboarding(messageInfo);
        } else if (interaction.customId == 'onboarding_observe') {
            OnboardingHandler.OnObserver(messageInfo);
        } else if (interaction.customId == 'onboarding_development') {
            OnboardingHandler.OnDevelopment(messageInfo);
        } else if (interaction.customId == 'diplomacy_report') {
            DiplomacyHandler.OnStartReport(messageInfo);
        } else if (interaction.customId.startsWith('diplomacy_claim')) {
            const id = interaction.customId.split('_')[2];
            DiplomacyHandler.OnClaim(messageInfo, id);
        }
    }

    public static async OnInteractionModal(interaction: ModalSubmitInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        if (interaction.customId == 'onboarding_diplomacy') {
            OnboardingHandler.OnFinishDiplomacyOnboarding(messageInfo);
        } else if (interaction.customId == 'diplomacy_report') {
            DiplomacyHandler.OnFinishReport(messageInfo);
        }
    }

    public static async OnInteractionSelectMenu(interaction: SelectMenuInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        if (interaction.customId == 'diplomacy_invite') {
            DiplomacyHandler.OnInvite(messageInfo);
        }
    }
}
