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
}

export const SOLDIERS: Readonly<Soldier[]> = Object.freeze([
  {
    id: '174206df-88a8-4746-9c55-e07c55ff02ea',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: {
      first: 'Richard',
      last: "O'Neill",
    },
    rankId: 'a6d07e41-a52a-45a2-ad74-24bcabaf8310',
    joined: new Date('2024-01-06'),
    player: 'wlan0',
    role: 'Platoon Lead',
  },
  {
    id: 'bb769a35-fed8-4ab5-938a-f56ea79cc5e6',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: '31b5f5bd-a0d4-4a06-9bcf-8672e3b29a25',
    name: {
      first: 'Mabel-lee',
      last: 'Reid',
    },
    rankId: 'd33c60b0-48fa-4f6e-9f0e-8b8b550b0b7a',
    joined: new Date('2024-01-06'),
    player: 'FlameAndLight',
    role: 'Squad Lead',
  },
  {
    id: '7347a0f2-c236-4c4a-ba2d-838350fd94fc',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: 'de329baa-6bf0-49d9-8a4b-8ec1b6ca0d7c',
    name: {
      first: 'Lena',
      last: 'Baird',
    },
    rankId: 'bea01e8b-ad6b-41e8-a590-f0a1aa89c6ad',
    joined: new Date('2024-01-06'),
    player: 'miss_chief',
    role: 'Fireteam Lead',
  },
  {
    id: 'cbfce5da-7f69-4409-a3b3-927d885aec5c',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: '08e66e6f-ddef-4a77-bb2b-f3bbadcfbcef',
    name: {
      first: 'E',
      last: 'Winter',
    },
    rankId: 'bea01e8b-ad6b-41e8-a590-f0a1aa89c6ad',
    joined: new Date('2024-01-06'),
    player: 'neersighted',
    role: 'Fireteam Lead',
  },
  {
    id: '6bfa0f17-9f72-4b95-8599-c93900a71cbb',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: '23b67b9c-fd63-455e-bbb4-02963af23f2d',
    name: {
      first: 'Danica',
      last: 'Cherry',
    },
    rankId: 'd39c040c-a5cb-4d17-854f-7399b069d353',
    joined: new Date('2024-01-08'),
    player: 'hilda.',
    role: 'Naval Aviation / Intelligence Officer',
  },
  {
    id: 'b174241a-d588-4701-8ab5-6d9b87aadea2',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: '31b5f5bd-a0d4-4a06-9bcf-8672e3b29a25',
    name: {
      first: 'Chloe',
      last: 'Barnes',
    },
    rankId: 'bea01e8b-ad6b-41e8-a590-f0a1aa89c6ad',
    joined: new Date('2024-01-07'),
    player: 'jessica_t',
    role: 'Combat Engineer',
  },
  {
    id: '5c491efd-1cf7-434b-a257-e1e843bbff6a',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: 'de329baa-6bf0-49d9-8a4b-8ec1b6ca0d7c',
    name: {
      first: 'Jonny',
      last: 'Bridges',
    },
    rankId: 'c13d7070-3bd2-41cd-b17d-24e2475fe21e',
    joined: new Date('2024-01-08'),
    player: 'undeadraccoonhat',
    role: 'Anti-Tank',
  },
  {
    id: 'c53bc672-5774-4e0e-8737-5b90c89d8b66',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: 'de329baa-6bf0-49d9-8a4b-8ec1b6ca0d7c',
    name: {
      first: 'Lyubov',
      last: 'Dukova',
    },
    rankId: '5f53bd67-79ea-4acd-a7d0-a4137f985e45',
    joined: new Date('2024-01-08'),
    player: 'cooldog',
    role: 'Medic',
  },
  {
    id: 'a7a702f9-6213-4024-beeb-c626d1ae5218',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: '08e66e6f-ddef-4a77-bb2b-f3bbadcfbcef',
    name: {
      first: 'Blake',
      last: 'Bottle',
    },
    rankId: 'c13d7070-3bd2-41cd-b17d-24e2475fe21e',
    joined: new Date('2024-02-05'),
    player: 'lewisllw',
    role: 'Autorifleman',
  },
  {
    id: '3893fd97-0cd3-4442-81d7-b39a0dc7f84e',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    groupId: '08e66e6f-ddef-4a77-bb2b-f3bbadcfbcef',
    name: {
      first: 'Taylor',
      last: 'Selänne',
    },
    rankId: '5f53bd67-79ea-4acd-a7d0-a4137f985e45',
    joined: new Date('2024-02-15'),
    player: 'toastwiz',
    role: 'Medic',
  },
]);
