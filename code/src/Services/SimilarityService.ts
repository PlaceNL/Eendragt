import { ThreadChannel } from 'discord.js';
import SettingsConstants from '../Constants/SettingsConstants';
import { VariableKey } from '../Enums/VariableKey';
import IResultInfo from '../Interfaces/IResultInfo';
import VariableManager from '../Managers/VariableManager';
import { Redis } from '../Providers/Redis';
const stringSimilarity = require('string-similarity');

export default class SimilarityService {

    public static async FindSimiliarThreads(thread: ThreadChannel, threadsKey: string, ignoreDuplicate: boolean) {
        const resultInfo: IResultInfo = {
            result: false
        };

        const threads = await Redis.hgetall(threadsKey);
        if (threads == null) {
            return resultInfo;
        }

        const titles = Object.values(threads);

        const similarities = stringSimilarity.findBestMatch(thread.name, titles);
        if (similarities.bestMatch.rating < VariableManager.Get(VariableKey.Similar)) {
            return resultInfo;
        }

        resultInfo.result = true;
        resultInfo.data = {};

        if (!ignoreDuplicate && similarities.bestMatch.rating >= VariableManager.Get(VariableKey.Identical)) {
            resultInfo.data.identical = true;
            for (const [key, value] of Object.entries(threads)) {
                if (value == similarities.bestMatch.target) {
                    resultInfo.data.thread = {
                        name: value,
                        url: `${SettingsConstants.SUGGESTION_THREAD_BASE_URL}${key}`
                    };

                    return resultInfo;
                }
            }
        }

        const list = [];

        for (const rating of similarities.ratings) {
            if (rating.rating >= VariableManager.Get(VariableKey.Similar)) {
                for (const [key, value] of Object.entries(threads)) {
                    if (value == rating.target) {
                        list.push({
                            name: value,
                            url: `${SettingsConstants.SUGGESTION_THREAD_BASE_URL}${key}`
                        });
                    }
                }
            }
        }

        resultInfo.data.list = list;
        return resultInfo;
    }
}