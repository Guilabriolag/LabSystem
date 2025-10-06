// ====================================================================
// Serverless-System | TOTEM PÚBLICO - LÓGICA FINAL (script.js)
// ====================================================================

let storeData = null; 
let cart = {}; // { 'prod-1': { item: {id, name, price, ...}, quantity: 1, total: 18.50 }, ... }

// --- CONFIGURAÇÃO CHAVE ---
const CLIENT_BIN_ID = 'SUA_BIN_ID_DE_TESTE'; // SUBSTITUA PELO BIN ID REAL DO JSONBIN
const DATA_CACHE_KEY = 'labsystem_totem_cache'; 
const WHATSAPP_BASE_URL = 'https://api.whatsapp.com/send';

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    initTotem();
    document.getElementById('cart-button').addEventListener('click', toggleDrawer);
    document.getElementById('checkout-btn').addEventListener('click', checkout);
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
    } else {
        storeData = loadLocalCache();
        if (!storeData) {
            storeData = { configuracoes: { storeStatus: 'closed' } };
            loadingMessage.textContent = '❌ Não foi possível carregar a loja. Tente novamente mais tarde.';
            document.getElementById('header-title').textContent = 'LOJA FECHADA / ERRO';
            return; 
        }
    }
    // Renderizar a loja (aplica customização, produtos, etc.)
    renderStore(storeData);
    // Adiciona event listeners para os botões 'Adicionar' (agora que os produtos existem)
    setupProductListeners();
}

async function loadRemoteData() {
    if (!CLIENT_BIN_ID || CLIENT_BIN_ID === 'SUA_BIN_ID_DE_TESTE') return null;

    const url = `https://api.jsonbin.io/v3/b/${CLIENT_BIN_ID}/latest`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`JSONBin status: ${response.status}`);
        const data = await response.json();
        
        localStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data.record));
        return data.record;
    } catch (error) {
        console.error('Erro ao buscar do JSONBin:', error);
        return null;
    }
}

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
// FUNÇÕES DE CARRINHO (CART)
// ====================================================================

function setupProductListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-product-id');
            addItemToCart(productId);
        });
    });
}

function getItemById(productId) {
    // Busca o produto completo na lista de produtos carregada do JSONBin
    return storeData.produtos.find(p => p.id === productId);
}

function addItemToCart(productId) {
    const product = getItemById(productId);
    if (!product) return;

    if (cart[productId]) {
        cart[productId].quantity += 1;
    } else {
        cart[productId] = {
            item: product,
            quantity: 1,
        };
    }
    updateCartUI();
    toggleDrawer(true); // Abre o carrinho
}

function removeItemFromCart(productId) {
    if (cart[productId]) {
        if (cart[productId].quantity > 1) {
            cart[productId].quantity -= 1;
        } else {
            delete cart[productId]; // Remove o item se a quantidade for 1
        }
    }
    updateCartUI();
}

function calculateCartTotal() {
    return Object.values(cart).reduce((total, cartItem) => {
        return total + (cartItem.item.price * cartItem.quantity);
    }, 0);
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');
    const total = calculateCartTotal();
    const itemCount = Object.values(cart).reduce((count, item) => count + item.quantity, 0);

    // Atualiza contadores e total
    countEl.textContent = itemCount;
    totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('checkout-btn').disabled = itemCount === 0;

    // Renderiza itens do carrinho
    itemsContainer.innerHTML = '';
    
    if (itemCount === 0) {
        itemsContainer.innerHTML = '<p id="empty-cart-message" class="text-gray-500 text-center mt-5">O carrinho está vazio.</p>';
        return;
    }

    for (const productId in cart) {
        const item = cart[productId];
        const itemTotal = item.item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item border-b py-3 flex justify-between items-center';
        div.innerHTML = `
            <div>
                <p class="font-medium">${item.item.name}</p>
                <p class="text-sm text-gray-600">${item.quantity} x R$ ${item.item.price.toFixed(2).replace('.', ',')} = R$ ${itemTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="removeItemFromCart('${productId}')" class="text-red-500 font-bold px-2 py-1 bg-red-100 rounded">-</button>
                <span class="font-bold">${item.quantity}</span>
                <button onclick="addItemToCart('${productId}')" class="text-green-500 font-bold px-2 py-1 bg-green-100 rounded">+</button>
            </div>
        `;
        itemsContainer.appendChild(div);
    }
}

// ====================================================================
// FUNÇÕES DE CHECKOUT E WHATSAPP
// ====================================================================

function checkout() {
    const total = calculateCartTotal();
    const { whatsapp } = storeData.configuracoes;
    const { pixKey, bankDetails } = storeData.pagamento;

    let orderText = `*Olá! Meu pedido é:*\n\n`;

    // 1. Detalhamento dos Itens
    Object.values(cart).forEach(item => {
        const itemTotal = item.item.price * item.quantity;
        orderText += `* ${item.quantity}x ${item.item.name}* (R$ ${itemTotal.toFixed(2).replace('.', ',')})\n`;
    });

    // 2. Total e Pagamento
    orderText += `\n*TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    orderText += `--- Aguardando pagamento ---\n`;
    
    if (pixKey) {
        orderText += `\n*PIX:* ${pixKey}`;
    }
    if (bankDetails) {
        orderText += `\n*Dados Bancários:* ${bankDetails}`;
    }
    orderText += `\n\n*Por favor, envie o comprovante de pagamento e seu endereço de entrega. Obrigado!*`;

    // 3. Geração do Link
    const fullUrl = `${WHATSAPP_BASE_URL}?phone=${whatsapp}&text=${encodeURIComponent(orderText)}`;
    
    // 4. Redirecionar
    window.open(fullUrl, '_blank');
    
    // Limpar o carrinho após o checkout
    cart = {};
    updateCartUI();
    toggleDrawer(false);
}


// ====================================================================
// FUNÇÕES DE RENDERIZAÇÃO E UTILIDADE (Do Passo 4)
// ====================================================================

function renderStore(data) {
    // Garante que o CSS está pronto para aplicar as cores
    const list = document.getElementById('products-list');
    
    if (data.configuracoes.storeStatus === 'closed') {
        document.getElementById('header-title').textContent = '⚠️ Loja Fechada';
        list.innerHTML = '<p class="text-center text-xl text-red-600 p-8">A loja está temporariamente fechada para pedidos. Verifique o horário de funcionamento.</p>';
        document.getElementById('cart-button').disabled = true;
    } else {
        document.getElementById('header-title').textContent = 'Faça seu Pedido';
        applyCustomization(data.customizacao);
        renderCategories(data.categorias);
        renderProducts(data.produtos);
    }
}

function applyCustomization(custom) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', custom.colorPrimary);
    root.style.setProperty('--secondary-color', custom.colorSecondary);
    root.style.setProperty('--background-color', custom.backgroundColor);
    
    const logoEl = document.getElementById('storeLogo');
    if (logoEl && custom.logoUrl) {
        logoEl.src = custom.logoUrl;
    }
}

function renderCategories(categories) {
    const nav = document.getElementById('categories-nav');
    nav.innerHTML = ''; 
    categories.forEach(cat => {
        const tab = document.createElement('div');
        tab.className = 'category-tab';
        tab.textContent = cat.name;
        tab.setAttribute('data-category-id', cat.id);
        nav.appendChild(tab);
    });
}

function renderProducts(products) {
    const list = document.getElementById('products-list');
    list.innerHTML = ''; 
    
    products.forEach(prod => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card border p-4 rounded-lg shadow-md bg-white flex flex-col items-center text-center';
        productCard.innerHTML = `
            <img src="${prod.imageUrl}" alt="${prod.name}" class="w-full h-32 object-cover mb-4 rounded-md">
            <h3 class="font-bold text-lg mb-1">${prod.name}</h3>
            <p class="text-xl font-extrabold text-green-700">R$ ${prod.price.toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart-btn mt-3 w-full" style="background: var(--primary-color); color: white;" data-product-id="${prod.id}">Adicionar ao Pedido</button>
        `;
        list.appendChild(productCard);
    });
}

function toggleDrawer(forceOpen) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    
    if (forceOpen === true || !drawer.classList.contains('open')) {
        drawer.classList.add('open');
        overlay.classList.add('active');
    } else {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
    }
            }
