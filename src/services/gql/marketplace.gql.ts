import { gql } from '@apollo/client';
import { PRODUCT_FIELDS } from './products.gql';

export const BUSINESS_FIELDS = gql`
  fragment BusinessFields on BusinessProfile {
    id firstName lastName businessName businessType county phone description productCount
  }
`;

export const GET_CITIES = gql`
  query GetCities {
    cities
  }
`;

export const GET_BUSINESSES = gql`
  ${BUSINESS_FIELDS}
  query GetBusinesses($city: String) {
    businesses(city: $city) { ...BusinessFields }
  }
`;

export const GET_BUSINESS = gql`
  ${BUSINESS_FIELDS}
  query GetBusiness($id: ID!) {
    business(id: $id) { ...BusinessFields }
  }
`;

export const GET_BUSINESS_PRODUCTS = gql`
  ${PRODUCT_FIELDS}
  query GetBusinessProducts($businessId: ID!) {
    businessProducts(businessId: $businessId) { ...ProductFields }
  }
`;
