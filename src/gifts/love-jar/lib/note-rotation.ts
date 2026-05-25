export function getNoteRotation(noteIndex: number): number {
  return -2 + (noteIndex % 5) - 1;
}
