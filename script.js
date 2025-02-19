// Aguarda todas as bibliotecas carregarem
document.addEventListener('DOMContentLoaded', function() {
    // Máscara para telefone
    var telefoneInput = document.getElementById('telefone');
    VMasker(telefoneInput).maskPattern('(99) 99999-9999');

    // Máscara para valor em reais
    var valorInput = document.getElementById('valor');
    VMasker(valorInput).maskMoney({
        precision: 2,
        separator: ',',
        delimiter: '.',
        unit: 'R$ '
    });

    // Ajuste para garantir valor numérico correto
    valorInput.addEventListener('change', function(e) {
        let valor = e.target.value.replace('R$ ', '')
            .replace('.', '')
            .replace(',', '.');
        e.target.dataset.valor = valor;
    });

    // Carrega o nome do estabelecimento se existir
    const savedName = localStorage.getItem('establishmentName');
    if (savedName) {
        document.getElementById('establishment-name').value = savedName;
        document.getElementById('establishment-form').innerHTML = `
            <div class="establishment-header">
                <h2 style="font-size: 1rem;">Estabelecimento: ${savedName}</h2>
                <button onclick="resetEstablishmentName()" class="btn btn-sm btn-secondary" style="font-size: 0.8rem;">Alterar</button>
            </div>
        `;
    }
});

// Função para salvar o nome do estabelecimento
function saveEstablishmentName() {
    const input = document.getElementById('establishment-name');
    const name = input.value.trim();
    
    if (name) {
        localStorage.setItem('establishmentName', name);
        document.getElementById('establishment-form').innerHTML = `
            <div class="establishment-header">
                <h2 style="font-size: 1rem;">Estabelecimento: ${name}</h2>
                <button onclick="resetEstablishmentName()" class="btn btn-sm btn-secondary" style="font-size: 0.8rem;">Alterar</button>
            </div>
        `;
    } else {
        alert('Por favor, digite um nome válido');
    }
}

// Função para resetar o nome do estabelecimento
function resetEstablishmentName() {
    localStorage.removeItem('establishmentName');
    location.reload();
}

function imprimirPedido() {
    // Coleta os dados do formulário
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const produtos = document.getElementById('produtos').value;
    const pagamento = document.getElementById('pagamento').value;
    const endereco = document.getElementById('endereco').value;
    const valor = document.getElementById('valor').value;
    const estabelecimento = localStorage.getItem('establishmentName') || 'Estabelecimento';

    // Verifica se todos os campos estão preenchidos
    if (!nome || !telefone || !produtos || !pagamento || !endereco || !valor) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        // Formata o texto para impressão com comandos ESC/POS
        const textoImpressao = 
            '\x1B\x40' +          // Initialize printer
            '\x1B\x61\x01' +      // Center alignment
            `${estabelecimento}\n\n` +
            '\x1B\x61\x00' +      // Left alignment
            `Nome: ${nome}\n` +
            `Telefone: ${telefone}\n\n` +
            `Produtos:\n${produtos}\n\n` +
            `Forma de Pagamento: ${pagamento}\n` +
            `Valor Total: ${valor}\n\n` +
            `Endereço:\n${endereco}\n\n` +
            '\x1B\x61\x01' +      // Center alignment
            `${new Date().toLocaleString()}\n` +
            '\x1B\x64\x02';       // Feed 2 lines

        // Prepara os dados para o Open Label
        const openLabelData = {
            text: textoImpressao,
            type: 'raw'
        };

        // Abre o Open Label com os dados formatados
        window.location.href = `openlabel://print?data=${encodeURIComponent(JSON.stringify(openLabelData))}`;

        // Continua com o envio do email...
        const mensagemEmail = `
Novo pedido registrado:

Estabelecimento: ${estabelecimento}
Nome do Cliente: ${nome}
Telefone: ${telefone}
Produtos: ${produtos}
Forma de Pagamento: ${pagamento}
Endereço: ${endereco}
Valor Total: ${valor}
Data: ${new Date().toLocaleString()}
        `;

        fetch(`https://portal.ecta.com.br/gerenciamento/EnviarEmailEcta?Assunto=PEDIDO CAIXA CELULAR&Mensagem=${encodeURIComponent(mensagemEmail)}`)
            .then(response => {
                console.log("Email enviado com sucesso");
                limparFormulario();
            })
            .catch(error => {
                console.error("Erro ao enviar email:", error);
                limparFormulario();
            });

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao preparar impressão: " + error.message);
    }
}

function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('produtos').value = '';
    document.getElementById('pagamento').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('nome').focus();
}
