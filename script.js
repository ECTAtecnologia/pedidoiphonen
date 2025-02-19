window.onload = function() {
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

    try {
        // Cria um novo documento PDF
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, 150] // Tamanho típico de papel térmico
        });

        // Configura a fonte
        doc.setFontSize(12);
        
        // Centraliza o texto do estabelecimento
        doc.setFont('helvetica', 'bold');
        doc.text(estabelecimento, 40, 10, { align: 'center' });
        
        // Adiciona linha divisória
        doc.setLineWidth(0.5);
        doc.line(5, 15, 75, 15);

        // Configura fonte para o conteúdo
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Adiciona os dados do pedido
        let y = 25; // Posição vertical inicial
        
        doc.text(`Nome: ${nome}`, 5, y);
        y += 7;
        doc.text(`Telefone: ${telefone}`, 5, y);
        y += 10;
        
        doc.text('Produtos:', 5, y);
        y += 7;
        // Quebra os produtos em linhas
        const produtosLines = doc.splitTextToSize(produtos, 70);
        doc.text(produtosLines, 5, y);
        y += (produtosLines.length * 5) + 5;
        
        doc.text(`Pagamento: ${pagamento}`, 5, y);
        y += 7;
        
        // Quebra o endereço em linhas
        const enderecoLines = doc.splitTextToSize(`Endereço: ${endereco}`, 70);
        doc.text(enderecoLines, 5, y);
        y += (enderecoLines.length * 5) + 5;
        
        doc.text(`Valor Total: ${valor}`, 5, y);
        y += 10;

        // Adiciona linha divisória final
        doc.line(5, y, 75, y);
        y += 5;
        
        // Adiciona data e hora
        doc.setFontSize(8);
        doc.text(new Date().toLocaleString(), 40, y, { align: 'center' });

        // Abre o PDF para impressão
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');

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
        alert("Erro ao gerar PDF: " + error.message);
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
