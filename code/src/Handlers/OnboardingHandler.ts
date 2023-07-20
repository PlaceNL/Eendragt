import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ModalBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import OnboardingEmbeds from '../Embeds/OnboardingEmbeds';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';
import DiplomacyHandler from './DiplomacyHandler';
import LanguageLoader from '../Utils/LanguageLoader';

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
        const interaction = <ChatInputCommandInteraction>messageInfo.interaction;

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('onboarding_roles')
                    .setPlaceholder(LanguageLoader.LangConfig.ROLE_SELECTOR_PLACEHOLDER)
                    .setMinValues(1)
                    .setMaxValues(2)
                    .addOptions(
                        {
                            // TODO: Introduce constants for roles
                            label: 'Soldaat',
                            value: 'soldaat'
                        },
                        {
                            label: 'Bouwer',
                            value: 'bouwer'
                        },
                    )
            );

        messageInfo.member.roles.add(SettingsConstants.ROLES.PLACER_ID);
        (interaction).reply({
            embeds: [OnboardingEmbeds.GetPlacerEmbed()],
            ephemeral: true,
            components: [actionRow]
        });

        LogService.Log(LogType.OnboardingPlacer, messageInfo.user.id);
    }

    public static OnObserver(messageInfo: IMessageInfo) {
        messageInfo.member.roles.add(SettingsConstants.ROLES.OBSERVER_ID);
        (<ChatInputCommandInteraction>messageInfo.interaction).reply({
            content: `${LanguageLoader.LangConfig.ONBOARDING_OBSERVE}\nFeel free to look around.`,
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

    public static OnConfirmNewDiplomacyOnboarding(messageInfo: IMessageInfo) {
        const interaction = <ButtonInteraction> messageInfo.interaction;
        if (!interaction.inCachedGuild()) {
            return;
        }

        try {
            if (interaction.member.roles.cache.has(SettingsConstants.ROLES.DIPLOMAT_ID)) {
                interaction.reply({
                    content: 'Your community already has a diplomacy thread here.',
                    ephemeral: true,
                });

                return;
            }

            const actionRowButtons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('onboarding_diplomacy_new')
                        .setLabel('Yes, I am the first')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('onboarding_diplomacy_exist')
                        .setLabel('No, I want to join the conversation')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('onboarding_diplomacy_unsure')
                        .setLabel('I\'m not sure...')
                        .setStyle(ButtonStyle.Secondary),
                );

            interaction.reply({
                content: 'Are you the first diplomat here of your community?',
                components: [actionRowButtons],
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingDiplomatInit, messageInfo.user.id);
            return;
        }
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

    public static OnRequestDiplomacyCommunityName(messageInfo: IMessageInfo) {
        const interaction = <ButtonInteraction> messageInfo.interaction;
        if (!interaction.inCachedGuild()) {
            return;
        }

        try {
            const interaction = <ButtonInteraction> messageInfo.interaction;
            if (!interaction.inCachedGuild()) {
                return;
            }

            const modal = new ModalBuilder()
                .setCustomId('onboarding_diplomacy_check')
                .setTitle('Diplomacy');

            const inputName = new TextInputBuilder()
                .setCustomId('name')
                .setLabel('What is the name of your community?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(100);

            const components = [new ActionRowBuilder<TextInputBuilder>().addComponents(inputName)];

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

    public static OnFinishDiplomacyOnboardingCheck(messageInfo: IMessageInfo) {
        DiplomacyHandler.OnDiplomacyCheck(messageInfo);
    }

    public static OnRoleSelect(messageInfo: IMessageInfo) {
        const interaction = messageInfo.interaction as StringSelectMenuInteraction;

        try {
            const roles = interaction.values;

            for (const role of roles) {
                switch (role) {
                    case 'soldaat':
                        messageInfo.member.roles.add(SettingsConstants.ROLES.SOLDIER_ID);
                        break;
                    case 'bouwer':
                        messageInfo.member.roles.add(SettingsConstants.ROLES.BUILDER_ID);
                        break;
                }
            }
            const rolesString = `${roles.slice(0, -1).map(r => `\`${r.toTitleCase()}\``).join(', ')} \
${roles.length > 1 ? 'en ' : ''}\`${roles[roles.length - 1].toTitleCase()}\``;
            const content = LanguageLoader.LangConfig.ONBOARDING_ROLES_GIVEN
                .replace('{plural}', roles.length > 1 ? 'len' : '')
                .replace('{roles}', rolesString);
            interaction.reply({
                content: content,
                ephemeral: true,
            });

            LogService.Log(LogType.OnboardingRoles, messageInfo.user.id, 'Roles', interaction.values.join(', '));
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.OnboardingRoles, messageInfo.user.id, 'Roles', interaction.values.join(', '));
        }
    }

    private static async OnCreateOnboarding(messageInfo: IMessageInfo) {
        try {
            const actionRowButtons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('onboarding_help')
                        .setLabel(LanguageLoader.LangConfig.I_WANT_TO_HELP)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('onboarding_diplomacy')
                        .setLabel('🤝 I\'m a foreign diplomat')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('onboarding_observe')
                        .setLabel('👀 I\'m here to observe')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('onboarding_development')
                        .setLabel('💻 I\'m here for development/support')
                        .setStyle(ButtonStyle.Secondary)
                );

            const interaction = messageInfo.interaction as ChatInputCommandInteraction;

            await interaction.channel.send({
                embeds: [OnboardingEmbeds.GetWelcomeEmbed()],
                components: [actionRowButtons]
            });

            interaction.reply({
                content: LanguageLoader.LangConfig.DONE,
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