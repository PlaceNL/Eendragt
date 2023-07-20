import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Message, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import VoteEmbeds from '../Embeds/VoteEmbeds';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import VoteManager from '../Managers/VoteManager';
import LogService from '../Services/LogService';
import LanguageLoader from '../Utils/LanguageLoader';

const fetch = require('cross-fetch');

export default class VoteHandler {

    private static readonly messageCache: Map<string, Message> = new Map();

    public static OnCommand(messageInfo: IMessageInfo) {
        const commandsSlash = CommandConstants.SLASH;

        switch (messageInfo.commandInfo.command) {
            case commandsSlash.VOTE:
                this.OnVoteCommand(messageInfo);
                break;
            default: return false;
        }

        return true;
    }

    public static async OnChoose(messageInfo: IMessageInfo, choices: Array<string>, id: string) {
        const interaction = messageInfo.interaction as ButtonInteraction;

        try {
            const data: any = await VoteManager.GetData(id);

            if (data == null) {
                interaction.reply({
                    content: LanguageLoader.LangConfig.VOTING_CANT_VOTE_FOR_THIS_ANYMORE,
                    ephemeral: true,
                });

                return;
            }

            const previousChoice = VoteManager.GetChoice(id, interaction.user.id);

            VoteManager.SetChoice(id, interaction.user.id, choices);

            if (choices.length > 1) {
                const sentence = `${choices.slice(0, -1).map(v => data.options[v])
                    .join(', ')} ${LanguageLoader.LangConfig.AND} ${data.options[choices[choices.length - 1]]}`;

                interaction.reply({
                    content: `${previousChoice == null
                        ? LanguageLoader.LangConfig.VOTING_VOTED_FOR
                        : LanguageLoader.LangConfig.VOTING_VOTE_CHANGED_TO} **${sentence}**!`,
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    content: `${previousChoice == null
                        ? LanguageLoader.LangConfig.VOTING_VOTED_FOR
                        : LanguageLoader.LangConfig.VOTING_VOTE_CHANGED_TO} **${data.options[choices[0]]}**!
${data.options.length > 2 ? `*${LanguageLoader.LangConfig.VOTING_YOU_CAN_VOTE_ON_MULTIPLE}*` : ''}`,
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VoteChoose, interaction.user.id, 'Vote ID', id);
        }
    }

    public static async OnCreatePreview(messageInfo: IMessageInfo, id: string) {
        const interaction = messageInfo.interaction as ModalSubmitInteraction;

        try {
            if (!interaction.inCachedGuild()) {
                return;
            }

            let description = interaction.fields.getTextInputValue('description');
            const optionsRawString = interaction.fields.getTextInputValue('options');
            const options = optionsRawString.split('\n');

            const max = SettingsConstants.VOTE_OPTIONS_MAX;
            if (options.length > max) {
                interaction.reply({
                    content: LanguageLoader.LangConfig.VOTING_CAN_ONLY_ADD_MAX_OPTION.replace('{max}', `${max}`),
                    ephemeral: true,
                });

                return;
            }

            if (!description?.isFilled()) {
                description = options.length > 1
                    ? LanguageLoader.LangConfig.VOTING_VOTE_FOR_YOUR_FAVOURITE
                    : LanguageLoader.LangConfig.VOTING_WHICH_SUGGESTION_WOULD_YOU_LIKE;
            }

            const buttonComponents = new Array<ButtonBuilder>();

            let optionString = '';
            const onlyOptions = [];

            if (options.length > 1) {
                // The user can select from multiple options.

                // Add styling to the options. Everything after :: is context.
                optionString = options.map((option) => {
                    const split = option.split('::');
                    onlyOptions.push(split[0]);

                    return `**${split[0]}**${split[1] == null ? '' : `\n*${split[1]}*`}\n`;
                }).join('\n');

                for (let i = 0; i < options.length; i++) {
                    buttonComponents.push(new ButtonBuilder()
                        .setCustomId(`vote_choose_${i}_${id}`)
                        .setLabel(options[i].split('::')[0])
                        .setStyle(ButtonStyle.Primary),
                    );
                }
            } else {
                // No options added. This is a yes/no vote.
                onlyOptions.push(LanguageLoader.LangConfig.YES);
                onlyOptions.push(LanguageLoader.LangConfig.NO);
                buttonComponents.push(new ButtonBuilder()
                    .setCustomId(`vote_choose_0_${id}`)
                    .setLabel(LanguageLoader.LangConfig.YES)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`vote_choose_1_${id}`)
                    .setLabel(LanguageLoader.LangConfig.NO)
                    .setStyle(ButtonStyle.Danger),
                );
            }

            const components = [];

            const actionButtonRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(...buttonComponents);

            const menuOptions = onlyOptions.map((option, index) => {
                return {
                    label: option,
                    value: index.toString(),
                };
            });

            components.push(actionButtonRow);

            if (onlyOptions.length > 2) {
                const actionSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(new StringSelectMenuBuilder()
                        .setCustomId(`vote_choose_${id}`)
                        .setPlaceholder(LanguageLoader.LangConfig.VOTING_OR_VOTE_FOR_MULTIPLE)
                        .setMinValues(1)
                        .setMaxValues(onlyOptions.length - 1)
                        .addOptions(menuOptions));

                components.push(actionSelectRow);
            }

            const data = await VoteManager.GetData(id);

            const imageResponse = await fetch(data.image);
            const imageArrayBuffer = await imageResponse.arrayBuffer();
            const imageBuffer = Buffer.from(imageArrayBuffer);

            const confirmRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(new ButtonBuilder()
                    .setLabel(LanguageLoader.LangConfig.VOTING_YES_SEND_IT)
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`vote_confirm_${id}`))
                .addComponents(new ButtonBuilder()
                    .setLabel(LanguageLoader.LangConfig.VOTING_NO_TRY_AGAIN)
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`vote_destroy_${id}`));

            components.push(confirmRow);

            const reply = await interaction.reply({
                content: `**__${LanguageLoader.LangConfig.VOTING_THIS_IS_A_PREVIEW}__**\n\n${LanguageLoader.LangConfig.VOTING_DOES_IT_LOOK_GOOD}`,
                embeds: [VoteEmbeds.GetVotingEmbed(description, optionString, 'attachment://image.png', parseInt(data.time))],

                components: components,
                ephemeral: true,
                files: [{ attachment: imageBuffer, name: 'image.png' }],
            });

            const message = await reply.fetch();

            data.options = onlyOptions;
            data.description = description;
            data.options_string = optionsRawString;

            VoteManager.SetData(id, data);

            this.messageCache.set(id, message);
            VoteManager.CreateChoiceCache(id);

            LogService.Log(LogType.VoteCreatePreview, interaction.user.id, 'Vote ID', id);
        } catch(error) {
            console.error(error);
            LogService.Error(LogType.VoteCreatePreview, interaction.user.id, 'Vote ID', id);
        }
    }

    public static async OnCreateConfirm(messageInfo: IMessageInfo, id: string) {
        const interaction = messageInfo.interaction as ModalSubmitInteraction;

        try {
            const cachedMessage = this.messageCache.get(id);

            if (cachedMessage == null) {
                interaction.reply({
                    content: LanguageLoader.LangConfig.VOTING_CREATION_FAILED_TRY_AGAIN,
                    ephemeral: true,
                });

                return;
            }

            const data = await VoteManager.GetData(id);
            const time = Math.floor(new Date().getTime() / 1000) + parseInt(data.duration);
            data.time = time;

            await VoteManager.SetData(id, data);
            VoteManager.StartTrackingVote(id);

            cachedMessage.embeds[0].fields[1].value = `Deze stemming einidgt om **<t:${time}:t>** (<t:${time}:R>)`;

            let messageMenu: Message;
            const messageMain = await interaction.channel.send({
                embeds: cachedMessage.embeds,
                components: [cachedMessage.components[0]]
            });

            data.message = messageMain.id;

            if (cachedMessage.components.length > 2) {
                messageMenu = await interaction.channel.send({
                    components: [cachedMessage.components[1]]
                });

                data.menu = messageMenu.id;
            }

            await VoteManager.SetData(id, data);
            VoteManager.CreateInterval(id);

            interaction.reply({
                content: LanguageLoader.LangConfig.DONE,
                ephemeral: true,
            });

            LogService.Log(LogType.VoteCreateConfirm, interaction.user.id, 'Vote ID', id);
        } catch (error) {
            console.log(error);
            LogService.Error(LogType.VoteCreateConfirm, interaction.user.id, 'Vote ID', id);
        }
    }

    public static OnDestroy(messageInfo: IMessageInfo, id: string) {
        const interaction = messageInfo.interaction as ButtonInteraction;

        try {
            VoteManager.DestroyVote(id);

            interaction.reply({
                content: LanguageLoader.LangConfig.OKAY,
                ephemeral: true,
            });
            LogService.Log(LogType.VoteCreateDestroy, interaction.user.id, 'Vote ID', id);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VoteCreateDestroy, interaction.user.id, 'Vote ID', id);
        }
    }

    private static OnVoteCommand(messageInfo: IMessageInfo) {
        const interaction = messageInfo.interaction as ChatInputCommandInteraction;

        try {
            if (!interaction.inCachedGuild()) {
                return;
            }

            const image = interaction.options.getAttachment('image');
            let duration = interaction.options.getNumber('duration');

            duration = (duration || SettingsConstants.VOTE_DURATION_DEFAULT) * 60;
            const time = Math.floor(new Date().getTime() / 1000) + duration;

            VoteManager.CreateVote(interaction.id, {
                id: interaction.id,
                image: image?.url,
                time: time,
                duration: duration,
                channel: interaction.channel.id,
            });

            const modal = new ModalBuilder()
                .setCustomId(`vote_create_${interaction.id}`)
                .setTitle(LanguageLoader.LangConfig.VOTING_VOTE);

            const inputName = new TextInputBuilder()
                .setCustomId('description')
                .setLabel(LanguageLoader.LangConfig.VOTING_WHAT_IS_THE_DESCRIPTION)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMinLength(0)
                .setMaxLength(1000);

            const inputSize = new TextInputBuilder()
                .setCustomId('options')
                .setLabel(LanguageLoader.LangConfig.VOTING_GIVE_OPTIONS_INSTRUCTIONS
                    .replace('{optionsMax}', `${SettingsConstants.VOTE_OPTIONS_MAX}`))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMaxLength(2500);

            const inputBuilders = [inputName, inputSize];
            const components = [];

            for (const inputBuilder of inputBuilders) {
                components.push(new ActionRowBuilder<TextInputBuilder>().addComponents(inputBuilder));
            }

            modal.addComponents(...components);

            interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            LogService.Error(LogType.VoteInitialize, interaction.user.id, 'Vote ID', interaction.id);
        }
    }
}
