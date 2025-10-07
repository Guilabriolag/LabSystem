
☆
# 🚀 LabSystem: Gerenciamento Serverless para Lojas

O **LabSystem** é um sistema de Gerenciamento de Conteúdo (CMS) Serverless personalizado, projetado para ser uma solução completa para estabelecimentos como restaurantes, lanchonetes ou cafés. Ele oferece um **Totem Digital** (lado do cliente) e um **Painel de Administração** (lado gerencial) que operam sem depender de um servidor de hospedagem tradicional, garantindo autonomia e baixo custo operacional.

## O Que é o LabSystem?

O LabSystem é um ecossistema digital dividido em duas partes principais que funcionam de forma independente, utilizando um banco de dados em nuvem simples (como o JSONBin) para sincronização de dados.

| Módulo | Descrição |
| :--- | :--- |
| **Painel CMS de Gerenciamento** | Interface administrativa (`cms_admin/index1.html`) responsável por configurar, gerenciar e publicar todo o conteúdo da loja. |
| **Totem / Loja Digital** | Interface de exibição (`totem/index1.html`), que lê os dados publicados em tempo real e apresenta o cardápio, cores e status da loja. |

-----

## 💻 Painel CMS de Gerenciamento (CMS Control)

O Painel CMS oferece uma interface administrativa com foco em UI/UX avançado para controlar toda a operação da loja.

\<div align="center"\>
\<a href="[https://guilabriolag.github.io/LabSystem/cms\_admin/index](https://guilabriolag.github.io/LabSystem/cms_admin/index)" target="\_blank" rel="noopener noreferrer"\>
\<img src="[https://img.shields.io/badge/Acessar%20CMS-50B4D1?style=for-the-badge\&logo=googlechrome\&logoColor=white](https://www.google.com/search?q=https://img.shields.io/badge/Acessar%2520CMS-50B4D1%3Fstyle%3Dfor-the-badge%26logo%3Dgooglechrome%26logoColor%3Dwhite)" alt="Botão Acessar CMS"\>
\</a\>
\</div\>

| Módulo | Funcionalidade Detalhada |
| :--- | :--- |
| **Publicação** | Sincroniza e envia todos os dados (cardápio, cores, status) para o Totem Digital usando o **JSONBin** e a **Master Key**. |
| **Dados Operacionais** | Gerencia informações vitais: **Status de Abertura/Fechamento**, contato via **WhatsApp**, e configuração de **Taxas/Áreas de Entrega** (por bairro/tempo). |
| **Cardápio / Itens** | Controle completo de **Categorias e Produtos**, incluindo nome, preço, imagem, estoque e **alertas de baixo estoque**. |
| **Customizar Totem** | Define a experiência visual do Totem, ajustando **cores**, **logo**, **imagem de fundo** e **música ambiente** (via URL do YouTube) com controle de volume. |

-----

## 🏗️ Principais Pilares do Conceito Serverless

O LabSystem adota uma arquitetura Serverless (Sem Servidor) baseada em simplicidade, autonomia e baixo custo operacional.

### 1\. Custo e Simplicidade

  * **Custo Zero de Hospedagem:** Dispensa servidores dedicados, bancos de dados tradicionais (MySQL, PostgreSQL) ou planos de hospedagem caros.
  * **Tecnologia Base:** Desenvolvido inteiramente com **HTML, CSS (Tailwind CSS)** e **JavaScript**, eliminando a necessidade de linguagens de servidor (PHP, Python, Node.js).

### 2\. Autonomia e Sincronização

  * **Armazenamento Local (Rascunho):** Todos os ajustes feitos no Painel CMS são salvos inicialmente no navegador, via **LocalStorage**, permitindo **edição offline** e segurança de dados antes da publicação.
  * **Sincronização na Nuvem:** Ao acionar **“Publicar e Sincronizar Dados”**, as informações locais são enviadas ao JSONBin, garantindo **atualização instantânea** no Totem Digital.

### 3\. Segurança e Controle

  * **Segurança de Dados:** Os dados sensíveis são protegidos pela **Master Key** no processo de escrita/publicação no JSONBin.
  * **Facilidade de Implantação:** A instalação é feita apenas copiando os arquivos para qualquer plataforma de hospedagem estática (GitHub Pages, Vercel, Netlify).

-----

## ✨ Vantagens e Benefícios do LabSystem

O LabSystem representa uma nova abordagem para gestão digital, unindo simplicidade, autonomia e eficiência.

| Vantagem | Descrição |
| :--- | :--- |
| **Atualização Instantânea** | Sincronização direta e em tempo real entre o CMS e o Totem (lado do cliente) via nuvem, sem atrasos. |
| **Controle Visual** | O módulo **Customizar Totem** permite adaptar a interface à identidade visual de cada marca de forma imediata. |
| **Design Moderno** | Interface limpa, moderna e responsiva, garantindo uma experiência de cliente agradável em qualquer dispositivo. |
| **Escalabilidade Simples** | O projeto pode ser replicado facilmente para múltiplas lojas, cada uma com seu próprio Bin ID e configurações independentes. |

### Conclusão

O LabSystem oferece uma solução centralizada, leve e de baixo custo para administrar e exibir informações da loja de forma moderna e integrada. É a prova de que a gestão digital eficiente pode ser alcançada sem a complexidade e os custos de uma arquitetura baseada em servidor.
