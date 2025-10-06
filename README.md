# ⚡️ LabSystem: Serverless Store Management (CMS + Totem)

O **LabSystem** é uma solução completa e *serverless* (sem servidor tradicional) para gerenciamento de lojas digitais, ideal para negócios de fast-food e varejo que buscam agilidade e baixo custo operacional. A persistência de dados é totalmente baseada em Front-end e no serviço de JSON as a Service (JSONBin).

---

## 🏛️ Arquitetura do Sistema

O sistema é modular e composto por dois módulos principais que interagem através de uma API de dados pública (JSONBin):

1.  **CMS Admin (`/cms_admin`)**: O Painel de Gerenciamento da Loja.
    * **Função:** O comerciante configura produtos, preços, cores, métodos de pagamento (PIX, Bitcoin/Lightning) e dados de contato.
    * **Persistência:** Salva o trabalho localmente (`localStorage`) para rascunho e envia os dados para o JSONBin via botão **PUBLICAR**.
2.  **Totem Público (`/totem`)**: A Interface de Pedidos.
    * **Função:** O cliente final visualiza o cardápio, adiciona ao carrinho e finaliza o pedido (checkout via WhatsApp).
    * **Leitura:** Carrega as configurações da loja dinamicamente via `GET` no JSONBin (com *fallback* para *cache* local).

---

## 🛠️ Status Atual e Próximos Passos

| Módulo | Status | Descrição |
| :--- | :--- | :--- |
| **Estrutura** | ✅ Concluído | Pastas `/cms_admin/`, `/totem/`, `/assets/` e `README.md` criados. |
| **CMS Admin (UI)** | 🟡 Em Desenvolvimento | Interface básica (`index1.html`) em construção com Tailwind CSS. |
| **CMS Admin (Lógica)** | 🔴 Pendente | Implementação da lógica `StoreManager` e salvamento duplo. |
| **Totem Público** | 🔴 Pendente | Desenvolvimento da interface de pedidos e lógica de leitura. |

---
## 🔑 Configuração (JSONBin)

Cada loja do LabSystem usa credenciais únicas:

| Credencial | Uso no CMS Admin |
| :--- | :--- |
| **BIN ID** | Identifica a loja. Usado para **Leitura** (GET) e **Escrita** (PUT) de dados. |
| **MASTER KEY** | A chave secreta pessoal do desenvolvedor. Usada para autenticar a **Escrita (PUT/Atualização)** de dados no JSONBin. |
