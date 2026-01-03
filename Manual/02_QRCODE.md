# 02. Tecnologia QR Code

O coração da fiscalização da SwiftRide é o **QR Code Inteligente**. Ao contrário de um código estático, os nossos QR Codes são otimizados para velocidade e segurança.

## 🔗 Estrutura do Dado
Para garantir a máxima precisão no escaneamento (mesmo em câmeras de baixo desempenho), o sistema utiliza um **Identificador Único (UUID)**.

*   **Conteúdo do QR**: Uma string única (ex: `e123-456b-789c`).
*   **Vantagem**: Menos dados no desenho do QR = Padrão mais simples e fácil de ler à distância ou com trepidação.

## ⚙️ Funcionamento das Leituras
1.  **Geração**: Ao criar uma Escala no Dashboard, o sistema gera o QR Code vinculado àquela `registration_id`.
2.  **Identificação**: Quando o fiscal scaneia, o App Mobile não decide quem é o motorista sozinho; ele pergunta à Nuvem: *"Quem é o dono desse ID?"*.
3.  **Resposta em Tempo Real**: O banco de dados responde instantaneamente com os dados do ônibus, motorista e rota.

---
### ⚠️ Melhoria Implementada (Jan/2026)
Migramos do formato **JSON (texto longo)** para o formato **ID Único (texto curto)**. Isso resolveu o erro de "QR Code Incompatível" e permitiu leituras 40% mais rápidas em dispositivos Android e iOS.
