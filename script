window.onload = function() {
    // Inicializa o EmailJS primeiro
    emailjs.init("yBK-sZTSf2ez5JgMu");

    // Máscara para telefone
    var telefoneInput = document.getElementById('telefone');
    VMasker(telefoneInput).maskPattern('(99) 99999-9999');

    // Máscara para valor em reais (ajustada para números com vírgula)
    var valorInput = document.getElementById('valor');
    VMasker(valorInput).maskMoney({
        precision: 2,
        separator: ',',
        delimiter: '.',
        unit: 'R$ '
    });

    // Ajuste para garantir valor numérico correto ao imprimir
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
}

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

    // Formata o texto para o Open Label
    const dadosImpressao = {
        estabelecimento: estabelecimento,
        nome: nome,
        telefone: telefone,
        produtos: produtos,
        pagamento: pagamento,
        endereco: endereco,
        valor: valor,
        data: new Date().toLocaleString()
    };

    try {
        // Cria o link para o Open Label
        var link = document.createElement('a');
        link.href = 'openlabel://print?data=' + encodeURIComponent(JSON.stringify(dadosImpressao));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Continua com o envio do email...
        emailjs.send("service_2frhpqp", "template_29ewlfj", {
            estabelecimento: estabelecimento,
            nome_cliente: nome,
            telefone: telefone,
            produtos: produtos,
            pagamento: pagamento,
            endereco: endereco,
            valor: valor,
            data: new Date().toLocaleString()
        }).then(
            function(response) {
                console.log("Email enviado com sucesso:", response);
                limparFormulario();
            },
            function(error) {
                console.error("Erro ao enviar email:", error);
                alert("Erro ao enviar email. Verifique o console para mais detalhes.");
                limparFormulario();
            }
        );
    } catch (error) {
        console.error("Erro:", error);
        limparFormulario();
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
