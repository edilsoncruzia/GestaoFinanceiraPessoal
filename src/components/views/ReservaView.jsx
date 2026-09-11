import React, { useState, useEffect } from 'react';
import { PiggyBank, ShieldCheck, AlertTriangle, ArrowRightLeft, Pencil, Wallet, RefreshCw } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, fmtDate, addMonths, monthLabelFull, memberLabel, round2 } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { MonthNav } from '../ui/MonthNav';
import { FormField } from '../ui/FormField';
import { BackRow } from './MaisMenuView';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

// Reserva mínima: teto fixo (como o limite de um cartão), consumo pelos
// lançamentos marcados como "Reserva mínima" e a sobra do mês virando Receita
// no mês seguinte.
export function ReservaView({ onBack, month, onMonthChange, reserva, config, salario, onSaveConfig }) {
  const [limite, setLimite] = useState(config && config.limite ? String(config.limite) : "");
  useEffect(() => { setLimite(config && config.limite ? String(config.limite) : ""); }, [config]);

  const sugerido = round2((Number(salario) || 0) * 0.15);
  const destino = addMonths(month, 1);
  const pctUso = reserva.limite > 0 ? Math.min(100, (reserva.usado / reserva.limite) * 100) : 0;
  const corUso = reserva.estourou ? COLORS.rust : reserva.usado > 0 ? COLORS.amber : COLORS.green;
  const salvou = Number(limite) || 0;

  return (
    <div>
      <BackRow onBack={onBack} />
      <MonthNav month={month} onChange={onMonthChange} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.amber + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PiggyBank size={21} color={COLORS.amber} />
        </div>
        <div>
          <p className="serif" style={{ fontSize: 19, fontWeight: 600, margin: 0, color: COLORS.ink }}>Reserva mínima</p>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: "2px 0 0" }}>Funciona como o limite do cartão: você lança nela o que usar e o disponível cai. A reserva é mensal — não acumula de um mês para o outro.</p>
        </div>
      </div>

      {/* Situação do mês */}
      <Card style={{ marginBottom: 12, padding: "14px 16px", borderLeft: "4px solid " + corUso }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Wallet size={16} color={corUso} />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Disponível em {monthLabelFull(month)}</p>
          {reserva.estourou && <Badge color={COLORS.rust}>Acima do teto</Badge>}
        </div>
        <p className="serif" style={{ fontSize: 30, fontWeight: 600, margin: "0 0 8px", color: reserva.disponivel >= 0 ? COLORS.green : COLORS.rust }}>{fmt(reserva.disponivel)}</p>
        <ProgressBar pct={pctUso} color={corUso} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Usado {fmt(reserva.usado)}</span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>Aporte do mês {fmt(reserva.aporte)}</span>
        </div>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid " + COLORS.line }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: COLORS.muted }}>Aporte do mês (Receita)</span>
            <span style={{ fontSize: 12, color: COLORS.ink }}>+ {fmt(reserva.aporte)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: COLORS.muted }}>Usado na reserva (Despesa)</span>
            <span style={{ fontSize: 12, color: COLORS.ink }}>− {fmt(reserva.usado)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: COLORS.muted }}>Saldo do mês</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: reserva.saldo < 0 ? COLORS.rust : COLORS.green }}>{fmt(reserva.saldo)}</span>
          </div>
          {(reserva.receitaDoMesAnterior > 0 || reserva.despesaDoMesAnterior > 0) && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontSize: 12, color: COLORS.muted }}>Fechamento do mês anterior</span>
              <span style={{ fontSize: 12, color: reserva.despesaDoMesAnterior > 0 ? COLORS.rust : COLORS.green }}>
                {reserva.receitaDoMesAnterior > 0 ? "Receita " + fmt(reserva.receitaDoMesAnterior) : "Despesa " + fmt(reserva.despesaDoMesAnterior)}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Teto configurável */}
      <Card style={{ marginBottom: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Pencil size={15} color={COLORS.green} />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Aporte mensal da reserva (valor fixo)</p>
        </div>
        <FormField label="Quanto entra na reserva por mês (R$)">
          <input value={limite} onChange={(e) => setLimite(e.target.value)} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} />
        </FormField>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button type="button" onClick={() => setLimite(String(sugerido))} disabled={sugerido <= 0}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, padding: "9px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: sugerido > 0 ? COLORS.green : COLORS.muted, fontWeight: 500 }}>
            <RefreshCw size={13} />Usar 15% do salário{sugerido > 0 ? " (" + fmt(sugerido) + ")" : ""}
          </button>
          <button type="button" onClick={() => setLimite("")} style={{ flex: 1, fontSize: 12.5, padding: "9px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted, fontWeight: 500 }}>
            Limpar
          </button>
        </div>
        <button onClick={() => onSaveConfig({ limite: salvou > 0 ? salvou : 0 })}
          style={{ ...primaryBtn, background: (config && Number(config.limite) === salvou) ? COLORS.line : COLORS.green, color: (config && Number(config.limite) === salvou) ? COLORS.muted : "#fff" }}>
          Salvar aporte
        </button>
        <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "8px 0 0" }}>
          {reserva.configurado
            ? "A reserva é mensal e não acumula: no fechamento o saldo do mês entra no mês seguinte como Receita (positivo) ou Despesa (negativo), e a reserva volta ao aporte cheio."
            : "Sem valor fixo, o aporte da reserva é 15% do salário líquido do mês (" + fmt(sugerido) + ")."}
        </p>
      </Card>

      {/* Fechamento: sobra vira Receita */}
      <Card style={{ marginBottom: 12, padding: "14px 16px", background: "#3B6E8F0F", border: "1px solid #3B6E8F22" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <ArrowRightLeft size={16} color="#3B6E8F" />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Fechamento do mês</p>
        </div>
        {reserva.saldo > 0 ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <ShieldCheck size={16} color={COLORS.green} style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5 }}>
              Saldo positivo de <strong>{fmt(reserva.saldo)}</strong> em {monthLabelFull(month)} — entra em {monthLabelFull(destino)} como
              <strong> Receita</strong>. A reserva não acumula: em {monthLabelFull(destino)} ela vale o aporte cheio.
            </span>
          </div>
        ) : reserva.saldo < 0 ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <AlertTriangle size={16} color={COLORS.rust} style={{ marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: COLORS.rust, lineHeight: 1.5 }}>
              Saldo negativo de <strong>{fmt(Math.abs(reserva.saldo))}</strong> em {monthLabelFull(month)} — entra em {monthLabelFull(destino)} como
              <strong> Despesa</strong>.
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={16} color={COLORS.muted} />
            <span style={{ fontSize: 12.5, color: COLORS.muted }}>
              A reserva foi usada exatamente por completo em {monthLabelFull(month)} — nada entra no mês seguinte.
            </span>
          </div>
        )}
      </Card>

      {/* Lançamentos que consumiram a reserva */}
      <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>O que consumiu a reserva</p>
      {reserva.itens.length === 0 ? (
        <Card style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={18} color={COLORS.green} />
          <p style={{ fontSize: 13, margin: 0 }}>Nada lançado na reserva em {monthLabelFull(month)}.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reserva.itens.map((i) => (
            <Card key={i.occId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
              <CategoryIcon cat={i.category} size={16} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0, color: COLORS.ink }}>{i.description}</p>
                <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>{fmtDate(i.dueDate)} · dia {i.dia} · {memberLabel(i.memberId)}</p>
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, whiteSpace: "nowrap" }}>{fmt(i.amount)}</span>
            </Card>
          ))}
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "2px 0 0" }}>Para lançar mais, use "Novo previsto" com a forma de pagamento "Reserva mínima".</p>
        </div>
      )}
    </div>
  );
}
