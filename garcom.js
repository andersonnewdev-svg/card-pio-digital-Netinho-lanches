/* =========================================
   SAAS - PAINEL DO GARÇOM
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    let atendimentoAtual = null;
    let mesaAtual = null;
    let carrinhoGarcom = [];
    let garcomAutenticado = null;
    let lojaGarcom = null;
    let mesas = [];
    let canalRealtimeMesas = null;

    const formularioLoginGarcom =
        document.getElementById("formLoginGarcom");

    if (formularioLoginGarcom) {
        formularioLoginGarcom.addEventListener("submit", async (event) => {
            event.preventDefault();

            const nome = document
                .getElementById("nomeGarcom")
                .value.trim();

            const pin = document
                .getElementById("pinGarcom")
                .value.trim();

            const erroLogin =
                document.getElementById("erroLoginGarcom");

            if (!nome || !/^\d{6}$/.test(pin)) {
                erroLogin.textContent =
                    "Informe seu nome e um PIN de 6 dígitos.";
                return;
            }

            erroLogin.textContent = "";

            try {
                const { data: loja, error: erroLoja } =
                    await supabaseClient
                        .from("store_settings")
                        .select("id")
                        .eq("slug", slugLoja)
                        .single();

                console.log("Slug consultado:", slugLoja);
                console.log("Dados da loja:", loja);
                console.log("Erro da consulta:", erroLoja);

                if (erroLoja || !loja) {
                    erroLogin.textContent =
                        "Loja não encontrada.";
                    return;
                }

                const { data, error } =
                    await supabaseClient.functions.invoke(
                        "login-garcom",
                        {
                            body: {
                                store_id: loja.id,
                                nome: nome,
                                pin: pin
                            }
                        }
                    );

                if (error || !data?.token) {
                    erroLogin.textContent =
                        "Não foi possível realizar o login.";
                    return;
                }

                console.log("Credenciais validadas pelo servidor.");

                garcomAutenticado = {
                    id: data.garcom.id,
                    nome: data.garcom.nome,
                    token: data.token
                };

                lojaGarcom = {
                    store_id: loja.id
                };

                const { data: resultadoMesas, error: erroMesasTeste } =
                    await supabaseClient.functions.invoke("mesas-garcom", {
                        headers: {
                            Authorization: `Bearer ${data.token}`
                        },
                        body: {}
                    });

                if (erroMesasTeste || !Array.isArray(resultadoMesas?.mesas)) {
                    console.error(
                        "Falha ao consultar mesas autorizadas:",
                        erroMesasTeste,
                        resultadoMesas
                    );

                    erroLogin.textContent =
                        "Login validado, mas não foi possível carregar as mesas.";
                    return;
                }

                mesas = resultadoMesas.mesas;

                console.log("Mesas autorizadas:", mesas.length);
                const listaMesas = document.getElementById("listaMesas");

                if (listaMesas) {
                    listaMesas.innerHTML = "";

                    mesas.forEach(mesa => {
                        const card = document.createElement("div");
                        card.className = "waiter-table-card";

                        card.style.cursor = "pointer";

                        card.addEventListener("click", () => {
                            console.log("Mesa selecionada:", mesa);
                        });

                        const titulo = document.createElement("h3");
                        titulo.textContent =
                            mesa.name || `Mesa ${mesa.table_number}`;

                        const status = document.createElement("p");
                        status.textContent =
                            mesa.status === "free" ? "Livre" : "Ocupada";

                        card.appendChild(titulo);
                        card.appendChild(status);
                        listaMesas.appendChild(card);
                    });
                }
                document.getElementById("loginGarcom").hidden = true;

                document.getElementById("painelGarcom").hidden = false;
                await carregarMesasAposLogin();
                iniciarRealtimeMesasGarcom();

                erroLogin.textContent = "";

                erroLogin.textContent =
                    "PIN validado. Acesso ao painel ainda não liberado.";

            } catch (erro) {
                console.error("Erro ao realizar login:", erro);

                erroLogin.textContent =
                    "Erro de comunicação. Tente novamente.";
            }
        });
    }
    const parametrosURL = new URLSearchParams(window.location.search);

    const slugLoja = parametrosURL.get("loja");

    console.log("Loja informada na URL:", slugLoja);

    function mostrarAtendimentoAtual() {

        if (!atendimentoAtual || !mesaAtual) {
            return;
        }

        carrinhoGarcom = [];
        atualizarResumoPedido();

        const secaoProdutos = document.getElementById("secaoProdutos");
        const secaoPedido = document.getElementById("secaoPedido");

        if (secaoProdutos) {
            secaoProdutos.hidden = false;
        }

        if (secaoPedido) {
            secaoPedido.hidden = false;
        }

        console.log("Atendimento selecionado:", {
            atendimentoId: atendimentoAtual.id,
            mesa: mesaAtual.table_number,
            cliente: atendimentoAtual.customer_name
        });

        carregarProdutosGarcom();

    }

    console.log("Painel do Garçom iniciado.");

    if (typeof supabaseClient === "undefined") {
        console.error("Supabase não encontrado.");
        return;
    }

    async function carregarProdutosGarcom() {

        if (!lojaGarcom?.store_id) {
            console.error("Loja do garçom não identificada.");
            return;
        }

        const lista = document.getElementById("listaProdutos");

        if (!lista) return;

        lista.textContent = "Carregando produtos...";

        const { data, error } = await supabaseClient
            .from("products")
            .select("id, name, price, category, available")
            .eq("store_id", lojaGarcom.store_id)
            .eq("available", true)
            .order("name", { ascending: true });

        if (error) {
            console.error("Erro ao carregar produtos:", error);
            lista.textContent = "Erro ao carregar produtos.";
            return;
        }

        console.log("Produtos do garçom:", data);

        lista.innerHTML = "";

        if (!data || data.length === 0) {
            lista.textContent = "Nenhum produto disponível.";
            return;
        }

        data.forEach(produto => {
            const card = document.createElement("div");
            card.className = "waiter-product-card";

            const nome = document.createElement("h3");
            nome.textContent = produto.name;

            const preco = document.createElement("p");
            preco.textContent = Number(produto.price).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            card.appendChild(nome);
            card.appendChild(preco);

            const botaoAdicionar = document.createElement("button");

            botaoAdicionar.type = "button";
            botaoAdicionar.className = "waiter-add-button";
            botaoAdicionar.textContent = "Adicionar ao Pedido";

            botaoAdicionar.addEventListener("click", () => {

                if (!atendimentoAtual || !mesaAtual) {
                    alert("Selecione um atendimento primeiro.");
                    return;
                }

                console.log("Produto selecionado:", {
                    atendimentoId: atendimentoAtual.id,
                    mesa: mesaAtual.table_number,
                    produtoId: produto.id,
                    produto: produto.name,
                    preco: produto.price
                });

                const itemExistente = carrinhoGarcom.find(
                    item => item.id === produto.id
                );

                if (itemExistente) {

                    itemExistente.quantidade += 1;

                } else {

                    carrinhoGarcom.push({
                        id: produto.id,
                        nome: produto.name,
                        preco: Number(produto.price),
                        quantidade: 1
                    });

                }

                console.log("Carrinho do garçom:", carrinhoGarcom);
                atualizarResumoPedido();

            });

            card.appendChild(botaoAdicionar);

            lista.appendChild(card);
        });
    }

    function atualizarResumoPedido() {

        const lista = document.getElementById("itensPedido");
        const totalElemento = document.getElementById("totalPedido");

        if (!lista || !totalElemento) return;

        lista.innerHTML = "";

        let total = 0;

        carrinhoGarcom.forEach(item => {

            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            const linha = document.createElement("p");

            linha.textContent =
                `${item.quantidade}x ${item.nome} - ` +
                subtotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });

            lista.appendChild(linha);

            const controles = document.createElement("div");

            const botaoMenos = document.createElement("button");
            botaoMenos.type = "button";
            botaoMenos.textContent = "−";

            const botaoMais = document.createElement("button");
            botaoMais.type = "button";
            botaoMais.textContent = "+";

            botaoMenos.addEventListener("click", () => {
                item.quantidade -= 1;

                if (item.quantidade <= 0) {
                    carrinhoGarcom = carrinhoGarcom.filter(
                        produto => produto.id !== item.id
                    );
                }

                atualizarResumoPedido();
            });

            botaoMais.addEventListener("click", () => {
                item.quantidade += 1;
                atualizarResumoPedido();
            });

            controles.appendChild(botaoMenos);
            controles.appendChild(botaoMais);

            lista.appendChild(controles);

        });

        totalElemento.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const botaoEnviarPedido =
            document.getElementById("enviarPedido");

    }

    const botaoEnviarPedido = document.getElementById("enviarPedido");

    if (botaoEnviarPedido) {
        botaoEnviarPedido.addEventListener("click", async () => {
            console.log("Botão Enviar pedido acionado!");
            console.log("Carrinho:", carrinhoGarcom);
            console.log("Atendimento:", atendimentoAtual);


            if (!atendimentoAtual?.id || !lojaGarcom?.store_id) {
                alert("Atendimento ou loja não identificados.");
                return;
            }

            if (carrinhoGarcom.length === 0) {
                alert("Adicione pelo menos um produto ao pedido.");
                return;
            }

            const totalPedido = carrinhoGarcom.reduce(
                (total, item) => total + item.preco * item.quantidade,
                0
            );

            console.log("Dados preparados para envio:", {
                atendimentoId: atendimentoAtual.id,
                lojaId: lojaGarcom.store_id,
                cliente: atendimentoAtual.customer_name,
                total: totalPedido
            });

            const itensPedido = carrinhoGarcom.map(item => ({
                id: item.id,
                name: item.nome,
                price: item.preco,
                quantity: item.quantidade
            }));

            const numeroPedido = `MESA-${Date.now()}`;

            const novoPedido = {
                order_number: numeroPedido,
                customer_name: atendimentoAtual.customer_name,
                customer_phone: "",
                order_type: "mesa",
                payment_method: "pendente",
                subtotal: totalPedido,
                delivery_fee: 0,
                total: totalPedido,
                status: "novo",
                items: itensPedido,
                store_id: lojaGarcom.store_id,
                table_session_id: atendimentoAtual.id
            };

            console.log("Pedido pronto para gravar:", novoPedido);

            const { data: pedidoSalvo, error: erroPedido } =
                await supabaseClient
                    .from("orders")
                    .insert([novoPedido])
                    .select()
                    .single();

            if (erroPedido) {
                console.error("Erro ao salvar pedido:", erroPedido);
                alert("Não foi possível enviar o pedido.");
                return;
            }

            console.log("Pedido salvo com sucesso:", pedidoSalvo);
            alert("Pedido enviado com sucesso!");
        });
    }

    /* =========================================
       CARREGAR MESAS DA LOJA
    ========================================= */

    async function carregarMesasAposLogin() {

        if (!garcomAutenticado?.token) {
            console.warn("Garçom ainda não autenticado.");
            return;
        }

        const { data: resultadoMesas, error: erroMesas } =
            await supabaseClient.functions.invoke("mesas-garcom", {
                headers: {
                    Authorization: `Bearer ${garcomAutenticado?.token || ""}`
                },
                body: {}
            });

        const mesasConsultadas = resultadoMesas?.mesas || [];

        if (erroMesas) {
            console.error(
                "Erro ao carregar mesas:",
                erroMesas
            );
            return;
        }

        mesas = mesasConsultadas || [];

        console.log("Mesas da Loja Automática:", mesas);

        const waiterTablesList =
            document.getElementById("listaMesas");

        if (waiterTablesList) {

            waiterTablesList.innerHTML = "";

            if (!mesas || mesas.length === 0) {

                waiterTablesList.textContent =
                    "Nenhuma mesa disponível.";

            } else {

                mesas.forEach(mesa => {

                    const card = document.createElement("div");
                    card.className = "waiter-table-card";

                    const titulo = document.createElement("h3");
                    titulo.textContent =
                        mesa.name || `Mesa ${mesa.table_number}`;

                    const status = document.createElement("p");

                    status.textContent =
                        mesa.status === "free"
                            ? "Livre"
                            : "Ocupada";

                    card.appendChild(titulo);
                    card.appendChild(status);

                    const iniciarButton =
                        document.createElement("button");

                    iniciarButton.type = "button";
                    iniciarButton.className =
                        "waiter-start-button";

                    iniciarButton.textContent =
                        mesa.status === "free"
                            ? "Iniciar Atendimento"
                            : "Continuar Atendimento";

                    iniciarButton.disabled = false;

                    iniciarButton.addEventListener("click", async () => {

                        if (mesa.status !== "free") {

                            const { data: atendimento, error } =
                                await supabaseClient
                                    .from("table_sessions")
                                    .select("id, customer_name, status")
                                    .eq("store_id", lojaGarcom.store_id)
                                    .eq("table_id", mesa.id)
                                    .eq("status", "open")
                                    .maybeSingle();

                            if (error) {
                                console.error("Erro ao consultar atendimento:", error);
                                alert("Não foi possível consultar o atendimento.");
                                return;
                            }

                            if (!atendimento) {
                                alert("Nenhum atendimento aberto encontrado para esta mesa.");
                                return;
                            }

                            atendimentoAtual = atendimento;
                            mesaAtual = mesa;

                            mostrarAtendimentoAtual();

                            alert(
                                `Atendimento encontrado!\n` +
                                `Mesa: ${mesa.table_number}\n` +
                                `Cliente: ${atendimento.customer_name}`
                            );

                            return;
                        }

                        const nomeCliente = prompt(
                            `Mesa ${mesa.table_number}\n\nDigite o nome do cliente:`
                        );

                        if (nomeCliente === null) return;

                        if (!nomeCliente.trim()) {
                            alert("Informe o nome do cliente.");
                            return;
                        }

                        const cpfCliente = prompt(
                            "Digite o CPF do cliente (opcional):"
                        );

                        if (cpfCliente === null) return;

                        iniciarButton.disabled = true;

                        const { data: atendimento, error: erroAtendimento } =
                            await supabaseClient
                                .from("table_sessions")
                                .insert({
                                    store_id: lojaGarcom.store_id,
                                    table_id: mesa.id,
                                    customer_name: nomeCliente.trim(),
                                    customer_cpf: cpfCliente.trim() || null,
                                    status: "open"
                                })

                        if (erroAtendimento) {
                            console.error(
                                "Erro ao iniciar atendimento:",
                                erroAtendimento
                            );

                            alert("Não foi possível iniciar o atendimento.");
                            iniciarButton.disabled = false;
                            return;
                        }

                        console.log("Atendimento criado:", atendimento);

                        alert(
                            `Atendimento iniciado com sucesso!\n` +
                            `Mesa: ${mesa.table_number}\n` +
                            `Cliente: ${nomeCliente.trim()}`
                        );

                        status.textContent = "Ocupada";
                        mesa.status = "occupied";
                        iniciarButton.textContent = "Continuar Atendimento";

                        iniciarButton.disabled = false;

                    });

                    card.appendChild(iniciarButton);

                    waiterTablesList.appendChild(card);

                });

            }

        }
    }


    function iniciarRealtimeMesasGarcom() {
        if (!lojaGarcom?.store_id || canalRealtimeMesas) return;

        canalRealtimeMesas = supabaseClient
            .channel(`mesas-garcom-${lojaGarcom.store_id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "restaurant_tables",
                    filter: `store_id=eq.${lojaGarcom.store_id}`
                },
                async (payload) => {
                    console.log("Mesa atualizada em tempo real!", payload);

                    await carregarMesasAposLogin();

                    if (
                        mesaAtual &&
                        payload.new?.id === mesaAtual.id &&
                        payload.new?.status === "free"
                    ) {
                        atendimentoAtual = null;
                        mesaAtual = null;
                        carrinhoGarcom = [];

                        atualizarResumoPedido();

                        document.getElementById("secaoProdutos").hidden = true;
                        document.getElementById("secaoPedido").hidden = true;

                        console.log("Atendimento encerrado. Carrinho limpo.");
                    }
                }
            )
            .subscribe((status) => {
                console.log("Realtime mesas:", status);
            });
    }
});

