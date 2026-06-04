import { gql } from '@apollo/client';

export const ORDER_ITEM_FIELDS = gql`
  fragment OrderItemFields on OrderItem {
    id orderId productId quantity unitPrice subtotal
    product { id name category pricePerUnit }
  }
`;

export const ORDER_FIELDS = gql`
  ${ORDER_ITEM_FIELDS}
  fragment OrderFields on Order {
    id customerName customerPhone notes status
    totalValue totalItems createdAt updatedAt
    items { ...OrderItemFields }
  }
`;

export const GET_ORDERS = gql`
  ${ORDER_FIELDS}
  query GetOrders($page: Int, $pageSize: Int, $status: OrderStatus) {
    orders(page: $page, pageSize: $pageSize, status: $status) {
      data { ...OrderFields }
      total page pageSize totalPages hasNextPage
    }
  }
`;

export const GET_ORDER = gql`
  ${ORDER_FIELDS}
  query GetOrder($id: ID!) {
    order(id: $id) { ...OrderFields }
  }
`;

// Nu cerem `items` în răspuns: backend-ul întoarce comanda fără relația items
// încărcată, iar Order.items e non-nullable => serializarea pica. Lista se
// reîncarcă oricum imediat (GET_ORDERS), deci scalarii sunt suficienți aici.
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id customerName customerPhone notes status
      totalValue totalItems createdAt updatedAt
    }
  }
`;

export const UPDATE_ORDER = gql`
  ${ORDER_FIELDS}
  mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) { ...OrderFields }
  }
`;

export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id)
  }
`;

export const ADD_ORDER_ITEM = gql`
  ${ORDER_ITEM_FIELDS}
  mutation AddOrderItem($orderId: ID!, $productId: ID!, $quantity: Int!) {
    addOrderItem(orderId: $orderId, productId: $productId, quantity: $quantity) {
      ...OrderItemFields
    }
  }
`;

export const UPDATE_ORDER_ITEM = gql`
  mutation UpdateOrderItem($itemId: ID!, $quantity: Int!) {
    updateOrderItem(itemId: $itemId, quantity: $quantity) {
      id quantity subtotal
    }
  }
`;

export const REMOVE_ORDER_ITEM = gql`
  mutation RemoveOrderItem($itemId: ID!) {
    removeOrderItem(itemId: $itemId)
  }
`;

export const ON_ORDER_CREATED = gql`
  ${ORDER_FIELDS}
  subscription OnOrderCreated {
    orderCreated { ...OrderFields }
  }
`;

export const ON_ORDER_UPDATED = gql`
  ${ORDER_FIELDS}
  subscription OnOrderUpdated {
    orderUpdated { ...OrderFields }
  }
`;

export const ON_ORDER_DELETED = gql`
  subscription OnOrderDeleted {
    orderDeleted { id }
  }
`;
