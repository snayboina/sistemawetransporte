# 📜 Guia Mestre: Padrões de Commit (Semantic Commits)

Este guia explica como escrever mensagens de commit profissionais usando o padrão **Conventional Commits**. Isso deixa o histórico do Git limpo, legível e organizado.

##  Estrutura Básica
Uma mensagem de commit deve ter esta estrutura:
```text
tipo: Descrição curta e objetiva do que foi feito
```
Exemplo:
`feat: Adiciona botão de login na tela inicial`

---

## 🎨 O Dicionário de Prefixos (Tipos)

Aqui estão os tipos mais importantes que você vai usar no dia a dia:

### ✨ `feat` (Feature / Funcionalidade)
*   **Quando usar:** Quando você cria uma **nova funcionalidade** para o usuário.
*   **Exemplos:**
    *   `feat: Adiciona sistema de busca de motoristas`
    *   `feat: Cria tela de perfil do usuário`
    *   `feat: Implementa integração com API de pagamentos`

### 🐛 `fix` (Correção)
*   **Quando usar:** Quando você corrige um **bug** ou erro no sistema.
*   **Exemplos:**
    *   `fix: Corrige erro de cálculo na planilha de rotas`
    *   `fix: Resolve quebra de layout no mobile`
    *   `fix: Impede cadastro de CPF inválido`

### 🎨 `style` (Estilo)
*   **Quando usar:** Alterações de **visual** ou **formatação** que não mudam a lógica do código (CSS, espaços, vírgulas, imagens).
*   **Exemplos:**
    *   `style: Muda cor do botão para amarelo`
    *   `style: Ajusta margens do formulário`
    *   `style: Corrige indentação no arquivo Welcome.tsx`

### ♻️ `refactor` (Refatoração)
*   **Quando usar:** Quando você melhora o código (deixa mais limpo ou rápido) **sem** criar funcionalidades novas nem corrigir bugs.
*   **Exemplos:**
    *   `refactor: Otimiza função de cálculo de rota`
    *   `refactor: Simplifica lógica do carrinho de compras`
    *   `refactor: Remove código morto/não utilizado`

### 📚 `docs` (Documentação)
*   **Quando usar:** Alterações apenas em arquivos de documentação (README, manuais, comentários).
*   **Exemplos:**
    *   `docs: Atualiza instruções de instalação no README`
    *   `docs: Adiciona comentários explicativos no código`

### 🧹 `chore` (Tarefas / Manutenção)
*   **Quando usar:** Alterações utilitárias, configurações de ferramentas ou dependências que não alteram o código de produção.
*   **Exemplos:**
    *   `chore: Atualiza versão do React`
    *   `chore: Configura regras do ESLint`
    *   `chore: Limpa arquivos temporários`

### ⚡ `perf` (Performance)
*   **Quando usar:** Mudanças focadas apenas em melhorar o desempenho.
*   **Exemplos:**
    *   `perf: Melhora tempo de carregamento da Home`
    *   `perf: Reduz tamanho das imagens`

---

## 💡 Dicas de Ouro

1.  **Use o Imperativo:** Escreva como se estivesse dando uma ordem ao código.
    *   ✅ `feat: Adiciona filtro` (Bom)
    *   ❌ `feat: Adicionei um filtro` (Ruim)
    *   ❌ `feat: Adicionando filtro` (Ruim)

2.  **Seja Curto:** A primeira linha deve ter no máximo 50-70 caracteres. Se precisar explicar mais, pule uma linha e escreva um texto detalhado abaixo.

3.  **Português ou Inglês?** Escolha um e mantenha. Se o projeto é brasileiro, pode usar PT-BR (`feat: Adiciona...`). Se pretende open-source global, use EN (`feat: Add...`).

---

## 🚀 Exemplo de Histórico Organizado
Veja como fica bonito no GitKraken:

*   `fix: Corrige botão travado no iPhone`
*   `style: Atualiza sombra dos cards`
*   `feat: Adiciona página de relatórios`
*   `docs: Explica como rodar o projeto`
*   `chore: Atualiza bibliotecas`
