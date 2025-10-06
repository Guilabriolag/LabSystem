// ====================================================================
// Serverless-System | CMS ADMIN - LÓGICA PRINCIPAL (script.js) - V2.1 (CONSOLIDADO)
// ====================================================================

/**
 * Estrutura Unificada de Dados Padrão (Default Data)
 */
const defaultData = {
    // --- 1. CONFIGURAÇÃO DE PUBLICAÇÃO (CMS) ---
    configuracoes: {
        binId: '', 
        masterKey: '', 
        storeStatus: 'open', // open | closed
        whatsapp: '5511999998888',
        lowStockThreshold: 5,
        storeName: 'LabSystem Store', 
        address: 'Rua Exemplo, 123 - Cidade, UF', 
    },

    // --- 2. CUSTOMIZAÇÃO (APARÊNCIA) ---
    customizacao: {
        headerFooterColor: '#10B981', // Cor 1: Header/Footer e Botões
        titleTextColor: '#FFFFFF',    // Cor 2: Cor da Letra/Título (Contraste)
        backgroundColor: '#f9f9f9',
        backgroundImageUrl: '', // URL da Imagem de Fundo
        logoUrl: 'https://via.placeholder.com/150x50/10B981/ffffff?text=LabSystem',
        musicUrl: '', // Link do YouTube 
        musicVolume: 50, // Volume (0-100)
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
    
    // --- 5. COBERTURA DE ENTREGA ---
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

    // ====================================================================
    // INICIALIZAÇÃO
    // ====================================================================

    init() {
        this.loadLocalData();
        this.renderFormFields(); 
        this.renderItemManagement(); 
        this.renderCoverage(); 
        this.checkLowStockAlerts(); 
        this.setupEventListeners(); // ESSENCIAL: Configura os eventos de clique
        this.switchTab('publicar'); // Define a aba inicial

        try {
            this.setupEventListeners();
        } catch (e) {
            console.error("Erro fatal ao configurar Event Listeners:", e);
            this.toast('❌ Erro de inicialização. Verifique o console.', 'bg-red-500');
        }
    }

    // ====================================================================
    // EVENT LISTENERS (CRITICAL)
    // ====================================================================

    setupEventListeners() {
        // Event Listeners para botões principais
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveLocalData());
        document.getElementById('publishBtn')?.addEventListener('click', () => this.publishData());
        
        // Event Listeners para abas de navegação (Onde o problema costuma estar)
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
        
        // Event Listener para formulário do modal de produto
        const productForm = document.getElementById('productForm');
        if(productForm) {
            productForm.onsubmit = (e) => {
                e.preventDefault();
                this.saveProduct();
            };
        }
        
        // Listener para sincronizar o texto do range de volume
        const musicVolumeInput = document.getElementById('musicVolume');
        if (musicVolumeInput) {
            musicVolumeInput.addEventListener('input', (e) => {
                document.getElementById('musicVolumeValue').textContent = e.target.value;
            });
        }
    }

    // ====================================================================
    // MÉTODOS DE TROCA DE ABA (CRITICAL)
    // ====================================================================

    switchTab(tabName) {
        // 1. Oculta todas as seções de conteúdo
        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.add('hidden');
        });
        // 2. Remove o estilo "ativo" de todos os botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active-tab', 'font-bold', 'text-indigo-600'); 
            btn.classList.add('text-gray-500');
        });

        // 3. Mostra a seção alvo
        const targetSection = document.getElementById(`tab-${tabName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        // 4. Adiciona o estilo "ativo" ao botão alvo
        const targetButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active-tab', 'font-bold', 'text-indigo-600');
            targetButton.classList.remove('text-gray-500');
        }
    }

    // ====================================================================
    // MÉTODOS DE PERSISTÊNCIA LOCAL (LOCAL STORAGE)
    // ====================================================================

    loadLocalData() {
        try {
            const savedData = localStorage.getItem(this.dataKey);
            if (savedData) {
                let loadedData = JSON.parse(savedData);
                this.data = { ...JSON.parse(JSON.stringify(defaultData)), ...loadedData }; 
                this.data.configuracoes = { ...defaultData.configuracoes, ...loadedData.configuracoes };
                this.data.customizacao = { ...defaultData.customizacao, ...loadedData.customizacao };
                this.data.pagamento = { ...defaultData.pagamento, ...loadedData.pagamento };
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
    // MÉTODOS DE COLETA E RENDERIZAÇÃO
    // (Lógica de coleta e renderização omitida por brevidade, mas deve existir)
    // ====================================================================
    
    collectDataFromForms() {
        this.collectPublicationFields();
        this.collectCustomizationFields();
        this.collectDadosLojaFields();
    }

    collectPublicationFields() {
        this.data.configuracoes.binId = document.getElementById('binId')?.value || '';
        this.data.configuracoes.masterKey = document.getElementById('masterKey')?.value || '';
    }

    collectDadosLojaFields() {
        this.data.configuracoes.storeName = document.getElementById('storeName')?.value || 'LabSystem Store';
        this.data.configuracoes.address = document.getElementById('address')?.value || '';
        this.data.configuracoes.storeStatus = document.getElementById('storeStatus')?.value || 'closed';
        this.data.configuracoes.whatsapp = document.getElementById('whatsapp')?.value || '';
        
        this.data.pagamento.pixKey = document.getElementById('pixKey')?.value || '';
        this.data.pagamento.bankDetails = document.getElementById('bankDetails')?.value || '';
        this.data.pagamento.bitcoinLightning = document.getElementById('bitcoinLightning')?.value || '';
    }
    
    collectCustomizationFields() {
        this.data.customizacao.headerFooterColor = document.getElementById('headerFooterColor')?.value || '#000000';
        this.data.customizacao.titleTextColor = document.getElementById('titleTextColor')?.value || '#FFFFFF';
        this.data.customizacao.backgroundColor = document.getElementById('backgroundColor')?.value || '#f9f9f9';
        this.data.customizacao.backgroundImageUrl = document.getElementById('backgroundImageUrl')?.value || '';
        this.data.customizacao.logoUrl = document.getElementById('logoUrl')?.value || '';
        this.data.customizacao.musicUrl = document.getElementById('musicUrl')?.value || '';
        
        let volume = parseInt(document.getElementById('musicVolume')?.value);
        this.data.customizacao.musicVolume = Math.min(100, Math.max(0, isNaN(volume) ? 50 : volume));
    }
    
    renderFormFields() {
        const d = this.data;

        if (document.getElementById('binId')) {
            document.getElementById('binId').value = d.configuracoes.binId || '';
            document.getElementById('masterKey').value = d.configuracoes.masterKey || '';
        }

        if (document.getElementById('storeStatus')) {
            document.getElementById('storeName').value = d.configuracoes.storeName || 'LabSystem Store'; 
            document.getElementById('address').value = d.configuracoes.address || ''; 
            document.getElementById('storeStatus').value = d.configuracoes.storeStatus || 'closed';
            document.getElementById('whatsapp').value = d.configuracoes.whatsapp || '';
        }
        
        if (document.getElementById('pixKey')) {
            document.getElementById('pixKey').value = d.pagamento.pixKey || '';
            document.getElementById('bankDetails').value = d.pagamento.bankDetails || '';
            document.getElementById('bitcoinLightning').value = d.pagamento.bitcoinLightning || '';
        }

        if (document.getElementById('headerFooterColor')) {
            document.getElementById('headerFooterColor').value = d.customizacao.headerFooterColor || '#000000';
            document.getElementById('titleTextColor').value = d.customizacao.titleTextColor || '#FFFFFF';
            document.getElementById('backgroundColor').value = d.customizacao.backgroundColor || '#f9f9f9';
            document.getElementById('backgroundImageUrl').value = d.customizacao.backgroundImageUrl || '';
            document.getElementById('logoUrl').value = d.customizacao.logoUrl || '';
            document.getElementById('musicUrl').value = d.customizacao.musicUrl || '';
            document.getElementById('musicVolume').value = d.customizacao.musicVolume || 50;
            document.getElementById('musicVolumeValue').textContent = d.customizacao.musicVolume || 50;
        }
    }
    
    // ====================================================================
    // MÉTODOS DE COBERTURA DE ENTREGA (CRUD)
    // (Métodos renderCoverage, saveCoverage, openCoverageModal, etc. devem estar aqui)
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
    // SINCRONIZAÇÃO, ITENS, BACKUP E UTILIDADES (Mantidos)
    // (Todos os métodos de publicação, produtos, categorias, import/export e toast devem estar aqui)
    // ====================================================================

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
        document.body.appendChild(
