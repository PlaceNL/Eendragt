import VariableConstants from '../Constants/VariableConstants';
import { VariableKey } from '../Enums/VariableKey';
import IResultInfo from '../Interfaces/IResultInfo';
import { Redis } from '../Providers/Redis';

export default class VariableManager {

    public static async InitializeVariables() {
        for (const [key, variable] of Object.entries(VariableConstants.VARIABLES)) {
            const value = await Redis.get(key);
            if (value == null) {
                variable.value = variable.default;
                continue;
            }

            if (variable.type == 'string') {
                variable.value = value;
            } else if (variable.type == 'number') {
                variable.value = parseFloat(value);
            } else if (variable.type == 'array') {
                variable.value = value.split(',');
            }
        }
    }

    public static Get(key: VariableKey) {
        return VariableConstants.VARIABLES[key].value;
    }

    public static GetAll() {
        return VariableConstants.VARIABLES;
    }

    public static async Set(key: VariableKey, value: string) {

        const variable = VariableConstants.VARIABLES[key];

        const resultInfo: IResultInfo = {
            result: false,
            reason: `${key} is niet van het type ${variable.type}`,
        };

        if (variable.type == 'string') {
            variable.value = value;
        } else if (variable.type == 'number') {
            const n = parseFloat(value);
            if (isNaN(n)) {
                return resultInfo;
            }

            variable.value = n;
        } else if (variable.type == 'array') {
            if (!value.includes(',')) {
                return resultInfo;
            }

            variable.value = value.split(',');
        }

        await Redis.set(key, value);

        resultInfo.result = true;
        return resultInfo;
    }

    public static GetChoices() {
        const choices = [];

        for (const key of Object.keys(VariableConstants.VARIABLES)) {
            choices.push({ name: key.toCamelCase(), value: key });
        }

        return choices;
    }
}