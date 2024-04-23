export interface Soldier {
  id: string;
  unitId: string;
  groupId?: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  rankId: string;
  joined?: Date;
  player: string;
  role: string;
};

export const SOLDIERS: Readonly<Soldier[]> = Object.freeze([
  {
    id: '174206df-88a8-4746-9c55-e07c55ff02ea',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: {
      first: 'Richard',
      last: 'O\'Neill',
    },
    rankId: '',
    joined: new Date("2024-01-06"),
    player: 'wlan0',
    role: 'Platoon Lead',
  },
]);
