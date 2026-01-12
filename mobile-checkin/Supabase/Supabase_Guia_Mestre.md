# Guia mestre Supabase: Web & Mobile (Swiftride)

Este documento é o guia definitivo para você se tornar um expert em como o Supabase gerencia o ecossistema do Swiftride.

---

## 1. O que é o Supabase?
O Supabase não é apenas um banco de dados. Ele é um "Backend-as-a-Service" (BaaS) que nos fornece:
- **Banco de Dados (PostgreSQL):** Onde os dados realmente moram.
- **Autenticação:** Gerencia quem pode entrar no sistema (Admin vs Motorista).
- **Auto-API:** Gera automaticamente as ferramentas para o Web e Mobile conversarem com o banco.
- **Real-time:** Permite que o Dashboard saiba de uma leitura de QR Code no segundo em que ela acontece.

---

## 2. Estrutura de Dados (Tabelas)
Aqui está como o coração do seu sistema está organizado:

### `buses` (Ônibus)
- **ID:** Identificador único interno.
- **plate:** Placa do veículo (ex: ABC1234).
- **bus_number:** Número de ordem (ex: 105).
- *Função:* Armazena a frota ativa da empresa.

### `drivers` (Motoristas)
- **name:** Nome completo.
- **license_number:** Registro da CNH.
- *Função:* Cadastro de quem opera os veículos.

### `routes` (Rotas)
- **name:** Nome da linha ou itinerário.
- *Função:* Define para onde os ônibus estão indo.

### `registrations` (Escalas/Check-ins)
Esta é a tabela mais importante. Ela une tudo:
- **bus_id:** Aponta para qual ônibus.
- **driver_id:** Aponta para quem está dirigindo.
- **route_id:** Aponta qual rota está sendo feita.
- **status:** Se a escala está ativa ou encerrada.
- *Função:* É daqui que o QR Code retira as informações. Quando o fiscal lê o QR, ele está lendo o `ID` de um registro nesta tabela.

---

## 3. Integração Passo a Passo (Linha a Linha)

### A. No Dashboard Web (O Cérebro)
No código `lib/supabase.ts`, o sistema se conecta:
```typescript
// 1. Cria a conexão usando as chaves secretas
export const supabase = createClient(URL, ANON_KEY);

// 2. No Cadastro.tsx, ele insere dados:
await supabase.from('buses').insert({ plate: 'XYX1010' });
```
*   **Fluxo:** O Admin cadastra o ônibus -> O Supabase salva -> O Supabase gera um link de QR Code baseado no ID daquela escala.

### B. No App Mobile (Os Olhos)
No código `QRScanner.tsx`:
```typescript
// 1. O fiscal lê o QR Code
const qrData = JSON.parse(decodedText);

// 2. O App pergunta ao Supabase: "Essa escala ainda é válida?"
const { data } = await supabase
  .from('registrations')
  .select('*, drivers(name)')
  .eq('id', qrData.id);

// 3. O App registra a leitura:
await supabase.from('readings').insert({ registration_id: data.id });
```

---

## 4. O Segredo do Modo Offline
Você me pediu para garantir que o Offline funcione. Veja como ele faz:
1.  **Tentativa:** O App tenta enviar para o Supabase.
2.  **Falha:** Se não há internet, o Supabase retorna erro.
3.  **Local Storage:** O código captura esse erro e salva no seu celular (LocalStorage).
4.  **Sincronização:** Quando a internet volta, o App percorre essa lista e faz vários `insert` seguidos no Supabase.

---

## 5. Como ser um Expert (Dicas de Ouro)
1.  **SQL Editor:** No portal do Supabase, você pode rodar comandos direto. Digite `SELECT * FROM registrations` para ver tudo em tempo real.
2.  **RLS (Row Level Security):** O Supabase protege seus dados. Só quem tem a chave certa pode ler.
3.  **Logs:** Se o App mobile não atualizar algo, olhe o "Dashboard -> API" no portal do Supabase para ver o erro exato que o banco devolveu.

---

*Documentação criada em 01/01/2026 para o projeto Swiftride.*
