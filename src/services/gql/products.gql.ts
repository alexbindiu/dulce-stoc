import { gql } from '@apollo/client';

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id name category pricePerUnit stock description
    ingredients isActive createdAt updatedAt
    manufactureDate expiryDate discountPercent
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_FIELDS}
  query GetProducts($query: ProductQueryInput) {
    products(query: $query) {
      data { ...ProductFields }
      total page pageSize totalPages hasNextPage
    }
  }
`;

export const GET_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  query GetProduct($id: ID!) {
    product(id: $id) { ...ProductFields }
  }
`;

export const CREATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) { ...ProductFields }
  }
`;

export const UPDATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) { ...ProductFields }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const ON_BATCH_ADDED = gql`
  ${PRODUCT_FIELDS}
  subscription OnBatchAdded {
    productsBatchAdded {
      products { ...ProductFields }
      stats { total generated }
    }
  }
`;
