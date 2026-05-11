import { nanoid } from 'nanoid';
import { SHORT_ID_LENGTH } from './constants';

export function generateShortId(): string {
  return nanoid(SHORT_ID_LENGTH);
}
