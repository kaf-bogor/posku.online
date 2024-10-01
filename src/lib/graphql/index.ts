import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const GRAPHQL_ENDPOINT = 'https://api.mayar.id/graphql';

export const client = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
});

export const GET_PAYMENT_LINK_PAGE_QUERY = gql`
  query getPaymentLinkPageByUsername(
    $username: String!
    $page: Int
    $pageSize: Int
    $excludeType: String
    $status: String
  ) {
    getPaymentLinkPageByUsername(
      username: $username
      page: $page
      pageSize: $pageSize
      excludeType: $excludeType
      status: $status
    ) {
      errorMessage
      items {
        id
        name
        type
        amount
        status
        description
        link
        multipleImage {
          url
        }
        coverImage {
          url
        }
      }
      total
      userDetail {
        account {
          name
          email
          profile
          isVerified
        }
      }
    }
  }
`;

export const GET_TOTAL_FUND_RAISING_BY_ID = gql`
  query getTotalFundraisingsByPaymentLinkID($id: ID, $link: String) {
    getTotalFundraisingsByPaymentLinkID(id: $id, link: $link) {
      totalFundraising
      target
    }
  }
`;
