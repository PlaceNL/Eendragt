import { VariableKey } from '../Enums/VariableKey';
import { IVariable } from '../Interfaces/IVariable';
import SettingsConstants from './SettingsConstants';

export default class VariableConstants {
    public static readonly VARIABLES: { [key in VariableKey]: IVariable } = {
        good_amount: {
            type: 'number',
            default: SettingsConstants.SUGGESTION_APPRECIATION_CRITERIA.GOOD_AMOUNT,
        },
        bad_amount: {
            type: 'number',
            default: SettingsConstants.SUGGESTION_APPRECIATION_CRITERIA.BAD_AMOUNT
        },
        ratio: {
            type: 'number',
            default: SettingsConstants.SUGGESTION_APPRECIATION_CRITERIA.RATIO
        },
        identical_suggestion: {
            type: 'number',
            default: SettingsConstants.SUGGESTION_SIMILARITY_CRITERIA.IDENTICAL
        },
        similar_suggestion: {
            type: 'number',
            default: SettingsConstants.SUGGESTION_SIMILARITY_CRITERIA.SIMILAR
        },
        similar_diplomacy: {
            type: 'number',
            default: SettingsConstants.SUGGESTION_SIMILARITY_CRITERIA.SIMILAR
        },
        valid_colors: {
            type: 'array',
            default: SettingsConstants.CANVAS.VALID_COLORS
        },
        canvas_width: {
            type: 'number',
            default: SettingsConstants.CANVAS.WIDTH
        },
        canvas_height: {
            type: 'number',
            default: SettingsConstants.CANVAS.HEIGHT
        },
        diplomacy_cooldown: {
            type: 'number',
            default: SettingsConstants.DIPLOMACY_COOLDOWN
        },
    };
}