import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { api } from '@/services/api'

interface AuditLog {
  id: string;
  userEmail: string;
  userRole: string;
  action: string;
  timestamp: string;
}

interface SuspiciousUser {
  id: string;
  userEmail: string;
  reason: string;
  detectedAt: string;
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [suspects, setSuspects] = useState<SuspiciousUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // În realitate, ai crea rute în backend pentru aceste date. 
    // Pentru demo, le simulăm sau le tragem din API dacă ai apucat să faci rutele.
    Promise.all([
      api.get<AuditLog[]>('/auth/audit-logs').catch(() => []),
      api.get<SuspiciousUser[]>('/auth/observation-list').catch(() => [])
    ]).then(([logsData, suspectsData]) => {
      setLogs(logsData)
      setSuspects(suspectsData)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Security Center" subtitle="— Monitorizare stealth & Loguri" />
      
      <div className="flex-1 p-8 space-y-8 page-enter">
        {/* LISTA DE OBSERVAȚIE (SUSPECȚI) */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            Utilizatori în lista de observație (Suspicious)
          </h2>
          <div className="bg-white border border-red-100 rounded-xl overflow-hidden shadow-sm">
            {suspects.length === 0 ? (
              <p className="p-6 text-sm text-muted text-center italic">Nicio activitate malițioasă detectată momentan.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-red-800 uppercase">Utilizator</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-red-800 uppercase">Motiv Detecție</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-red-800 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {suspects.map(s => (
                    <tr key={s.id} className="border-b border-red-50 hover:bg-red-50/30">
                      <td className="px-6 py-4 font-medium text-brown">{s.userEmail}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">{s.reason}</span></td>
                      <td className="px-6 py-4 text-xs text-muted">{new Date(s.detectedAt).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* LOGURI DE AUDIT */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Istoric Activitate (Audit Logs)</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-paper border-b border-border z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-muted uppercase">User</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-muted uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-muted uppercase">Acțiune</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-muted uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-caramel/[0.02]">
                      <td className="px-6 py-3 text-xs font-semibold">{log.userEmail}</td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${log.userRole === 'ADMIN' ? 'bg-brown text-white' : 'bg-paper border border-border'}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-[11px] text-caramel">{log.action}</td>
                      <td className="px-6 py-3 text-[10px] text-muted">{new Date(log.timestamp).toLocaleString('ro-RO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}