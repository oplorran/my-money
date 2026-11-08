# Catálogo do funil `growaiclub.com/pv13`

Levantamento presencial da cadeia completa em 05/nov/2026, do primeiro clique até o fim
da sequência pós-compra. Cada etapa abaixo foi percorrida no navegador em viewport de
celular (390x844) e é a fonte da replicação em `my-money`.

---

## 0. Ordem real das rotas (importante)

A ordem do funil **não** é a que estava implementada no projeto. O fluxo original é:

```
/pv13                     landing
/pv13/trading             sync → escolha de modo → 5 trades → popup de bloqueio
/pv13/withdraw            método de saque → confirmação → handshake → nome
/pv13/vsl                 chamada de "verificação" (agente de voz)
   ↓ CTA de ativação com preço dinâmico
checkout externo (go.centerpag.com)
   ↓ página de obrigado
/pay/up1                  upsell 1 — $297 premium
/pay/up2                  upsell 2 — survey 3 perguntas → AI Multiplier $197
/hot/up3a                 upsell 3 — "acesso expira em 6 meses" → vitalício $67
riseaiclub.com/login      área de membros
```

O simulador **não** vai para `/pay/up1`: o popup de saque leva para `/pv13/withdraw`, e
só a VSL leva ao checkout. O `up1` é pós-compra, não pós-simulador.

---

## 1. `/pv13` — landing

- Topo: três selos dos fabricantes citados (GPT/OpenAI, Google, Microsoft) sobrepostos.
- Badge `Balance $50.00` no canto superior direito.
- Card central: check verde em selo circular, `Congratulations!`, "You just won 1 free
  license of the official AI from GPT, Microsoft and Google.", divisória, "Take it — you
  already earned $50.00", "Activate the AI and multiply your balance in 60 seconds."
- CTA `START NOW` (fica `disabled` no clique), som de toque sintético, overlay
  "Activating your session / Connecting to the AI…" e navegação após ~1 s.
- Fundo: trilha vertical de logos/pill "AI · TRADE".

## 2. `/pv13/trading`

Quatro estados no mesmo componente:

1. **Sync** — pill "AI in sync · 500 stocks", grade 3x3 de logos (Meta, Apple, Microsoft,
   Google, Amazon, Netflix, Tesla, Visa, NVIDIA) com ticker e nome, texto "Scanning for
   high-probability opportunities…". Duração ~1,6 s.
2. **Escolha** — `How much do you want to make?`, "Move the slider to pick your mode",
   card "RECOMMENDED MODE" com valor estimado (`$51.43`), slider `LOW / CONSERVATIVE /
   MAXIMUM` com 2 marcas internas, "Slide to adjust", botão `START TRADING`.
3. **Sessão** — pill `LIVE`, card do ativo (`Apple Inc.` / `AAPL · NASDAQ`), faixa com
   GPT · GEMINI · COPILOT, `CURRENT BALANCE` com delta (`↑ +$60.44`) e saldo, badge
   `ACTIVE PROFIT`, contador `Completed trades 3 / 5`, lista de trades numerados
   (`TRADE #3` …) com lucro em verde e barra de brilho no trade em execução.
4. **Popup** — círculo verde com o saldo arredondado, `Withdrawal requested`,
   `$110.44`, pill "Pending verification", bloco âmbar `Withdrawal on hold` +
   "Your request was received, but it could not be released" + explicação de conta de
   demonstração, bloco "TO WITHDRAW YOUR BALANCE: Request the transfer to your account
   below.", botão verde `CONTINUE VERIFICATION` que passa por
   "Contacting the payments network…" antes de navegar.

## 3. `/pv13/withdraw`

- Pill `BALANCE VERIFIED AND READY`, label "Available to withdraw", valor grande
  (`$101.43` — vem do saldo simulado).
- "Tap your payout method" / "Choose one of the 2 available" (Bank, PayPal).
- Seleção revela bloco azul "The transfer goes to your linked personal account…",
  checkbox "I confirm I am over 18 years old and that these funds are mine." e
  `WITHDRAW NOW`.
- Envio → tela de handshake: "Encrypted connection to your bank / Processing
  withdrawal… / We are sending $X to your Bank account", checklist animado
  (Connecting to your bank… → Verifying details… → Processing transfer…), selo
  "Protected by AES-256 encryption".
- Em seguida o cartão `VERIFICATION PENDING`: "Your $X withdrawal needs verification /
  Enter your first name to start the identity check and release the funds.", campo
  `FIRST NAME`, `COMPLETE NOW`, nota "This step confirms your identity…" e
  "4 minutes · One-time verification".
- Confirmar → "Sarah Klein / Account Manager / Connecting… / Connecting you to finish
  verification" → `/pv13/vsl`.

## 4. `/pv13/vsl` — a "verificação" por voz

- Tela de chamada: avatar, "Daniel Torres" (no nosso caso Alex Parker),
  "Money Club · Verification Dept.", pill `On call`, ícones de mute e encerrar.
- Legendas grandes em branco com destaque em ciano nas palavras-chave, reveladas
  palavra a palavra conforme o áudio.
- Cartão `ledger`: `ACCOUNT BALANCE` + valor em verde, "Available after verification",
  linhas `PENDING / Withdrawal method / Bank`, `Session / Completed`, `Operations / 5`,
  rodapé `MONEY CLUB · LEDGER` e `REF-1046`.
- Sair (botão encerrar ou voltar) abre modal `End the call?` — "If you leave now the call
  ends, and the $X balance on your account will be permanently removed." com
  `Back to the call` and `End and lose the balance` (ver §4.1).
- Sequência de fala: abertura → pull do arquivo → `p2` "What's your situation right now?"
  (5 opções, hint "Tap one of the buttons below") → mecanismo (patente Bill Gates,
  200 ativos/s) → cena `ACCURACY RATE` com contador 73,00 % → curva SVG subindo até
  `83.33 %` rotulado "18 months later" / "Launch" → confiança >90% → provas
  (María/James/Marco, cruzeiro, Dubai) → `p1` meta mensal (input numérico +
  `Confirm`, rodapé "Type your target above, then tap Confirm") → overlay `PROJECTION`
  de 4 colunas (`Week 1 — calibrating`, `Month 1 — calibration`, `Month 2 — on target`,
  `Month 3 — full speed`) com linha final `90 days` e rodapé "Based on your profile" →
  `p3` "What's left after your monthly bills?" (6 opções, mesmo hint) →
  "Processing withdrawal" com cena institucional em 2 fases (BUY/SELL, 1.2M pontos/s,
  HEDGE FUNDS / INVESTMENT BANKS / PROP DESKS / MARKET MAKERS → "Institutional
  algorithms / The same engines banks use — now in your pocket") → garantia de 7 dias →
  escassez `300/350` "Only 50 spots left in this cycle" → ancoragem
  `$2,000 / $500 / $200` → preço `$29.90 TODAY ONLY` → `ACTIVATION LOCKED` →
  `p5` "Ready to activate your account?" (`I want to activate my account` = +2,
  `Not yet, I need to think` = 0) → `ACTIVATION UNLOCKED $29.90`, `Tap to activate`,
  "ONE-TIME · 7-DAY GUARANTEE · ACCESS BY EMAIL", link de recusa
  `I don't want this offer` e botão `Tap to hear Daniel`.
- Preço/tier definido pelo score das respostas (`p1`, `p2`, `p3`, `p5`).
- CTA → `?to=<checkout do tier>`.

## 5. `/pay/up1` — premium $297 (página de obrigado do gateway)

- Barra `Attention! Your APP access is not 100% complete yet...`.
- Stepper de 3 passos: `Sign-Up / Complete / ✓` (concluídos) → `Activate / Your / Plan`
  (atual) → `Completed`.
- H1 "Congratulations! You now have access to Money Club."
- "Before you start trading, activate your premium plan to unlock the full potential of
  the AI."
- Lista colorida de 4 benefícios (40+ análises/dia, 92% win rate, gerente de conta,
  `$800–$1,000/day`).
- Card de preço com selo `⭐ PREMIUM PLAN`, `US $297`, "one-time payment" e 5 itens.
- `ACTIVATE PREMIUM` → checkout; skip "No thanks, I want to stay on the basic plan" →
  `/hot/up2`.

## 6. `/pay/up2` — survey + AI Multiplier $197

- `Question 1 of 3` + barra de 33/67/100%:
  1. "What's your current financial situation?" — STRUGGLING / STABLE BUT LIMITED /
     COMFORTABLE / VERY COMFORTABLE
  2. "How much do you want to earn per month?" — $5–10k / $10–20k / $20–35k / >$35k
  3. "In how long do you want to achieve this?" — <6 meses / 6–12 meses / 1–2 anos
- Fim: "Your profile is ready! Based on your answers, we identified the perfect solution
  to accelerate your results." + `SEE MY RESULT`.
- Pitch: "AI Multiplier — the tool that takes your Money Club earnings and multiplies
  them automatically using compound interest." + 4 bullets → `CONTINUE`.
- Oferta `AI MULTIPLIER` `US $197`, one-time, 5 itens, `ACTIVATE MULTIPLIER`,
  "7-day guarantee · One-time payment", skip → `/hot/up3a`.

## 7. `/hot/up3a` — vitalício $67

- "WARNING: Your Money Club access expires in 6 months!", lista do que acabou de ativar
  (premium, AI Multiplier, Pro Mode).
- Explicação contratual de 6 meses, cenário de perda, `The Solution`, "founding member".
- `US$67`, `ACTIVATE LIFETIME ACCESS`, "Unconditional 7-day guarantee…".
- Skip → `riseaiclub.com/login` (área de membros: `EXCLUSIVE ACCESS`, e-mail, `Sign in`,
  "Members only · no password required").

---

## 8. Checkouts observados ao vivo

| Etapa | ID CenterPag |
| --- | --- |
| Ativação tier 17 (full) | PPU38CQG07H |
| Ativação tier 27 (full) | PPU38CQG07I |
| Ativação tier 47 (full) | PPU38CQG07K |
| Ativação tier 67 (full) | PPU38CQG07L |
| Ativação tier 97 (full) | PPU38CQG07M |
| Downsell tier 17 | PPU38CQG07N |
| Downsell tier 27 | PPU38CQG07O |
| Downsell tier 47 | PPU38CQG07P |
| Downsell tier 67 | PPU38CQG07R |
| Downsell tier 97 | PPU38CQG07S |
| `/back` retargeting full | PPU38CQFUFH |
| `/back` downsell | PPU38CQFUFG |
| Premium pós-compra ($297) | PPU38CQHH1O |
| AI Multiplier ($197) | PPU38CQHH1P |
| Vitalício ($67) | PPU38CQHH1Q |

Todos os CTAs internos passam por um redirector (padrão `/hotwt/<step>?to=…`) que
repassa `sck`, `xcod` e UTMs e só então sai para o gateway.

Verificado ao vivo em 08/nov/2026:

- `/pay/up1`, `/pay/up2` e `/hot/up3a` existem e são servidos nesses caminhos.
- `/pay/up3` é um alias do mesmo upsell vitalício de `/hot/up3a`; os dois renderizam
  `components/up3-offer.tsx`.
- Os CTAs de compra dos upsells apontam para `/br/wt/up1`, `/br/wt/up2` e `/br/wt/up3`
  com `?to=<checkout>` — o mesmo redirector branco, só com prefixo de idioma.
- Os skips usam `/hot/up2` (up1) e `/hot/up3a` (up2); o skip do up3 vai para a área de
  membros.

## 9. Área de membros (`riseaiclub.com/login`)

`EXCLUSIVE ACCESS`, campo `Email` (`you@email.com`), botão `Sign in` (fica `disabled`
até o e-mail ser válido), rodapé "Use the email you used when you purchased" e
"Members only · no password required". Não existe tela de senha.
