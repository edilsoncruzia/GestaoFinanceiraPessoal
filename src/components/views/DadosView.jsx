import React, { useState } from 'react';
import { Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';

export function DadosView({ onExport, onImport, onReset, onClearSupabase }) {
  const [confirming, setConfirming] = useState(false);
  const [clearConfirming, setClearConfirming] = useState(false);
  const [clearScope, setClearScope] = useState(null); // null | 'all' | 'income' | 'expense'
  return (
    <div>
      <SectionTitle title="Dados" subtitle="Sua base de dados, para levar para a planilha ou fazer backup" />
      
      {isSupabaseConfigured && (
        <Card style={{ marginBottom: 12, background: COLORS.green + "12", borderColor: COLORS.green }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.green, margin: "0 0 4px" }}>Conectado ao Supabase ✓</p>
          <p style={{ fontSize: 12, color: COLORS.ink, margin: 0 }}>Seus dados estão sincronizados em tempo real com seu projeto na nuvem.</p>
        </Card>
      )}

      <Card style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Download size={18} color={COLORS.green} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Exportar dados</p>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Baixa um .json com contas, transações, previsto e metas</p>
        </div>
        <button onClick={onExport} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: "none", background: COLORS.green, color: "#fff", fontWeight: 500, whiteSpace: "nowrap" }}>Exportar</button>
      </Card>
      
      <Card style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.amber + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Upload size={18} color={COLORS.amber} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Importar dados</p>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Substitui os dados atuais por um .json exportado antes</p>
        </div>
        <button onClick={onImport} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.amber, background: "transparent", color: COLORS.amber, fontWeight: 500, whiteSpace: "nowrap" }}>Importar</button>
      </Card>

      {!confirming ? (
        <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.rust + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><RotateCcw size={18} color={COLORS.rust} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Restaurar dados de exemplo</p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Apaga o que foi cadastrado e volta ao estado inicial</p>
          </div>
          <button onClick={() => setConfirming(true)} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.rust, background: "transparent", color: COLORS.rust, fontWeight: 500, whiteSpace: "nowrap" }}>Restaurar</button>
        </Card>
      ) : (
        <Card style={{ display: "flex", alignItems: "center", gap: 10, borderColor: COLORS.rust }}>
          <AlertTriangle size={18} color={COLORS.rust} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, margin: 0, flex: 1 }}>Tem certeza? Isso descarta tudo que foi cadastrado nesta sessão.</p>
          <button onClick={() => setConfirming(false)} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
          <button onClick={onReset} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Restaurar</button>
        </Card>
      )}

      {isSupabaseConfigured && !clearConfirming && (
        <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.rust + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AlertTriangle size={18} color={COLORS.rust} /></div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Limpar Base de Dados do Supabase</p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Apaga do banco na nuvem — escolha o que apagar</p>
          </div>
          <button onClick={() => setClearConfirming(true)} style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid " + COLORS.rust, background: "transparent", color: COLORS.rust, fontWeight: 500, whiteSpace: "nowrap" }}>Limpar</button>
        </Card>
      )}
      {isSupabaseConfigured && clearConfirming && (
        <Card style={{ borderColor: COLORS.rust }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <AlertTriangle size={18} color={COLORS.rust} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, margin: 0, flex: 1 }}>O que deseja apagar do Supabase? Isso não pode ser desfeito.</p>
            <button onClick={() => { setClearConfirming(false); setClearScope(null); }} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["all", "Tudo"], ["expense", "Despesas"], ["income", "Receitas"]].map(([scope, label]) => (
              <button key={scope} onClick={() => { setClearScope(scope); }} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (clearScope === scope ? COLORS.green : COLORS.line), background: clearScope === scope ? COLORS.green : "transparent", color: clearScope === scope ? "#fff" : COLORS.ink }}>{label}</button>
            ))}
          </div>
          {clearScope && (
            <button onClick={() => { const sc = clearScope; setClearConfirming(false); setClearScope(null); onClearSupabase(sc); }} style={{ width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 10, border: "none", background: COLORS.rust, color: "#fff", fontSize: 13, fontWeight: 500 }}>
              Confirmar limpeza
            </button>
          )}
        </Card>
      )}
    </div>
  );
}
