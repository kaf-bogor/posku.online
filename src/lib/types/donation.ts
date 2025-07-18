export interface DonationPage {
  id: string;
  title: string;
  summary: string;
  imageUrls: string[];
  target: number;
  link: string;
  organizer: {
    avatar: string;
    name: string;
    tagline: string;
  };
  donors: Array<{
    name: string;
    value: number;
    datetime: string;
  }>;
}
