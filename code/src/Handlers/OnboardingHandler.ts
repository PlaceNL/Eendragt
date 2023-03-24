import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import OnboardingEmbeds from '../Embeds/OnboardingEmbeds';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import DiplomacyHandler from './DiplomacyHandler';

export default class OnboardingHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.ONBOARDING:
                this.OnCreateOnboarding(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static OnPlacer(messageInfo: IMessageInfo) {
        messageInfo.member.roles.add(SettingsConstants.ROLES.PLACER_ID);
        (<ChatInputCommandInteraction>messageInfo.interaction).reply({
            content: 'Fijn dat je komt helpen!',
            ephemeral: true
        });

        LogService.Log(LogType.OnboardingPlacer, messageInfo.user.id);
    }

    public static OnObserver(messageInfo: IMessageInfo) {
        messageInfo.member.roles.add(SettingsConstants.ROLES.OBSERVER_ID);
        (<ChatInputCommandInteraction>messageInfo.interaction).reply({
            content: 'Kijk gerust even rond.\nFeel free to look around.',
            ephemeral: true
        });

        LogService.Log(LogType.OnboardingObserver, messageInfo.user.id);
    }

    public static OnDevelopment(messageInfo: IMessageInfo) {
        // TODO: You already had this role
        messageInfo.member.roles.add(SettingsConstants.ROLES.DEVELOPMENT_ID);
        (<ChatInputCommandInteraction>messageInfo.interaction).reply({
            content: `<#${SettingsConstants.CHANNELS.BOT_SUPPORT_ID}>`,
            ephemeral: true
        });

        LogService.Log(LogType.OnboardingDevelopment, messageInfo.user.id);
    }

    public static OnStartDiplomacyOnboarding(messageInfo: IMessageInfo) {
        const interaction = <ButtonInteraction> messageInfo.interaction;
        if (!interaction.inCachedGuild()) {
            return;
        }

        try {
            const interaction = <ButtonInteraction> messageInfo.interaction;
            if (!interaction.inCachedGuild()) {
                return;
            }

            if (interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMAT_ID)) {
                interaction.reply({
                    content: 'You already have a diplomacy thread here.',
                    ephemeral: true,
                });

                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('onboarding_diplomacy')
                .setTitle('Diplomacy');

            const inputName = new TextInputBuilder()
                .setCustomId('name')
                .setLabel('What is the name of your community?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(100);

            const inputSize = new TextInputBuilder()
                .setCustomId('size')
                .setLabel('How big is your community?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(20);

            const inputDiscuss = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Why do you want to discuss diplomacy with us?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(50)
                .setMaxLength(1000);

            const inputBuilders = [inputName, inputSize, inputDiscuss];
            const components = [];

            for (const inputBuilder of inputBuilders) {
                components.push(new ActionRowBuilder<TextInputBuilder>().addComponents(inputBuilder));
            }

            modal.addComponents(...components);

            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingDiplomatStart, messageInfo.user.id);
            return;
        }
    }

    public static OnFinishDiplomacyOnboarding(messageInfo: IMessageInfo) {
        DiplomacyHandler.OnStartDiplomacy(messageInfo);
    }

    private static async OnCreateOnboarding(messageInfo: IMessageInfo) {
        try {
            const actionRowButtons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('onboarding_help')
                        .setLabel('🌷 Ik wil meehelpen!')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('onboarding_diplomacy')
                        .setLabel('🤝 I\'m a foreign diplomat')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('onboarding_observe')
                        .setLabel('👀 To observe')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('onboarding_development')
                        .setLabel('🤖 Bot development/support')
                        .setStyle(ButtonStyle.Secondary)
                );

            const interaction = messageInfo.interaction as ChatInputCommandInteraction;

            await interaction.channel.send({
                embeds: [OnboardingEmbeds.GetWelcomeEmbed()],
                components: [actionRowButtons]
            });

            interaction.reply({
                content: 'Done!',
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingCreate, messageInfo.user.id);
            return;
        }

        LogService.Log(LogType.OnboardingCreate, messageInfo.user.id);
    }
}