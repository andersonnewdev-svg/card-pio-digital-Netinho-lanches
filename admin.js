/* =========================================================
   NETTINHO LANCHES
   V4.0 FINAL - PAINEL ADMINISTRATIVO
   SUPABASE + AUTH + PRODUTOS + PEDIDOS + REALTIME
========================================================= */


/* =========================================================
   ELEMENTOS - LOGIN
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================================================
   ELEMENTOS - CONFIGURAÇÕES DA LOJA
========================================================= */

const storeSettingsForm =
    document.getElementById("storeSettingsForm");

const storeSettingsId =
    document.getElementById("storeSettingsId");

const storeName =
    document.getElementById("storeName");

const storeWhatsapp =
    document.getElementById("storeWhatsapp");

const storeAddress =
    document.getElementById("storeAddress");

const deliveryFee =
    document.getElementById("deliveryFee");

const minimumOrder =
    document.getElementById("minimumOrder");

const openingTime =
    document.getElementById("openingTime");

const closingTime =
    document.getElementById("closingTime");

const storeOpen =
    document.getElementById("storeOpen");


let currentStoreSettingsId = null;


/* =========================================================
   ELEMENTOS - PEDIDOS
========================================================= */

const ordersList =
    document.getElementById("ordersList");

const refreshOrdersButton =
    document.getElementById("refreshOrdersButton");

const orderFilterButtons =
    document.querySelectorAll(".order-filter");


const countTodos =
    document.getElementById("countTodos");

const countNovo =
    document.getElementById("countNovo");

const countPreparando =
    document.getElementById("countPreparando");

const countSaiuEntrega =
    document.getElementById("countSaiuEntrega");

const countConcluido =
    document.getElementById("countConcluido");

const countCancelado =
    document.getElementById("countCancelado");


/* =========================================================
   ELEMENTOS - DASHBOARD DE PEDIDOS
========================================================= */

const todayOrdersCount =
    document.getElementById("todayOrdersCount");

const todayRevenue =
    document.getElementById("todayRevenue");

const todayNewCount =
    document.getElementById("todayNewCount");

const todayPreparingCount =
    document.getElementById("todayPreparingCount");

const todayCompletedCount =
    document.getElementById("todayCompletedCount");

const todayCanceledCount =
    document.getElementById("todayCanceledCount");


/* =========================================================
   ESTADO DOS PEDIDOS
========================================================= */

let orders = [];

let currentOrderStatus =
    "todos";

let ordersRealtimeChannel =
    null;

let highlightedOrderId =
    null;

let orderAudioContext =
    null;


/* =========================================================
   ELEMENTOS - PRODUTOS
========================================================= */

const newProductButton =
    document.getElementById("newProductButton");

const productModal =
    document.getElementById("productModal");

const closeProductModal =
    document.getElementById("closeProductModal");

const productForm =
    document.getElementById("productForm");

const adminProducts =
    document.getElementById("adminProducts");

const adminSearch =
    document.getElementById("adminSearch");

const modalTitle =
    document.getElementById("modalTitle");


/* =========================================================
   DASHBOARD DE PRODUTOS
========================================================= */

const totalProducts =
    document.getElementById("totalProducts");

const availableProducts =
    document.getElementById("availableProducts");

const unavailableProducts =
    document.getElementById("unavailableProducts");


/* =========================================================
   CAMPOS DO PRODUTO
========================================================= */

const productId =
    document.getElementById("productId");

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const productPrice =
    document.getElementById("productPrice");

const productDescription =
    document.getElementById("productDescription");

const productImage =
    document.getElementById("productImage");

const productAvailable =
    document.getElementById("productAvailable");


/* =========================================================
   ESTADO DOS PRODUTOS
========================================================= */

let adminProductsData = [];


/* =========================================================
   VERIFICAR SUPABASE
========================================================= */

function verificarSupabase() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "Supabase não foi carregado."
        );

        return false;
    }

    return true;
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(text = "") {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}


/* =========================================================
   FORMATAR MOEDA
========================================================= */

function formatCurrency(value) {

    return Number(value || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}


/* =========================================================
   LOGIN
========================================================= */

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!verificarSupabase()) {
            return;
        }

        const email =
            document
                .getElementById("username")
                ?.value
                .trim() || "";

        const password =
            document
                .getElementById("password")
                ?.value || "";

        loginError.textContent =
            "";

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });

        if (error) {

            console.error(
                "Erro no login:",
                error
            );

            loginError.textContent =
                "E-mail ou senha incorretos.";

            return;
        }

        if (data.session) {

            showAdminPanel();
        }
    }
);


/* =========================================================
   VERIFICAR SESSÃO
========================================================= */

async function checkLogin() {

    if (!verificarSupabase()) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .getSession();

    if (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

        return;
    }

    if (data.session) {

        showAdminPanel();

    } else {

        loginScreen?.classList.remove(
            "hidden"
        );

        adminPanel?.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   MOSTRAR PAINEL
========================================================= */

async function showAdminPanel() {

    loginScreen?.classList.add(
        "hidden"
    );

    adminPanel?.classList.remove(
        "hidden"
    );

    await Promise.all([
        carregarProdutos(),
        carregarConfiguracoesLoja(),
        carregarPedidos()
    ]);

    iniciarRealtimePedidos();
}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton?.addEventListener(
    "click",
    async () => {

        if (
            ordersRealtimeChannel
        ) {

            await supabaseClient
                .removeChannel(
                    ordersRealtimeChannel
                );

            ordersRealtimeChannel =
                null;
        }

        const {
            error
        } =
            await supabaseClient.auth
                .signOut();

        if (error) {

            console.error(
                "Erro ao sair:",
                error
            );

            alert(
                "Erro ao sair do painel."
            );

            return;
        }

        location.reload();
    }
);


/* =========================================================
   CONFIGURAÇÕES DA LOJA
========================================================= */

async function carregarConfiguracoesLoja() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("store_settings")
            .select("*")
            .limit(1)
            .single();

    if (error) {

        console.error(
            "Erro ao carregar configurações:",
            error
        );

        return;
    }

    if (!data) {
        return;
    }

    currentStoreSettingsId =
        data.id;

    if (storeSettingsId) {

        storeSettingsId.value =
            data.id;
    }

    storeName.value =
        data.store_name || "";

    storeWhatsapp.value =
        data.whatsapp || "";

    storeAddress.value =
        data.address || "";

    deliveryFee.value =
        Number(
            data.delivery_fee || 0
        );

    minimumOrder.value =
        Number(
            data.minimum_order || 0
        );

    openingTime.value =
        data.opening_time
            ? data.opening_time.slice(
                0,
                5
            )
            : "";

    closingTime.value =
        data.closing_time
            ? data.closing_time.slice(
                0,
                5
            )
            : "";

    storeOpen.checked =
        data.is_open === true;
}


/* =========================================================
   SALVAR CONFIGURAÇÕES
========================================================= */

storeSettingsForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const id =
            currentStoreSettingsId;

        if (!id) {

            alert(
                "Configuração da loja não encontrada."
            );

            return;
        }

        const whatsapp =
            storeWhatsapp.value
                .replace(/\D/g, "");

        if (!whatsapp) {

            alert(
                "Informe o WhatsApp da loja."
            );

            return;
        }

        const settingsData = {

            store_name:
                storeName.value.trim(),

            whatsapp,

            address:
                storeAddress.value.trim(),

            delivery_fee:
                Number(
                    deliveryFee.value || 0
                ),

            minimum_order:
                Number(
                    minimumOrder.value || 0
                ),

            is_open:
                storeOpen.checked,

            opening_time:
                openingTime.value ||
                null,

            closing_time:
                closingTime.value ||
                null,

            updated_at:
                new Date().toISOString()
        };

        const {
            error
        } =
            await supabaseClient
                .from("store_settings")
                .update(
                    settingsData
                )
                .eq(
                    "id",
                    id
                );

        if (error) {

            console.error(
                "Erro ao salvar configurações:",
                error
            );

            alert(
                "❌ Erro ao salvar configurações:\n\n" +
                error.message
            );

            return;
        }

        alert(
            "✅ Configurações salvas com sucesso!"
        );

        await carregarConfiguracoesLoja();
    }
);


/* =========================================================
   PEDIDO É DE HOJE
========================================================= */

function pedidoEhDeHoje(pedido) {

    const hoje =
        new Date();

    const dataPedido =
        new Date(
            pedido.created_at
        );

    return (
        dataPedido.getDate() ===
        hoje.getDate()
        &&
        dataPedido.getMonth() ===
        hoje.getMonth()
        &&
        dataPedido.getFullYear() ===
        hoje.getFullYear()
    );
}


/* =========================================================
   CARREGAR PEDIDOS
========================================================= */

async function carregarPedidos() {

    if (!verificarSupabase()) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(
            "Erro ao carregar pedidos:",
            error
        );

        if (ordersList) {

            ordersList.innerHTML = `
                <div class="empty-products">
                    Erro ao carregar pedidos.
                </div>
            `;
        }

        return;
    }

    orders =
        data || [];

    atualizarContadoresPedidos();

    atualizarDashboardPedidosHoje();

    renderizarPedidos();
}


/* =========================================================
   BOTÃO ATUALIZAR PEDIDOS
========================================================= */

refreshOrdersButton?.addEventListener(
    "click",
    carregarPedidos
);


/* =========================================================
   CONTADORES DOS PEDIDOS
========================================================= */

function atualizarContadoresPedidos() {

    const pedidosHoje =
        orders.filter(
            pedidoEhDeHoje
        );

    if (countTodos) {

        countTodos.textContent =
            pedidosHoje.length;
    }

    if (countNovo) {

        countNovo.textContent =
            pedidosHoje.filter(
                pedido =>
                    pedido.status ===
                    "novo"
            ).length;
    }

    if (countPreparando) {

        countPreparando.textContent =
            pedidosHoje.filter(
                pedido =>
                    pedido.status ===
                    "preparando"
            ).length;
    }

    if (countSaiuEntrega) {

        countSaiuEntrega.textContent =
            pedidosHoje.filter(
                pedido =>
                    pedido.status ===
                    "saiu_entrega"
            ).length;
    }

    if (countConcluido) {

        countConcluido.textContent =
            pedidosHoje.filter(
                pedido =>
                    pedido.status ===
                    "concluido"
            ).length;
    }

    if (countCancelado) {

        countCancelado.textContent =
            pedidosHoje.filter(
                pedido =>
                    pedido.status ===
                    "cancelado"
            ).length;
    }
}


/* =========================================================
   DASHBOARD DE PEDIDOS DO DIA
========================================================= */

function atualizarDashboardPedidosHoje() {

    const pedidosHoje =
        orders.filter(
            pedidoEhDeHoje
        );

    const faturamentoHoje =
        pedidosHoje
            .filter(
                pedido =>
                    pedido.status !==
                    "cancelado"
            )
            .reduce(
                (total, pedido) =>
                    total +
                    Number(
                        pedido.total || 0
                    ),
                0
            );

    const novos =
        pedidosHoje.filter(
            pedido =>
                pedido.status ===
                "novo"
        ).length;

    const preparando =
        pedidosHoje.filter(
            pedido =>
                pedido.status ===
                "preparando"
        ).length;

    const concluidos =
        pedidosHoje.filter(
            pedido =>
                pedido.status ===
                "concluido"
        ).length;

    const cancelados =
        pedidosHoje.filter(
            pedido =>
                pedido.status ===
                "cancelado"
        ).length;

    if (todayOrdersCount) {

        todayOrdersCount.textContent =
            pedidosHoje.length;
    }

    if (todayRevenue) {

        todayRevenue.textContent =
            formatCurrency(
                faturamentoHoje
            );
    }

    if (todayNewCount) {

        todayNewCount.textContent =
            novos;
    }

    if (todayPreparingCount) {

        todayPreparingCount.textContent =
            preparando;
    }

    if (todayCompletedCount) {

        todayCompletedCount.textContent =
            concluidos;
    }

    if (todayCanceledCount) {

        todayCanceledCount.textContent =
            cancelados;
    }
}


/* =========================================================
   FILTROS DOS PEDIDOS
========================================================= */

orderFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentOrderStatus =
                    button.dataset.status;

                orderFilterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add(
                    "active"
                );

                renderizarPedidos();
            }
        );
    }
);


/* =========================================================
   TEMPO DO PEDIDO
========================================================= */

function calcularTempoPedido(
    createdAt
) {

    const agora =
        new Date();

    const criadoEm =
        new Date(
            createdAt
        );

    const diferenca =
        agora - criadoEm;

    const minutos =
        Math.max(
            0,
            Math.floor(
                diferenca /
                60000
            )
        );

    if (minutos < 1) {

        return "Recebido agora";
    }

    if (minutos < 60) {

        return `Recebido há ${minutos} min`;
    }

    const horas =
        Math.floor(
            minutos / 60
        );

    const minutosRestantes =
        minutos % 60;

    if (
        minutosRestantes === 0
    ) {

        return `Recebido há ${horas}h`;
    }

    return (
        `Recebido há ${horas}h ` +
        `${minutosRestantes}min`
    );
}


/* =========================================================
   ALERTA DE ATRASO
========================================================= */

function pedidoEstaAtrasado(
    pedido
) {

    if (
        pedido.status !== "novo"
        &&
        pedido.status !==
        "preparando"
    ) {

        return false;
    }

    const agora =
        new Date();

    const criadoEm =
        new Date(
            pedido.created_at
        );

    const minutos =
        Math.floor(
            (
                agora -
                criadoEm
            ) /
            60000
        );

    return minutos >= 20;
}


/* =========================================================
   RENDERIZAR PEDIDOS
========================================================= */

function renderizarPedidos() {

    if (!ordersList) {
        return;
    }

    const pedidosHoje =
        orders.filter(
            pedidoEhDeHoje
        );

    const pedidosFiltrados =
        currentOrderStatus ===
            "todos"

            ? pedidosHoje

            : pedidosHoje.filter(
                pedido =>
                    pedido.status ===
                    currentOrderStatus
            );

    if (
        pedidosFiltrados.length ===
        0
    ) {

        ordersList.innerHTML = `
            <div class="empty-products">
                Nenhum pedido encontrado.
            </div>
        `;

        return;
    }

    ordersList.innerHTML =
        pedidosFiltrados
            .map(
                pedido => {

                    const dataPedido =
                        new Date(
                            pedido.created_at
                        ).toLocaleString(
                            "pt-BR"
                        );

                    const tempoPedido =
                        calcularTempoPedido(
                            pedido.created_at
                        );

                    const atrasado =
                        pedidoEstaAtrasado(
                            pedido
                        );

                    const itens =
                        Array.isArray(
                            pedido.items
                        )
                            ? pedido.items
                            : [];

                    const itensHtml =
                        itens
                            .map(
                                item => {

                                    const nome =
                                        escapeHTML(
                                            item.name ||
                                            ""
                                        );

                                    const observacao =
                                        escapeHTML(
                                            item.observation ||
                                            ""
                                        );

                                    const quantidade =
                                        Number(
                                            item.quantity ||
                                            0
                                        );

                                    const preco =
                                        formatCurrency(
                                            item.unit_price ||
                                            0
                                        );

                                    return `
                                        <div class="order-item">

                                            <strong>
                                                ${quantidade}x ${nome}
                                            </strong>

                                            <span>
                                                ${preco}
                                            </span>

                                            ${observacao
                                            ? `
                                                        <small>
                                                            Obs.: ${observacao}
                                                        </small>
                                                    `
                                            : ""
                                        }

                                        </div>
                                    `;
                                }
                            )
                            .join("");

                    const cliente =
                        escapeHTML(
                            pedido.customer_name ||
                            ""
                        );

                    const telefone =
                        escapeHTML(
                            pedido.customer_phone ||
                            ""
                        );

                    const tipo =
                        escapeHTML(
                            pedido.order_type ||
                            ""
                        );

                    const endereco =
                        escapeHTML(
                            pedido.address ||
                            "-"
                        );

                    const referencia =
                        escapeHTML(
                            pedido.reference ||
                            "-"
                        );

                    const pagamento =
                        escapeHTML(
                            pedido.payment_method ||
                            ""
                        );

                    const observacaoPedido =
                        escapeHTML(
                            pedido.observation ||
                            ""
                        );

                    const status =
                        escapeHTML(
                            pedido.status ||
                            ""
                        );

                    const numeroPedido =
                        escapeHTML(
                            pedido.order_number ||
                            ""
                        );

                    return `

                        <article
                            class="
                                order-card
                                ${pedido.id ===
                            highlightedOrderId
                            ? "order-card-new"
                            : ""
                        }
                                ${atrasado
                            ? "order-card-late"
                            : ""
                        }
                            "
                        >

                            <div class="order-card-header">

                                <div>

                                    <h3>
                                        Pedido #${numeroPedido}
                                    </h3>

                                    <span>
                                        ${dataPedido}
                                    </span>

                                    <span class="order-time">
                                        ⏱ ${tempoPedido}
                                    </span>

                                    ${atrasado
                            ? `
                                                <span
                                                    class="order-delay-alert"
                                                >
                                                    ⚠️ Pedido demorando
                                                </span>
                                            `
                            : ""
                        }

                                </div>

                                <span class="order-status">
                                    ${status}
                                </span>

                            </div>


                            <div class="order-customer">

                                <p>
                                    <strong>
                                        Cliente:
                                    </strong>
                                    ${cliente}
                                </p>

                                <p>
                                    <strong>
                                        Telefone:
                                    </strong>
                                    ${telefone}
                                </p>

                                <p>
                                    <strong>
                                        Tipo:
                                    </strong>
                                    ${tipo}
                                </p>

                                ${pedido.order_type ===
                            "Entrega"
                            ? `
                                            <p>
                                                <strong>
                                                    Endereço:
                                                </strong>
                                                ${endereco}
                                            </p>

                                            <p>
                                                <strong>
                                                    Referência:
                                                </strong>
                                                ${referencia}
                                            </p>
                                        `
                            : ""
                        }

                            </div>


                            <div class="order-items">

                                <h4>
                                    Itens do pedido
                                </h4>

                                ${itensHtml}

                            </div>


                            <div class="order-summary">

                                <p>
                                    <strong>
                                        Subtotal:
                                    </strong>

                                    ${formatCurrency(
                            pedido.subtotal ||
                            0
                        )}
                                </p>

                                <p>
                                    <strong>
                                        Taxa de entrega:
                                    </strong>

                                    ${formatCurrency(
                            pedido.delivery_fee ||
                            0
                        )}
                                </p>

                                <p>
                                    <strong>
                                        Total:
                                    </strong>

                                    ${formatCurrency(
                            pedido.total ||
                            0
                        )}
                                </p>

                                <p>
                                    <strong>
                                        Pagamento:
                                    </strong>

                                    ${pagamento}
                                </p>

                                ${pedido.change_for
                            ? `
                                            <p>
                                                <strong>
                                                    Troco para:
                                                </strong>

                                                ${formatCurrency(
                                pedido.change_for
                            )}
                                            </p>
                                        `
                            : ""
                        }

                            </div>


                            ${observacaoPedido
                            ? `
                                        <div class="order-observation">

                                            <strong>
                                                Observação:
                                            </strong>

                                            <p>
                                                ${observacaoPedido}
                                            </p>

                                        </div>
                                    `
                            : ""
                        }


     ${pedido.status === "concluido"
                            ? `
            <div class="order-final-status completed">
                ✅ Pedido concluído
            </div>
        `
                            : pedido.status === "cancelado"
                                ? `
                <div class="order-final-status canceled">
                    ❌ Pedido cancelado
                </div>
            `
                                : `
                <div class="order-actions">

                    <button
                        type="button"
                        data-order-id="${escapeHTML(pedido.id)}"
                        data-status="novo"
                    >
                        Novo
                    </button>

                    <button
                        type="button"
                        data-order-id="${escapeHTML(pedido.id)}"
                        data-status="preparando"
                    >
                        Preparando
                    </button>

                    <button
                        type="button"
                        data-order-id="${escapeHTML(pedido.id)}"
                        data-status="saiu_entrega"
                    >
                        Saiu para entrega
                    </button>

                    <button
                        type="button"
                        data-order-id="${escapeHTML(pedido.id)}"
                        data-status="concluido"
                    >
                        Concluído
                    </button>

                    <button
                        type="button"
                        data-order-id="${escapeHTML(pedido.id)}"
                        data-status="cancelado"
                    >
                        Cancelar
                    </button>

                </div>
            `
                        }

                        </article>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   AÇÕES DOS PEDIDOS
   EVENT DELEGATION
========================================================= */

ordersList?.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".order-actions button"
            );

        if (!button) {
            return;
        }

        const id =
            button.dataset.orderId;

        const status =
            button.dataset.status;

        if (
            !id ||
            !status
        ) {

            return;
        }

        alterarStatusPedido(
            id,
            status
        );
    }
);


/* =========================================================
   ALTERAR STATUS DO PEDIDO
========================================================= */

async function alterarStatusPedido(
    id,
    novoStatus
) {

    const statusPermitidos = [
        "novo",
        "preparando",
        "saiu_entrega",
        "concluido",
        "cancelado"
    ];

    if (
        !statusPermitidos.includes(
            novoStatus
        )
    ) {

        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .update({
                status:
                    novoStatus
            })
            .eq(
                "id",
                id
            );

    if (error) {

        console.error(
            "Erro ao alterar status:",
            error
        );

        alert(
            "Erro ao alterar status do pedido."
        );

        return;
    }

    await carregarPedidos();
}


/* =========================================================
   ATUALIZAR TEMPOS A CADA 1 MINUTO
========================================================= */

setInterval(
    () => {

        if (
            orders.length > 0
        ) {

            renderizarPedidos();
        }

    },
    60000
);


/* =========================================================
   REALTIME DOS PEDIDOS
========================================================= */

function iniciarRealtimePedidos() {

    if (
        ordersRealtimeChannel
    ) {

        return;
    }

    ordersRealtimeChannel =
        supabaseClient
            .channel(
                "orders-realtime"
            )

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders"
                },

                async payload => {

                    console.log(
                        "🟢 NOVO PEDIDO RECEBIDO:",
                        payload.new
                    );

                    highlightedOrderId =
                        payload.new.id;

                    tocarSomNovoPedido();

                    mostrarToastNovoPedido(
                        payload.new
                    );

                    mostrarNotificacaoNovoPedido(
                        payload.new
                    );

                    await carregarPedidos();

                    setTimeout(
                        () => {

                            highlightedOrderId =
                                null;

                            renderizarPedidos();

                        },
                        8000
                    );
                }
            )

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders"
                },

                async () => {

                    await carregarPedidos();
                }
            )

            .subscribe(
                status => {

                    console.log(
                        "Status Realtime:",
                        status
                    );
                }
            );
}


/* =========================================================
   SOM DE NOVO PEDIDO
========================================================= */

function prepararSomPedidos() {

    if (orderAudioContext) {
        return;
    }

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {

        console.warn(
            "AudioContext não suportado."
        );

        return;
    }

    orderAudioContext =
        new AudioContext();

    if (
        orderAudioContext.state ===
        "suspended"
    ) {

        orderAudioContext
            .resume()
            .catch(() => { });
    }

    console.log(
        "🔊 Som dos pedidos preparado"
    );
}


/* =========================================================
   TOCAR BEEP
========================================================= */

function tocarSomNovoPedido() {

    if (!orderAudioContext) {

        console.log(
            "⚠️ Áudio ainda não foi liberado."
        );

        return;
    }

    const oscillator =
        orderAudioContext
            .createOscillator();

    const gain =
        orderAudioContext
            .createGain();

    oscillator.connect(
        gain
    );

    gain.connect(
        orderAudioContext.destination
    );

    oscillator.type =
        "sine";

    oscillator.frequency
        .setValueAtTime(
            880,
            orderAudioContext.currentTime
        );

    gain.gain
        .setValueAtTime(
            0.4,
            orderAudioContext.currentTime
        );

    gain.gain
        .exponentialRampToValueAtTime(
            0.01,
            orderAudioContext.currentTime +
            0.5
        );

    oscillator.start();

    oscillator.stop(
        orderAudioContext.currentTime +
        0.5
    );

    console.log(
        "🔊 Beep executado"
    );
}


/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function solicitarPermissaoNotificacoes() {

    if (
        !(
            "Notification" in
            window
        )
    ) {

        return;
    }

    if (
        Notification.permission ===
        "default"
    ) {

        Notification
            .requestPermission()
            .then(
                permission => {

                    console.log(
                        "Permissão de notificações:",
                        permission
                    );
                }
            );
    }
}


/* =========================================================
   NOTIFICAÇÃO DO SISTEMA
========================================================= */

function mostrarNotificacaoNovoPedido(
    pedido
) {

    if (
        !(
            "Notification" in
            window
        )
    ) {

        return;
    }

    if (
        Notification.permission !==
        "granted"
    ) {

        return;
    }

    const numero =
        pedido?.order_number ||
        "";

    const cliente =
        pedido?.customer_name ||
        "Cliente";

    const total =
        formatCurrency(
            pedido?.total || 0
        );

    const notificacao =
        new Notification(
            `Novo pedido #${numero}`,
            {
                body:
                    `${cliente}\nTotal: ${total}`,

                tag:
                    `pedido-${pedido.id}`
            }
        );

    notificacao.onclick =
        () => {

            window.focus();

            notificacao.close();
        };
}


/* =========================================================
   LIBERAR SOM + NOTIFICAÇÃO
========================================================= */

function prepararAlertasAdmin() {

    prepararSomPedidos();

    solicitarPermissaoNotificacoes();
}


document.addEventListener(
    "pointerdown",
    prepararAlertasAdmin,
    {
        once: true
    }
);


document.addEventListener(
    "keydown",
    prepararAlertasAdmin,
    {
        once: true
    }
);


/* =========================================================
   TOAST DE NOVO PEDIDO
========================================================= */

function mostrarToastNovoPedido(
    pedido
) {

    const toast =
        document.getElementById(
            "orderToast"
        );

    const message =
        document.getElementById(
            "orderToastMessage"
        );

    if (
        !toast ||
        !message
    ) {

        return;
    }

    const numero =
        pedido?.order_number ||
        "";

    const total =
        Number(
            pedido?.total || 0
        );

    message.textContent =
        numero
            ? `Pedido #${numero} recebido - ${formatCurrency(total)}`
            : `Novo pedido recebido - ${formatCurrency(total)}`;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        window.orderToastTimeout
    );

    window.orderToastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            5000
        );
}


/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function carregarProdutos() {

    if (!verificarSupabase()) {
        return;
    }

    if (adminProducts) {

        adminProducts.innerHTML = `
            <div class="loading">
                ⏳ Carregando produtos...
            </div>
        `;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        if (adminProducts) {

            adminProducts.innerHTML = `
                <div class="error-message">

                    ❌ Erro ao carregar produtos.

                    <br><br>

                    <small>
                        ${escapeHTML(
                error.message
            )}
                    </small>

                </div>
            `;
        }

        return;
    }

    adminProductsData =
        data || [];

    atualizarDashboardProdutos(
        adminProductsData
    );

    renderizarProdutos(
        adminProductsData
    );
}


/* =========================================================
   DASHBOARD DE PRODUTOS
========================================================= */

function atualizarDashboardProdutos(
    products = []
) {

    const total =
        products.length;

    const disponiveis =
        products.filter(
            product =>
                product.available ===
                true
        ).length;

    const indisponiveis =
        total -
        disponiveis;

    if (totalProducts) {

        totalProducts.textContent =
            total;
    }

    if (availableProducts) {

        availableProducts.textContent =
            disponiveis;
    }

    if (unavailableProducts) {

        unavailableProducts.textContent =
            indisponiveis;
    }
}


/* =========================================================
   CATEGORIAS
========================================================= */

function getCategoryName(
    category
) {

    const categories = {

        burgers:
            "Burguer's",

        combos:
            "Combos",

        especiais:
            "Especiais",

        hotdogs:
            "Hot-Dog's",

        pasteis:
            "Pastéis",

        massas:
            "Massas",

        bebidas:
            "Bebidas",

        adicionais:
            "Adicionais"
    };

    return (
        categories[category] ||
        category ||
        "Sem categoria"
    );
}


/* =========================================================
   RENDERIZAR PRODUTOS
========================================================= */

function renderizarProdutos(
    products = []
) {

    if (!adminProducts) {
        return;
    }

    adminProducts.innerHTML =
        "";

    if (
        products.length ===
        0
    ) {

        adminProducts.innerHTML = `
            <div class="empty-products">

                <h3>
                    📦 Nenhum produto cadastrado
                </h3>

                <p>
                    Clique em "+ Novo Produto"
                    para cadastrar seu primeiro produto.
                </p>

            </div>
        `;

        return;
    }

    products.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "admin-product-card";

            const image =
                product.image_url ||
                "https://placehold.co/800x500?text=Sem+Imagem";

            card.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
                product.name
            )}"
                    class="admin-product-image"
                    loading="lazy"
                >

                <div class="admin-product-content">

                    <span class="product-category">

                        ${escapeHTML(
                getCategoryName(
                    product.category
                )
            )}

                    </span>

                    <h3>
                        ${escapeHTML(
                product.name
            )}
                    </h3>

                    <p>
                        ${escapeHTML(
                product.description ||
                ""
            )}
                    </p>

                    <div class="admin-price">

                        ${formatCurrency(
                product.price
            )}

                    </div>

                    <span
                        class="
                            status
                            ${product.available
                    ? "available"
                    : "unavailable"
                }
                        "
                    >

                        ${product.available
                    ? "🟢 Disponível"
                    : "🔴 Indisponível"
                }

                    </span>

                    <div class="admin-actions">

                        <button
                            type="button"
                            class="edit-button"
                            data-id="${escapeHTML(
                    product.id
                )}"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            type="button"
                            class="toggle-button"
                            data-id="${escapeHTML(
                    product.id
                )}"
                        >
                            ${product.available
                    ? "🔴 Desativar"
                    : "🟢 Ativar"
                }
                        </button>

                        <button
                            type="button"
                            class="delete-button"
                            data-id="${escapeHTML(
                    product.id
                )}"
                        >
                            🗑️ Excluir
                        </button>

                    </div>

                </div>
            `;

            card
                .querySelector(
                    ".edit-button"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        editarProduto(
                            product.id
                        );
                    }
                );

            card
                .querySelector(
                    ".toggle-button"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        alternarProduto(
                            product.id,
                            product.available
                        );
                    }
                );

            card
                .querySelector(
                    ".delete-button"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        excluirProduto(
                            product.id
                        );
                    }
                );

            adminProducts
                .appendChild(
                    card
                );
        }
    );
}


/* =========================================================
   NOVO PRODUTO
========================================================= */

newProductButton?.addEventListener(
    "click",
    () => {

        productForm.reset();

        productId.value =
            "";

        productAvailable.checked =
            true;

        modalTitle.textContent =
            "Novo Produto";

        productModal.classList.add(
            "show"
        );
    }
);


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModalProduto() {

    productModal?.classList.remove(
        "show"
    );
}


closeProductModal?.addEventListener(
    "click",
    fecharModalProduto
);


productModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            productModal
        ) {

            fecharModalProduto();
        }
    }
);


/* =========================================================
   ESC FECHA MODAL
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            fecharModalProduto();
        }
    }
);


/* =========================================================
   SALVAR PRODUTO
========================================================= */

productForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!verificarSupabase()) {
            return;
        }

        const name =
            productName.value
                .trim();

        const category =
            productCategory.value;

        const price =
            Number(
                productPrice.value
            );

        const description =
            productDescription.value
                .trim();

        const image_url =
            productImage.value
                .trim();

        const available =
            productAvailable.checked;

        if (!name) {

            alert(
                "Digite o nome do produto."
            );

            return;
        }

        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {

            alert(
                "Digite um preço válido."
            );

            return;
        }

        const productData = {

            name,
            category,
            price,
            description,
            image_url,
            available
        };

        const id =
            productId.value;

        let error =
            null;

        if (id) {

            const result =
                await supabaseClient
                    .from("products")
                    .update(
                        productData
                    )
                    .eq(
                        "id",
                        id
                    );

            error =
                result.error;

        } else {

            const result =
                await supabaseClient
                    .from("products")
                    .insert(
                        productData
                    );

            error =
                result.error;
        }

        if (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            alert(
                "❌ Erro ao salvar produto:\n\n" +
                error.message
            );

            return;
        }

        fecharModalProduto();

        productForm.reset();

        productId.value =
            "";

        alert(
            id
                ? "✅ Produto atualizado com sucesso!"
                : "✅ Produto cadastrado com sucesso!"
        );

        await carregarProdutos();
    }
);


/* =========================================================
   EDITAR PRODUTO
========================================================= */

async function editarProduto(
    id
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();

    if (error) {

        console.error(
            "Erro ao buscar produto:",
            error
        );

        alert(
            "Erro ao buscar produto:\n\n" +
            error.message
        );

        return;
    }

    productId.value =
        data.id;

    productName.value =
        data.name || "";

    productCategory.value =
        data.category ||
        "burgers";

    productPrice.value =
        data.price || "";

    productDescription.value =
        data.description || "";

    productImage.value =
        data.image_url || "";

    productAvailable.checked =
        data.available !== false;

    modalTitle.textContent =
        "Editar Produto";

    productModal.classList.add(
        "show"
    );
}


/* =========================================================
   ATIVAR / DESATIVAR PRODUTO
========================================================= */

async function alternarProduto(
    id,
    currentStatus
) {

    const novoStatus =
        !currentStatus;

    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({
                available:
                    novoStatus
            })
            .eq(
                "id",
                id
            );

    if (error) {

        console.error(
            "Erro ao alterar produto:",
            error
        );

        alert(
            "Erro ao alterar disponibilidade:\n\n" +
            error.message
        );

        return;
    }

    await carregarProdutos();
}


/* =========================================================
   EXCLUIR PRODUTO
========================================================= */

async function excluirProduto(
    id
) {

    const confirmado =
        confirm(
            "⚠️ Tem certeza que deseja excluir este produto?"
        );

    if (!confirmado) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                id
            );

    if (error) {

        console.error(
            "Erro ao excluir produto:",
            error
        );

        alert(
            "❌ Erro ao excluir produto:\n\n" +
            error.message
        );

        return;
    }

    alert(
        "🗑️ Produto excluído com sucesso!"
    );

    await carregarProdutos();
}


/* =========================================================
   BUSCAR PRODUTOS
========================================================= */

adminSearch?.addEventListener(
    "input",
    () => {

        const termo =
            adminSearch.value
                .toLowerCase()
                .trim();

        if (!termo) {

            renderizarProdutos(
                adminProductsData
            );

            return;
        }

        const filtrados =
            adminProductsData.filter(
                product => {

                    const nome =
                        (
                            product.name ||
                            ""
                        ).toLowerCase();

                    const descricao =
                        (
                            product.description ||
                            ""
                        ).toLowerCase();

                    return (
                        nome.includes(
                            termo
                        )
                        ||
                        descricao.includes(
                            termo
                        )
                    );
                }
            );

        renderizarProdutos(
            filtrados
        );
    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarAdmin() {

    console.log(
        "🍔 Nettinho Lanches - Admin V4.0"
    );

    console.log(
        "☁️ Banco: Supabase"
    );

    await checkLogin();
}


iniciarAdmin();