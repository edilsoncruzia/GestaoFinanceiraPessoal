# Aplicação no App.jsx — patch exato

Esta rodada entrega o shell e as telas em arquivos prontos. O `App.jsx` concentra
todo o estado (804 linhas) e por isso não foi reescrito aqui: o que ele precisa é
de um patch de três pontos. Nada de estado, dado, regra de negócio ou fluxo muda.

## 1. Imports

Substituir:

```jsx
import { BottomNav } from './components/ui/BottomNav';
```

por:

```jsx
import { AppShell, AppTopbar } from './components/shell/AppShell';
import { MemberFilterBar } from './components/ui/MemberFilterBar';
```

(`MemberFilterBar` já é importado em outro ponto do arquivo — mantenha um só.)

## 2. Rota ativa

O shell precisa saber qual rota está ativa para marcar a aba ou o item da barra
lateral. `tab` + `moreView` já dão isso:

```jsx
// logo antes do return
const activeRoute = tab === "mais" && moreView ? moreView : tab;
```

Isso resolve um efeito colateral bom: **Priorização deixa de ser uma tela
escondida dentro de "Mais"** e passa a acender a aba correspondente no celular e
o item na barra lateral no desktop.

## 3. Troca do shell (bloco `return`, linhas 822–877)

### Antes

```jsx
return (
  <CategoriesContext.Provider value={categories}>
  <div className="app-shell">
    <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
      <div key={tab + (moreView || "")} className="tab-content" style={{ padding: "20px 18px 96px" }}>
        {tab === "inicio" && <><MonthNav .../><MemberFilterBar .../><InicioView .../></>}
        ...
      </div>
    </div>
    <BottomNav ... />
    {extratoAccount && <div style={{ position: "absolute", inset: 0, ... }}>...</div>}
    {showForm && <TransactionFormModal ... />}
    ... (todos os modais)
  </div>
  </CategoriesContext.Provider>
);
```

### Depois

```jsx
return (
  <CategoriesContext.Provider value={categories}>
    <AppShell
      activeRoute={activeRoute}
      onNavigate={(key) => {
        if (MAIN_TABS.includes(key)) { setTab(key); setMoreView(null); }
        else { setTab("mais"); setMoreView(key === "mais" ? null : key); }
      }}
      onAdd={() => { setEditingPlanned(null); setShowPlannedForm(true); }}
      userName={userName}
      topbar={
        <AppTopbar>
          <MonthNav month={selectedMonth} onChange={setSelectedMonth} />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
            <button
              onClick={() => { setEditingPlanned(null); setShowPlannedForm(true); }}
              className="btn-primary"
              style={{ minHeight: 44, padding: "0 18px", borderRadius: 10, border: "none",
                       background: COLORS.green, color: "#fff", fontWeight: 600, fontSize: 13.5 }}>
              Novo previsto
            </button>
          </div>
        </AppTopbar>
      }
    >
      {tab === "inicio" && (
        <>
          {/* Mês e pessoa saem daqui no desktop: passam a viver na topbar.
              No celular continuam no topo da tela, que é onde o dedo já está.
              O estado é o mesmo (selectedMonth / memberFilter) — o que muda é
              onde o controle é montado. */}
          <div className="only-phone" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <MonthNav month={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <div className="only-phone" style={{ marginBottom: 12 }}>
            <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
          </div>
          <InicioView /* ...exatamente as mesmas props de hoje... */ />
        </>
      )}

      {tab === "transacoes" && (
        <>
          <div className="only-phone" style={{ marginBottom: 12 }}>
            <MonthNav month={selectedMonth} onChange={setSelectedMonth} />
          </div>
          <TransacoesView /* ...mesmas props... */ />
        </>
      )}

      {tab === "orcamento" && (/* ...mesmas props... */}
      {tab === "mais" && moreView === null && <MaisMenuView onSelect={setMoreView} />}
      {/* ...todas as outras telas de `mais` continuam idênticas... */}
    </AppShell>

    {/* ── Overlays: agora FORA do shell ──────────────────────────────────────
        Este é o ponto central da correção. Antes todo modal era
        position:absolute dentro de .app-shell, então não tinha como virar um
        diálogo centralizado no desktop sem mexer na premissa do shell.
        Como ModalSheet usa position:fixed, os modais sobem um nível e passam a
        funcionar nos dois formatos sem nenhuma outra mudança. */}
    {extratoAccount && (
      <div style={{ position: "fixed", inset: 0, zIndex: 50, background: COLORS.paper, overflowY: "auto", padding: "20px 16px 96px" }}>
        <ExtratoView account={extratoAccount} transactions={transactions} sources={sources} onBack={() => setExtratoAccount(null)} />
      </div>
    )}

    {toast && (
      <div role="status" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)",
        bottom: "calc(var(--tabbar-height) + 24px)", background: COLORS.ink, color: "#fff",
        borderRadius: 12, padding: "11px 18px", fontSize: 13, fontWeight: 500, zIndex: 80,
        boxShadow: "0 10px 28px rgba(27,42,47,.26)", maxWidth: "min(92vw, 420px)", textAlign: "center" }}>
        {toast}
      </div>
    )}

    {showForm && <TransactionFormModal /* ...iguais... */ />}
    {showPlannedForm && <PlannedFormModal /* ...iguais... */ />}
    {payTarget && (/* ...iguais... */)}
    {contributeTarget && <ContributeModal /* ...iguais... */ />}
    {showGoalForm && <GoalFormModal /* ...iguais... */ />}
    {showCloseMonth && <CloseMonthModal /* ...iguais... */ />}
    {showAccountForm && <AccountFormModal /* ...iguais... */ />}
    {accountAction && <AccountScopeModal /* ...iguais... */ />}
  </CategoriesContext.Provider>
);
```

## 4. Um utilitário de visibilidade por dispositivo

Para não duplicar o contexto global (mês/pessoa) no desktop e no celular, use:

```css
/* index.css */
.only-phone { display: block; }
.only-desktop { display: none; }
@media (min-width: 980px) {
  .only-phone { display: none; }
  .only-desktop { display: block; }
}
```

```jsx
// App.jsx — o mesmo MonthNav/filtro de pessoa, sem repetir estado
<div className="only-phone"><MonthNav month={selectedMonth} onChange={setSelectedMonth} /></div>
<div className="only-desktop"><MonthNav month={selectedMonth} onChange={setSelectedMonth} /></div>
```

Isso não duplica dado nem estado: é o mesmo componente, montado no lugar certo
para cada formato. Se preferir evitar montagem dupla, use `useDevice()` e
renderize condicionalmente — o resultado visual é o mesmo.

## 5. Verificação depois do patch

1. `pnpm dev` e abrir em 390×844: a lista de contas em aberto aparece sem
   rolagem de 2 telas; a barra inferior respeita a safe-area do iPhone.
2. Redimensionar a janela para 700px de largura: nada de shell de 430px
   flutuando — o conteúdo passa a duas colunas e mantém a barra inferior.
3. Acima de 980px: barra lateral com todos os grupos, topbar com mês e pessoa,
   ação primária só uma. Abrir um modal e confirmar que ele é um diálogo
   centralizado com ESC funcionando.
4. Abrir o app em uma janela de 900×600 (notebook pequeno): o app ocupa a tela
   inteira, sem corte no topo nem na base.
