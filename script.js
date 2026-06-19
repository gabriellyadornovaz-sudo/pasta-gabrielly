// ==========================================================================
// CENTRAL WEATHER STATION LOGIC (Y2K INFRASTRUCTURE)
// ==========================================================================

const API_KEY = 'b71216bc3d671f654b09ec2543d2c884'; 

document.addEventListener('DOMContentLoaded', () => {
    initRelogioRetro();
    initRastroMouse();
    initEscutadoresBusca();
    
    // Inicialização padrão por geolocalização ou fallback
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

        const respostaPrevisao = await fetch(`
