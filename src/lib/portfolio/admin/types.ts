export type AdminPhoto = {
  id: string;
  portfolio_id: string;
  storage_key: string;
  filename: string;
  file_size_bytes: number;
  mime_type: string;
  alt_text: string;
  gallery_order: number | null;
  public_url: string;
};

export type AdminLink = {
  id?: string;
  type: string;
  label: string | null;
  url: string;
  sort_order: number;
};

export type AdminPortfolio = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: string;
  stack: string[];
  started_at: string | null;
  ended_at: string | null;
  is_maintained: boolean;
  is_published: boolean;
  featured: boolean;
  sort_order: number;
  thumbnail_photo_id: string | null;
  mobile_thumbnail_photo_id: string | null;
  photos: AdminPhoto[];
  links: AdminLink[];
};
