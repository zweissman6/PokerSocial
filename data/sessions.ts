export type Session = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  stakes: string;
  location: string;
  buyIn: number;
  cashOut: number;
  startTime: string; // e.g., "2024-06-23T19:00"
  endTime: string;   // e.g., "2024-06-24T02:30"
  date: string;
  photo?: string;
  description?: string;
};

export const dummySessions: Session[] = [
  {
    id: '1',
    user: {
      name: 'Phil Ivey',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    stakes: '$2/$5 NLH',
    location: 'Aria, Las Vegas',
    buyIn: 500,
    cashOut: 1875,
    startTime: '2024-06-23T19:00',
    endTime: '2024-06-24T02:30',
    date: '2024-06-23',
    photo: 'https://a.storyblok.com/f/161938/1200x630/bd69c0aa27/the-art-of-poker-chip-stacking.jpg/m/',
    description: 'Had an epic run tonight! Flopped two sets, rivered a flush, good times.',
  },
  {
    id: '2',
    user: {
      name: 'Liv Boeree',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    stakes: '$1/$2 PLO',
    location: 'Commerce, LA',
    buyIn: 300,
    cashOut: 1100,
    startTime: '2024-06-22T15:45',
    endTime: '2024-06-22T20:10',
    date: '2024-06-22',
    photo: '',
    description: 'Swung up and down, but ended up with a nice session!',
  },
];
