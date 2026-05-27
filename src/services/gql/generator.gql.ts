import { gql } from '@apollo/client';

export const GET_GENERATOR_STATUS = gql`
  query GetGeneratorStatus {
    generatorStatus {
      running batchSize intervalMs totalGenerated startedAt
    }
  }
`;

export const START_GENERATOR = gql`
  mutation StartGenerator($batchSize: Int, $intervalMs: Int) {
    startGenerator(batchSize: $batchSize, intervalMs: $intervalMs) {
      running batchSize intervalMs totalGenerated startedAt
    }
  }
`;

export const STOP_GENERATOR = gql`
  mutation StopGenerator {
    stopGenerator {
      running batchSize intervalMs totalGenerated startedAt
    }
  }
`;

export const ON_GENERATOR_STATUS = gql`
  subscription OnGeneratorStatusChanged {
    generatorStatusChanged {
      running batchSize intervalMs totalGenerated startedAt
    }
  }
`;
