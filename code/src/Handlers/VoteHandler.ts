import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Message, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import CommandConstants from '../Constants/CommandConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import VoteEmbeds from '../Embeds/VoteEmbeds';
import { LogType } from '../Enums/LogType';
import IMessageInfo from '../Interfaces/IMessageInfo';
import VoteManager from '../Managers/VoteManager';
import LogService from '../Services/LogService';

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
                    content: 'Je kan hier niet meer op stemmen!',
                    ephemeral: true,
                });

                return;
            }

            const previousChoice = VoteManager.GetChoice(id, interaction.user.id);

            VoteManager.SetChoice(id, interaction.user.id, choices);

            if (choices.length > 1) {
                const sentence = `${choices.slice(0, -1).map(v => data.options[v])
                    .join(', ')} en ${data.options[choices[choices.length - 1]]}`;

                interaction.reply({
                    content: `${previousChoice == null ? 'Je hebt gestemd op' : 'Je stem is veranderd naar'} **${sentence}**!`,
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    content: `${previousChoice == null ? 'Je hebt gestemd op' : 'Je stem is veranderd naar'} **${data.options[choices[0]]}**!
${data.options.length > 2 ? '*Tip: Gebruik het menu onder de knoppen om op meerdere opties te stemmen.*' : ''}`,
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
                    content: `Je kan maximaal ${max} opties toevoegen!`,
                    ephemeral: true,
                });

                return;
            }

            if (!description?.isFilled()) {
                description = options.length > 1
                    ? 'Stem op je favoriete suggestie voor op het canvas!'
                    : 'Wil jij deze suggestie op het canvas zien?';
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
                onlyOptions.push('Ja');
                onlyOptions.push('Nee');
                buttonComponents.push(new ButtonBuilder()
                    .setCustomId(`vote_choose_0_${id}`)
                    .setLabel('Ja')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`vote_choose_1_${id}`)
                    .setLabel('Nee')
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
                        .setPlaceholder('Of stem op meerdere opties')
                        .setMinValues(1)
                        .setMaxValues(onlyOptions.length - 1)
                        .addOptions(menuOptions));

                components.push(actionSelectRow);
            }

            const data = await VoteManager.GetData(id);

            const confirmRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(new ButtonBuilder()
                    .setLabel('Ja, stuur het')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`vote_confirm_${id}`))
                .addComponents(new ButtonBuilder()
                    .setLabel('Nee, opnieuw!')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId(`vote_destroy_${id}`));

            components.push(confirmRow);

            const reply = await interaction.reply({
                content: '**__DIT IS EEN PREVIEW__**\n\nZiet dit er goed uit zo?',
                embeds: [VoteEmbeds.GetVotingEmbed(description, optionString, data.image, parseInt(data.time))],
                components: components,
                ephemeral: true,
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
                    content: 'Er is iets fout gegaan. Maak de stemming opnieuw aan.',
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
                content: 'Done!',
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
                content: 'Oké',
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
                .setTitle('Stemming');

            const inputName = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Wat is de beschrijving van de stemming?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMinLength(0)
                .setMaxLength(1000);

            const inputSize = new TextInputBuilder()
                .setCustomId('options')
                .setLabel(`Optie per regel | Max ${SettingsConstants.VOTE_OPTIONS_MAX} | Context na ::`)
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