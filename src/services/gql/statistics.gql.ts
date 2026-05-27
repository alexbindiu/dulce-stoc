import { gql } from '@apollo/client';

export const GET_STATISTICS = gql`
  query GetStatistics {
    statistics {
      totalProducts activeProducts inactiveProducts
      outOfStockProducts totalStock totalStockValue averagePrice
      byCategory { category count totalStock totalValue }
      orders {
        totalOrders pendingOrders confirmedOrders
        completedOrders cancelledOrders
        totalRevenue averageOrderValue
        revenueByProduct {
          productId productName category totalQuantity totalRevenue
        }
      }
    }
  }
`;
