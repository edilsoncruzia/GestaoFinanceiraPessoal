import React, { useState } from 'react';
import { Paperclip, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { fmt, fmtDate } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { BackRow } from './MaisMenuView';
import { ImageViewer } from '../ui/ImageViewer';

function readFileAsDataUrl(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.onerror = () => cb("");
  reader.readAsDataURL(file);
}

export function DeclaracaoIRView({ transactions, onBack, onAttach }) {
  const categories = useCategories();
  const [preview, setPreview] = useState(null);

  const expenses = (transactions || [])
    .filter((t) => t.type === "expense" && t.includeInIR)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));

  // Agrupa por ano da declaração (despesa do ano X -> IR do ano X+1)
  const groups = {};
  expenses.forEach((t) => {
    const year = Number(t.date.slice(0, 4)) + 1;
    (groups[year] = groups[year] || []).push(t);
  });
  const years = Object.keys(groups).sort((a, b) => b - a);

  function handleFile(t, file) {
    if (!file) return;
    if (file.size > 1500000) { onAttach(t, null); return; }
    readFileAsDataUrl(file, (d) => onAttach(t, d));
  }

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Declaração de IR" subtitle="Despesas marcadas como 'Incluir na Declaração de IR'" />

      {expenses.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 6px" }}>Nenhuma despesa marcada ainda.</p>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Ao cadastrar uma despesa, ative "Incluir na Declaração de IR" para ela aparecer aqui.</p>
        </Card>
      )}

      {years.map((y) => (
        <div key={y} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.green, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Ano-base {Number(y) - 1} → IR {y} ({groups[y].length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {groups[y].map((t) => {
              const c = categories[t.category];
              const hasReceipt = Boolean(t.attachment);
              const isImage = t.attachment && t.attachment.startsWith("data:image");
              return (
                <Card key={t.id}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{t.description}</p>
                      <p style={{ fontSize: 12, color: COLORS.muted, margin: "2px 0 6px" }}>{c ? c.label : t.category} · {fmtDate(t.date)}</p>
                      {hasReceipt ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: COLORS.green }}>
                          <CheckCircle2 size={13} /> Comprovante anexado
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.muted }}>
                          <Paperclip size={13} /> Sem comprovante
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.rust, whiteSpace: "nowrap" }}>{fmt(t.amount)}</p>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {hasReceipt ? (
                      isImage ? (
                        <button onClick={() => setPreview(t.attachment)} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 8, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 500 }}>Ver comprovante</button>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.muted }}><Paperclip size={13} /> Anexado</span>
                      )
                    ) : (
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, padding: "7px 12px", borderRadius: 8, border: "1px dashed " + COLORS.line, background: "transparent", color: COLORS.green, fontWeight: 500, cursor: "pointer" }}>
                        <Paperclip size={13} /> Anexar comprovante
                        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => { handleFile(t, e.target.files[0]); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <ImageViewer src={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
