export interface Rank {
  id: string;
  unitId: string;
  name: string;
  abbreviation: string;
  weight: number;
};

export const RANKS: Readonly<Rank[]> = Object.freeze([
  {
    id: 'c13d7070-3bd2-41cd-b17d-24e2475fe21e',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Private First Class',
    abbreviation: 'PFC',
    weight: 2,
  },
  {
    id: '5f53bd67-79ea-4acd-a7d0-a4137f985e45',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Hospitalman Apprentice',
    abbreviation: 'HA',
    weight: 2,
  },
  {
    id: 'ea1c53e3-7b40-466f-ba21-f7d6e1b1c2cf',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Lance Corporal',
    abbreviation: 'LCPL',
    weight: 3,
  },
  {
    id: 'bea01e8b-ad6b-41e8-a590-f0a1aa89c6ad',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Corporal',
    abbreviation: 'CPL',
    weight: 4,
  },
  {
    id: 'd33c60b0-48fa-4f6e-9f0e-8b8b550b0b7a',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Sergeant',
    abbreviation: 'SGT',
    weight: 5,
  },
  {
    id: 'a6d07e41-a52a-45a2-ad74-24bcabaf8310',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Second Lieutenant',
    abbreviation: '2LT',
    weight: 14,
  },
  {
    id: 'd39c040c-a5cb-4d17-854f-7399b069d353',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Lieutenant',
    abbreviation: 'LT',
    weight: 15,
  },
]);
