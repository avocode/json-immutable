export function getUniqueId(prefix?: string): () => string {
  let idCounter = 0;
  return () => `${prefix ? `${prefix}-` : ''}${idCounter++}`;
}
