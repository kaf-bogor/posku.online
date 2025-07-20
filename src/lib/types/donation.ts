export interface DonationPage {
  id: string;
  title: string;
  summary: string;
  imageUrls: string[];
  target: number;
  link: string;
  published: boolean;
  organizer: {
    avatar: string;
    name: string;
    tagline: string;
  };
  donors: Array<Donor>;
}

export interface Donor {
  id: number;
  name: string;
  value: number;
  datetime: string;
}

export const initialDonationState: Omit<DonationPage, 'id'> = {
  title: '',
  summary: '',
  imageUrls: [],
  target: 0,
  link: '',
  published: false,
  organizer: {
    avatar: '',
    name: '',
    tagline: '',
  },
  donors: [],
};
