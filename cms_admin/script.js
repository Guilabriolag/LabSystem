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
        binId: '', // O ID do Bin da loja (será lido do input)
        masterKey: '', // A chave para Escrita (Master Key do JSONBin)
        storeStatus: 'open', // open | closed
        whatsapp: '5511999998888',
        lowStockThreshold: 5,
        // ... outras configurações gerais
    },

    // --- 2. CUSTOMIZAÇÃO (APARÊNCIA) ---
    customizacao: {
        colorPrimary: '#10B981', // Ex: Cor Verde Esmeralda (Principal)
        colorSecondary: '#059669', // Ex: Cor Verde Escuro
        backgroundColor: '#f9f9f9',
        logoUrl: 'https://via.placeholder.com/150x50/10B981/ffffff?text=Logo',
    },

    // --- 3. ITENS E CARDÁPIO (TOTEM) ---
    // A estrutura unificada de produtos e preços do McClone
    categorias: [
        { id: 'cat-1', name: 'Combos Especiais' },
        { id: 'cat-2', name: 'Hambúrgueres' }
    ],
    produtos: [
        { id: 'prod-1', name: 'X-Salada Clássico', price: 18.50, stock: 50, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200?text=X-Salada' },
        { id: 'prod-2', name: 'Batata Média', price: 8.00, stock: 100, categoryId: 'cat-2', imageUrl: 'https://via.placeholder.com/300x200?text=Batata' }
    ],

    // --- 4. DADOS DE PAGAMENTO ---
    pagamento: {
        pixKey: 'sua-chave-pix-aqui',
        bankDetails: 'Banco X, Ag 0001, C/C 12345-6',
        bitcoinLightning: '' // Suporte a Bitcoin Lightning
    },

    // ... Outras seções como cupons, publicidade, etc.
};

// ... (O início do script e a classe StoreManager)

    // ====================================================================
    // MÉTODOS DE COLETA DE DADOS DO FORMULÁRIO (INPUT)
    // ====================================================================

    // Função Mestra: Coleta TODOS os dados do formulário e atualiza this.data
    collectDataFromForms() {
        this.collectPublicationFields();
        this.collectCustomizationFields();
        this.collectDadosLojaFields();
        // ... Chamar outras funções de coleta (itens, cupons, etc)
    }

    // Coleta BIN ID e Master Key
    collectPublicationFields() {
        this.data.configuracoes.binId = document.getElementById('binId')?.value || '';
        this.data.configuracoes.masterKey = document.getElementById('masterKey')?.value || '';
    }

    // Coleta Dados Operacionais e Pagamento
    collectDadosLojaFields() {
        this.data.configuracoes.storeStatus = document.getElementById('storeStatus')?.value || 'closed';
        this.data.configuracoes.whatsapp = document.getElementById('whatsapp')?.value || '';
        
        this.data.pagamento.pixKey = document.getElementById('pixKey')?.value || '';
        this.data.pagamento.bankDetails = document.getElementById('bankDetails')?.value || '';
        this.data.pagamento.bitcoinLightning = document.getElementById('bitcoinLightning')?.value || '';
    }
    
    // Coleta Customização
    collectCustomizationFields() {
        this.data.customizacao.colorPrimary = document.getElementById('colorPrimary')?.value || '#000000';
        this.data.customizacao.colorSecondary = document.getElementById('colorSecondary')?.value || '#000000';
        this.data.customizacao.logoUrl = document.getElementById('logoUrl')?.value || '';
    }


    // ====================================================================
    // MÉTODOS DE RENDERIZAÇÃO DOS DADOS NO FORMULÁRIO (OUTPUT)
    // ====================================================================
    
    // Renderiza os valores de this.data nos campos de formulário (CMS)
    renderFormFields() {
        const d = this.data;

        // 1. Configurações de Publicação (Publicar)
        if (document.getElementById('binId')) {
            document.getElementById('binId').value = d.configuracoes.binId || '';
            document.getElementById('masterKey').value = d.configuracoes.masterKey || '';
        }

        // 2. Dados Operacionais (Loja)
        if (document.getElementById('storeStatus')) {
            document.getElementById('storeStatus').value = d.configuracoes.storeStatus || 'closed';
            document.getElementById('whatsapp').value = d.configuracoes.whatsapp || '';
        }
        
        // 3. Dados de Pagamento (Loja)
        if (document.getElementById('pixKey')) {
            document.getElementById('pixKey').value = d.pagamento.pixKey || '';
            document.getElementById('bankDetails').value = d.pagamento.bankDetails || '';
            document.getElementById('bitcoinLightning').value = d.pagamento.bitcoinLightning || '';
        }

        // 4. Customização (Customizar)
        if (document.getElementById('colorPrimary')) {
            document.getElementById('colorPrimary').value = d.customizacao.colorPrimary || '#000000';
            document.getElementById('colorSecondary').value = d.customizacao.colorSecondary || '#000000';
            document.getElementById('logoUrl').value = d.customizacao.logoUrl || '';
        }
    }

// ... (O restante do script, incluindo publishData e a inicialização)

    // ====================================================================
    // MÉTODOS DE SINCRONIZAÇÃO REMOTA (JSONBIN) - Próximo Passo
    // ====================================================================

    async publishData() {
        this.collectDataFromForms(); // Coleta todos os dados mais recentes

        const { binId, masterKey } = this.data.configuracoes;

        if (!binId || !masterKey) {
            this.toast('❌ BIN ID e Master Key são obrigatórios para Publicar.', 'bg-red-500');
            return;
        }

        // 1. Salva localmente (Garantia de que o trabalho está salvo)
        this.saveLocalData(); 

        // 2. Publica no JSONBin
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
    // MÉTODOS DE UI E UTILIDADES
    // ====================================================================

    // Renderiza os valores de this.data nos campos de formulário (CMS)
    renderFormFields() {
        // 1. Campos de Publicação
        if (document.getElementById('binId')) {
            document.getElementById('binId').value = this.data.configuracoes.binId;
            document.getElementById('masterKey').value = this.data.configuracoes.masterKey; // A Master Key pode ser sensível, mas salva localmente para conveniência.
        }
        
        // 2. Outros campos de Customização, etc. (A SER IMPLEMENTADO)
    }
    
    // Funções de Utilitário para UI
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
            btn.classList.remove('active-tab', 'text-indigo-600', 'font-bold');
        });

        const targetSection = document.getElementById(`tab-${tabName}`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const targetButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active-tab', 'text-indigo-600', 'font-bold');
        }
    }

    setupEventListeners() {
        // Event Listeners para botões principais
        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveLocalData());
        document.getElementById('publishBtn')?.addEventListener('click', () => this.publishData());
        // document.getElementById('visitBtn')?.addEventListener('click', () => window.open('/totem/index.html', '_blank'));
        
        // Event Listeners para abas de navegação
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });
    }
}

// Inicialização da aplicação
const storeManager = new StoreManager();
