# PRD: BioMeter – Espelho Biológico (Micro-SaaS)

## 1. Visão Geral do Produto

O **BioMeter** é um Micro-SaaS focado em indivíduos neurodivergentes (TDAH/Autismo) que sofrem de baixa interocepção. O sistema funciona como um "painel de status de personagem de RPG" para a vida real, visualizando necessidades biológicas (fome, sede, energia) que decaem automaticamente com o tempo.

- **Objetivo:** Reduzir o esgotamento físico através da consciência visual.
- **Público-alvo:** Pessoas com TDAH, Autistas e entusiastas de biohacking.
- **Diferencial:** Zero necessidade de input constante. As barras caem sozinhas; o usuário apenas clica para "reabastecer".

---

## 2. Stack Técnica (The "Instagram Pro" Stack)

- **Frontend:** Next.js 15 (App Router).
- **UI/Styling:** Tailwind CSS + Shadcn UI (Visual clean e minimalista).
- **Backend/Banco:** Supabase (Auth, PostgreSQL, Realtime).
- **Pagamentos:** Stripe (Checkout externo para evitar taxas de App Store).
- **Notificações:** Web Push API via OneSignal.

---

## 3. Funcionalidades Principais (MVP)

### 3.1. Motor de Decaimento de Status (Core)

- Visualização de barras de progresso (Shadcn `Progress`).
- Lógica de cálculo: `ValorAtual = ValorRef - (TaxaDeDecaimento * HorasPassadas)`.
- Botões de "Refill" rápido para resetar a barra a 100%.

### 3.2. Gerenciamento de Status

- Usuários Free: Podem criar até 3 barras (Ex: Água, Comida, Energia).
- Usuários Pro: Barras ilimitadas + ícones personalizados.

### 3.3. Sistema de Notificações

- Alerta quando uma barra atinge o nível crítico (ex: < 15%).
- Notificações enviadas via navegador (PWA).

---

## 4. Arquitetura de Dados (Supabase)

### Tabela: `profiles`

- `id`: uuid (PK)
- `is_pro`: boolean (default: false)
- `stripe_customer_id`: text

### Tabela: `stats`

- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `name`: text (ex: "Hidratação")
- `current_value`: float (valor no último refill)
- `decay_rate`: float (quanto perde por hora, ex: 16.6 para 6 horas total)
- `last_refill`: timestamptz (momento do último clique em "reabastecer")
- `color`: text (hex para a cor da barra)

---

## 5. Roadmap de Monetização ("Até a Primeira Venda")

1. **Fase 1 (Freemium):** App funcional com limite de 3 barras.
2. **Fase 2 (Paywall):** Gatilho de venda ao tentar adicionar a 4ª barra.
3. **Fase 3 (Conversão):** Redirect para Stripe Checkout (Plano Vitalício de R$ 47,00).

---

## 6. Regras de Negócio Importantes

- **Persistência:** O estado das barras deve ser calculado no Client-side mas sincronizado com o Supabase para cross-device.
- **Offline First:** O PWA deve abrir mesmo sem internet (usando cache do Next.js).
- **Simplicidade:** O app deve carregar em menos de 2 segundos.