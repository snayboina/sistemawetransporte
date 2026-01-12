# 03. Sicronização: Online & Offline

O SwiftRide foi construído para ser resiliente. Sabemos que garagens e estradas nem sempre têm o melhor 4G/5G.

## 📡 Modo Online (Padrão)
Quando o celular tem sinal, a leitura é enviada instantaneamente para o **Supabase**. O Dashboard Web recebe um "pulso" via Real-time e a tela atualiza sozinha sem precisar dar F5.

## 💾 Modo Offline (Resiliência)
Se o fiscal estiver em um ponto sem internet (ex: subsolo ou rodovia):
1.  **Detecção Automática**: O App detecta que o envio falhou.
2.  **Armazenamento Local**: A leitura é salva em um banco de dados temporário dentro do próprio celular (**LocalStorage/IndexedDB**).
3.  **Fila de Espera**: O App cria uma "Fila de Sincronização".

## 🔄 Sincronização Automática
Assim que o celular recupera qualquer sinal de internet, o App automaticamente percorre a fila e envia todas as leituras acumuladas para o servidor, mantendo a data e hora originais da batida.

---
### 🔒 Segurança de Dados
Mesmo que o fiscal feche o aplicativo ou o celular descarregue, as leituras offline **não são perdidas**. Elas ficam guardadas no dispositivo até que a sincronização seja concluída com sucesso.
