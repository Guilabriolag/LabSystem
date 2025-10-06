// ====================================================================
// Serverless-System | TOTEM CLIENTE - LÓGICA PRINCIPAL (script.js) - V2.1
// ====================================================================

class TotemApp {
    constructor() {
        this.binId = 'COLE_O_SEU_BIN_ID_AQUI'; // *ATUALIZE COM SEU BIN ID PUBLICO*
        this.storeData = {};
        this.cart = this.loadCart() || [];
        this.storeStatus = 'closed';
        this.youtubePlayer = null; // Para o player do YouTube

        this.init();
    }

    // ====================================================================
    // INICIALIZAÇÃO E CARREGAMENTO DE DADOS
    // ====================================================================

    async init() {
        await this.fetchData();
        
        if (this.storeStatus === 'closed') {
            this.showClosedMessage();
            return;
        }

        this.renderStore();
        this.renderMenu();
        this.updateCartUI();
        this.setupEventListeners();
        
        // NOVO: Inicializa a customização avançada (incluindo a música)
        this.applyCustomization();
        this.initYouTubePlayer(); 
    }
    
    // MÉTODOS DE APLICAÇÃO DE ESTILOS E MÍDIA
    applyCustomization() {
        const custom = this.storeData.customizacao;
        const config = this.storeData.configuracoes;

        // 1. Aplica Cores e Background
        document.documentElement.style.setProperty('--color-primary', custom.headerFooterColor); // Cor 1 (Header/Botões)
        document.documentElement.style.setProperty('--text-primary', custom.titleTextColor); // Cor 2 (Cor do Texto Principal)
        document.documentElement.style.setProperty('--bg-color', custom.backgroundColor);

        // 2. Aplica Nome da Loja e Logo
        document.getElementById('store-name').textContent = config.storeName || 'LabSystem Totem'; 
        document.getElementById('store-logo').src = custom.logoUrl;
        
        // 3. Aplica Imagem de Fundo (se houver)
        const main = document.getElementById('main-content');
        if (custom.backgroundImageUrl) {
            document.body.style.backgroundImage = `url('${custom.backgroundImageUrl}')`;
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
        } else {
            // Garante que o background seja apenas a cor se a URL estiver vazia
            document.body.style.backgroundImage = 'none';
        }
    }

    // NOVO: Lógica do Player de Música do YouTube
    initYouTubePlayer() {
        const musicUrl = this.storeData.customizacao.musicUrl;
        if (!musicUrl) return;

        // Extrai o ID do vídeo da URL
        const videoIdMatch = musicUrl.match(/(?:\/|v=)([\w-]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) return;

        // 1. Cria o elemento div onde o player será injetado
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-music-player';
        playerDiv.style.display = 'none'; // Oculta o player
        document.body.appendChild(playerDiv);
        
        // 2. Carrega a API do YouTube IFrame (se ainda não carregada)
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // 3. Função Global para ser chamada quando a API estiver pronta
        window.onYouTubeIframeAPIReady = () => {
            this.createPlayer(videoId);
        };

        // Se a API já estiver carregada, chama a função diretamente
        if (window.YT && !this.youtubePlayer) {
            this.createPlayer(videoId);
        }
    }

    createPlayer(videoId) {
        const volume = this.storeData.customizacao.musicVolume;
        
        this.youtubePlayer = new YT.Player('youtube-music-player', {
            videoId: videoId,
            playerVars: {
                'autoplay': 0, // Não pode iniciar automático no mobile, precisa de interação
                'controls': 0,
                'loop': 1,
                'disablekb': 1,
                'playlist': videoId // Para garantir o loop
            },
            events: {
                'onReady': (event) => {
                    event.target.setVolume(volume);
                    // Adiciona um botão/evento para o usuário iniciar a música
                    this.addMusicToggleButton();
                },
                'onStateChange': (event) => {
                    // Reinicia o vídeo quando terminar (estado 0) para simular loop
                    if (event.data === YT.PlayerState.ENDED) {
                        event.target.playVideo();
                    }
                }
            }
        });
    }

    // Adiciona um botão flutuante para que o usuário possa dar o Play/Pause na música (requisito de navegadores)
    addMusicToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'music-toggle-btn';
        btn.className = 'fixed bottom-20 right-4 z-40 bg-gray-700 text-white p-3 rounded-full shadow-lg transition duration-300 hover:bg-gray-600 lg:bottom-4';
        btn.innerHTML = '▶️'; // Ícone inicial (Play)
        document.body.appendChild(btn);

        let isPlaying = false;

        btn.onclick = () => {
            if (!this.youtubePlayer) return;

            if (isPlaying) {
                this.youtubePlayer.pauseVideo();
                btn.innerHTML = '▶️';
                isPlaying = false;
            } else {
                this.youtubePlayer.playVideo();
                btn.innerHTML = '⏸️';
                isPlaying = true;
            }
        };
    }
    
    // ... (MÉTODOS fetchData, showClosedMessage, setupEventListeners, renderMenu, renderProducts, updateCartUI, saveCart, loadCart, addToCart, removeFromCart, openCartModal, closeCartModal, initiateCheckout permanecem IGUAIS) ...

    async fetchData() {
        const loadingContainer = document.getElementById('sections-container');
        loadingContainer.innerHTML = '<p class="text-center text-gray-500 mt-12">Carregando dados da loja...</p>';
        
        const url = `https://api.jsonbin.io/v3/b/${this.binId}/latest`;

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Master-Key': '$2b$10$seu-key-publico-aqui' // AQUI DEVE SER A CHAVE PÚBLICA (READ KEY) SE ESTIVER USANDO NÍVEL DE ACESSO
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.storeData = data.record;
                this.storeStatus = this.storeData.configuracoes.storeStatus;
            } else {
                console.error("Erro ao buscar dados:", response.status);
                this.showClosedMessage('Não foi possível carregar os dados da loja (Erro ' + response.status + ').');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            this.showClosedMessage('Erro de conexão. Verifique sua URL e internet.');
        }
    }
    
    // ... (restante da classe TotemApp permanece IGUAL) ...

    showClosedMessage(message = 'Esta loja está temporariamente fechada para pedidos.') {
        const container = document.getElementById('sections-container');
        container.innerHTML = `<div class="text-center py-20 bg-white rounded-lg shadow-xl">
            <h2 class="text-3xl font-bold text-red-600 mb-4">Loja Fechada</h2>
            <p class="text-gray-700">${message}</p>
        </div>`;
    }

    renderMenu() {
        // ... (renderMenu permanece IGUAL) ...
    }
    
    // ... (Todos os outros métodos permanecem IGUAIS) ...
}

document.addEventListener('DOMContentLoaded', () => {
    window.totemApp = new TotemApp();
});
