// ====================================================================
// Serverless-System | TOTEM DIGITAL - LÓGICA PRINCIPAL (script.js)
// ====================================================================

class TotemManager {
    constructor() {
        this.BIN_ID = 'YOUR_PUBLIC_BIN_ID_HERE'; // ⚠️ ATUALIZE COM SEU BIN ID PÚBLICO!
        this.data = null;
        this.cart = []; // { id: 'prod-x', name: 'Product Name', price: 10.00, qty: 1 }
        this.selectedCategory = null; 
        this.deliveryTax = 0;
        this.estimatedTime = 0;
        this.player = null; // YouTube Player Object
    }

    // ====================================================================
    // 1. INICIALIZAÇÃO E CARREGAMENTO DE DADOS
    // ====================================================================

    async init() {
        await this.loadRemoteData();
        if (this.data) {
            this.applyTheme();
            this.renderStoreStatus();
            this.renderMenu();
            this.renderCoverageOptions();
            this.renderPaymentOptions();
            this.setupEventListeners();
            this.updateCartUI();
            this.initYouTubePlayer();
        } else {
            document.getElementById('products-container').innerHTML = '<div class="text-center p-10 text-red-600 bg-white rounded-xl shadow-xl">❌ Não foi possível carregar os dados da loja. Verifique o BIN ID.</div>';
        }
    }

    async loadRemoteData() {
        if (!this.BIN_ID || this.BIN_ID === 'YOUR_PUBLIC_BIN_ID_HERE') {
            console.error('BIN ID não configurado no script.js do Totem.');
            return;
        }

        const url = `https://api.jsonbin.io/v3/b/${this.BIN_ID}/latest`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'X-Master-Key': '$2b$10$....' } // Não precisa de Master Key para LEITURA
            });

            if (response.ok) {
                const json = await response.json();
                this.data = json.record;
                console.log('Dados da Loja carregados:', this.data);
            } else {
                console.error(`Erro ao carregar dados do JSONBin: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro de rede ao carregar JSONBin:', error);
        }
    }
    
    setupEventListeners() {
        // Inicializa a navegação da categoria (delegada para o contêiner)
        document.getElementById('categories-list').addEventListener('click', (e) => {
            const btn = e.target.closest('.category-btn');
            if (btn) {
                this.filterProducts(btn.getAttribute('data-id'));
            }
        });
        
        // Inicializa o campo de nome no modal
        document.getElementById('client-name').addEventListener('input', () => this.validateCheckout());
        
        // Inicializa o campo de endereço no modal (se entrega estiver ativo)
        document.getElementById('client-address')?.addEventListener('input', () => this.validateCheckout());

        // Atualiza a taxa ao trocar a opção de pagamento (dinheiro, pix, etc)
        document.querySelectorAll('input[name="payment-option"]').forEach(input => {
             input.addEventListener('change', () => this.validateCheckout());
        });
        
        // Listener para fechar o modal ao clicar fora
        document.getElementById('checkout-modal').addEventListener('click', (e) => {
            if (e.target.id === 'checkout-modal') {
                this.closeCheckoutModal();
            }
        });
    }

    // ====================================================================
    // 2. TEMA E STATUS DA LOJA
    // ====================================================================
    
    applyTheme() {
        if (!this.data || !this.data.customizacao) return;
        const c = this.data.customizacao;
        const root = document.documentElement;

        // Aplica cores principais
        root.style.setProperty('--color-primary', c.headerFooterColor || '#10B981');
        root.style.setProperty('--color-text', c.titleTextColor || '#FFFFFF');
        root.style.setProperty('--color-background', c.backgroundColor || '#f9fafb');
        
        // Aplica logo
        const logoEl = document.getElementById('store-logo');
        if (c.logoUrl) {
            logoEl.src = c.logoUrl;
            logoEl.classList.remove('hidden');
            document.getElementById('store-name-display').classList.add('hidden');
        } else {
             logoEl.classList.add('hidden');
             document.getElementById('store-name-display').classList.remove('hidden');
        }
        
        // Aplica imagem de fundo (se houver)
        if (c.backgroundImageUrl) {
             document.getElementById('app-container').classList.add('bg-image-cover');
             document.getElementById('app-container').style.backgroundImage = `url('${c.backgroundImageUrl}')`;
             root.style.setProperty('--color-background', 'transparent'); // Remove a cor sólida
        } else {
             document.getElementById('app-container').classList.remove('bg-image-cover');
        }
    }

    renderStoreStatus() {
        const status = this.data.configuracoes.storeStatus;
        const statusBadge = document.getElementById('store-status-badge');
        const statusText = document.getElementById('status-text');
        const closedMessage = document.getElementById('store-closed-message');

        if (!statusBadge || !statusText) return;

        if (status === 'open') {
            statusBadge.className = 'bg-green-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md';
            statusText.textContent = 'LOJA ABERTA';
            closedMessage?.classList.add('hidden');
        } else {
            statusBadge.className = 'bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md';
            statusText.textContent = 'FECHADA';
            closedMessage?.classList.remove('hidden');
            // Desabilita o botão do carrinho se a loja estiver fechada
            document.getElementById('cart-button').disabled = true;
            document.getElementById('cart-button').title = 'Loja Fechada - Não é possível fazer pedidos.';
        }
        
        document.getElementById('store-name-display').textContent = this.data.configuracoes.storeName || 'LabSystem Store';
    }

    // ====================================================================
    // 3. RENDERIZAÇÃO DE CARDÁPIO E PRODUTOS
    // ====================================================================

    renderMenu() {
        this.renderCategoriesList();
        this.filterProducts(this.data.categorias[0]?.id || null);
    }
    
    renderCategoriesList() {
        const listEl = document.getElementById('categories-list');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        document.getElementById('loading-categories').classList.add('hidden');

        // Botão para todos os produtos
        listEl.innerHTML += this.createCategoryButton(null, 'Todos os Produtos', true); 

        this.data.categorias.forEach(cat => {
            listEl.innerHTML += this.createCategoryButton(cat.id, cat.name);
        });
    }
    
    createCategoryButton(id, name, isAll = false) {
        // Adiciona a classe 'active' ao primeiro ou à categoria selecionada
        const isActive = (id === this.selectedCategory) || (isAll && !this.selectedCategory);
        const activeClass = isActive 
            ? 'bg-primary text-primary-contrast shadow-md font-extrabold' 
            : 'text-gray-700 hover:bg-gray-100 font-medium';
            
        return `
            <button data-id="${id || ''}" class="category-btn w-full text-left p-3 rounded-xl transition ${activeClass}">
                ${name}
            </button>
        `;
    }

    filterProducts(categoryId) {
        this.selectedCategory = categoryId;
        const gridEl = document.getElementById('menu-items-grid');
        if (!gridEl) return;

        // Atualiza o título da seção
        const titleEl = document.getElementById('current-category-title');
        if (categoryId) {
            const cat = this.data.categorias.find(c => c.id === categoryId);
            titleEl.textContent = cat ? cat.name : 'Produtos';
        } else {
            titleEl.textContent = 'Todos os Produtos';
        }
        
        // Atualiza as classes 'active' dos botões
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-primary-contrast', 'shadow-md', 'font-extrabold');
            btn.classList.add('text-gray-700', 'hover:bg-gray-100', 'font-medium');
            
            if (btn.getAttribute('data-id') === categoryId || (!categoryId && !btn.getAttribute('data-id'))) {
                btn.classList.add('bg-primary', 'text-primary-contrast', 'shadow-md', 'font-extrabold');
                btn.classList.remove('text-gray-700', 'hover:bg-gray-100', 'font-medium');
            }
        });

        const filteredProducts = categoryId 
            ? this.data.produtos.filter(p => p.categoryId === categoryId)
            : this.data.produtos;

        gridEl.innerHTML = ''; // Limpa a lista
        
        if (filteredProducts.length === 0) {
            gridEl.innerHTML = '<p class="text-gray-500 col-span-full p-8 bg-white rounded-2xl shadow-xl">Nenhum produto nesta categoria.</p>';
            return;
        }

        filteredProducts.forEach(prod => {
            // Verifica o estoque
            const isAvailable = prod.stock > 0;
            const stockText = isAvailable ? `${prod.stock} em estoque` : 'Esgotado';
            const buttonClass = isAvailable ? 'bg-primary hover:bg-primary-dark' : 'bg-gray-400 cursor-not-allowed';
            const buttonText = isAvailable ? 'Adicionar ao Carrinho' : 'Indisponível';

            gridEl.innerHTML += `
                <div class="bg-white rounded-2xl shadow-xl overflow-hidden fade-in border border-gray-100">
                    ${prod.imageUrl ? `<img src="${prod.imageUrl}" alt="${prod.name}" class="w-full h-48 object-cover">` : `<div class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 font-bold">Sem Imagem</div>`}
                    <div class="p-4">
                        <h3 class="text-xl font-extrabold text-gray-800">${prod.name}</h3>
                        <p class="text-3xl font-extrabold text-primary my-2">R$ ${prod.price.toFixed(2).replace('.', ',')}</p>
                        <p class="text-sm text-gray-500 mb-4">${stockText}</p>
                        
                        <button onclick="totemManager.addItemToCart('${prod.id}')" 
                                ${!isAvailable || this.data.configuracoes.storeStatus !== 'open' ? 'disabled' : ''}
                                class="w-full text-center text-primary-contrast py-2 rounded-xl transition ${buttonClass} disabled:opacity-50">
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // ====================================================================
    // 4. LÓGICA DO CARRINHO (CART)
    // ====================================================================

    addItemToCart(productId) {
        if (this.data.configuracoes.storeStatus !== 'open') {
             this.toast('🔴 Loja fechada. Pedidos não são permitidos.', 'bg-red-500');
             return;
        }
        
        const product = this.data.produtos.find(p => p.id === productId);
        if (!product || product.stock <= 0) {
            this.toast('Produto esgotado ou não encontrado!', 'bg-red-500');
            return;
        }

        const cartItem = this.cart.find(item => item.id === productId);

        if (cartItem) {
            if (cartItem.qty < product.stock) {
                cartItem.qty += 1;
            } else {
                 this.toast('Estoque máximo atingido para este item.', 'bg-yellow-500');
                 return;
            }
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                qty: 1
            });
        }

        this.updateCartUI();
        this.toast(`"${product.name}" adicionado!`, 'bg-green-500');
    }

    removeItemFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            this.updateCartUI();
            this.renderCheckoutList(); // Atualiza a lista no modal
        }
    }
    
    changeItemQuantity(productId, change) {
        const cartItem = this.cart.find(item => item.id === productId);
        const productData = this.data.produtos.find(p => p.id === productId);
        
        if (cartItem && productData) {
            cartItem.qty += change;
            
            if (cartItem.qty <= 0) {
                this.removeItemFromCart(productId);
            } else if (cartItem.qty > productData.stock) {
                cartItem.qty = productData.stock;
                this.toast('Limite de estoque atingido.', 'bg-yellow-500');
            }
            
            this.updateCartUI();
            this.renderCheckoutList(); 
        }
    }

    updateCartUI() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.qty, 0);
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        document.getElementById('cart-item-count').textContent = totalItems;
        document.getElementById('cart-total-display').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        // Desabilita o botão se o carrinho estiver vazio
        document.getElementById('cart-button').disabled = totalItems === 0 || this.data.configuracoes.storeStatus !== 'open';
    }

    // ====================================================================
    // 5. CHECKOUT E PEDIDO WHATSAPP
    // ====================================================================

    openCheckoutModal() {
        if (this.cart.length === 0) return;
        this.renderCheckoutList();
        this.updateDeliveryDetails(); // Calcula total inicial
        document.getElementById('checkout-modal').classList.remove('hidden');
        this.validateCheckout();
    }

    closeCheckoutModal() {
        document.getElementById('checkout-modal').classList.add('hidden');
    }
    
    renderCheckoutList() {
        const listEl = document.getElementById('checkout-list');
        if (!listEl) return;
        
        listEl.innerHTML = this.cart.map(item => `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl shadow-sm">
                <div class="flex-1">
                    <p class="font-bold text-gray-800">${item.name}</p>
                    <p class="text-sm text-gray-600">R$ ${item.price.toFixed(2).replace('.', ',')} (Un.)</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="totemManager.changeItemQuantity('${item.id}', -1)" class="text-primary hover:opacity-70 font-bold text-xl px-2">-</button>
                    <span class="font-bold text-gray-800">${item.qty}</span>
                    <button onclick="totemManager.changeItemQuantity('${item.id}', 1)" class="text-primary hover:opacity-70 font-bold text-xl px-2">+</button>
                </div>
            </div>
        `).join('');
    }

    renderCoverageOptions() {
        const selectEl = document.getElementById('client-area');
        if (!selectEl) return;
        
        // Mantém a primeira opção de placeholder
        const placeholder = selectEl.querySelector('option[value=""]');
        selectEl.innerHTML = '';
        selectEl.appendChild(placeholder);
        
        this.data.cobertura.forEach(area => {
            const option = document.createElement('option');
            option.value = area.id;
            option.textContent = `${area.name} (R$ ${area.taxa.toFixed(2).replace('.', ',')} / ${area.tempo} min)`;
            selectEl.appendChild(option);
        });
    }

    renderPaymentOptions() {
        const optionsEl = document.getElementById('payment-options');
        if (!optionsEl) return;
        
        optionsEl.innerHTML = '';
        
        // Opção Padrão: Dinheiro (Troco)
        optionsEl.innerHTML += `
            <label class="block p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200">
                <input type="radio" name="payment-option" value="Dinheiro" checked class="form-radio text-primary" onchange="totemManager.validateCheckout()">
                <span class="ml-2 font-medium text-gray-800">💵 Dinheiro (Troco para...)</span>
                <input type="number" id="cash-change" class="mt-2 block w-full border rounded-xl p-2 shadow-sm" placeholder="Precisa de troco para quanto? (Ex: 50)">
            </label>
        `;
        
        // Opção PIX
        if (this.data.pagamento.pixKey) {
            optionsEl.innerHTML += `
                <label class="block p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200">
                    <input type="radio" name="payment-option" value="PIX" class="form-radio text-primary" onchange="totemManager.validateCheckout()">
                    <span class="ml-2 font-medium text-gray-800">🔑 PIX (Chave: ${this.data.pagamento.pixKey})</span>
                </label>
            `;
        }

        // Outros detalhes (Bancário ou Bitcoin)
         if (this.data.pagamento.bankDetails || this.data.pagamento.bitcoinLightning) {
            optionsEl.innerHTML += `
                <label class="block p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200">
                    <input type="radio" name="payment-option" value="Outras Formas" class="form-radio text-primary" onchange="totemManager.validateCheckout()">
                    <span class="ml-2 font-medium text-gray-800">💳 Outras Formas (A combinar)</span>
                </label>
            `;
        }
    }

    updateDeliveryDetails() {
        const deliveryContainer = document.getElementById('delivery-details-container');
        const isDelivery = document.querySelector('input[name="delivery-option"]:checked')?.value === 'Entrega';
        const finalTotalDisplay = document.getElementById('final-total-display');
        const baseTotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        deliveryContainer.classList.toggle('hidden', !isDelivery);
        document.getElementById('client-address').required = isDelivery;
        document.getElementById('client-area').required = isDelivery;

        this.deliveryTax = 0;
        this.estimatedTime = 0;
        
        if (isDelivery) {
            const selectedAreaId = document.getElementById('client-area').value;
            if (selectedAreaId) {
                const area = this.data.cobertura.find(a => a.id === selectedAreaId);
                if (area) {
                    this.deliveryTax = area.taxa;
                    this.estimatedTime = area.tempo;
                }
            }
        }
        
        const finalTotal = baseTotal + this.deliveryTax;
        finalTotalDisplay.textContent = `R$ ${finalTotal.toFixed(2).replace('.', ',')}`;

        const taxDisplay = document.getElementById('delivery-tax-display');
        if (this.deliveryTax > 0) {
            taxDisplay.textContent = `Taxa de Entrega: R$ ${this.deliveryTax.toFixed(2).replace('.', ',')} (Tempo: ${this.estimatedTime} min)`;
        } else if (isDelivery) {
            taxDisplay.textContent = 'Selecione uma área para calcular a taxa.';
        } else {
            taxDisplay.textContent = 'Retirada no Local (sem taxa)';
        }
        
        this.validateCheckout();
    }
    
    validateCheckout() {
        const btn = document.getElementById('finish-order-btn');
        if (!btn) return;

        const isDelivery = document.querySelector('input[name="delivery-option"]:checked')?.value === 'Entrega';
        const clientName = document.getElementById('client-name').value.trim();
        const clientAddress = document.getElementById('client-address').value.trim();
        const clientArea = document.getElementById('client-area').value;
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + this.deliveryTax;
        
        let isValid = true;
        
        if (!clientName) isValid = false;
        
        if (isDelivery) {
            if (!clientAddress || !clientArea || this.deliveryTax === 0) {
                 isValid = false;
            }
        }
        
        btn.disabled = !isValid || total === 0;
        
        if (isValid && total > 0) {
             btn.title = 'Finalizar Pedido';
        } else if (total === 0) {
             btn.title = 'Carrinho vazio';
        } else {
             btn.title = 'Preencha todos os campos obrigatórios e selecione uma área de entrega.';
        }
    }

    generateWhatsAppLink() {
        if (this.cart.length === 0) return;
        this.validateCheckout();
        if (document.getElementById('finish-order-btn').disabled) return;

        const isDelivery = document.querySelector('input[name="delivery-option"]:checked')?.value === 'Entrega';
        const deliveryOption = document.querySelector('input[name="delivery-option"]:checked')?.value;
        const paymentOption = document.querySelector('input[name="payment-option"]:checked')?.value;
        const clientName = document.getElementById('client-name').value.trim();
        const clientAddress = document.getElementById('client-address').value.trim();
        const selectedArea = document.getElementById('client-area').value;
        const baseTotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const finalTotal = baseTotal + this.deliveryTax;
        
        let message = `*Olá, ${this.data.configuracoes.storeName}! Novo Pedido LabSystem* %0A%0A`;
        message += `*Cliente:* ${clientName}%0A`;
        message += `*Opção:* ${deliveryOption}%0A`;
        
        if (isDelivery) {
            const areaName = this.data.cobertura.find(a => a.id === selectedArea)?.name || 'Área não identificada';
            message += `*Endereço:* ${clientAddress} (${areaName})%0A`;
            message += `*Tempo Estimado:* ${this.estimatedTime} minutos%0A`;
        } else {
            message += `*Local de Retirada:* ${this.data.configuracoes.address}%0A`;
        }
        
        message += `%0A*--- ITENS ---*%0A`;
        
        this.cart.forEach(item => {
            message += `👉 ${item.qty}x ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})%0A`;
        });
        
        message += `%0A*--- VALORES ---*%0A`;
        message += `Subtotal: R$ ${baseTotal.toFixed(2).replace('.', ',')}%0A`;
        if (this.deliveryTax > 0) {
            message += `Taxa de Entrega: R$ ${this.deliveryTax.toFixed(2).replace('.', ',')}%0A`;
        }
        message += `*Total do Pedido: R$ ${finalTotal.toFixed(2).replace('.', ',')}*%0A`;
        
        message += `%0A*--- PAGAMENTO ---*%0A`;
        message += `Forma: ${paymentOption}%0A`;
        
        if (paymentOption === 'Dinheiro') {
            const change = document.getElementById('cash-change').value.trim();
            message += `Troco para: ${change ? 'R$ ' + change : 'Exato'}%0A`;
        } else if (paymentOption === 'PIX') {
            message += `Chave PIX: ${this.data.pagamento.pixKey}%0A`;
        } else if (paymentOption === 'Outras Formas') {
             message += `Detalhes: ${this.data.pagamento.bankDetails ? this.data.pagamento.bankDetails : 'A combinar com a loja'}`
        }

        // URL Final
        const whatsappNumber = this.data.configuracoes.whatsapp;
        const finalUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        window.open(finalUrl, '_blank');
        this.closeCheckoutModal();
        this.toast('Pedido enviado! Aguarde a confirmação da loja.', 'bg-indigo-600');
        
        // Limpa o carrinho após o pedido
        this.cart = [];
        this.updateCartUI();
        this.filterProducts(this.selectedCategory); // Refresca a lista
    }

    // ====================================================================
    // 6. MÚSICA DE FUNDO (YOUTUBE API)
    // ====================================================================

    initYouTubePlayer() {
        if (!this.data.customizacao.musicUrl) return;
        
        // Esta função global é chamada pelo script do YouTube API
        window.onYouTubeIframeAPIReady = () => {
            const videoId = this.getYouTubeVideoId(this.data.customizacao.musicUrl);
            if (!videoId) return;

            this.player = new YT.Player('youtube-player', {
                videoId: videoId,
                playerVars: {
                    'autoplay': 1,  // Tenta iniciar automaticamente
                    'controls': 0,  // Remove controles
                    'loop': 1,      // Habilita o loop (será forçado no evento)
                    'playlist': videoId, // Necessário para 'loop' funcionar
                    'disablekb': 1,
                    'modestbranding': 1,
                    'rel': 0
                },
                events: {
                    'onReady': (event) => {
                        // Define o volume e tenta tocar
                        event.target.setVolume(this.data.customizacao.musicVolume || 50);
                        event.target.playVideo();
                    },
                    'onStateChange': (event) => {
                        // Garante que o vídeo seja reiniciado (loop manual)
                        if (event.data === YT.PlayerState.ENDED) {
                            event.target.playVideo();
                        }
                    }
                }
            });
        };
    }
    
    getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // ====================================================================
    // 7. UTILIDADES
    // ====================================================================

    toast(message, className = 'bg-gray-800') {
        const toastEl = document.createElement('div');
        toastEl.className = `fixed bottom-4 left-1/2 -translate-x-1/2 text-white p-3 rounded-xl shadow-xl ${className} z-50 transition-opacity duration-300`;
        toastEl.textContent = message;
        document.body.appendChild(toastEl);
        
        setTimeout(() => {
            toastEl.style.opacity = 0;
            setTimeout(() => toastEl.remove(), 300);
        }, 3000);
    }
}

// ====================================================================
// INICIALIZAÇÃO
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.totemManager = new TotemManager();
    // Verifica se o YouTube API já carregou (pode acontecer antes do DOMContentLoaded)
    if (typeof YT !== 'undefined' && YT.loaded) {
        window.totemManager.init();
    } else {
        // Inicializa o manager após o carregamento do DOM
        window.totemManager.init();
    }
});
