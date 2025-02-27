// Aguarda todas as bibliotecas carregarem
document.addEventListener('DOMContentLoaded', function() {
    // Define jsPDF globalmente
    window.jsPDF = window.jspdf.jsPDF;

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

    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!nome || !produtos || !pagamento || !endereco || !valor) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    try {
        // Primeiro calcula a altura necessária
        const alturaLinha = 3; // altura de cada linha em mm
        const margemSuperior = 4;
        let alturaTotal = margemSuperior;

        // Calcula altura dos produtos
        const produtosTemp = new jsPDF().splitTextToSize(produtos, 54);
        const alturaProdutos = produtosTemp.length * alturaLinha;

        // Calcula altura do endereço
        const enderecoTemp = new jsPDF().splitTextToSize(endereco, 54);
        const alturaEndereco = enderecoTemp.length * alturaLinha;

        // Calcula altura total necessária
        alturaTotal += 6; // estabelecimento + linha
        alturaTotal += 8; // nome + telefone
        alturaTotal += alturaProdutos + 4; // produtos + título
        alturaTotal += 8; // pagamento + valor
        alturaTotal += alturaEndereco + 4; // endereço + título
        alturaTotal += 6; // linha final + data

        // Cria o PDF com a altura exata necessária
        const doc = new jsPDF({
            unit: 'mm',
            format: [58, alturaTotal]
        });

        // Configura fonte
        doc.setFontSize(8);
        
        // Centraliza o nome do estabelecimento
        doc.setFont('helvetica', 'bold');
        doc.text(estabelecimento, 29, 4, { align: 'center' });
        
        // Linha divisória
        doc.setLineWidth(0.1);
        doc.line(2, 6, 56, 6);

        // Configura fonte para o conteúdo
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Adiciona os dados do pedido
        let y = 10;
        
        doc.text(`Nome: ${nome}`, 2, y);
        y += 4;
        doc.text(`Telefone: ${telefone}`, 2, y);
        y += 4;
        
        // Produtos
        doc.text('Produtos:', 2, y);
        y += 4;
        const produtosLines = doc.splitTextToSize(produtos, 54);
        doc.text(produtosLines, 2, y);
        y += (produtosLines.length * 3);
        
        doc.text(`Forma de Pagamento: ${pagamento}`, 2, y);
        y += 4;
        
        doc.text(`Valor Total: ${valor}`, 2, y);
        y += 4;
        
        // Endereço
        doc.text('Endereço:', 2, y);
        y += 4;
        const enderecoLines = doc.splitTextToSize(endereco, 54);
        doc.text(enderecoLines, 2, y);
        y += (enderecoLines.length * 3);

        // Linha final
        doc.line(2, y, 56, y);
        y += 2;
        
        // Data
        doc.setFontSize(6);
        doc.text(new Date().toLocaleString(), 29, y, { align: 'center' });

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

async function colarTexto(elementId) {
    try {
        if (!navigator.clipboard) {
            throw new Error('API de área de transferência não suportada');
        }

        // Tenta o método mais novo primeiro
        try {
            const texto = await navigator.clipboard.readText();
            document.getElementById(elementId).value = texto;
            return;
        } catch (err) {
            console.log('Método moderno falhou, tentando método alternativo');
        }

        // Método alternativo usando document.execCommand
        const elemento = document.getElementById(elementId);
        elemento.focus();
        const resultado = document.execCommand('paste');
        
        if (!resultado) {
            throw new Error('Não foi possível colar o texto');
        }
    } catch (err) {
        console.error('Erro ao colar:', err);
        
        // Solicita ao usuário que use o atalho do teclado
        alert('Por favor, use Ctrl+V (ou Cmd+V no Mac) para colar o texto');
    }
}
