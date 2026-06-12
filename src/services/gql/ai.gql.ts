import { gql } from '@apollo/client';
import { BUSINESS_FIELDS } from './marketplace.gql';

export const ASK_CONCIERGE = gql`
  ${BUSINESS_FIELDS}
  query AskConcierge($query: String!) {
    askConcierge(query: $query) {
      message
      usedAi
      recommendations {
        reason
        matchedProducts
        business { ...BusinessFields }
      }
    }
  }
`;
