import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/Button';

const GET_GENERATOR_STATUS = gql`
  query GetGeneratorStatus {
    generatorStatus { running batchSize intervalMs totalGenerated startedAt }
  }
`;

const START_GENERATOR = gql`
  mutation StartGenerator($batchSize: Int, $intervalMs: Int) {
    startGenerator(batchSize: $batchSize, intervalMs: $intervalMs) {
      running batchSize intervalMs totalGenerated startedAt
    }
  }
`;

const STOP_GENERATOR = gql`
  mutation StopGenerator {
    stopGenerator { running batchSize intervalMs totalGenerated startedAt }
  }
`;

const ON_GENERATOR_STATUS = gql`
  subscription OnGeneratorStatus {
    generatorStatusChanged { running batchSize intervalMs totalGenerated startedAt }
  }
`;

export function GeneratorPanel() {
  const [batchSize, setBatchSize]   = useState(3);
  const [intervalMs, setIntervalMs] = useState(4000);

  const { data, refetch } = useQuery(GET_GENERATOR_STATUS, { fetchPolicy: 'network-only' });

  const [startGenerator, { loading: starting }] = useMutation(START_GENERATOR, { onCompleted: () => refetch() });
  const [stopGenerator,  { loading: stopping }] = useMutation(STOP_GENERATOR,  { onCompleted: () => refetch() });

  const [liveStatus, setLiveStatus] = useState<any>(null);
  useSubscription(ON_GENERATOR_STATUS, { onData: ({ data }) => setLiveStatus(data.data?.generatorStatusChanged) });

  const status = liveStatus ?? data?.generatorStatus;
  const isRunning = status?.running ?? false;
  const loading = starting || stopping;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-0.5">Generator date</p>
          <h3 className="text-sm font-semibold text-brown">Generare automată produse</h3>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {isRunning ? 'Activ' : 'Oprit'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted mb-1 block">Produse per batch</label>
          <input type="number" min={1} max={20} value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} disabled={isRunning}
            className="w-full bg-paper border border-border rounded-md px-3 py-1.5 text-sm text-brown outline-none focus:border-caramel disabled:opacity-50" />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Interval (ms)</label>
          <input type="number" min={1000} max={30000} step={500} value={intervalMs} onChange={(e) => setIntervalMs(Number(e.target.value))} disabled={isRunning}
            className="w-full bg-paper border border-border rounded-md px-3 py-1.5 text-sm text-brown outline-none focus:border-caramel disabled:opacity-50" />
        </div>
      </div>

      {status && (
        <div className="flex gap-3 mb-4">
          {[
            { label: 'Generate total', value: String(status.totalGenerated) },
            { label: 'Per batch',      value: String(status.batchSize) },
            { label: 'Interval',       value: `${(status.intervalMs / 1000).toFixed(1)}s` },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 bg-paper border border-border rounded-lg px-3 py-2 text-center">
              <div className="text-lg font-semibold text-brown">{value}</div>
              <div className="text-[10px] text-muted uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      )}

      {isRunning ? (
        <Button onClick={() => stopGenerator()} disabled={loading} className="w-full justify-center bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
          ⏹ Oprește generatorul
        </Button>
      ) : (
        <Button onClick={() => startGenerator({ variables: { batchSize, intervalMs } })} disabled={loading} className="w-full justify-center">
          ▶ Pornește generatorul
        </Button>
      )}
    </div>
  );
}
