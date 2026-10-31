/** Shared document labels and plain-text previews for Markdown and MDX entries. */
export function manuscriptDetails(id: string, body = '') {
  const number = /^journal-(\d+)$/.exec(id)?.[1];
  const documentId = number ? `No. ${number.padStart(3, '0')}` : id.toUpperCase();
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:emsp|ensp|nbsp);/g, ' ')
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const excerpt = text.length > 220 ? `${text.slice(0, 220).replace(/\s+\S*$/, '')}…` : text;
  return { documentId, excerpt };
}
