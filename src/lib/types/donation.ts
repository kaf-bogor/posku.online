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
  donorsCount: number;
  activities: Array<Activity>;
}

export interface Donor {
  donorsCount?: number;
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
  donorsCount: 1,
  activities: [],
};

export interface Activity {
  userId: string;
  userName: string | null;
  type: 'add' | 'edit' | 'delete';
  description: string;
  datetime: string;
}
