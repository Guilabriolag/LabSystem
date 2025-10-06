// ====================================================================
// Serverless-System | TOTEM PÚBLICO - LÓGICA DE LEITURA (script.js)
// ====================================================================

// Variável global para armazenar os dados da loja
let storeData = null; 

// A CHAVE BIN ID DA LOJA (DEVE SER CONFIGURADA POR CLIENTE)
// Em um cenário real, o comerciante daria este ID a você, e você o inseriria aqui.
const CLIENT_BIN_ID = 'SUA_BIN_ID_DE_TESTE'; // SUBSTITUA PELO BIN ID REAL DO JSONBIN
const DATA_CACHE_KEY = 'labsystem_totem_cache'; // Chave para o cache local do Totem

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    initTotem();
    // Adiciona listener para o botão do carrinho
    document.getElementById('cart-button').addEventListener('click', toggleDrawer);
});

// ====================================================================
// FUNÇÕES DE PERSISTÊNCIA (CACHE-FIRST)
// ====================================================================

async function initTotem() {
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = 'Carregando dados da loja...';
    
    // Tentar carregar a versão mais recente do JSONBin
    const remoteData = await loadRemoteData();
    
    if (remoteData) {
        storeData = remoteData;
        console.log("Dados carregados do JSONBin com sucesso.");
    } else {
        // Falha no remoto: tentar o cache local
        storeData = loadLocalCache();
        if (storeData) {
            console.log("Falha no JSONBin, usando dados do cache local.");
        } else {
            // Falha total: loja fechada ou erro fatal
            storeData = { configuracoes: { storeStatus: 'closed' } };
            loadingMessage.textContent = '❌ Não foi possível carregar a loja. Tente novamente mais tarde.';
            document.getElementById('header-title').textContent = 'LOJA FECHADA / ERRO';
            return; 
        }
    }

    // Se houver dados (remoto ou cache), renderizar a loja
    renderStore(storeData);
}

// 1. Tenta buscar os dados mais recentes do JSONBin (GET)
async function loadRemoteData() {
    if (!CLIENT_BIN_ID || CLIENT_BIN_ID === 'SUA_BIN_ID_DE_TESTE') {
        console.warn("CLIENT_BIN_ID não configurado. Pulando JSONBin.");
        return null;
    }

    const url = `https://api.jsonbin.io/v3/b/${CLIENT_BIN_ID}/latest`; // Pega a versão mais recente
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`JSONBin status: ${response.status}`);
        }
        const data = await response.json();
        
        // Salva os dados mais recentes no cache local
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data.record));
        return data.record; // Retorna o objeto de dados da loja
        
    } catch (error) {
        console.error('Erro ao buscar do JSONBin:', error);
        return null; // Retorna nulo se falhar
    }
}

// 2. Carrega dados do cache local (o fallback)
function loadLocalCache() {
    try {
        const cached = localStorage.getItem(DATA_CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        console.error('Erro ao ler cache local:', e);
        return null;
    }
}

// ====================================================================
// FUNÇÕES DE RENDERIZAÇÃO E UI
// ====================================================================

function renderStore(data) {
    if (data.configuracoes.storeStatus === 'closed') {
        document.getElementById('header-title').textContent = '⚠️ Loja Fechada';
        document.getElementById('products-list').innerHTML = '<p class="text-center text-xl text-red-600">A loja está temporariamente fechada para pedidos.</p>';
        document.getElementById('cart-button').disabled = true;
    } else {
        document.getElementById('header-title').textContent = 'Faça seu Pedido';
        applyCustomization(data.customizacao);
        renderCategories(data.categorias);
        renderProducts(data.produtos);
    }
}

function applyCustomization(custom) {
    // Aplica as cores via CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', custom.colorPrimary);
    root.style.setProperty('--secondary-color', custom.colorSecondary);
    root.style.setProperty('--background-color', custom.backgroundColor);
    
    // Aplica a logo
    const logoEl = document.getElementById('storeLogo');
    if (logoEl && custom.logoUrl) {
        logoEl.src = custom.logoUrl;
    }
}

function renderCategories(categories) {
    const nav = document.getElementById('categories-nav');
    nav.innerHTML = ''; // Limpa as categorias anteriores
    
    categories.forEach(cat => {
        const tab = document.createElement('div');
        tab.className = 'category-tab';
        tab.textContent = cat.name;
        tab.setAttribute('data-category-id', cat.id);
        nav.appendChild(tab);
    });
    // [PRÓXIMOS PASSOS] Adicionar a lógica de filtro
}

function renderProducts(products) {
    const list = document.getElementById('products-list');
    list.innerHTML = ''; 

    products.forEach(prod => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        // HTML básico do produto (A ser estilizado no style.css e aprimorado)
        productCard.innerHTML = `
            <img src="${prod.imageUrl}" alt="${prod.name}">
            <h3>${prod.name}</h3>
            <p>R$ ${prod.price.toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart-btn" data-product-id="${prod.id}">Adicionar</button>
        `;
        list.appendChild(productCard);
    });
}

function toggleDrawer() {
    document.getElementById('cart-drawer').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}
