# 04. Estrutura do Banco de Dados

Utilizamos o **Supabase (PostgreSQL)** como motor principal. A estrutura é relacional, o que garante que nenhum dado fique "solto".

## 📋 Principais Tabelas

1.  **`buses`**: Cadastro da frota (Placa e Número).
2.  **`drivers`**: Cadastro de motoristas oficiais.
3.  **`routes`**: Itinerários e linhas.
4.  **`registrations`**: A tabela mestre de escalas. Vincula um ônibus a um motorista e uma rota em um determinado período.
5.  **`readings`**: Registro de todas as batidas de QR Code. É aqui que as divergências são detectadas.

## ⚠️ Lógica de Divergência
Diferente de sistemas comuns, nossa tabela de `readings` possui campos especiais:
*   **`driver_name`**: Nome de quem o sistema esperava.
*   **`real_driver_name`**: Nome de quem o fiscal identificou.
*   **`has_divergence`**: Um interruptor (True/False) que acende o alerta no Dashboard.

---
### 🛡️ Segurança (RLS)
O banco de dados utiliza **Row Level Security**, o que significa que mesmo que alguém descubra a URL do banco, não conseguirá ver os dados sem as chaves de acesso (API Keys) autorizadas pelo sistema.
