export interface Group {
  id: string;
  unitId: string;
  parentId?: string;
  name: string;
  weight: number;
}

export const GROUPS: Readonly<Group[]> = Object.freeze([
  {
    id: '36788d44-1941-4b21-bc17-79dd82f05267',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Druid Squad',
    weight: 4,
  },
  {
    id: '31b5f5bd-a0d4-4a06-9bcf-8672e3b29a25',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Wizard Squad',
    weight: 3,
  },
  {
    id: 'de329baa-6bf0-49d9-8a4b-8ec1b6ca0d7c',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    parentId: '31b5f5bd-a0d4-4a06-9bcf-8672e3b29a25',
    name: 'Red Team',
    weight: 2,
  },
  {
    id: '08e66e6f-ddef-4a77-bb2b-f3bbadcfbcef',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    parentId: '31b5f5bd-a0d4-4a06-9bcf-8672e3b29a25',
    name: 'Green Team',
    weight: 1,
  },
  {
    id: '67a86c34-7d50-4f9f-b343-56a979060e41',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Cleric Squad',
    weight: 2,
  },
  {
    id: '43e23dd1-e0dc-413c-81e7-31da32cfb162',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Bard Squad',
    weight: 1,
  },
  {
    id: '23b67b9c-fd63-455e-bbb4-02963af23f2d',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Office of Naval Intelligence',
    weight: 5,
  },
]);
