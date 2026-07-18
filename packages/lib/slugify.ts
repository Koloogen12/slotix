// forDisplayingInput is used to allow user to type "-" at the end and not replace with empty space.
// For eg:- "test-slug" is the slug user wants to set but while typing "test-" would get replace to "test" becauser of replace(/-+$/, "")

// Slotix serves a RU-only market — booking URLs are public and shared outside the app (chat,
// social, print), so Cyrillic titles must transliterate to Latin instead of the previous
// behavior of keeping Cyrillic letters verbatim (which produced unreadable/hard-to-type
// percent-encoded URLs like /user/бесплатная-консультация).
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const transliterate = (str: string) => str.replace(/[а-яё]/g, (char) => CYRILLIC_TO_LATIN[char] ?? char);

export const slugify = (str: string, forDisplayingInput?: boolean) => {
  if (!str) {
    return "";
  }

  const s = transliterate(str.toLowerCase()) // Convert to lowercase, then Cyrillic -> Latin
    .trim() // Remove whitespace from both sides
    .normalize("NFD") // Normalize to decomposed form for handling accents
    // @ts-expect-error - Unicode property escapes require ES6+ target in some TS configs
    .replace(/\p{Diacritic}/gu, "") // Remove any diacritics (accents) from characters
    // @ts-expect-error - Unicode property escapes require ES6+ target in some TS configs
    .replace(/[^.\p{L}\p{N}\p{Zs}\p{Emoji}]+/gu, "-") // Replace any non-alphanumeric characters (including Unicode and except "." period) with a dash
    .replace(/[\s_#]+/g, "-") // Replace whitespace, # and underscores with a single dash
    .replace(/^-+/, "") // Remove dashes from start
    .replace(/\.{2,}/g, ".") // Replace consecutive periods with a single period
    .replace(/^\.+/, "") // Remove periods from the start
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    ) // Removes emojis
    .replace(/\s+/g, " ")
    .replace(/-+/g, "-"); // Replace consecutive dashes with a single dash

  return forDisplayingInput ? s : s.replace(/-+$/, "").replace(/\.*$/, ""); // Remove dashes and period from end
};

export default slugify;
