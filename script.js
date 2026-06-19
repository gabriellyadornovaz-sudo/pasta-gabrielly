// ==========================================================================
// CENTRAL WEATHER STATION LOGIC (Y2K INFRASTRUCTURE)
// ==========================================================================

const API_KEY = 'b71216bc3d671f654b09ec2543d2c884'; 

document.addEventListener('DOMContentLoaded', () => {
    initRelogioRetro();
    initRastroMouse();
    
    // Inicialização padrão de geolocalização
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            obterClimaPorCoordenadas, 
            () => buscarDadosClimaticos('Brasilia')
        );
    } else {
        buscarDadosClimaticos('Brasilia');
    }
});

async function buscarDadosClimaticos(cidade) {
    try {
        const respostaAtual = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`);
        if (!respostaAtual.ok) throw new Error('Cidade inválida');
        const dadosAtuais = await respostaAtual.json();

        const respostaPrevisao = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${API_KEY}&units=metric&lang=pt_br`);
        const dadosPrevisao = await respostaPrevisao.json();

        atualizarPainelClima(dadosAtuais, dadosPrevisao);
        ativarEfeitoEstacao(dadosAtuais.coord.lat);

    } catch (erro) {
        alert('CÓDIGO DE ERRO INTERNO: Local de busca não encontrado! 👾');
        console.error(erro);
    }
}

function obterClimaPorCoordenadas(posicao) {
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`)
        .then(res => res.json())
        .then(dados => buscarDadosClimaticos(dados.name));
}

function atualizarPainelClima(atual, previsao) {
    let containerClima = document.getElementById('y2k-weather-panel');
    
    if (!containerClima) {
        containerClima = document.createElement('section');
        containerClima.id = 'y2k-weather-panel';
        containerClima.className = 'introducao';
        const main = document.querySelector('main');
        main.insertBefore(containerClima, main.firstChild);
    }

    const listaDias = previsao.list.filter((item, index) => index % 8 === 0).slice(1, 4);
    let htmlPrevisao = '';

    listaDias.forEach(dia => {
        const dataObjeto = new Date(dia.dt * 1000);
        const dataFormatada = dataObjeto.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
        htmlPrevisao += `
            <div style="border: 2px dashed var(--y2k-blue); padding: 10px; text-align: center; background: #000;">
                <span style="color: #fff; font-size: 0.85rem;">${dataFormatada.toUpperCase()}</span><br>
                <strong style="font-size: 1.1rem; color: var(--urban-color);">${Math.round(dia.main.temp)}°C</strong><br>
                <span style="font-size: 0.75rem; color: #888;">${dia.weather[0].description}</span>
            </div>
        `;
    });

    containerClima.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--y2k-blue); padding-bottom: 10px; margin-bottom: 15px; gap: 10px;">
            <h2 style="margin: 0; color: #fff; text-shadow: 2px 2px var(--urban-color); font-size: 1.5rem;">📡 TERMINAL METEOROLÓGICO GLOBAL</h2>
            <div>
                <input type="text" id="input-busca" placeholder="DIGITE O LUGAR..." style="background: #000; color: #00ff00; border: 2px outset #fff; padding: 5px; font-family: monospace;">
                <button id="btn-busca" style="background: var(--urban-color); color: #fff; border: 2px outset #fff; padding: 5px 10px; font-weight: bold; cursor: pointer;">BUSCAR</button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
            <div>
                <span style="font-size: 1.3rem; font-weight: bold; color: var(--y2k-blue); text-transform: uppercase;">📍 ${atual.name}, ${atual.sys.country}</span><br>
                <span style="font-size: 3rem; font-weight: bold; color: #fff; text-shadow: 3px 3px var(--urban-color);">${Math.round(atual.main.temp)}°C</span>
            </div>
            <div style="font-size: 0.9rem; color: #fff; line-height: 1.8;">
                🛰️ ATMOSFERA: <span style="color: var(--rural-color); font-weight: bold;">${atual.weather[0].description.toUpperCase()}</span><br>
                💧 UMIDADE: <span>${atual.main.humidity}%</span><br>
                💨 VEL. VENTO: <span>${atual.wind.speed} m/s</span>
            </div>
        </div>

        <h3 style="color: #fff; font-size: 0.9rem; border-bottom: 1px dashed #333; padding-bottom: 5px; margin: 0;">🔮 ESTIMATIVA PARA OS PRÓXIMOS DIAS:</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
            ${htmlPrevisao}
        </div>
    `;

    document.getElementById('btn-busca').addEventListener('click', () => {
        const cidadeBuscada = document.getElementById('input-busca').value;
        if(cidadeBuscada) buscarDadosClimaticos(cidadeBuscada);
    });
    document.getElementById('input-busca').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cidadeBuscada = document.getElementById('input-busca').value;
            if(cidadeBuscada) buscarDadosClimaticos(cidadeBuscada);
        }
    });
}

function activarEfeitoEstacao(latitude) {
    const efeitoAntigo = document.getElementById('efeito-estacao-container');
    if (efeitoAntigo) efeitoAntigo.remove();

    const mesAtual = new Date().getMonth() + 1; 
    const ehHemisferioNorte = latitude > 0;
    let estacao = '';

    if ([12, 1, 2].includes(mesAtual)) {
        estacao = ehHemisferioNorte ? 'inverno' : 'verão';
    } else if ([3, 4, 5].includes(mesAtual)) {
        estacao = ehHemisferioNorte ? 'primavera' : 'outono';
    } else if ([6, 7, 8].includes(mesAtual)) {
        estacao = ehHemisferioNorte ? 'verão' : 'inverno';
    } else {
        estacao = ehHemisferioNorte ? 'outono' : 'primavera';
    }

    const containerEfeito = document.createElement('div');
    containerEfeito.id = 'efeito-estacao-container';
    Object.assign(containerEfeito.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '999'
    });
    document.body.appendChild(containerEfeito);

    if (estacao === 'verão') {
        const sol = document.createElement('div');
        sol.textContent = '☀️';
        Object.assign(sol.style, {
            position: 'absolute', top: '20px', right: '20px', fontSize: '4.5rem',
            filter: 'drop-shadow(0 0 15px #ffaa00)', animation: 'girarSol 15s linear infinite'
        });
        containerEfeito.appendChild(sol);
        injetarAnimacao(`@keyframes girarSol { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`);
    } 
    else if (estacao === 'inverno') criarChuvaDeParticulas('❄️', containerEfeito);
    else if (estacao === 'outono') criarChuvaDeParticulas('🍂', containerEfeito);
    else if (estacao === 'primavera') criarChuvaDeParticulas('🌸', containerEfeito);
}

function criarChuvaDeParticulas(caractere, container) {
    for (let i = 0; i < 25; i++) {
        const particula = document.createElement('span');
        particula.textContent = caractere;
        Object.assign(particula.style, {
            position: 'absolute', top: '-50px', left: Math.random() * 100 + 'vw',
            fontSize: Math.random() * (25 - 12) + 12 + 'px', opacity: Math.random() * (1 - 0.4) + 0.4,
            animation: `quedaY2K ${Math.random() * (10 - 5) + 5}s linear ${Math.random() * 5}s infinite`
        });
        container.appendChild(particula);
    }
    injetarAnimacao(`@keyframes quedaY2K { 0% { top: -50px; transform: translateX(0) rotate(0deg); } 50% { transform: translateX(20px) rotate(180deg); } 100% { top: 105vh; transform: translateX(-20px) rotate(360deg); } }`);
}

function injetarAnimacao(css) {
    const estilo = document.createElement('style');
    estilo.appendChild(document.createTextNode(css));
    document.head.appendChild(estilo);
}

function initRelogioRetro() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const relogioContainer = document.createElement('div');
    relogioContainer.style.color = 'var(--urban-color)';
    relogioContainer.style.marginTop = '10px';
    footer.appendChild(relogioContainer);

    setInterval(() => {
        const agora = new Date();
        relogioContainer.textContent = `[ SYSTEM TIME: ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}:${String(agora.getSeconds()).padStart(2, '0')} ]`;
    }, 1000);
}

function initRastroMouse() {
    window.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.15) return;
        const particula = document.createElement('span');
        particula.textContent = '⚡';
        Object.assign(particula.style, {
            position: 'absolute', left: e.pageX + 'px', top: e.pageY + 'px',
            pointerEvents: 'none', color: 'var(--y2k-blue)', transition: 'all 0.5s ease-out', zIndex: '1000'
        });
        document.body.appendChild(particula);
        setTimeout(() => { particula.style.transform = 'translateY(25px) scale(0)'; particula.style.opacity = '0'; }, 50);
        setTimeout(() => particula.remove(), 500);
    });
}
