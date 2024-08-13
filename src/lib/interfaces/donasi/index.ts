// Define the types for the query response
export interface CoverImage {
  url: string;
  width: number;
  height: number;
  id: string;
}

export interface Account {
  name: string;
  email: string;
  mobile: string | null;
  logo: {
    url: string;
    width: number;
    height: number;
  };
}

export interface User {
  paymeLink: string;
  account: Account;
}

export interface Item {
  id: string;
  name: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  link: string;
  coverImage: CoverImage;
  user: User;
}

export interface GetPaymentLinkPageResponse {
  getPaymentLinkPageByUsername: {
    items: Item[];
    userDetail: {
      account: Account;
    };
    total: number;
  };
}

// Define the types for the query variables
export interface GetPaymentLinkPageVariables {
  username: string;
  pageSize: number;
  page: number;
  status: string;
  excludeType: string;
}

export interface GetTotalFundraisingsByIDResponse {
  getTotalFundraisingsByPaymentLinkID: {
    totalFundraising: number;
    target: number;
  };
}

export interface GetTotalFundraisingsByIDVariables {
  link: string;
}
