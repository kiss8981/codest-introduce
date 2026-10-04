export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  stack: string[];
  startedAt: string | null;
  endedAt: string | null;
  isMaintained: boolean;
  featured: boolean;
  cover: string | null;
  mobileCover: string | null;
  gallery: { id: string; src: string; alt: string }[];
  urls: { type: string; label: string | null; url: string }[];
  updatedAt: string;
};
