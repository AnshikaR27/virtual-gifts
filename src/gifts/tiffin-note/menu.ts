/** Menu choices + tone placeholders for the Tiffin Note gift. Shared by the
 *  sender form and the receiver's item sprites. */

export const SWEET_OPTIONS = [
  'Gulab Jamun',
  'Jalebi',
  'Rasgulla',
  'Kaju Katli',
] as const;

export const SNACK_OPTIONS = ['Mathri', 'Samosa', 'Chakli', 'Khakhra'] as const;

/** Hinglish examples that cycle in the note textarea to model tone. */
export const NOTE_PLACEHOLDERS = [
  'khaana time pe khaa lena. miss u 💌',
  'thoda kam soya kar. love u',
  'office me dhyaan se. miss you yaar',
];

export const NOTE_MAX_LENGTH = 200;

export const DEFAULT_TOP_DABBA = SWEET_OPTIONS[0];
export const DEFAULT_MIDDLE_DABBA = SNACK_OPTIONS[0];
