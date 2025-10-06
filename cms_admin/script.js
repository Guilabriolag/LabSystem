// ====================================================================
// Serverless-System | CMS ADMIN - LÓGICA PRINCIPAL (script.js)
// ====================================================================

/**
 * Estrutura Unificada de Dados Padrão (Default Data)
 * Esta estrutura será usada se não houver nada no localStorage.
 */
const defaultData = {
    // --- 1. CONFIGURAÇÃO DE PUBLICAÇÃO (CMS) ---
    configuracoes: {
        binId: '', 
        masterKey: '', 
        storeStatus: 'open', // open | closed
        whatsapp: '5511999998888',
        lowStockThreshold: 5,
    },

    // --- 2. CUSTOMIZAÇÃO (APARÊNCIA) ---
    customizacao: {
        colorPrimary: '#10B981', // Cor Padrão: Verde Esmeralda
        colorSecondary: '#059669', 
        backgroundColor: '#f9f9f9',
        logoUrl: 'https://via.placeholder.com/150x50/10B981/ffffff?text=LabSystem',
    },

    // --- 3. ITENS E CARDÁPIO (TOTEM) ---
    categorias: [
        { id: 'cat-1', name: 'Combos Especiais' },
        { id: 'cat-2', name: 'Hambúrgueres' }
    ],
    produtos: [
        { id: 'prod-1', name: 'X-Salada Clássico', price: 18.50, stock: 50, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200/FFCC00/000000?text=X-Salada' },
        { id: 'prod-2', name: 'Batata Média', price: 8.00, stock: 100, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200/DA291C/ffffff?text=Batata' }
    ],

    // --- 4. DADOS DE PAGAMENTO ---
    pagamento: {
        pixKey: 'sua-chave-pix-aqui',
        bankDetails: '',
        bitcoinLightning: ''
    },
};


class StoreManager {
    constructor() {
        this.dataKey = 'labsystem_store_data'; // Chave mestra no localStorage
        this.data = {};
        this.currentProductId = null; // Para rastrear o produto em edição
    }

    // Inicializa: Tenta carregar dados locais, configura eventos e renderiza a UI.
    init() {
        this.loadLocalData();
        this.setupEventListeners();
        this.renderFormFields(); 
        this.renderItemManagement(); 
        this.switchTab('publicar'); // Inicia na aba mais crítica
    }

    // ====================================================================
    // MÉTODOS DE PERSISTÊNCIA LOCAL (LOCAL STORAGE)
    // ====================================================================

    loadLocalData() {
        try {
            const savedData = localStorage.getItem(this.dataKey);
            if (savedData) {
                this.data = JSON.parse(savedData);
            } else {
                // Cria uma cópia profunda dos dados default para não modificar a constante
                this.data = JSON.parse(JSON.stringify(defaultData)); 
            }
        } catch (e) {
            console.error('Erro ao carregar dados locais:', e);
            this.data = JSON.parse(JSON.stringify(defaultData));
        }
    }

    saveLocalData() {
        try {
            // Garante que o estado do formulário esteja na memória antes de salvar
            this.collectDataFromForms(); 
            localStorage.setItem(this.dataKey, JSON.stringify(this.data));
            this.toast('✅ Dados salvos localmente!', 'bg-indigo-500');
        } catch (e) {
            this.toast('❌ Erro ao salvar dados localmente.', 'bg-red-500');
            console.error('Erro ao salvar no LocalStorage:', e);
        }
    }
    
    // ====================================================================
    // MÉTODOS DE COLETA DE DADOS DO FORMULÁRIO (INPUT)
    // ====================================================================

    // Função Mestra: Coleta TODOS os dados visíveis do formulário e atualiza this.data
    collectDataFromForms() {
        this.collectPublicationFields();
        this.collectCustomizationFields();
        this.collectDadosLojaFields();
        // Os itens (produtos/categorias) são manipulados diretamente pelos métodos CRUD, não via esta função.
    }

    collectPublicationFields() {
        this.data.configuracoes.binId = document.getElementById('binId')?.value || '';
        this.data.configuracoes.masterKey = document.getElementById('masterKey')?.value || '';
    }

    collectDadosLojaFields() {
        this.data.configuracoes.storeStatus = document.getElementById('storeStatus')?.value || 'closed';
        this.data.configuracoes.whatsapp = document.getElementById('whatsapp')?.value || '';
        
        this.data.pagamento.pixKey = document.getElementById('pixKey')?.value || '';
        this.data.pagamento.bankDetails = document.getElementById('bankDetails')?.value || '';
        this.data.pagamento.bitcoinLightning = document.getElementById('bitcoinLightning')?.value || '';
    }
    
    collectCustomizationFields() {
        this.data.customizacao.colorPrimary = document.getElementById('colorPrimary')?.value || '#000000';
        this.data.customizacao.colorSecondary = document.getElementById('colorSecondary')?.value || '#000000';
        this.data.customizacao.logoUrl = document.getElementById('logoUrl')?.value || '';
    }
    
    // ====================================================================
    // MÉTODOS DE RENDERIZAÇÃO DOS DADOS NO FORMULÁRIO (OUTPUT)
    // ====================================================================

    renderFormFields() {
        const d = this.data;

        // Configurações de Publicação (Publicar)
        if (document.getElementById('binId')) {
            document.getElementById('binId').value = d.configuracoes.binId || '';
            document.getElementById('masterKey').value = d.configuracoes.masterKey || '';
        }

        // Dados Operacionais (Loja)
        if (document.getElementById('storeStatus')) {
            document.getElementById('storeStatus').value = d.configuracoes.storeStatus || 'closed';
            document.getElementById('whatsapp').value = d.configuracoes.whatsapp || '';
        }
        
        // Dados de Pagamento (Loja)
        if (document.getElementById('pixKey')) {
            document.getElementById('pixKey').value = d.pagamento.pixKey || '';
            document.getElementById('bankDetails').value = d.pagamento.bankDetails || '';
            document.getElementById('bitcoinLightning').value = d.pagamento.bitcoinLightning || '';
        }

        // Customização (Customizar)
        if (document.getElementById('colorPrimary')) {
            document.getElementById('colorPrimary').value = d.customizacao.colorPrimary || '#000000';
            document.getElementById('colorSecondary').value = d.customizacao.colorSecondary || '#000000';
            document.getElementById('logoUrl').value = d.customizacao.logoUrl || '';
        }
    }
    
    // ====================================================================
    // MÉTODOS DE SINCRONIZAÇÃO REMOTA (JSONBIN)
    // ====================================================================

    async publishData() {
        this.collectDataFromForms(); // 1. Coleta todos os dados mais recentes

        const { binId, masterKey } = this.data.configuracoes;

        if (!binId || !masterKey) {
            this.toast('❌ BIN ID e Master Key são obrigatórios para Publicar.', 'bg-red-500');
            return;
        }

        // 2. Salva localmente (Garantia de que o trabalho está salvo)
        this.saveLocalData(); 

        // 3. Publica no JSONBin
        const url = `https://api.jsonbin.io/v3/b/${binId}`;
        this.toast('⏳ Publicando no JSONBin...');

        try {
            const response = await fetch(url, {
                method: 'PUT', // Atualiza o conteúdo do Bin
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': masterKey, // Chave Secreta para Escrita
                },
                body: JSON.stringify(this.data)
            });

            if (response.ok) {
                this.toast('🎉 Publicado com sucesso no JSONBin!', 'bg-green-500');
            } else {
                const error = await response.json();
                this.toast(`❌ Erro ${response.status}: ${error.message || 'Falha na publicação.'}`, 'bg-red-500');
            }
        } catch (error) {
            this.toast('❌ Erro de conexão de rede ou JSONBin.', 'bg-red-500');
            console.error('JSONBin Error:', error);
        }
    }

    // ====================================================================
    // MÉTODOS DE GERENCIAMENTO DE ITENS (CRUD)
    // ====================================================================
    
    renderItemManagement() {
        this.renderCategoriesList();
        this.renderProductsTable();
    }
    
    renderCategoriesList() {
        const list = document.getElementById('categoriesList');
        if (!list) return;

        list.innerHTML = '';
        this.data.categorias.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-2 bg-white rounded-md border';
            div.innerHTML = `
                <span>${cat.name}</span>
                <button onclick="storeManager.deleteCategory('${cat.id}')" class="text-red-500 hover:text-red-700 transition">Excluir</button>
            `;
            list.appendChild(div);
        });
    }
    
    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.data.produtos.forEach(prod => {
            const category = this.data.categorias.find(c => c.id === prod.categoryId);
            const row = tbody.insertRow();
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${prod.name}</td>
                <td class="py-2 px-4 border-b">${category ? category.name : 'Sem Categoria'}</td>
                <td class="py-2 px-4 border-b">R$ ${prod.price.toFixed(2).replace('.', ',')}</td>
                <td class="py-2 px-4 border-b">${prod.stock}</td>
                <td class="py-2 px-4 border-b text-center space-x-2">
                    <button onclick="storeManager.editProduct('${prod.id}')" class="text-blue-500 hover:text-blue-700">Editar</button>
                    <button onclick="storeManager.deleteProduct('${prod.id}')" class="text-red-500 hover:text-red-700">Excluir</button>
                </td>
            `;
        });
    }

    addCategory() {
        const nameInput = document.getElementById('newCategoryName');
        const name = nameInput.value.trim();

        if (!name) {
            this.toast('Nome da categoria é obrigatório.', 'bg-yellow-500');
            return;
        }

        const newId = 'cat-' + Date.now();
        this.data.categorias.push({ id: newId, name: name });
        nameInput.value = '';
        this.saveLocalData();
        this.renderCategoriesList(); 
    }

    deleteCategory(categoryId) {
        if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos nela serão movidos para "Sem Categoria".')) return;
        
        this.data.categorias = this.data.categorias.filter(cat => cat.id !== categoryId);
        
        this.data.produtos = this.data.produtos.map(prod => {
            if (prod.categoryId === categoryId) {
                prod.categoryId = null; 
            }
            return prod;
        });

        this.saveLocalData();
        this.renderItemManagement();
    }
    
    openProductModal(productId = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const categorySelect = document.getElementById('productCategoryId');
        
        categorySelect.innerHTML = '';
        this.data.categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });

        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('modalTitle').textContent = 'Adicionar Novo Produto';

        if (productId) {
            const product = this.data.produtos.find(p => p.id === productId);
            if (product) {
                document.getElementById('modalTitle').textContent = 'Editar Produto';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productImageUrl').value = product.imageUrl;
                document.getElementById('productCategoryId').value = product.categoryId;
            }
        }

        modal.classList.remove('hidden');
        
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveProduct();
        };
    }

    closeProductModal() {
        document.getElementById('productModal').classList.add('hidden');
    }
    
    saveProduct() {
        const productId = document.getElementById('productId').value;
        
        const productData = {
            id: productId || 'prod-' + Date.now(),
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            imageUrl: document.getElementById('productImageUrl').value,
            categoryId: document.getElementById('productCategoryId').value,
        };
        
        if (productId) {
            // Edição
            const index = this.data.produtos.findIndex(p => p.id === productId);
            if (index !== -1) {
                this.data.produtos[index] = productData;
            }
        } else {
            // Criação
            this.data.produtos.push(productData);
        }

        this.saveLocalData();
        this.renderItemManagement();
        this.closeProductModal();
        this.toast('Produto salvo com sucesso!', 'bg-green-500');
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }
    
    deleteProduct(productId) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        
        this.data.produtos = this.data.produtos.filter(p => p.id !== productId);
        this.saveLocalData();
        this.renderProductsTable();
        this.toast('Produto excluído.', 'bg-red-500');
    }

    // ====================================================================
    // MÉTODOS DE UI E UTILIDADES
    // ====================================================================
    
    toast(message, className = 'bg-gray-800') {
        const toastEl = document.createElement('div');
        toastEl.className = `fixed bottom-4 right-4 text-white p-3 rounded-lg shadow-xl ${className} z-50 transition-opacity duration-300`;
        toastEl.textContent = message;
        document.body.appendChild(toastEl);
        
        setTimeout(() => {
            toastEl.style.opacity = 0;
            setTimeout(() => toastEl.remove(), 300);
        }, 3000);
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active-tab', 'font-bold', 'text-indigo-600'); // Remove o estilo ativo
        });

        const targetSection = document.getElementById(`tab-${tabName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        const targetButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active-tab', 'font-bold', 'text-indigo-600');
        }
    }

    setupEventListeners() {
        // Event Listeners para botões principais
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveLocalData());
        document.getElementById('publishBtn')?.addEventListener('click', () => this.publishData());
        
        // Event Listeners para abas de navegação
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });
    }
}

// ====================================================================
// INICIALIZAÇÃO ROBUSTA
// Só inicia a aplicação quando o DOM (HTML) estiver totalmente carregado.
// Isso resolve o problema das abas que não mudavam.
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    // A inicialização da classe agora acontece aqui
    window.storeManager = new StoreManager();
    window.storeManager.init(); 
});
