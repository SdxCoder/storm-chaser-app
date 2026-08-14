import { darkColors, lightColors } from '../src/theme/theme';

describe('theme palettes', () => {
  it('provides the same semantic colors for light and dark modes', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });
});
