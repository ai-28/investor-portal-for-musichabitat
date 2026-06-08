const MAX_GUARDIANS = 35;

export function guardianSerialToRoman(n: number): string {
  if (n < 1 || n > MAX_GUARDIANS) return String(n);
  const numerals: [number, string][] = [
    [35, "XXXV"],
    [34, "XXXIV"],
    [33, "XXXIII"],
    [32, "XXXII"],
    [31, "XXXI"],
    [30, "XXX"],
    [29, "XXIX"],
    [28, "XXVIII"],
    [27, "XXVII"],
    [26, "XXVI"],
    [25, "XXV"],
    [24, "XXIV"],
    [23, "XXIII"],
    [22, "XXII"],
    [21, "XXI"],
    [20, "XX"],
    [19, "XIX"],
    [18, "XVIII"],
    [17, "XVII"],
    [16, "XVI"],
    [15, "XV"],
    [14, "XIV"],
    [13, "XIII"],
    [12, "XII"],
    [11, "XI"],
    [10, "X"],
    [9, "IX"],
    [8, "VIII"],
    [7, "VII"],
    [6, "VI"],
    [5, "V"],
    [4, "IV"],
    [3, "III"],
    [2, "II"],
    [1, "I"],
  ];
  for (const [value, label] of numerals) {
    if (n === value) return label;
  }
  return String(n);
}
