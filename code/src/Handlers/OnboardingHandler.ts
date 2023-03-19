import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import DiplomacyEmbeds from '../Embeds/DiplomacyEmbeds';
import OnboardingEmbeds from '../Embeds/OnboardingEmbeds';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import DiscordService from '../Services/DiscordService';
import LogService from '../Services/LogService';
import MessageService from '../Services/MessageService';
import { Utils } from '../Utils/Utils';

export default class OnboardingHandler {

    public static OnCommand(messageInfo: IMessageInfo) {
        const commands = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commands.ONBOARDING:
                this.OnOnboarding(messageInfo);
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
        messageInfo.member.roles.add(SettingsConstants.ROLES.DEVELOPMENT_ID);
        (<ChatInputCommandInteraction>messageInfo.interaction).reply({
            content: `<#${SettingsConstants.CHANNELS.BOT_SUPPORT_ID}>`,
            ephemeral: true
        });

        LogService.Log(LogType.OnboardingDevelopment, messageInfo.user.id);
    }

    public static OnStartDiplomacyOnboarding(messageInfo: IMessageInfo) {
        try {
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

            (messageInfo.interaction as ButtonInteraction).showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingDiplomatStart, messageInfo.user.id);
            return;
        }
    }

    public static async OnFinishDiplomacyOnboarding(messageInfo: IMessageInfo) {
        try {
            const interaction = <ModalSubmitInteraction>messageInfo.interaction;
            interaction.deferUpdate();
            const name = interaction.fields.getTextInputValue('name');
            const size = interaction.fields.getTextInputValue('size');
            const description = interaction.fields.getTextInputValue('description');

            if (!interaction.inCachedGuild()) {
                return;
            }

            await interaction.member.roles.add(SettingsConstants.ROLES.DIPLOMAT_ID);

            await Utils.Sleep(.25);

            const diplomacyThreadsChannel = (await DiscordService.FindChannelById(SettingsConstants.CHANNELS.DIPLOMACY_THREADS_ID)) as TextChannel;
            const thread = await diplomacyThreadsChannel.threads.create({
                name: name,
                autoArchiveDuration: Utils.GetHoursInMinutes(24),
                type: ChannelType.PrivateThread,
                invitable: false
            });

            const time = new Date().toLocaleTimeString('nl-NL', { timeZone: 'Europe/Amsterdam' });

            let formattedTime: string = null;
            const timeParts = time.split(':');
            const hours = parseInt(timeParts[0]);
            if (hours >= SettingsConstants.TIME.NIGHT_START && hours < SettingsConstants.TIME.NIGHT_END) {
                formattedTime = `${timeParts[0]}:${timeParts[1]} AM`;
            }

            const components = new ActionRowBuilder<UserSelectMenuBuilder>()
                .addComponents(new UserSelectMenuBuilder()
                    .setCustomId('diplomacy_invite')
                    .setMaxValues(2));

            const message = await thread.send({
                content: `${messageInfo.user}!`,
                allowedMentions: { users: [messageInfo.user.id] },
                embeds: [DiplomacyEmbeds.GetWelcomeEmbed(messageInfo.user.username, name, size, description, formattedTime)],
                components: [components]
            });

            message.pin();

            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`diplomacy_claim_${thread.id}`)
                        .setLabel('Ik pak dit op!')
                        .setStyle(ButtonStyle.Primary),
                );

            const diplomacyDispatchChannel = (await DiscordService.FindChannelById(SettingsConstants.CHANNELS.DIPLOMACY_DISPATCH_ID)) as TextChannel;
            await diplomacyDispatchChannel.send({
                embeds: [DiplomacyEmbeds.GetDispatchEmbed(name, size, description, thread.url)],
                components: [actionRow]
            });
            LogService.Log(LogType.OnboardingDiplomat, messageInfo.user.id, 'Thread', thread.id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingDiplomat, messageInfo.user.id);
        }
    }

    private static OnOnboarding(messageInfo: IMessageInfo) {
        try {
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('onboarding_help')
                        .setLabel('Om te helpen')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('onboarding_diplomacy')
                        .setLabel('I\'m here for diplomacy')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('onboarding_observe')
                        .setLabel('Om te kijken / To observe')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('onboarding_development')
                        .setLabel('Bot development/support')
                        .setStyle(ButtonStyle.Secondary)
                );

            MessageService.ReplyEmbed(messageInfo, OnboardingEmbeds.GetWelcomeEmbed(), null, [actionRow]);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingCreate, messageInfo.user.id);
            return;
        }

        LogService.Log(LogType.OnboardingCreate, messageInfo.user.id);
    }
}