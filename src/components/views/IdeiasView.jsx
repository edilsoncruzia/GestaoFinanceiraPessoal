import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Paperclip, Image as ImageIcon, X } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmtDate } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { BackRow } from './MaisMenuView';
import { ImageViewer } from '../ui/ImageViewer';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none", fontFamily: "inherit" };

function readFileAsDataUrl(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.onerror = () => cb("");
  reader.readAsDataURL(file);
}

function handleFile(file, cb) {
  if (!file) return;
  if (file.type.startsWith("image/")) readFileAsDataUrl(file, cb);
  else cb(file.name);
}

// Permite colar (Ctrl+V) uma imagem da área de transferência para ilustrar a ideia.
function handlePaste(e, cb) {
  const items = (e.clipboardData && e.clipboardData.items) || [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type && items[i].type.startsWith("image/")) {
      const file = items[i].getAsFile();
      if (file) {
        e.preventDefault();
        readFileAsDataUrl(file, cb);
        return;
      }
    }
  }
}

export function IdeiasView({ ideas, onBack, onSave, onDelete, onToggle, onUpdate }) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState("");
  const [attachmentMethod, setAttachmentMethod] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [preview, setPreview] = useState(null);

  const sorted = [...ideas].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.id - a.id;
  });
  const total = ideas.length;
  const doneCount = ideas.filter((i) => i.done).length;
  const isImage = (v) => v && typeof v === "string" && v.startsWith("data:image");

  function submit() {
    const t = text.trim();
    if (!t) return;
    onSave(t, attachment, attachmentMethod);
    setText("");
    setAttachment("");
    setAttachmentMethod("");
  }

  function startEdit(idea) { setEditingId(idea.id); setEditText(idea.text); }
  function saveEdit() {
    const t = editText.trim();
    if (!t) return;
    onUpdate(editingId, t);
    setEditingId(null);
    setEditText("");
  }

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Ajustes e Melhorias" subtitle="Registre ideias para implementar depois" />

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Card style={{ flex: 1, padding: "10px 12px", textAlign: "center" }}>
          <p className="serif" style={{ fontSize: 22, fontWeight: 600, margin: 0, color: COLORS.ink }}>{total}</p>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Notas</p>
        </Card>
        <Card style={{ flex: 1, padding: "10px 12px", textAlign: "center" }}>
          <p className="serif" style={{ fontSize: 22, fontWeight: 600, margin: 0, color: COLORS.green }}>{doneCount}</p>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Concluídas</p>
        </Card>
        <Card style={{ flex: 1, padding: "10px 12px", textAlign: "center" }}>
          <p className="serif" style={{ fontSize: 22, fontWeight: 600, margin: 0, color: COLORS.amber }}>{total - doneCount}</p>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Pendentes</p>
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>Nova ideia</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} onPaste={(e) => handlePaste(e, (d) => { setAttachment(d); setAttachmentMethod("image"); })} placeholder="Ex: gráfico de gastos por fonte, alerta de conta a vencer..." rows={3} style={{ ...inputStyle, resize: "none" }} />
        <p style={{ fontSize: 11, color: COLORS.muted, margin: "6px 0 0" }}>Dica: cole (Ctrl+V) uma imagem para ilustrar a ideia.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "8px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, color: COLORS.green, cursor: "pointer", fontWeight: 500 }}>
            <Paperclip size={14} />
            {attachmentMethod === "image" ? "Imagem" : "Anexar arquivo"}
            <input type="file" accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx" style={{ display: "none" }} onChange={(e) => {
              const f = e.target.files[0];
              if (!f) return;
              setAttachmentMethod(f.type.startsWith("image/") ? "image" : "file");
              handleFile(f, setAttachment);
              e.target.value = "";
            }} />
          </label>
          {attachment && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.muted, background: COLORS.line + "66", borderRadius: 8, padding: "4px 8px", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <ImageIcon size={12} />
              {isImage(attachment) ? "imagem" : attachment}
              <button type="button" onClick={() => { setAttachment(""); setAttachmentMethod(""); }} style={{ background: "none", border: "none", color: COLORS.rust, cursor: "pointer", padding: 0, display: "flex" }}><X size={12} /></button>
            </span>
          )}
        </div>
        <button onClick={submit} disabled={!text.trim()} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10, border: "none", background: text.trim() ? COLORS.green : COLORS.line, color: text.trim() ? "#fff" : COLORS.muted, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={15} /> Adicionar ideia
        </button>
      </Card>

      {sorted.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nenhuma ideia ainda. Vá usando o app e registre o que quiser melhorar.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((idea) => (
          <Card key={idea.id}>
            {confirming === idea.id ? (
              <div>
                <p style={{ fontSize: 13, margin: "0 0 10px" }}>Remover esta ideia?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setConfirming(null)} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
                  <button onClick={() => { onDelete(idea.id); setConfirming(null); }} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Remover</button>
                </div>
              </div>
            ) : editingId === idea.id ? (
              <div>
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setEditingId(null)} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
                  <button onClick={saveEdit} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.green, color: "#fff", fontWeight: 500 }}>Salvar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <button onClick={() => onToggle(idea.id)} aria-label="Marcar como feito" style={{ background: "none", border: "none", padding: 2, marginTop: 1, cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ display: "block", width: 20, height: 20, borderRadius: 6, border: "2px solid " + (idea.done ? COLORS.green : COLORS.line), background: idea.done ? COLORS.green : "transparent", color: "#fff", fontSize: 12, lineHeight: "18px", textAlign: "center" }}>{idea.done ? "✓" : ""}</span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, margin: 0, color: idea.done ? COLORS.muted : COLORS.ink, textDecoration: idea.done ? "line-through" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{idea.text}</p>
                  <p style={{ fontSize: 11, color: COLORS.muted, margin: "4px 0 0" }}>#{idea.id} · {idea.date ? fmtDate(idea.date) : "sem data"}
                    {idea.done && <span style={{ color: COLORS.green }}> · feito</span>}
                  </p>
                  {idea.attachment && (
                    <button onClick={() => isImage(idea.attachment) ? setPreview(idea.attachment) : window.open(idea.attachment, "_blank")} style={{ background: "none", border: "none", padding: 0, marginTop: 6, display: "inline-block", cursor: isImage(idea.attachment) ? "zoom-in" : "pointer" }}>
                      {isImage(idea.attachment)
                        ? <img src={idea.attachment} alt="Anexo" style={{ maxWidth: 120, borderRadius: 8, border: "1px solid " + COLORS.line }} />
                        : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.green, background: COLORS.green + "12", borderRadius: 8, padding: "5px 10px" }}><Paperclip size={12} />{idea.attachment}</span>}
                    </button>
                  )}
                </div>
                <button onClick={() => startEdit(idea)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, padding: 6, flexShrink: 0 }}><Pencil size={15} /></button>
                <button onClick={() => setConfirming(idea.id)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, padding: 6, flexShrink: 0 }}><Trash2 size={16} /></button>
              </div>
            )}
          </Card>
        ))}
      </div>
      <ImageViewer src={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
