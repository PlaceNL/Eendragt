import { RoleType } from '../Enums/RoleType';
import IRole from '../Interfaces/IRole';

export default class RolesConstants {

    public static readonly ROLES: { [key in RoleType]: IRole } = {
        [RoleType.Soldier]: {
            name: '🪖 Soldier',
            description: 'Ben jij een strijder voor het Vaderlandt? Help dan mee met het verdedigen van onze glorie op het canvas.',
        },
        [RoleType.Builder]: {
            name: '👷 Bouwer',
            description: 'De architect van het canvas. Meepraten over wat er komt en waar we het plaatsen. Iets voor jou?',
        },
        [RoleType.Artist]: {
            name: '🧑‍🎨 Pixel Artist',
            description: 'Ben jij de Rembrandt van de pixel? Meld je aan als Pixel Artist om samen te werken met de andere kunstenaars.',
        },
        [RoleType.Diplomat]: {
            name: '🤝 Diplomaat',
            description: 'Kan jij goed onderhandelen? Meld je aan als diplomaat, en help mee met het onderhouden van de relaties met andere communities.',
        },
        [RoleType.Reporter]: {
            name: '📰 Nieuwsredacteur',
            description: 'Ben jij op de hoogte van wat er allemaal speelt op en rond het canvas? Lijkt het je leuk om content te maken voor het journaal? Meld je aan als Nieuwsredacteur!',
        },
        [RoleType.Support]: {
            name: '👮 Community Support',
            description: 'Frustreer je je over mensen die spammen? Erger je je aan posts die de verkeerde tags hebben? Meld je dan Community Supporter en help mee om de server schoon te houden!'
        }
    };
}
