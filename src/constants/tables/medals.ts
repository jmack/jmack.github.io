export interface Medal {
  id: string;
  unitId: string;
  name: string;
  weight: number;
};

export const MEDALS: Readonly<Medal[]> = Object.freeze([
  {
    id: '26ec69b8-31ec-45f5-97f3-1c85e588dc51',
    unitId: 'acfa4c5f-d2d9-43f4-ac88-01cbf0156f76',
    name: 'Purple Heart',
    weight: 5,
  },
]);
