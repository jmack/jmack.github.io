import { Medal } from './medals';

export interface SoldierMedal {
  id: string;
  soldierId: string;
  medalId: string;
  medal?: Medal;
  quantity: number;
  info: SoldierMedalInfo[];
}
export interface SoldierMedalInfo {
  dateAwarded: Date;
  reason: string;
}

export const SOLDIER_MEDALS: Readonly<SoldierMedal[]> = Object.freeze([
  {
    id: 'fa2e9f44-82d0-43d2-b672-a91f40c6e549',
    soldierId: '174206df-88a8-4746-9c55-e07c55ff02ea',
    medalId: '26ec69b8-31ec-45f5-97f3-1c85e588dc51',
    quantity: 2,
    info: [
      {
        dateAwarded: new Date('2548-04-02'),
        reason:
          'Awarded for wounds received in combat against insurrectionist forces on Roost while assaulting an enemy artillery position.',
      },
      {
        dateAwarded: new Date('2548-04-09'),
        reason:
          'Awarded for wounds received in combat against covenant forces on Roost while defending the city of New Amsterdam',
      },
    ],
  },
]);
