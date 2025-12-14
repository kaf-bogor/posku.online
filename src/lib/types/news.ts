export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrls: string[];
  publishDate: string;
  author: string;
  isPublished: boolean;
}
