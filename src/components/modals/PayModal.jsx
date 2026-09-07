import React, { useState } from 'react';
import { COLORS } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { fmt, round2, fmtDate } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { CodeScanner } from '../ui/CodeScanner';
import { Paperclip, CheckCircle2 } from 'lucide-react';
import { ImageViewer } from '../ui/ImageViewer';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };
const ATTACH_METHODS = [["anexo", "Anexo"], ["foto", "Foto"], ["qrcode", "QR Code"], ["barra", "Código de barras"]];

function readFileAsDataUrl(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.onerror = () => cb("");
  reader.readAsDataURL(file);
}

export function PayModal({ item, accounts, sources, transactions, selectedMonth, onClose, onSubmit, onFinalize }) {
  const [tab, setTab] = useState("pagamento");
  const remaining = round2(item.amount - item.paid);
  const payments = (transactions || []).filter((t) => t.plannedId === item.id).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  const paidTotal = payments.reduce((s, t) => s + t.amount, 0);

  const [amount, setAmount] = useState(String(remaining));
  const [date, setDate] = useState(selectedMonth === TODAY_MONTH ? TODAY_MONTH + "-12" : selectedMonth + "-01");
  const [accountId, setAccountId] = useState(item.accountId ?? accounts[0]?.id ?? null);
  const [fonteId, setFonteId] = useState(item.fonteId ? String(item.fonteId) : "");
  const [attachmentMethod, setAttachmentMethod] = useState("anexo");
  const [attachment, setAttachment] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [preview, setPreview] = useState(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!amount || Number(amount) <= 0) { setError("Informe um valor válido."); return; }
    onSubmit({ amount: Number(amount), date, accountId: accountId ? Number(accountId) : null, fonteId: fonteId ? Number(fonteId) : undefined, attachment: attachment || undefined, attachmentMethod });
  }

  return (
    <ModalSheet title={item.type === "income" ? "Registrar recebimento" : "Registrar pagamento"} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setTab("pagamento")} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (tab === "pagamento" ? COLORS.green : COLORS.line), background: tab === "pagamento" ? COLORS.green : "transparent", color: tab === "pagamento" ? "#fff" : COLORS.muted }}>Pagamento</button>
        <button onClick={() => setTab("extrato")} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (tab === "extrato" ? COLORS.green : COLORS.line), background: tab === "extrato" ? COLORS.green : "transparent", color: tab === "extrato" ? "#fff" : COLORS.muted }}>Extrato ({payments.length})</button>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>{item.description}</p>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Previsto {fmt(item.amount)} · já {item.type === "income" ? "recebido" : "pago"} {fmt(item.paid)} · restam {fmt(remaining)}</p>
      </Card>

      {tab === "extrato" ? (
        <div style={{ marginBottom: 14 }}>
          {payments.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "16px 0" }}>Nenhum pagamento registrado ainda.</p>}
          {payments.map((t) => {
            const fonte = t.fonteId ? (sources || []).find((s) => s.id === t.fonteId) : null;
            const isImage = t.attachment && t.attachment.startsWith("data:image");
            return (
              <Card key={t.id} style={{ padding: "10px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0 }}>{fmtDate(t.date)}</p>
                    {fonte && <p style={{ fontSize: 12, color: COLORS.green, margin: "2px 0 0" }}>Fonte: {fonte.name}</p>}
                    {t.attachment && !isImage && <p style={{ fontSize: 11, color: COLORS.muted, margin: "4px 0 0" }}><Paperclip size={11} /> {t.attachment}</p>}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: t.type === "income" ? COLORS.green : COLORS.rust }}>{t.type === "income" ? "+" : "−"}{fmt(t.amount)}</p>
                </div>
                {isImage && <button onClick={() => setPreview(t.attachment)} style={{ background: "none", border: "none", padding: 0, marginTop: 6, display: "inline-block", cursor: "zoom-in" }}><img src={t.attachment} alt="Comprovante" style={{ maxWidth: 80, borderRadius: 8, border: "1px solid " + COLORS.line }} /></button>}
              </Card>
            );
          })}
          <p style={{ fontSize: 12, color: COLORS.muted, margin: "6px 0 0" }}>Total pago: <strong>{fmt(paidTotal)}</strong> de {fmt(item.amount)}</p>
        </div>
      ) : (
        <>
          <FormField label="Valor (R$)"><input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} type="number" min="0" step="0.01" style={inputStyle} /></FormField>
          <FormField label="Conta ou cartão"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
          <FormField label="Fonte (de quem recebe / para quem paga)">
            <select value={fonteId} onChange={(e) => setFonteId(e.target.value)} style={inputStyle}>
              <option value="">Sem fonte</option>
              {(sources || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Data"><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>
          <FormField label="Anexar comprovante (opcional)">
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {ATTACH_METHODS.map(([v, l]) => (
                <button key={v} onClick={() => setAttachmentMethod(v)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 11, fontWeight: 500, border: "1px solid " + (attachmentMethod === v ? COLORS.green : COLORS.line), background: attachmentMethod === v ? COLORS.green : "transparent", color: attachmentMethod === v ? "#fff" : COLORS.ink }}>{l}</button>
              ))}
            </div>
            {(attachmentMethod === "anexo" || attachmentMethod === "foto") ? (
              <input type="file" accept={attachmentMethod === "foto" ? "image/*" : undefined} capture={attachmentMethod === "foto" ? "environment" : undefined} onChange={(e) => { const f = e.target.files[0]; if (!f) return; if (f.size > 1500000) { setError("Imagem grande demais (máx 1,5MB)."); return; } setError(""); setReading(true); readFileAsDataUrl(f, (d) => { setAttachment(d); setReading(false); }); }} style={inputStyle} />
            ) : (
              <>
                <button onClick={() => setShowScanner(true)} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green, fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Escanear pela câmera</button>
                {showScanner && <CodeScanner onResult={(code) => { setAttachment(code); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
                <input value={attachment} onChange={(e) => setAttachment(e.target.value)} placeholder={attachmentMethod === "qrcode" ? "Valor/URL do QR Code" : "Código de barras"} style={inputStyle} />
              </>
            )}
            {attachment && attachment.startsWith("data:image") && <button onClick={() => setPreview(attachment)} style={{ background: "none", border: "none", padding: 0, marginTop: 6, display: "block", cursor: "zoom-in" }}><img src={attachment} alt="Comprovante" style={{ maxWidth: 90, borderRadius: 8, border: "1px solid " + COLORS.line }} /></button>}
          </FormField>

          {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={reading} style={{ ...primaryBtn, opacity: reading ? 0.6 : 1 }}>{reading ? "Lendo anexo..." : (item.type === "income" ? "Registrar recebimento" : "Registrar pagamento")}</button>
          {onFinalize && (
            <button onClick={() => onFinalize(item)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green, fontSize: 13.5, fontWeight: 500, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <CheckCircle2 size={15} /> Encerrar como está (não ficar pendente)
            </button>
          )}
        </>
      )}
      <ImageViewer src={preview} onClose={() => setPreview(null)} />
    </ModalSheet>
  );
}
