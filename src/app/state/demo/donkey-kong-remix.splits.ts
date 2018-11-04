import { Split } from '../models/split.model';

export const donkeyKongRemixSplits = {
  maxLives: 4,
  splits: [
    {
      label: 'L=01',
      subsplits: [{ label: '1-1: Barrel' }, { label: '1-2: Rivet' }]
    },
    {
      label: 'L=02',
      subsplits: [{ label: '2-1: Barrel' }, { label: '2-2: Spring' }, { label: '2-3: Rivet' }]
    },
    {
      label: 'L=03',
      subsplits: [
        { label: '3-1: Barrel' },
        { label: '3-2: Pie' },
        { label: '3-3: Spring' },
        { label: '3-4: Rivet' }
      ]
    },
    {
      label: 'L=04',
      subsplits: [
        { label: '4-1: Barrel' },
        { label: '4-2: Pie' },
        { label: '4-3: Barrel' },
        { label: '4-4: Spring' },
        { label: '4-5: Rivet' }
      ]
    },
    {
      isRepeating: true,
      startAt: 5,
      endAt: 8,
      labelMask: 'L=$$',
      subsplits: [
        { label: '$-1: Barrel', likeness: 'Barrels' },
        { label: '$-2: Pie', likeness: 'Pies' },
        { label: '$-3: Barrel', likeness: 'Barrels' },
        { label: '$-4: Spring', likeness: 'Springs' },
        { label: '$-5: Barrel', likeness: 'Barrels' },
        { label: '$-6: Rivet', likeness: 'Rivets' }
      ]
    },
    {
      label: 'L=22',
      subsplits: [
        { label: '22-1: Barrel' },
        { label: '22-2: Pie' },
        { label: '22-3: Barrel' },
        { label: '22-4: Spring' },
        { label: '22-5: Barrel' },
        { label: '22-6: Rivet' }
      ]
    }
  ]
};
