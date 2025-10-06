// ====================================================================
// Serverless-System | CMS ADMIN - LÓGICA PRINCIPAL (script.js) - V2.0
// ====================================================================

/**
 * Estrutura Unificada de Dados Padrão (Default Data)
 * Adicionado: storeName, address e cobertura[]
 */
const defaultData = {
    // --- 1. CONFIGURAÇÃO DE PUBLICAÇÃO (CMS) ---
    configuracoes: {
        binId: '', 
        masterKey: '', 
        storeStatus: 'open', // open | closed
        whatsapp: '5511999998888',
        lowStockThreshold: 5,
        storeName: 'LabSystem Store', // NOVO: Nome da Loja
        address: 'Rua Exemplo, 123 - Cidade, UF', // NOVO: Endereço da Loja
    },

    // --- 2. CUSTOMIZAÇÃO (APARÊNCIA) ---
    customizacao: {
        colorPrimary: '#10B981', 
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
    
    // --- 5. COBERTURA DE ENTREGA (NOVO) ---
    cobertura: [
        { id: 'area-1', name: 'Centro', taxa: 5.00, tempo: 30 },
        { id: 'area-2', name: 'Bairro Exemplo', taxa: 8.50, tempo: 45 }
    ],
};


class StoreManager {
    constructor() {
        this.dataKey = 'labsystem_store_data'; 
        this.data = {};
        this.currentProductId = null; 
    }

    // Inicializa: Tenta carregar dados locais, configura eventos e renderiza a UI.
    init() {
        this.loadLocalData();
        this.renderFormFields(); 
        this.renderItemManagement(); 
        this.renderCoverage(); // NOVO: Renderiza a Cobertura
        this.checkLowStockAlerts(); 
        this.switchTab('publicar'); 

        try {
            this.setupEventListeners();
        } catch (e) {
            console.error("Erro fatal ao configurar Event Listeners:", e);
            this.toast('❌ Erro de inicialização. Verifique o console.', 'bg-red-500');
        }
    }

    // ====================================================================
    // MÉTODOS DE PERSISTÊNCIA LOCAL (LOCAL STORAGE)
    // ====================================================================

    loadLocalData() {
        try {
            const savedData = localStorage.getItem(this.dataKey);
            if (savedData) {
                // Tenta mesclar novos campos, caso o usuário tenha dados antigos
                let loadedData = JSON.parse(savedData);
                this.data = { ...JSON.parse(JSON.stringify(defaultData)), ...loadedData }; 
                // Garante que sub-objetos também sejam mesclados
                this.data.configuracoes = { ...defaultData.configuracoes, ...loadedData.configuracoes };
                this.data.customizacao = { ...defaultData.customizacao, ...loadedData.customizacao };
                this.data.pagamento = { ...defaultData.pagamento, ...loadedData.pagamento };
                // Garante que o array de cobertura exista
                this.data.cobertura = loadedData.cobertura || defaultData.cobertura;
            } else {
                this.data = JSON.parse(JSON.stringify(defaultData)); 
            }
        } catch (e) {
            console.error('Erro ao carregar dados locais:', e);
            this.data = JSON.parse(JSON.stringify(defaultData));
        }
    }

    saveLocalData() {
        try {
            this.collectDataFromForms(); 
            localStorage.setItem(this.dataKey, JSON.stringify(this.data));
            this.checkLowStockAlerts();
            this.toast('✅ Dados salvos localmente!', 'bg-indigo-500');
        } catch (e) {
            this.toast('❌ Erro ao salvar dados localmente.', 'bg-red-500');
            console.error('Erro ao salvar no LocalStorage:', e);
        }
    }
    
    // ====================================================================
    // MÉTODOS DE COLETA DE DADOS DO FORMULÁRIO (INPUT)
    // ====================================================================

    collectDataFromForms() {
        this.collectPublicationFields();
        this.collectCustomizationFields();
        this.collectDadosLojaFields();
        // A cobertura é salva diretamente pelos métodos de CRUD
    }

    collectPublicationFields() {
        this.data.configuracoes.binId = document.getElementById('binId')?.value || '';
        this.data.configuracoes.masterKey = document.getElementById('masterKey')?.value || '';
    }

    collectDadosLojaFields() {
        // NOVOS CAMPOS
        this.data.configuracoes.storeName = document.getElementById('storeName')?.value || 'LabSystem Store';
        this.data.configuracoes.address = document.getElementById('address')?.value || '';
        
        // CAMPOS EXISTENTES
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

        // Dados Operacionais (Loja) - NOVOS E EXISTENTES
        if (document.getElementById('storeStatus')) {
            document.getElementById('storeName').value = d.configuracoes.storeName || 'LabSystem Store'; // NOVO
            document.getElementById('address').value = d.configuracoes.address || ''; // NOVO
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
    // MÉTODOS DE COBERTURA DE ENTREGA (CRUD)
    // ====================================================================

    renderCoverage() {
        const tableBody = document.getElementById('coverageTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        this.data.cobertura.forEach(area => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${area.name}</td>
                <td class="py-2 px-4 border-b">R$ ${area.taxa.toFixed(2).replace('.', ',')}</td>
                <td class="py-2 px-4 border-b">${area.tempo} min</td>
                <td class="py-2 px-4 border-b text-center space-x-2">
                    <button onclick="storeManager.editCoverage('${area.id}')" class="text-blue-500 hover:text-blue-700">Editar</button>
                    <button onclick="storeManager.deleteCoverage('${area.id}')" class="text-red-500 hover:text-red-700">Excluir</button>
                </td>
            `;
        });
    }

    openCoverageModal(coverageId = null) {
        const modal = document.getElementById('coverageModal');
        const form = document.getElementById('coverageForm');
        
        form.reset();
        document.getElementById('coverageId').value = '';
        document.getElementById('coverageModalTitle').textContent = 'Adicionar Nova Área';

        if (coverageId) {
            const area = this.data.cobertura.find(a => a.id === coverageId);
            if (area) {
                document.getElementById('coverageModalTitle').textContent = 'Editar Área';
                document.getElementById('coverageId').value = area.id;
                document.getElementById('coverageNameModal').value = area.name;
                document.getElementById('coverageTaxaModal').value = area.taxa;
                document.getElementById('coverageTempoModal').value = area.tempo;
            }
        }

        modal.classList.remove('hidden');
    }

    closeCoverageModal() {
        document.getElementById('coverageModal').classList.add('hidden');
    }

    saveCoverage() {
        const coverageId = document.getElementById('coverageId').value;
        const name = document.getElementById('coverageNameModal').value.trim();
        const taxa = parseFloat(document.getElementById('coverageTaxaModal').value);
        const tempo = parseInt(document.getElementById('coverageTempoModal').value);
        
        if (!name || isNaN(taxa) || isNaN(tempo) || taxa < 0 || tempo <= 0) {
            this.toast('Preencha todos os campos da Cobertura corretamente.', 'bg-yellow-500');
            return;
        }

        const areaData = {
            id: coverageId || 'area-' + Date.now(),
            name,
            taxa,
            tempo,
        };
        
        if (coverageId) {
            const index = this.data.cobertura.findIndex(a => a.id === coverageId);
            if (index !== -1) {
                this.data.cobertura[index] = areaData;
            }
        } else {
            this.data.cobertura.push(areaData);
        }

        this.saveLocalData();
        this.renderCoverage();
        this.closeCoverageModal();
        this.toast('Área de cobertura salva!', 'bg-green-500');
    }

    editCoverage(coverageId) {
        this.openCoverageModal(coverageId);
    }

    deleteCoverage(coverageId) {
        if (!confirm('Tem certeza que deseja excluir esta área de cobertura?')) return;
        
        this.data.cobertura = this.data.cobertura.filter(a => a.id !== coverageId);
        this.saveLocalData();
        this.renderCoverage();
        this.toast('Área de cobertura excluída.', 'bg-red-500');
    }

    // ====================================================================
    // SINCRONIZAÇÃO, ITENS, BACKUP E UTILIDADES (MANTIDOS)
    // ====================================================================
    
    // (MÉTODOS publishData, renderItemManagement, addCategory, deleteCategory, etc., mantidos iguais)
    async publishData() {
        this.collectDataFromForms(); 

        const { binId, masterKey } = this.data.configuracoes;

        if (!binId || !masterKey) {
            this.toast('❌ BIN ID e Master Key são obrigatórios para Publicar.', 'bg-red-500');
            return;
        }

        this.saveLocalData(); 

        const url = `https://api.jsonbin.io/v3/b/${binId}`;
        this.toast('⏳ Publicando no JSONBin...');

        try {
            const response = await fetch(url, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': masterKey, 
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
            const index = this.data.produtos.findIndex(p => p.id === productId);
            if (index !== -1) {
                this.data.produtos[index] = productData;
            }
        } else {
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

    exportData() {
        this.collectDataFromForms(); 
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `labsystem_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.toast('💾 Dados exportados com sucesso!', 'bg-gray-700');
    }

    triggerImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.style.display = 'none';
        input.addEventListener('change', (e) => this.importData(e));
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && importedData.configuracoes && importedData.produtos) {
                    if (confirm('Importar? Isso substituirá TODOS os dados atuais do CMS local. Tem certeza?')) {
                        this.data = importedData;
                        this.saveLocalData(); 
                        this.renderFormFields(); 
                        this.renderItemManagement(); 
                        this.renderCoverage(); // NOVO: Recarrega a Cobertura
                        this.toast('🎉 Dados importados com sucesso! Não esqueça de PUBLICAR.', 'bg-indigo-500');
                    }
                } else {
                    this.toast('❌ Arquivo JSON inválido ou incompleto para o LabSystem.', 'bg-red-500');
                }
            } catch (error) {
                this.toast('❌ Erro ao ler o arquivo. Certifique-se de que é um JSON válido.', 'bg-red-500');
            }
        };
        reader.readAsText(file);
    }

    checkLowStockAlerts() {
        const alertContainer = document.getElementById('lowStockAlerts');
        if (!alertContainer) return;

        const threshold = this.data.configuracoes.lowStockThreshold || 5;
        const lowStockProducts = this.data.produtos.filter(p => p.stock <= threshold && p.stock > 0);

        if (lowStockProducts.length > 0) {
            alertContainer.classList.remove('hidden');
            const alertHtml = lowStockProducts.map(p => 
                `<span class="block text-sm">⚠️ ${p.name}: ${p.stock} em estoque</span>`
            ).join('');
            alertContainer.innerHTML = `<h4 class="font-bold mb-1">ALERTA DE ESTOQUE (${lowStockProducts.length})</h4>${alertHtml}`;
        } else {
            alertContainer.classList.add('hidden');
        }
    }

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
            btn.classList.remove('active-tab', 'font-bold', 'text-indigo-600'); 
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
        
        // Event Listener para formulário do modal de cobertura
        const coverageForm = document.getElementById('coverageForm');
        if(coverageForm) {
            coverageForm.onsubmit = (e) => {
                e.preventDefault();
                this.saveCoverage();
            };
        }
    }
}

// ====================================================================
// INICIALIZAÇÃO ROBUSTA
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.storeManager = new StoreManager();
    window.storeManager.init(); 
});
