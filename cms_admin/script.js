// ====================================================================
// Serverless-System | CMS ADMIN - LÓGICA PRINCIPAL (script.js) - V2.1
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

    // --- 2. CUSTOMIZAÇÃO (APARÊNCIA) - EXPANDIDO ---
    customizacao: {
        headerFooterColor: '#10B981', // Cor 1: Header/Footer e Botões
        titleTextColor: '#FFFFFF',    // Cor 2: Cor da Letra/Título (Contraste)
        backgroundColor: '#f9f9f9',
        backgroundImageUrl: '', // NOVO: URL da Imagem de Fundo
        logoUrl: 'https://via.placeholder.com/150x50/10B981/ffffff?text=LabSystem',
        musicUrl: '', // NOVO: Link do YouTube (Ex: https://www.youtube.com/watch?v=xxxxxxxxxxx)
        musicVolume: 50, // NOVO: Volume (0-100)
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

    init() {
        this.loadLocalData();
        this.renderFormFields(); 
        this.renderItemManagement(); 
        this.renderCoverage(); 
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
    // MÉTODOS DE COLETA DE DADOS DO FORMULÁRIO (INPUT)
    // ====================================================================

    collectDataFromForms() {
        this.collectPublicationFields();
        this.collectCustomizationFields(); // ATUALIZADO
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
    
    // ATUALIZADO: Coleção de novos campos de customização
    collectCustomizationFields() {
        this.data.customizacao.headerFooterColor = document.getElementById('headerFooterColor')?.value || '#000000';
        this.data.customizacao.titleTextColor = document.getElementById('titleTextColor')?.value || '#FFFFFF'; // NOVO
        this.data.customizacao.backgroundColor = document.getElementById('backgroundColor')?.value || '#f9f9f9';
        this.data.customizacao.backgroundImageUrl = document.getElementById('backgroundImageUrl')?.value || ''; // NOVO
        this.data.customizacao.logoUrl = document.getElementById('logoUrl')?.value || '';
        this.data.customizacao.musicUrl = document.getElementById('musicUrl')?.value || ''; // NOVO
        
        // NOVO: Coleta o valor do volume e garante que seja um número entre 0 e 100
        let volume = parseInt(document.getElementById('musicVolume')?.value);
        this.data.customizacao.musicVolume = Math.min(100, Math.max(0, isNaN(volume) ? 50 : volume));
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
            document.getElementById('storeName').value = d.configuracoes.storeName || 'LabSystem Store'; 
            document.getElementById('address').value = d.configuracoes.address || ''; 
            document.getElementById('storeStatus').value = d.configuracoes.storeStatus || 'closed';
            document.getElementById('whatsapp').value = d.configuracoes.whatsapp || '';
        }
        
        // Dados de Pagamento (Loja)
        if (document.getElementById('pixKey')) {
            document.getElementById('pixKey').value = d.pagamento.pixKey || '';
            document.getElementById('bankDetails').value = d.pagamento.bankDetails || '';
            document.getElementById('bitcoinLightning').value = d.pagamento.bitcoinLightning || '';
        }

        // Customização (Customizar) - ATUALIZADO
        if (document.getElementById('headerFooterColor')) {
            document.getElementById('headerFooterColor').value = d.customizacao.headerFooterColor || '#000000';
            document.getElementById('titleTextColor').value = d.customizacao.titleTextColor || '#FFFFFF'; // NOVO
            document.getElementById('backgroundColor').value = d.customizacao.backgroundColor || '#f9f9f9';
            document.getElementById('backgroundImageUrl').value = d.customizacao.backgroundImageUrl || ''; // NOVO
            document.getElementById('logoUrl').value = d.customizacao.logoUrl || '';
            document.getElementById('musicUrl').value = d.customizacao.musicUrl || ''; // NOVO
            document.getElementById('musicVolume').value = d.customizacao.musicVolume || 50; // NOVO
        }
    }
    
    // ... (MÉTODOS renderCoverage, openCoverageModal, closeCoverageModal, saveCoverage, editCoverage, deleteCoverage, renderItemManagement e todos os métodos de Produtos e Categorias permanecem IGUAIS) ...

    // MÉTODOS DE UTILIDADE (mantidos)

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
        // ... (lógica de mudança de aba mantida) ...
    }

    setupEventListeners() {
        // ... (event listeners mantidos) ...
    }
    
    async publishData() {
        // ... (lógica de publicação mantida) ...
    }

    // ... (Todos os outros métodos CRUD de produtos e categorias mantidos) ...
    // ... (Métodos de import/export mantidos) ...
}

document.addEventListener('DOMContentLoaded', () => {
    window.storeManager = new StoreManager();
    window.storeManager.init(); 
});
