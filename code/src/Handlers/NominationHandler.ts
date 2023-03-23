import { ActionRowBuilder, ContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import NominationEmbeds from '../Embeds/NominationEmbeds';
import { LogType } from '../Enums/LogType';
import { NominationAction as NominationAction } from '../Enums/NominationAction';
import IMessageInfo from '../Interfaces/IMessageInfo';
import LogService from '../Services/LogService';

export default class NominationHandler {

    private static readonly titles: {[key in NominationAction]: string} = {
        approve:  'Goedkeuren',
        decline:  'Afwijzen',
        delay:  'Uitstellen',
        vote:  'Stembus',
    };

    private static readonly defaultMessages: {[key in NominationAction]: string} = {
        approve:  'We gaan het regelen.',
        decline:  'Dit is niet mogelijk.',
        delay:  'Hier is momenteel nog geen tijd/plek voor.',
        vote:  'Deze suggestie wordt meegenomen in de volgende stemronde.',
    };

    public static OnCommand(messageInfo: IMessageInfo) {
        const menuCommands = CommandConstants.MENU;

        switch (messageInfo.commandInfo.command) {
            case menuCommands.APPROVE:
                this.OnApprove(messageInfo);
                break;
            case menuCommands.DECLINE:
                this.OnDecline(messageInfo);
                break;
            case menuCommands.DELAY:
                this.OnDelay(messageInfo);
                break;
            case menuCommands.VOTE:
                this.OnVote(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static OnModal(messageInfo: IMessageInfo, action: NominationAction, messageId: string) {
        const interaction = <ModalSubmitInteraction> messageInfo.interaction;

        const confirm = interaction.fields.getTextInputValue('confirm');
        if (confirm.toLowerCase() != this.titles[action].toLowerCase()) {
            interaction.reply({ content: 'Bevestiging incorrect.', ephemeral: true });
            return;
        }

        let addition = (<ModalSubmitInteraction> messageInfo.interaction).fields.getTextInputValue('addition');

        if (!addition?.isFilled()) {
            addition = this.defaultMessages[action];
        }

        const message = (<TextChannel> messageInfo.channel).messages.cache.get(messageId);
        const embed = message.embeds[0];

        message.edit({ embeds: [NominationEmbeds.GetActionEmbed(embed.title, embed.author.name, embed.description, action, addition)] });

        interaction.reply({ content: 'Done!', ephemeral: true });
    }

    private static OnApprove(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ContextMenuCommandInteraction;
            const modal = this.CreateModal(interaction.targetId, NominationAction.Approve, true);
            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.NominationApproveStart, messageInfo.user.id, 'Message', messageInfo.message.id);
            return;
        }
    }

    private static OnDecline(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ContextMenuCommandInteraction;
            const modal = this.CreateModal(interaction.targetId, NominationAction.Decline, false);
            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.NominationDeclineStart, messageInfo.user.id, 'Message', messageInfo.message.id);
            return;
        }
    }

    private static OnDelay(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ContextMenuCommandInteraction;
            const modal = this.CreateModal(interaction.targetId, NominationAction.Delay, false);
            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.NominationDelayStart, messageInfo.user.id, 'Message', messageInfo.message.id);
            return;
        }
    }

    private static OnVote(messageInfo: IMessageInfo) {
        try {
            const interaction = messageInfo.interaction as ContextMenuCommandInteraction;
            const modal = this.CreateModal(interaction.targetId, NominationAction.Vote, true);
            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.NominationVoteStart, messageInfo.user.id, 'Message', messageInfo.message.id);
            return;
        }
    }

    private static CreateModal(id: string, action: NominationAction, additionOptional: boolean) {
        const customId = `nomination_${action}_${id}`;
        const title = this.titles[action];

        const modal = new ModalBuilder()
            .setCustomId(customId)
            .setTitle(title);

        const inputConfirm = new TextInputBuilder()
            .setCustomId('confirm')
            .setLabel(`Typ "${title}" om je keuze te bevestigen`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder(title)
            .setMaxLength(title.length)
            .setMinLength(title.length);

        const inputAddition = new TextInputBuilder()
            .setCustomId('addition')
            .setLabel(additionOptional ? 'Optionele toelichting' : 'Licht je keuze toe')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(additionOptional)
            .setPlaceholder(this.defaultMessages[action])
            .setMinLength(10)
            .setMaxLength(1000);

        const inputBuilders = [inputConfirm, inputAddition];
        const components = [];

        for (const inputBuilder of inputBuilders) {
            components.push(new ActionRowBuilder<TextInputBuilder>().addComponents(inputBuilder));
        }

        modal.addComponents(...components);

        return modal;
    }
}