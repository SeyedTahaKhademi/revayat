import documentData from './documents.json';

export type DocumentTileSize = 'normal' | 'wide' | 'tall' | 'hero';

export interface DocumentItem {
  slug: string;
  title: string;
  category: string;
  image: string;
  size?: DocumentTileSize;
}

export const documentItems: DocumentItem[] = documentData.map(item => ({
  ...item,
  size: (item.size as DocumentTileSize | undefined) || 'normal'
}));
