import type { HuePaletteColor } from '@/src/types/hue';

export type CuratedPalette = {
  id: string;
  name: string;
  mood: string;
  colors: HuePaletteColor[];
};

export const curatedPalettes: CuratedPalette[] = [
  {
    id: 'dusk-pressure',
    name: 'Dusk Pressure',
    mood: 'held breath at evening',
    colors: [
      {
        hex: '#15111E',
        role: 'base',
        weight: 0.42,
        meaning: 'room for the feeling to settle',
      },
      {
        hex: '#34254B',
        role: 'shadow',
        weight: 0.25,
        meaning: 'a deep weight without sharp edges',
      },
      {
        hex: '#B7826A',
        role: 'accent',
        weight: 0.2,
        meaning: 'warm pressure asking to be noticed',
      },
      {
        hex: '#D9C6D6',
        role: 'light',
        weight: 0.13,
        meaning: 'a small hush of relief',
      },
    ],
  },
  {
    id: 'first-light',
    name: 'First Light',
    mood: 'quiet return of warmth',
    colors: [
      {
        hex: '#1A1822',
        role: 'base',
        weight: 0.4,
        meaning: 'a steady place before morning',
      },
      {
        hex: '#4E5D61',
        role: 'neutral',
        weight: 0.22,
        meaning: 'cool air around the edges',
      },
      {
        hex: '#D49A6A',
        role: 'accent',
        weight: 0.24,
        meaning: 'warmth beginning to gather',
      },
      {
        hex: '#E8D8B7',
        role: 'light',
        weight: 0.14,
        meaning: 'a pale opening in the dark',
      },
    ],
  },
  {
    id: 'sea-glass',
    name: 'Sea Glass',
    mood: 'soft clarity after motion',
    colors: [
      {
        hex: '#101B24',
        role: 'base',
        weight: 0.39,
        meaning: 'deep water holding still',
      },
      {
        hex: '#31515C',
        role: 'neutral',
        weight: 0.25,
        meaning: 'a softened edge from moving through',
      },
      {
        hex: '#7CB5A6',
        role: 'accent',
        weight: 0.22,
        meaning: 'clear breath returning',
      },
      {
        hex: '#C7D8D0',
        role: 'light',
        weight: 0.14,
        meaning: 'a washed brightness near the surface',
      },
    ],
  },
  {
    id: 'ember-hold',
    name: 'Ember Hold',
    mood: 'warmth kept close',
    colors: [
      {
        hex: '#171016',
        role: 'base',
        weight: 0.41,
        meaning: 'a private room for heat',
      },
      {
        hex: '#3D2228',
        role: 'shadow',
        weight: 0.24,
        meaning: 'old intensity softening down',
      },
      {
        hex: '#B95F4D',
        role: 'accent',
        weight: 0.22,
        meaning: 'a living ember under the quiet',
      },
      {
        hex: '#E4B795',
        role: 'light',
        weight: 0.13,
        meaning: 'gentle heat on the edge',
      },
    ],
  },
  {
    id: 'milk-moon',
    name: 'Milk Moon',
    mood: 'tender light in stillness',
    colors: [
      {
        hex: '#14141C',
        role: 'base',
        weight: 0.38,
        meaning: 'night made soft enough to rest in',
      },
      {
        hex: '#3B3A4C',
        role: 'neutral',
        weight: 0.25,
        meaning: 'a muted layer of protection',
      },
      {
        hex: '#9C8DB8',
        role: 'accent',
        weight: 0.21,
        meaning: 'a gentle signal through the quiet',
      },
      {
        hex: '#E2DDCD',
        role: 'light',
        weight: 0.16,
        meaning: 'soft light with no demand',
      },
    ],
  },
  {
    id: 'wet-ink',
    name: 'Wet Ink',
    mood: 'clear feeling, freshly named',
    colors: [
      {
        hex: '#0D1018',
        role: 'base',
        weight: 0.44,
        meaning: 'a deep page before the words',
      },
      {
        hex: '#252C46',
        role: 'shadow',
        weight: 0.26,
        meaning: 'thought gathering into shape',
      },
      {
        hex: '#5C7FA1',
        role: 'accent',
        weight: 0.18,
        meaning: 'a cool mark of clarity',
      },
      {
        hex: '#C9D4DF',
        role: 'light',
        weight: 0.12,
        meaning: 'a clean edge around the feeling',
      },
    ],
  },
  {
    id: 'meadow-air',
    name: 'Meadow Air',
    mood: 'steady breath with room',
    colors: [
      {
        hex: '#111914',
        role: 'base',
        weight: 0.4,
        meaning: 'a quiet field underfoot',
      },
      {
        hex: '#344735',
        role: 'neutral',
        weight: 0.24,
        meaning: 'green steadiness around the body',
      },
      {
        hex: '#8EAD79',
        role: 'accent',
        weight: 0.22,
        meaning: 'fresh space opening slowly',
      },
      {
        hex: '#D6D8B9',
        role: 'light',
        weight: 0.14,
        meaning: 'a mild sky over the moment',
      },
    ],
  },
  {
    id: 'static-bloom',
    name: 'Static Bloom',
    mood: 'charged but becoming softer',
    colors: [
      {
        hex: '#171221',
        role: 'base',
        weight: 0.39,
        meaning: 'a dark room with movement inside',
      },
      {
        hex: '#3C3154',
        role: 'shadow',
        weight: 0.25,
        meaning: 'nervous texture settling into pattern',
      },
      {
        hex: '#A676A8',
        role: 'accent',
        weight: 0.22,
        meaning: 'color rising through the static',
      },
      {
        hex: '#D7C1DF',
        role: 'light',
        weight: 0.14,
        meaning: 'a soft bloom at the edge',
      },
    ],
  },
  {
    id: 'night-swim',
    name: 'Night Swim',
    mood: 'deep motion, held gently',
    colors: [
      {
        hex: '#0D1420',
        role: 'base',
        weight: 0.43,
        meaning: 'dark water with space beneath it',
      },
      {
        hex: '#1F3C4B',
        role: 'shadow',
        weight: 0.24,
        meaning: 'movement below the surface',
      },
      {
        hex: '#4E8EA0',
        role: 'accent',
        weight: 0.2,
        meaning: 'a cool current of feeling',
      },
      {
        hex: '#BDD6D7',
        role: 'light',
        weight: 0.13,
        meaning: 'moonlit air above the water',
      },
    ],
  },
  {
    id: 'clay-warmth',
    name: 'Clay Warmth',
    mood: 'grounded and quietly alive',
    colors: [
      {
        hex: '#1B1513',
        role: 'base',
        weight: 0.41,
        meaning: 'earthy quiet under the feeling',
      },
      {
        hex: '#51362F',
        role: 'neutral',
        weight: 0.24,
        meaning: 'a held shape, warm and steady',
      },
      {
        hex: '#B9795F',
        role: 'accent',
        weight: 0.22,
        meaning: 'soft heat returning to the hands',
      },
      {
        hex: '#DFC0A8',
        role: 'light',
        weight: 0.13,
        meaning: 'a gentle glow on the surface',
      },
    ],
  },
  {
    id: 'frost-note',
    name: 'Frost Note',
    mood: 'cool focus with a soft edge',
    colors: [
      {
        hex: '#111821',
        role: 'base',
        weight: 0.4,
        meaning: 'a calm dark place to notice from',
      },
      {
        hex: '#364353',
        role: 'neutral',
        weight: 0.25,
        meaning: 'cool structure around the feeling',
      },
      {
        hex: '#7E9BB3',
        role: 'accent',
        weight: 0.21,
        meaning: 'a clear note in the air',
      },
      {
        hex: '#D8E0E4',
        role: 'light',
        weight: 0.14,
        meaning: 'frosted brightness, not too sharp',
      },
    ],
  },
  {
    id: 'low-tide',
    name: 'Low Tide',
    mood: 'what remains after the pull',
    colors: [
      {
        hex: '#121719',
        role: 'base',
        weight: 0.42,
        meaning: 'wet quiet after the rush',
      },
      {
        hex: '#39433F',
        role: 'neutral',
        weight: 0.24,
        meaning: 'stone and salt holding steady',
      },
      {
        hex: '#8E9C83',
        role: 'accent',
        weight: 0.2,
        meaning: 'a softened green return',
      },
      {
        hex: '#D5CFB8',
        role: 'light',
        weight: 0.14,
        meaning: 'pale sand under the last water',
      },
    ],
  },
];
