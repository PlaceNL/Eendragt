import { Message, TextChannel } from 'discord.js';
import EmojiConstants from '../Constants/EmojiConstants';
import RedisConstants from '../Constants/RedisConstants';
import VoteEmbeds from '../Embeds/VoteEmbeds';
import { Redis } from '../Providers/Redis';
import DiscordService from '../Services/DiscordService';
import { Utils } from '../Utils/Utils';
import LanguageLoader from '../Utils/LanguageLoader';

export default class VoteManager {

    private static readonly dataKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.VOTE}${RedisConstants.KEYS.DATA}`;
    private static readonly trackKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.VOTE}${RedisConstants.KEYS.TRACK}`;
    private static readonly choiceKey: string = `${RedisConstants.KEYS.PLACENL}${RedisConstants.KEYS.VOTE}${RedisConstants.KEYS.CHOICE}`;
    private static readonly dataCache: Map<string, any> = new Map();
    private static readonly choiceCache: Map<string, Map<string, Array<string>>> = new Map();

    public static async CheckOngoingVote() {
        const tracking = await Redis.hgetall(this.trackKey);

        if (tracking) {
            const keys = Object.keys(tracking);
            if (keys.length > 0) {
                for (const id of keys) {
                    this.CreateChoiceCache(id);
                    this.CreateInterval(id);
                }
            }
        }
    }

    public static CreateVote(id: string, data: any) {
        const key = `${this.dataKey}${id}`;
        Redis.hmset(key, data);
        Redis.expire(key, Utils.GetHoursInSeconds(1));
    }

    public static DestroyVote(id: string) {
        Redis.del(`${this.dataKey}${id}`);
    }

    public static async GetData(id: string) {
        let data = this.dataCache.get(id);

        if (data) {
            return data;
        }

        data = await Redis.hgetall(`${this.dataKey}${id}`);

        if (data) {
            const options = data.options;
            if (options) {
                data.options = JSON.parse(options);
            }

            this.dataCache.set(id, {...data});
            data.options = options;
            return data;
        }

        return null;
    }

    public static async SetData(id: string, data: any) {
        if (typeof data.options == 'string') {
            data.options = JSON.parse(data.options);
        }

        this.dataCache.set(id, {...data});
        data.options = JSON.stringify(data.options);
        await Redis.hmset(`${this.dataKey}${id}`, data);
    }

    public static StartTrackingVote(id: string) {
        Redis.hset(this.trackKey, id, 1);
        Redis.persist(`${this.dataKey}${id}`);
    }

    public static StopTrackingVote(id: string) {
        Redis.hdel(this.trackKey, id);
    }

    public static CreateChoiceCache(id: string) {
        this.choiceCache.set(id, new Map<string, Array<string>>());
    }

    public static GetChoice(id: string, userId: string) {
        const choiceCache = this.choiceCache.get(id);
        if (choiceCache == null) {
            this.CreateChoiceCache(id);
        }

        if (choiceCache == null) {
            return null;
        }

        return choiceCache.get(userId);
    }

    public static async SetChoice(id: string, userId: string, choices: Array<string>) {
        const choiceCache = this.choiceCache.get(id);
        if (choiceCache == null) {
            this.CreateChoiceCache(id);
        }

        choiceCache.set(userId, choices);
        await Redis.hset(`${this.choiceKey}${id}`, userId, JSON.stringify(choices));
    }

    public static async CreateInterval(id: string) {
        let voteCount = 0;

        const data = await this.GetData(id);

        if (data == null) {
            console.log('No data found?');
            return;
        }

        const channel = await DiscordService.FindChannelById(data.channel) as TextChannel;
        const messageMain = await channel.messages.fetch(data.message);
        const messageMenu = (await channel.messages.fetch({
            after: data.message,
            limit: 1,
        })).first();

        if (new Date().getTime() / 1000 >= data.time) {

            this.ShowResults(id, data, messageMain, messageMenu);
            return;
        }

        const interval = setInterval(() => {
            try {
                const dataChoice = this.choiceCache.get(id);

                if (dataChoice == null) {
                    clearInterval(interval);
                    return;
                }

                if (new Date().getTime() / 1000 >= data.time) {

                    this.ShowResults(id, data, messageMain, messageMenu);

                    clearInterval(interval);
                    return;
                }

                const votes = Array.from(dataChoice.values()).length;

                if (voteCount == votes) {
                    return;
                }

                voteCount = votes;

                // Convert the number of votes to emoji
                messageMain.embeds[0].fields[0].value = votes.toString().split('')
                    .map((number) => EmojiConstants.VOTE.NUMBERS[parseInt(number)]).join('');

                messageMain.edit({embeds: messageMain.embeds});
            } catch (error) {
                console.log('Error in vote interval:');
                console.log(error);
            }
        }, 1000 * 5);
    }

    private static async ShowResults(id: string, data: any, messageMain: Message, messageMenu: Message) {
        const resultData = await this.GetResults(id);

        const max = Math.max(...resultData.map((data: any) => data.votes));
        const winner = resultData.filter((data: any) => data.votes === max)[0];
        const winnerIndex = resultData.indexOf(winner);

        let resultString = '';
        const options = data.options_string.split('\n');

        if (options.length > 1) {
            resultString = options.map((option: string, index: number) => {
                const split = option.split('::');
                const votes = resultData[index].votes;
                return `**${split[0]}** - ${votes} ${votes == 1 ? LanguageLoader.LangConfig.VOTING_SINGLE_VOTE : LanguageLoader.LangConfig.VOTING_MULTIPLE_VOTES}${split[1] == null ? '' : `\n*${split[1]}*`}\n`;
            }).join('\n');
        } else {
            for (const value of resultData) {
                resultString += `**${value.name}** - ${value.votes} ${value.votes == 1 ? LanguageLoader.LangConfig.VOTING_SINGLE_VOTE : LanguageLoader.LangConfig.VOTING_MULTIPLE_VOTES}\n\n`;
            }
        }

        await messageMain.edit({
            embeds: [VoteEmbeds.GetVotingResultEmbed(data.description, resultString, winner.name, data.image)],
            components: [],
        });

        if (messageMenu != null) {
            messageMenu.delete();
        }

        Redis.hset(`${this.dataKey}${id}`, 'winner', winnerIndex);

        VoteManager.StopTrackingVote(id);
    }

    private static async GetResults(id: string) {
        const choiceData = await Redis.hgetall(`${this.choiceKey}${id}`);
        const voteData = await VoteManager.GetData(id);
        const optionNames = voteData.options;

        const score: any = {};

        for (let i = 0; i < optionNames.length; i++) {
            score[i] = 0;
        }

        for (const value of Object.values(choiceData || {})) {
            const choices = JSON.parse(value as string);

            for (const choice of choices) {
                score[choice]++;
            }
        }

        const resultData = [];
        for (const [key, value] of Object.entries(score)) {
            resultData.push({name: optionNames[key],  votes: value});
        }

        return resultData;
    }
}

