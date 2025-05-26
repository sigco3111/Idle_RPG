
/**
 * Rolls a specified number of dice with a given number of sides.
 * @param count Number of dice to roll.
 * @param sides Number of sides on each die.
 * @returns The sum of the dice rolls.
 */
export const rollDice = (count: number, sides: number): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

/**
 * Parses a dice string (e.g., "1d8", "2d6") into its components.
 * Does not support modifiers like "+3" in the string itself.
 * @param diceStr The dice string.
 * @returns An object with count and sides, or null if invalid.
 */
export const parseDiceString = (diceStr: string): { count: number; sides: number } | null => {
  const match = diceStr.toLowerCase().match(/^(\d+)d(\d+)$/);
  if (match) {
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    if (count > 0 && sides > 0) {
      return { count, sides };
    }
  }
  return null;
};

/**
 * Rolls a single d20.
 * @returns The result of the d20 roll.
 */
export const rollD20 = (): number => {
  return Math.floor(Math.random() * 20) + 1;
};
