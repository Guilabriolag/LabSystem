// ====================================================================
// LabSystem TOTEM - SCRIPT DE VISUALIZAÇÃO PÚBLICA (script.js)
// ====================================================================

// Seu ID Público do JSONBin (Apenas Leitura)
const CLIENT_BIN_ID = '68e36776ae596e708f07b93a'; 

// URL de onde o Totem buscará os dados
const API_URL = `https://api.jsonbin.io/v3/b/${CLIENT_BIN_ID}/latest`;

class TotemApp {
    constructor() {
        this.storeData = {};
        this.cart = this.loadCart();
        this.cartCountElement = document.getElementById('cart-count');
        this.cartTotalElement = document.getElementById('cart-total');
        this.checkoutButton = document.getElementById('checkout-btn');
        this.sectionsContainer = document.getElementById('sections-container');
        this.cartModal = document.getElementById('cart-modal');
        this.cartItemsList = document.getElementById('cart-items-list');
    }

    // ====================================================================
    // DADOS E PERSISTÊNCIA (Carrinho Local)
    // ====================================================================

    loadCart() {
        try {
            const savedCart = localStorage.getItem('labsystem_totem_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    }

    saveCart() {
        localStorage.setItem('labsystem_totem_cart', JSON.stringify(this.cart));
        this.updateCartSummary();
    }

    // ====================================================================
    // INICIALIZAÇÃO E CARREGAMENTO REMOTO
    // ====================================================================

    async init() {
        this.sectionsContainer.innerHTML = '<p class="text-center text-gray-500 mt-12">Carregando dados da loja...</p>';
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Falha ao carregar dados do JSONBin.');
            }
            const data = await response.json();
            // A estrutura do JSONBin encapsula o conteúdo em 'record'
            this.storeData = data.record;
            
            this.renderStore();
            this.updateCartSummary();
        } catch (error) {
            console.error('Erro de Inicialização do Totem:', error);
            this.sectionsContainer.innerHTML = `
                <div class="text-center mt-12 p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <h2 class="text-xl font-bold mb-2">❌ Loja Indisponível</h2>
                    <p>Não foi possível carregar as informações do servidor. Verifique o Bin ID e a conexão.</p>
                </div>
            `;
        }
    }

    // ====================================================================
    // RENDERIZAÇÃO E UI
    // ====================================================================

    renderStore() {
        // 1. Aplica Customização (Cores)
        this.applyCustomization();
        
        // 2. Verifica Status da Loja
        if (this.storeData.configuracoes.storeStatus !== 'open') {
            this.sectionsContainer.innerHTML = `
                <div class="text-center mt-12 p-8 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                    <h2 class="text-xl font-bold mb-2">🔒 Loja Fechada</h2>
                    <p>O administrador definiu que a loja está temporariamente indisponível para pedidos.</p>
                </div>
            `;
            this.checkoutButton.classList.add('hidden');
            return;
        }

        // 3. Renderiza o Cardápio (Categorias e Produtos)
        this.sectionsContainer.innerHTML = ''; // Limpa o "Carregando..."

        this.storeData.categorias.forEach(category => {
            const productsInCategory = this.storeData.produtos.filter(p => p.categoryId === category.id);
            if (productsInCategory.length > 0) {
                // Renderiza a seção da categoria
                const categorySection = document.createElement('section');
                categorySection.id = `cat-${category.id}`;
                categorySection.className = 'mb-10 fade-in';
                categorySection.innerHTML = `<h2 class="text-3xl font-bold mb-6 pt-4 border-b border-gray-300 text-gray-800">${category.name}</h2>`;
                
                const productsGrid = document.createElement('div');
                productsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
                
                productsInCategory.forEach(product => {
                    productsGrid.appendChild(this.renderProductCard(product));
                });

                categorySection.appendChild(productsGrid);
                this.sectionsContainer.appendChild(categorySection);
            }
        });

        // 4. Renderiza Menu Lateral (Se houver)
        this.renderSidebarMenu();
    }

    renderProductCard(product) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition hover:shadow-xl';

        const image = product.imageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem';
        
        // Determina se o produto está indisponível
        const isOutOfStock = product.stock <= 0;
        const stockStatus = isOutOfStock ? '<span class="text-red-600 font-bold">ESGOTADO</span>' : `<span class="text-green-600">${product.stock} em estoque</span>`;
        const buttonText = isOutOfStock ? 'Esgotado' : `Adicionar R$ ${product.price.toFixed(2).replace('.', ',')}`;
        
        card.innerHTML = `
            <img src="${image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4 flex-grow flex flex-col">
                <h3 class="text-xl font-semibold mb-1">${product.name}</h3>
                <p class="text-sm text-gray-500 mb-2 flex-grow">${stockStatus}</p>
                <button 
                    onclick="totemApp.addToCart('${product.id}')" 
                    ${isOutOfStock ? 'disabled' : ''}
                    class="mt-3 py-2 rounded-full font-bold transition duration-300 
                    ${isOutOfStock ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}">
                    ${buttonText}
                </button>
            </div>
        `;
        return card;
    }

    applyCustomization() {
        const custom = this.storeData.customizacao;
        
        // Define variáveis CSS (ex: --color-primary)
        document.documentElement.style.setProperty('--color-primary', custom.colorPrimary);
        document.documentElement.style.setProperty('--color-secondary', custom.colorSecondary);
        document.documentElement.style.setProperty('--bg-color', custom.backgroundColor);
        
        // Atualiza elementos específicos
        document.body.style.backgroundColor = custom.backgroundColor;
        document.getElementById('store-name').textContent = 'LabSystem Totem'; // Mantém o nome padrão
        document.getElementById('store-logo').src = custom.logoUrl;
    }
    
    // Renderiza o menu lateral de navegação (para scroll suave)
    renderSidebarMenu() {
        const menu = document.getElementById('sidebar-menu');
        if (!menu) return;
        
        menu.innerHTML = '';
        this.storeData.categorias.forEach(cat => {
            const productsInCategory = this.storeData.produtos.filter(p => p.categoryId === cat.id);
            if (productsInCategory.length > 0) {
                const li = document.createElement('li');
                li.className = 'mb-2';
                li.innerHTML = `
                    <a href="#cat-${cat.id}" 
                       onclick="totemApp.scrollToSection('cat-${cat.id}'); return false;"
                       class="block p-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">
                       ${cat.name}
                    </a>
                `;
                menu.appendChild(li);
            }
        });
    }
    
    // ====================================================================
    // LÓGICA DO CARRINHO
    // ====================================================================

    addToCart(productId) {
        const product = this.storeData.produtos.find(p => p.id === productId);
        if (!product || product.stock <= 0) return;

        const cartItem = this.cart.find(item => item.id === productId);

        if (cartItem) {
            if (cartItem.quantity < product.stock) {
                cartItem.quantity++;
            } else {
                alert('Estoque máximo atingido para este item.');
            }
        } else {
            this.cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        this.saveCart();
    }
    
    updateCartSummary() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        this.cartCountElement.textContent = totalItems;
        this.cartTotalElement.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

        if (totalItems > 0) {
            this.checkoutButton.classList.remove('opacity-0', 'pointer-events-none');
            this.checkoutButton.classList.add('opacity-100');
        } else {
            this.checkoutButton.classList.add('opacity-0', 'pointer-events-none');
            this.checkoutButton.classList.remove('opacity-100');
        }
    }
    
    // ====================================================================
    // MODAL E CHECKOUT
    // ====================================================================

    openCartModal() {
        this.cartModal.classList.remove('hidden');
        this.renderCartItems();
    }

    closeCartModal() {
        this.cartModal.classList.add('hidden');
    }
    
    renderCartItems() {
        this.cartItemsList.innerHTML = '';
        if (this.cart.length === 0) {
            this.cartItemsList.innerHTML = '<p class="text-center text-gray-500 py-8">Seu carrinho está vazio.</p>';
            return;
        }

        this.cart.forEach(item => {
            const itemElement = document.createElement('li');
            itemElement.className = 'flex justify-between items-center py-2 border-b';
            
            const subtotal = item.price * item.quantity;
            
            itemElement.innerHTML = `
                <div class="flex-1">
                    <p class="font-semibold">${item.name}</p>
                    <p class="text-sm text-gray-500">R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.quantity}</p>
                </div>
                <div class="font-bold">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                <button onclick="totemApp.removeFromCart('${item.id}')" class="ml-4 text-red-500 hover:text-red-700">
                    &times;
                </button>
            `;
            this.cartItemsList.appendChild(itemElement);
        });

        // Recalcula o total dentro do modal
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('modal-cart-total').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                this.cart.splice(itemIndex, 1);
            }
        }
        this.saveCart();
        this.renderCartItems(); // Atualiza a lista no modal
    }

    initiateCheckout() {
        if (this.cart.length === 0) return;

        const whatsapp = this.storeData.configuracoes.whatsapp;
        if (!whatsapp) {
            alert('A loja não configurou um número de WhatsApp. Tente mais tarde.');
            return;
        }

        const itemsText = this.cart.map(item => 
            `* ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})`
        ).join('\n');
        
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const paymentInfo = `\n\nPIX: ${this.storeData.pagamento.pixKey}\nBanco: ${this.storeData.pagamento.bankDetails}\n\n`;

        const message = `Olá! Gostaria de fazer o seguinte pedido:\n\n*ITENS:*\n${itemsText}\n\n*TOTAL:* R$ ${totalPrice.toFixed(2).replace('.', ',')}\n\n*DADOS DE PAGAMENTO:*\n${paymentInfo}`;
        
        const encodedMessage = encodeURIComponent(message);
        
        // Link do WhatsApp
        window.open(`https://api.whatsapp.com/send?phone=${whatsapp}&text=${encodedMessage}`, '_blank');
        
        // Limpa o carrinho após o checkout
        this.cart = [];
        this.saveCart();
        this.closeCartModal();
    }
    
    // ====================================================================
    // UTILIDADES
    // ====================================================================

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    window.totemApp = new TotemApp();
    window.totemApp.init();

    // Configura eventos do modal (precisa de acesso global)
    document.getElementById('cart-modal-close').addEventListener('click', () => totemApp.closeCartModal());
    document.getElementById('checkout-btn').addEventListener('click', () => totemApp.openCartModal());
    document.getElementById('modal-checkout-final').addEventListener('click', () => totemApp.initiateCheckout());
});
