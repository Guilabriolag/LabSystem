LabSystem
O LabSystem é um sistema de Gerenciamento de Conteúdo (CMS) Serverless personalizado, projetado para ser uma solução completa para lojas — como restaurantes, lanchonetes ou cafés — que necessitam de um Totem Digital (lado do cliente) e um Painel de Administração (lado gerencial), sem depender de um servidor de hospedagem tradicional.

O que é o LabSystem?
O LabSystem é um ecossistema digital dividido em duas partes principais, que funcionam de forma independente e utilizam um banco de dados em nuvem simples (como o JSONBin) para sincronização.

1. Painel CMS de Gerenciamento (CMS Control)
Interface administrativa (index1.html) com foco em UI/UX avançado, responsável por controlar toda a operação da loja.

Módulo

Descrição

Publicação

Sincroniza e envia todos os dados (cardápio, cores, status) para o Totem Digital usando o JSONBin e a Master Key.

Dados Operacionais

Gerencia informações vitais da loja, como Status de Abertura/Fechamento, contato via WhatsApp, e Taxas/Áreas de Entrega (por bairro/tempo).

Cardápio / Itens

Controla Categorias e Produtos, incluindo nome, preço, imagem, estoque e alertas de baixo estoque.

Customizar Totem

Define a experiência visual do Totem, ajustando cores, logo, imagem de fundo e música ambiente (via URL do YouTube) com controle de volume.

2. Totem / Loja Digital (Lado do Cliente)
Interface exibida ao cliente (por exemplo, em /totem/index1.html), que lê os dados publicados no JSONBin e apresenta o cardápio, cores e status da loja em tempo real.

Principais Pilares do Conceito Serverless
O LabSystem adota uma arquitetura Serverless (Sem Servidor), baseada em simplicidade, autonomia e baixo custo operacional.

Armazenamento Local (Rascunho): Todos os ajustes feitos no Painel CMS são salvos inicialmente no navegador, via LocalStorage, permitindo edição offline e segurança de dados antes da publicação.
Sincronização na Nuvem: Ao acionar “Publicar e Sincronizar Dados”, as informações locais são enviadas ao JSONBin utilizando a Master Key, garantindo atualização instantânea no Totem Digital.
Tecnologia Base: Desenvolvido inteiramente com HTML, CSS (Tailwind CSS) e JavaScript, eliminando a necessidade de linguagens de servidor (PHP, Python, Node.js) e bancos de dados tradicionais.
Benefícios do LabSystem
Custo Zero de Hospedagem: Dispensa servidores dedicados ou planos de hospedagem.
Atualização Instantânea: Sincronização direta entre CMS e Totem via nuvem.
Escalabilidade Simples: Pode ser replicado para múltiplas lojas com configurações independentes.
Segurança e Controle: Dados sensíveis protegidos pela Master Key e armazenados apenas no navegador e na nuvem.
Design Personalizável: Interface moderna e adaptável à identidade visual de cada marca.
Conclusão
O LabSystem representa uma nova abordagem para gestão digital de lojas, unindo simplicidade, autonomia e eficiência.
Com sua estrutura Serverless, oferece uma solução centralizada, leve e de baixo custo para administrar e exibir informações de forma moderna e integrada.
