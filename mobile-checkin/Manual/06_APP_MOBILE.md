# 06. Funcionalidades: App Mobile

O App Mobile é a extensão visual do sistema na rua. Como um **PWA (Progressive Web App)**, ele funciona como um aplicativo instalado, mas roda via navegador.

## 📱 Fluxo de Trabalho do Fiscal

1.  **Identificação**: O fiscal abre o app e clica em "Ler QR Code".
2.  **Escaneamento**: A câmera é ativada. Ao ler o código, o sistema busca os dados da escala.
3.  **Confirmação/Divergência**: 
    *   Se estiver tudo certo, o fiscal apenas confirma.
    *   Se o motorista for outro, o fiscal marca a "Divergência", digita o nome real e envia.
4.  **Histórico**: O fiscal pode consultar na hora as últimas leituras feitas por ele para evitar duplicidade.

## 🛠️ Detalhes Técnicos
*   **Câmera**: Integração direta com a API de câmera do celular para foco rápido.
*   **Localização**: O sistema pode capturar a coordenada GPS no momento da leitura (opcional).
*   **Instalação**: No Android/iPhone, basta clicar em "Compartilhar" ➔ "Adicionar à Tela de Início".

---
### 📈 Próximas Melhorias (Roadmap)
*   **Assinatura Digital**: Captura de assinatura do motorista na tela do celular.
*   **Fotos de Ocorrência**: Opção de tirar foto se o ônibus tiver algum problema visual.
*   **Modo Baixa Luz**: Lanterna automática durante a leitura (se disponível).
