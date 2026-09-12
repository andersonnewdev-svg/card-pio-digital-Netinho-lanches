/* =========================================================
   CARDÁPIO DIGITAL
   V4.0 FINAL - CARDÁPIO DO CLIENTE
   SUPABASE + CARRINHO + WHATSAPP
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

let WHATSAPP_NUMBER = "";


/* =========================================================
   ESTADO DO SISTEMA
========================================================= */

let products = [];

let cart = [];

let currentCategory =
    "todos";

let currentSort =
    "destaques";

let selectedProduct =
    null;

let modalQuantity =
    1;

let storeSettings =
    null;

let orderSubmitting =
    false;


/* =========================================================
   MAPA DE CATEGORIAS
========================================================= */

function mostrarNotificacao(mensagem, tipo = "sucesso") {
    const existente =
        document.querySelector(".notificacao-app");

    if (existente) {
        existente.remove();
    }

    const notificacao =
        document.createElement("div");

    notificacao.className =
        `notificacao-app ${tipo}`;

    notificacao.textContent = mensagem;

    document.body.appendChild(notificacao);

    setTimeout(() => {
        notificacao.classList.add("visivel");
    }, 10);

    setTimeout(() => {
        notificacao.classList.remove("visivel");

        setTimeout(() => {
            notificacao.remove();
        }, 300);
    }, 3000);
}


/* =========================================================
   MAPA DE CATEGORIAS
========================================================= */

let categories = [];

async function carregarCategorias() {

    if (!storeSettings?.id) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("categories")
            .select("id, name, slug, icon")
            .eq(
                "store_id",
                storeSettings.id
            )
            .eq(
                "active",
                true
            )
            .order(
                "name",
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(
            "Erro ao carregar categorias:",
            error
        );

        categories = [];

        return;
    }

    categories = data || [];


}

function renderizarCategorias() {

    if (!categoriesMenu) {
        return;
    }

    categoriesMenu.innerHTML = "";

    const botaoTodos =
        document.createElement(
            "button"
        );

    botaoTodos.className =
        "categoria ativa";

    botaoTodos.dataset.slug =
        "todos";

    botaoTodos.innerHTML = `
        <span>🍔</span>

        <small>
            TODOS
        </small>
    `;

    botaoTodos.addEventListener(
        "click",
        () => {

            filtrarCategoria(
                "todos"
            );
        }
    );

    categoriesMenu.appendChild(
        botaoTodos
    );


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "categoria";

            button.dataset.category =
                category.slug;

            button.innerHTML = `
    <span>
        ${escapeHTML(
                category.icon || "🍽️"
            )}
    </span>

    <small>
        ${escapeHTML(
                category.name || ""
            ).toUpperCase()}
    </small>
`;

            button.addEventListener(
                "click",
                () => {

                    filtrarCategoria(
                        category.slug
                    );
                }
            );

            categoriesMenu.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   ELEMENTOS DA PÁGINA
========================================================= */

const searchInput =
    document.getElementById(
        "campo-busca"
    );

const sortSelect =
    document.getElementById(
        "ordenacao"
    );

const categoryButtons =
    document.querySelectorAll(
        ".categoria"
    );

const highlightsContainer =
    document.getElementById(
        "produtos-destaques"
    );

const productsContainer =
    document.getElementById(
        "lista-produtos"
    );

const categoriesMenu =
    document.getElementById(
        "categoriesMenu"
    );


/* =========================================================
   CARRINHO
========================================================= */

const cartCount =
    document.getElementById(
        "contador-carrinho"
    );

const cartItems =
    document.getElementById(
        "itens-carrinho"
    );

const cartSubtotal =
    document.getElementById(
        "subtotal"
    );

const cartTotal =
    document.getElementById(
        "total"
    );

const totalMobile =
    document.getElementById(
        "total-mobile"
    );


/* =========================================================
   CHECKOUT
========================================================= */

const deliveryData =
    document.getElementById(
        "dados-entrega"
    );

const paymentSelect =
    document.getElementById(
        "pagamento"
    );

const trocoField =
    document.getElementById(
        "campo-troco"
    );

const tipoPedidoRadios =
    document.querySelectorAll(
        'input[name="tipoPedido"]'
    );

const finalizarButton =
    document.querySelector(
        ".btn-finalizar"
    );


/* =========================================================
   MODAL
========================================================= */

const modal =
    document.getElementById(
        "modal-produto"
    );

const modalImage =
    document.getElementById(
        "modal-imagem"
    );

const modalName =
    document.getElementById(
        "modal-nome"
    );

const modalDescription =
    document.getElementById(
        "modal-descricao"
    );

const modalPreco =
    document.getElementById(
        "modal-preco"
    );

const modalObservacao =
    document.getElementById(
        "modal-observacao"
    );

const modalQuantidadeText =
    document.getElementById(
        "modal-quantidade"
    );

const modalAdicionais =
    document.getElementById(
        "modal-adicionais"
    );


/* =========================================================
   SUPABASE
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
   FORMATAR MOEDA
========================================================= */

function formatCurrency(value) {

    const number =
        Number(value) || 0;

    return number.toLocaleString(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }
    );
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escapeHTML(text = "") {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            text ?? ""
        );

    return div.innerHTML;
}


/* =========================================================
   IMAGEM DO PRODUTO
========================================================= */

function getProductImage(product) {

    const storeName =
        storeSettings?.store_name ||
        "Produto";

    return (
        product.image_url ||
        `https://placehold.co/800x600?text=${encodeURIComponent(storeName)}`
    );
}


/* =========================================================
   CATEGORIA
========================================================= */

function getCategoryName(category) {

    const foundCategory =
        categories.find(
            item =>
                item.slug === category
        );

    return (
        foundCategory?.name ||
        category ||
        "Sem categoria"
    );
}

/* =========================================================
   CONFIGURAÇÕES DA LOJA
========================================================= */

async function carregarConfiguracoesLoja() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const lojaSlug =
        params.get("loja") || "nettinho-lanches";

    if (!lojaSlug) {

        document.body.innerHTML = `
        <main class="loja-erro">
            <div class="loja-erro-card">
                <h1>Loja não encontrada</h1>
                <p>
                    Não foi possível identificar esta loja.
                    Verifique se o link está correto.
                </p>
                <button onclick="window.location.reload()">
                    Tentar novamente
                </button>
            </div>
        </main>
    `;

        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "store_settings"
            )
            .select("*")
            .eq(
                "slug",
                lojaSlug
            )
            .maybeSingle();


    if (
        error ||
        !data
    ) {

        console.error(
            "Erro ao carregar configurações da loja:",
            error
        );

        alert(
            "Loja não encontrada."
        );

        return false;
    }

    if (error) {

        console.error(
            "Erro ao carregar configurações da loja:",
            error
        );

        return false;
    }

    storeSettings =
        data;

    document.title =
        `Cardápio Digital | ${storeSettings.store_name || "Minha Loja"}`;

    WHATSAPP_NUMBER =
        String(
            data?.whatsapp ||
            ""
        )
            .replace(
                /\D/g,
                ""
            );

    /* =========================================
       APLICAR IDENTIDADE VISUAL DA LOJA
    ========================================= */

    const storeDisplayName =
        document.getElementById(
            "storeDisplayName"
        );

    const storeDisplaySlogan =
        document.getElementById(
            "storeDisplaySlogan"
        );

    const storeDisplaySince =
        document.getElementById(
            "storeDisplaySince"
        );

    const storeLogoContainer =
        document.getElementById(
            "storeLogoContainer"
        );


    if (storeDisplayName) {

        storeDisplayName.textContent =
            data.store_name ||
            "Minha Loja";
    }


    if (storeDisplaySlogan) {

        storeDisplaySlogan.textContent =
            data.slogan ||
            "";
    }


    if (storeDisplaySince) {

        storeDisplaySince.textContent =
            data.since_year
                ? `DESDE ${data.since_year}`
                : "";
    }


    if (
        storeLogoContainer &&
        data.logo_url
    ) {

        storeLogoContainer.innerHTML = `
    <img
        src="${escapeHTML(
            data.logo_url || ""
        )}"
        alt="${escapeHTML(
            data.store_name || "Logo da loja"
        )}"
        class="store-logo-image"
    >
`;

    }

    return true;
}



/* =========================================================
   VERIFICAR SE LOJA ESTÁ ABERTA
========================================================= */

function lojaEstaAbertaAgora() {

    if (
        !storeSettings
    ) {

        return false;
    }

    if (
        storeSettings.is_open !==
        true
    ) {

        return false;
    }

    const abertura =
        storeSettings.opening_time;

    const fechamento =
        storeSettings.closing_time;

    /*
       Se não houver horários configurados,
       consideramos apenas o checkbox "Loja aberta".
    */

    if (
        !abertura ||
        !fechamento
    ) {

        return true;
    }

    const agora =
        new Date();

    const minutosAgora =
        (
            agora.getHours() *
            60
        )
        +
        agora.getMinutes();

    const [
        horaAbertura,
        minutoAbertura
    ] =
        abertura
            .slice(0, 5)
            .split(":")
            .map(Number);

    const [
        horaFechamento,
        minutoFechamento
    ] =
        fechamento
            .slice(0, 5)
            .split(":")
            .map(Number);

    const minutosAbertura =
        (
            horaAbertura *
            60
        )
        +
        minutoAbertura;

    const minutosFechamento =
        (
            horaFechamento *
            60
        )
        +
        minutoFechamento;

    /*
       Horário normal:
       18:00 → 23:00
    */

    if (
        minutosAbertura <
        minutosFechamento
    ) {

        return (
            minutosAgora >=
            minutosAbertura
            &&
            minutosAgora <
            minutosFechamento
        );
    }

    /*
       Horário atravessando meia-noite:
       18:00 → 02:00
    */

    if (
        minutosAbertura >
        minutosFechamento
    ) {

        return (
            minutosAgora >=
            minutosAbertura
            ||
            minutosAgora <
            minutosFechamento
        );
    }

    /*
       Mesmo horário de abertura e fechamento:
       tratamos como aberto 24h enquanto is_open = true.
    */

    return true;
}


/* =========================================================
   TEXTO DO HORÁRIO
========================================================= */

function getHorarioLojaTexto() {

    const abertura =
        storeSettings?.opening_time;

    const fechamento =
        storeSettings?.closing_time;

    if (
        !abertura ||
        !fechamento
    ) {

        return "";
    }

    return (
        abertura.slice(
            0,
            5
        )
        +
        " às "
        +
        fechamento.slice(
            0,
            5
        )
    );
}


/* =========================================================
   CARREGAR PRODUTOS
========================================================= */

async function carregarProdutos() {

    if (
        !verificarSupabase()
    ) {

        mostrarErroProdutos(
            "Supabase não carregado."
        );

        return;
    }

    mostrarCarregando();

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq(
                "store_id",
                storeSettings.id
            )
            .eq(
                "available",
                true
            );

    if (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        mostrarErroProdutos(
            error.message
        );

        return;
    }

    products =
        (
            data || []
        ).map(
            product => ({
                ...product,

                price:
                    Number(
                        product.price
                    )
            })
        );

    renderHighlights();

    renderProducts();

    updateCart();
}


/* =========================================================
   CARREGAMENTO
========================================================= */

function mostrarCarregando() {

    if (
        productsContainer
    ) {

        productsContainer.innerHTML = `
            <div class="carrinho-vazio">
                ⏳ Carregando cardápio...
            </div>
        `;
    }

    if (
        highlightsContainer
    ) {

        highlightsContainer.innerHTML = `
            <div class="carrinho-vazio">
                ⏳ Carregando destaques...
            </div>
        `;
    }
}


/* =========================================================
   ERRO DE PRODUTOS
========================================================= */

function mostrarErroProdutos(
    message
) {

    const html = `
        <div class="carrinho-vazio">

            <strong>
                ❌ Não foi possível carregar o cardápio.
            </strong>

            <br><br>

            <small>
                ${escapeHTML(
        message
    )}
            </small>

        </div>
    `;

    if (
        productsContainer
    ) {

        productsContainer.innerHTML =
            html;
    }

    if (
        highlightsContainer
    ) {

        highlightsContainer.innerHTML =
            html;
    }
}


/* =========================================================
   FILTRAR PRODUTOS
========================================================= */

function getFilteredProducts() {

    const searchTerm =
        (
            searchInput?.value ||
            ""
        )
            .toLowerCase()
            .trim();

    const selectedCategory =
        currentCategory === "todos"
            ? null
            : currentCategory;

    return products.filter(
        product => {

            const categoryMatch =
                !selectedCategory
                ||
                product.category ===
                selectedCategory;

            const name =
                (
                    product.name ||
                    ""
                )
                    .toLowerCase();

            const description =
                (
                    product.description ||
                    ""
                )
                    .toLowerCase();

            const searchMatch =
                name.includes(
                    searchTerm
                )
                ||
                description.includes(
                    searchTerm
                );

            return (
                categoryMatch &&
                searchMatch
            );
        }
    );
}

/* =========================================================
   ORDENAR PRODUTOS
========================================================= */

function sortProducts(list) {

    const sorted =
        [...list];

    switch (
    currentSort
    ) {

        case "menor":

            return sorted.sort(
                (a, b) =>
                    Number(
                        a.price
                    )
                    -
                    Number(
                        b.price
                    )
            );

        case "maior":

            return sorted.sort(
                (a, b) =>
                    Number(
                        b.price
                    )
                    -
                    Number(
                        a.price
                    )
            );

        case "az":

            return sorted.sort(
                (a, b) =>
                    String(
                        a.name || ""
                    )
                        .localeCompare(
                            String(
                                b.name || ""
                            ),
                            "pt-BR"
                        )
            );

        default:

            return sorted;
    }
}


/* =========================================================
   CARD DO PRODUTO
========================================================= */

function criarCardProduto(
    product
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "produto-card";

    const image =
        getProductImage(
            product
        );

    card.innerHTML = `

        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(
        product.name
    )}"
            class="produto-imagem"
            loading="lazy"
        >

        <div class="produto-info">

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

            <div class="produto-rodape">

                <strong
                    class="produto-preco"
                >
                    ${formatCurrency(
        product.price
    )}
                </strong>

                <button
                    type="button"
                    class="btn-produto"
                >
                    + Adicionar
                </button>

            </div>

        </div>
    `;

    card
        .querySelector(
            ".btn-produto"
        )
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openProductModal(
                    product.id
                );
            }
        );

    card.addEventListener(
        "click",
        () => {

            openProductModal(
                product.id
            );
        }
    );

    return card;
}


/* =========================================================
   DESTAQUES
========================================================= */

function renderHighlights() {

    if (
        !highlightsContainer
    ) {

        return;
    }

    highlightsContainer.innerHTML =
        "";

    const featured =
        products
            .filter(
                product =>
                    product.category !==
                    "adicionais"
            )
            .slice(
                0,
                4
            );

    if (
        featured.length ===
        0
    ) {

        highlightsContainer.innerHTML = `
            <div class="carrinho-vazio">
                Nenhum destaque disponível.
            </div>
        `;

        return;
    }

    featured.forEach(
        product => {

            highlightsContainer
                .appendChild(
                    criarCardProduto(
                        product
                    )
                );
        }
    );
}


/* =========================================================
   RENDERIZAR PRODUTOS
========================================================= */

function renderProducts() {

    if (
        !productsContainer
    ) {

        return;
    }

    currentSort =
        sortSelect?.value ||
        "destaques";

    const filteredProducts =
        sortProducts(
            getFilteredProducts()
        );

    productsContainer.innerHTML =
        "";

    if (
        filteredProducts.length ===
        0
    ) {

        productsContainer.innerHTML = `
            <div class="carrinho-vazio">

                <span>
                    🔎
                </span>

                <p>
                    Nenhum produto encontrado.
                </p>

            </div>
        `;

        return;
    }

    filteredProducts.forEach(
        product => {

            productsContainer
                .appendChild(
                    criarCardProduto(
                        product
                    )
                );
        }
    );
}


/* =========================================================
   FILTRAR CATEGORIA
========================================================= */

function filtrarCategoria(category) {

    currentCategory =
        category;

    const buttons =
        categoriesMenu.querySelectorAll(
            ".categoria"
        );

    buttons.forEach(button => {

        const buttonCategory =
            button.dataset.category;

        button.classList.toggle(
            "ativa",
            buttonCategory === category
        );
    });

    renderProducts();
}

/* =========================================================
   BUSCA
========================================================= */

function buscarProdutos() {

    renderProducts();
}


/* =========================================================
   ORDENAÇÃO
========================================================= */

function ordenarProdutos() {

    currentSort =
        sortSelect?.value ||
        "destaques";

    renderProducts();
}


/* =========================================================
   ENCONTRAR PRODUTO
========================================================= */

function findProduct(id) {

    return products.find(
        product =>
            String(
                product.id
            )
            ===
            String(
                id
            )
    );
}


/* =========================================================
   ABRIR MODAL
========================================================= */

function openProductModal(
    productId
) {

    if (
        !modal
    ) {

        return;
    }

    const product =
        findProduct(
            productId
        );

    if (
        !product
    ) {

        return;
    }

    selectedProduct =
        product;

    modalQuantity =
        1;

    if (
        modalImage
    ) {

        modalImage.src =
            getProductImage(
                product
            );

        modalImage.alt =
            product.name;
    }

    if (
        modalName
    ) {

        modalName.textContent =
            product.name;
    }

    if (
        modalDescription
    ) {

        modalDescription.textContent =
            product.description ||
            "";
    }

    if (
        modalPreco
    ) {

        modalPreco.textContent =
            formatCurrency(
                product.price
            );
    }

    if (
        modalObservacao
    ) {

        modalObservacao.value =
            "";
    }

    if (
        modalQuantidadeText
    ) {

        modalQuantidadeText.textContent =
            modalQuantity;
    }

    renderModalAdicionais(
        product
    );

    modal.classList.add(
        "ativo"
    );

}


/* =========================================================
   ADICIONAIS
========================================================= */

function renderModalAdicionais(
    product
) {

    if (
        !modalAdicionais
    ) {

        return;
    }

    modalAdicionais.innerHTML = `
        <h3>
            Adicionais
        </h3>
    `;

    if (
        product.category ===
        "adicionais"
    ) {

        modalAdicionais.innerHTML += `
            <p>
                Este item já é um adicional.
            </p>
        `;

        return;
    }

    const extras =
        products.filter(
            item =>
                item.category ===
                "adicionais"
        );

    if (
        extras.length ===
        0
    ) {

        modalAdicionais.innerHTML += `
            <p>
                Nenhum adicional disponível.
            </p>
        `;

        return;
    }

    extras.forEach(
        extra => {

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "adicional-item";

            wrapper.innerHTML = `

                <label>

                    <input
                        type="checkbox"
                        class="modal-adicional-checkbox"
                        data-id="${escapeHTML(
                extra.id
            )}"
                    >

                    ${escapeHTML(
                extra.name
            )}

                </label>

                <span class="adicional-preco">

                    + ${formatCurrency(
                extra.price
            )}

                </span>
            `;

            modalAdicionais
                .appendChild(
                    wrapper
                );
        }
    );
}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

    if (
        !modal
    ) {

        return;
    }

    modal.classList.remove(
        "ativo"
    );

    document.body.style.overflow =
        "";

    selectedProduct =
        null;

    modalQuantity =
        1;
}


/* =========================================================
   QUANTIDADE MODAL
========================================================= */

function alterarQuantidadeModal(
    delta
) {

    modalQuantity =
        Math.max(
            1,
            modalQuantity +
            Number(
                delta
            )
        );

    if (
        modalQuantidadeText
    ) {

        modalQuantidadeText.textContent =
            modalQuantity;
    }
}


/* =========================================================
   ADICIONAIS SELECIONADOS
========================================================= */

function getSelectedExtras() {

    const checkboxes =
        document.querySelectorAll(
            ".modal-adicional-checkbox:checked"
        );

    const extras =
        [];

    checkboxes.forEach(
        checkbox => {

            const product =
                findProduct(
                    checkbox.dataset.id
                );

            if (
                product
            ) {

                extras.push({

                    id:
                        product.id,

                    name:
                        product.name,

                    price:
                        Number(
                            product.price
                        )
                });
            }
        }
    );

    return extras;
}


/* =========================================================
   ID DO ITEM DO CARRINHO
========================================================= */

function createCartItemId() {

    if (
        window.crypto &&
        typeof crypto.randomUUID ===
        "function"
    ) {

        return crypto.randomUUID();
    }

    return (
        Date.now()
            .toString()
        +
        "-"
        +
        Math.random()
            .toString(
                36
            )
            .slice(2)
    );
}


/* =========================================================
   ADICIONAR PELO MODAL
========================================================= */

function adicionarProdutoModal() {

    if (
        !selectedProduct
    ) {

        return;
    }

    const extras =
        getSelectedExtras();

    const observation =
        modalObservacao?.value
            .trim() ||
        "";

    const extrasTotal =
        extras.reduce(
            (total, extra) =>
                total +
                Number(
                    extra.price
                ),
            0
        );

    const unitPrice =
        Number(
            selectedProduct.price
        )
        +
        extrasTotal;

    cart.push({

        cartId:
            createCartItemId(),

        productId:
            selectedProduct.id,

        name:
            selectedProduct.name,

        basePrice:
            Number(
                selectedProduct.price
            ),

        unitPrice,

        quantity:
            modalQuantity,

        extras,

        observation
    });

    updateCart();

    fecharModal();
}


/* =========================================================
   ADICIONAR DIRETAMENTE
========================================================= */

function addToCart(
    productId
) {

    openProductModal(
        productId
    );
}


/* =========================================================
   QUANTIDADE DO CARRINHO
========================================================= */

function increaseQuantity(
    cartId
) {

    const item =
        cart.find(
            item =>
                item.cartId ===
                cartId
        );

    if (
        !item
    ) {

        return;
    }

    item.quantity +=
        1;

    updateCart();
}


function decreaseQuantity(
    cartId
) {

    const item =
        cart.find(
            item =>
                item.cartId ===
                cartId
        );

    if (
        !item
    ) {

        return;
    }

    item.quantity -=
        1;

    if (
        item.quantity <=
        0
    ) {

        cart =
            cart.filter(
                item =>
                    item.cartId !==
                    cartId
            );
    }

    updateCart();
}


/* =========================================================
   REMOVER ITEM
========================================================= */

function removeFromCart(
    cartId
) {

    cart =
        cart.filter(
            item =>
                item.cartId !==
                cartId
        );

    updateCart();
}


/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */

function renderCart() {

    if (
        !cartItems
    ) {

        return;
    }

    if (
        cart.length ===
        0
    ) {

        cartItems.innerHTML = `
            <div class="carrinho-vazio">

                Seu carrinho está vazio.

                <br>

                Adicione um produto
                para começar.

            </div>
        `;

        return;
    }

    cartItems.innerHTML =
        "";

    cart.forEach(
        item => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "item-carrinho";

            const subtotal =
                item.unitPrice *
                item.quantity;

            const extrasText =
                item.extras
                    .map(
                        extra =>
                            `${escapeHTML(
                                extra.name
                            )} (+${formatCurrency(
                                extra.price
                            )})`
                    )
                    .join(
                        "<br>"
                    );

            element.innerHTML = `

                <div class="item-carrinho-header">

                    <h4>
                        ${escapeHTML(
                item.name
            )}
                    </h4>

                    <strong>
                        ${formatCurrency(
                subtotal
            )}
                    </strong>

                </div>

                ${extrasText
                    ? `
                            <div class="item-adicionais">
                                ➕ ${extrasText}
                            </div>
                        `
                    : ""
                }

                ${item.observation
                    ? `
                            <div class="item-observacao">
                                📝 ${escapeHTML(
                        item.observation
                    )}
                            </div>
                        `
                    : ""
                }

                <div class="item-controle">

                    <button
                        type="button"
                        class="btn-menos"
                    >
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        type="button"
                        class="btn-mais"
                    >
                        +
                    </button>

                    <button
                        type="button"
                        class="item-remover"
                    >
                        🗑 Remover
                    </button>

                </div>
            `;

            element
                .querySelector(
                    ".btn-menos"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        decreaseQuantity(
                            item.cartId
                        );
                    }
                );

            element
                .querySelector(
                    ".btn-mais"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        increaseQuantity(
                            item.cartId
                        );
                    }
                );

            element
                .querySelector(
                    ".item-remover"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        removeFromCart(
                            item.cartId
                        );
                    }
                );

            cartItems
                .appendChild(
                    element
                );
        }
    );
}


/* =========================================================
   TOTAL DE ITENS
========================================================= */

function updateCartCount() {

    if (
        !cartCount
    ) {

        return;
    }

    const count =
        cart.reduce(
            (total, item) =>
                total +
                item.quantity,
            0
        );

    cartCount.textContent =
        count;
}


/* =========================================================
   SUBTOTAL
========================================================= */

function calculateSubtotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (
                item.unitPrice *
                item.quantity
            ),
        0
    );
}


/* =========================================================
   TAXA DE ENTREGA
========================================================= */

function getDeliveryFee() {

    const tipoPedido =
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        )?.value;

    if (
        tipoPedido !==
        "Entrega"
    ) {

        return 0;
    }

    return Number(
        storeSettings?.delivery_fee ||
        0
    );
}


/* =========================================================
   TOTAL
========================================================= */

function calculateTotal() {

    return (
        calculateSubtotal()
        +
        getDeliveryFee()
    );
}


/* =========================================================
   ATUALIZAR VALORES DO CARRINHO
========================================================= */

function updateCartTotal() {

    const subtotal =
        calculateSubtotal();

    const total =
        calculateTotal();

    if (
        cartSubtotal
    ) {

        cartSubtotal.textContent =
            formatCurrency(
                subtotal
            );
    }

    if (
        cartTotal
    ) {

        cartTotal.textContent =
            formatCurrency(
                total
            );
    }

    if (
        totalMobile
    ) {

        totalMobile.textContent =
            formatCurrency(
                total
            );
    }
}


/* =========================================================
   ATUALIZAR CARRINHO
========================================================= */

function updateCart() {

    renderCart();

    updateCartCount();

    updateCartTotal();
}


/* =========================================================
   ENTREGA / RETIRADA
========================================================= */

function alternarEntrega() {

    const tipo =
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        );

    if (
        !deliveryData ||
        !tipo
    ) {

        return;
    }

    deliveryData.style.display =
        tipo.value ===
            "Entrega"
            ? "block"
            : "none";

    updateCartTotal();
}


/* =========================================================
   TROCO
========================================================= */

function alternarTroco() {

    if (
        !trocoField ||
        !paymentSelect
    ) {

        return;
    }

    const dinheiro =
        paymentSelect.value ===
        "Dinheiro";

    trocoField.style.display =
        dinheiro
            ? "block"
            : "none";

    if (
        !dinheiro
    ) {

        const input =
            document.getElementById(
                "troco"
            );

        if (
            input
        ) {

            input.value =
                "";
        }
    }
}


/* =========================================================
   CARRINHO MOBILE
========================================================= */
function abrirCarrinhoMobile() {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    if (window.innerWidth <= 800) {

        document.body.classList.add(
            "carrinho-mobile-aberto"
        );

        sidebar.classList.add(
            "sidebar-mobile-aberta"
        );

        /*
        Garante que o carrinho comece
        no topo sempre que for aberto.
        */
        sidebar.scrollTop = 0;


        /*
        Cria o botão fechar somente
        se ele ainda não existir.
        */
        if (
            !document.getElementById(
                "fechar-carrinho-mobile"
            )
        ) {

            const closeButton =
                document.createElement(
                    "button"
                );

            closeButton.id =
                "fechar-carrinho-mobile";

            closeButton.type =
                "button";

            closeButton.textContent =
                "✕ Fechar";

            closeButton.setAttribute(
                "aria-label",
                "Fechar carrinho"
            );

            closeButton.addEventListener(
                "click",
                fecharCarrinhoMobile
            );

            document.body.appendChild(
                closeButton
            );
        }
    }
}


/* =========================================================
   FECHAR CARRINHO MOBILE
========================================================= */

function fecharCarrinhoMobile() {

    const sidebar =
        document.querySelector(".sidebar");


    /*
    Fecha o teclado antes de fechar
    o carrinho.
    */
    if (
        document.activeElement &&
        typeof document.activeElement.blur ===
        "function"
    ) {

        document.activeElement.blur();
    }


    document.body.classList.remove(
        "carrinho-mobile-aberto"
    );


    if (sidebar) {

        sidebar.classList.remove(
            "sidebar-mobile-aberta"
        );

        sidebar.scrollTop = 0;

        /*
        Remove qualquer altura inline
        que possa ter ficado de testes
        anteriores.
        */
        sidebar.style.removeProperty(
            "height"
        );

        sidebar.style.removeProperty(
            "max-height"
        );
    }


    document
        .getElementById(
            "fechar-carrinho-mobile"
        )
        ?.remove();
}

function atualizarAlturaViewport() {
    const altura = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

    document.documentElement.style.setProperty(
        "--altura-viewport",
        `${altura}px`
    );
}

atualizarAlturaViewport();

window.addEventListener(
    "resize",
    atualizarAlturaViewport
);

if (window.visualViewport) {

    window.visualViewport.addEventListener(
        "resize",
        atualizarAlturaViewport
    );

    window.visualViewport.addEventListener(
        "scroll",
        atualizarAlturaViewport
    );
}
/* =========================================================
   SALVAR PEDIDO NO SUPABASE
========================================================= */

document.addEventListener(
    "focusin",
    function (event) {

        if (
            window.innerWidth <= 800 &&
            event.target.matches(
                ".checkout-box input, .checkout-box select, .checkout-box textarea"
            )
        ) {

            setTimeout(() => {

                event.target.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 300);
        }
    }
);

async function salvarPedidoNoSupabase(
    orderData
) {

    const {
        error
    } =
        await supabaseClient
            .from(
                "orders"
            )
            .insert(
                orderData
            );

    if (
        error
    ) {

        console.error(
            "Erro ao salvar pedido:",
            error
        );

        return false;
    }

    return true;
}


/* =========================================================
   BLOQUEAR / DESBLOQUEAR FINALIZAÇÃO
========================================================= */

function setFinalizandoPedido(
    ativo
) {

    orderSubmitting =
        ativo;

    if (
        !finalizarButton
    ) {

        return;
    }

    finalizarButton.disabled =
        ativo;

    if (
        ativo
    ) {

        finalizarButton.dataset.originalHtml =
            finalizarButton.innerHTML;

        finalizarButton.innerHTML = `
            <span>
                ⏳
            </span>

            <div>

                <strong>
                    ENVIANDO PEDIDO...
                </strong>

                <small>
                    AGUARDE
                </small>

            </div>
        `;

    } else if (
        finalizarButton.dataset.originalHtml
    ) {

        finalizarButton.innerHTML =
            finalizarButton.dataset.originalHtml;

        delete finalizarButton.dataset.originalHtml;
    }
}


/* =========================================================
   LIMPAR PEDIDO APÓS SUCESSO
========================================================= */

function limparPedido() {

    cart =
        [];

    updateCart();

    const campos = [
        "nome-cliente",
        "telefone-cliente",
        "endereco",
        "referencia",
        "troco",
        "observacao"
    ];

    campos.forEach(
        id => {

            const campo =
                document.getElementById(
                    id
                );

            if (
                campo
            ) {

                campo.value =
                    "";
            }
        }
    );

    if (
        paymentSelect
    ) {

        paymentSelect.value =
            "";
    }

    alternarTroco();
}


/* =========================================================
   FINALIZAR PEDIDO
========================================================= */

async function finalizarPedido() {

    if (
        orderSubmitting
    ) {

        return;
    }

    if (
        cart.length ===
        0
    ) {

        alert(
            "Seu carrinho está vazio."
        );

        return;
    }

    if (
        !storeSettings
    ) {

        alert(
            "Não foi possível carregar as configurações da loja."
        );

        return;
    }

    if (
        !lojaEstaAbertaAgora()
    ) {

        const horario =
            getHorarioLojaTexto();

        alert(
            horario
                ? `A loja está fechada no momento.\n\nHorário de funcionamento: ${horario}.`
                : "A loja está fechada no momento."
        );

        return;
    }

    const whatsappNumber =
        String(
            WHATSAPP_NUMBER ||
            ""
        )
            .replace(
                /\D/g,
                ""
            );

    /*
       Verificamos o WhatsApp ANTES
       de registrar o pedido no banco.
    */

    if (
        !whatsappNumber
    ) {

        alert(
            "WhatsApp da loja não configurado."
        );

        return;
    }

    /*
       Pedido mínimo calculado
       somente sobre os produtos.
    */

    const minimumOrder =
        Number(
            storeSettings?.minimum_order ||
            0
        );

    const subtotalProdutos =
        calculateSubtotal();

    if (
        minimumOrder >
        0
        &&
        subtotalProdutos <
        minimumOrder
    ) {

        alert(
            "O pedido mínimo é de " +
            formatCurrency(
                minimumOrder
            ) +
            ".\n\n" +
            "O subtotal atual dos produtos é de " +
            formatCurrency(
                subtotalProdutos
            ) +
            "."
        );

        return;
    }

    const nome =
        document
            .getElementById(
                "nome-cliente"
            )
            ?.value
            .trim() ||
        "";

    const telefone =
        document
            .getElementById(
                "telefone-cliente"
            )
            ?.value
            .trim() ||
        "";

    const endereco =
        document
            .getElementById(
                "endereco"
            )
            ?.value
            .trim() ||
        "";

    const referencia =
        document
            .getElementById(
                "referencia"
            )
            ?.value
            .trim() ||
        "";

    const pagamento =
        paymentSelect?.value ||
        "";

    const troco =
        document
            .getElementById(
                "troco"
            )
            ?.value
            .trim() ||
        "";

    const observacao =
        document
            .getElementById(
                "observacao"
            )
            ?.value
            .trim() ||
        "";

    const tipoPedido =
        document
            .querySelector(
                'input[name="tipoPedido"]:checked'
            )
            ?.value ||
        "Entrega";


    /* =====================================================
       VALIDAÇÕES
    ===================================================== */

    if (
        !nome
    ) {

        alert(
            "Digite seu nome."
        );

        return;
    }

    if (
        !telefone
    ) {

        alert(
            "Digite seu telefone."
        );

        return;
    }

    const telefoneNumeros =
        telefone.replace(
            /\D/g,
            ""
        );

    if (
        telefoneNumeros.length <
        8
    ) {

        alert(
            "Digite um telefone válido."
        );

        return;
    }

    if (
        tipoPedido ===
        "Entrega"
        &&
        !endereco
    ) {

        alert(
            "Digite o endereço de entrega."
        );

        return;
    }

    if (
        !pagamento
    ) {

        alert(
            "Selecione a forma de pagamento."
        );

        return;
    }

    let trocoNumero =
        null;

    if (
        pagamento ===
        "Dinheiro"
        &&
        troco
    ) {

        trocoNumero =
            Number(
                String(
                    troco
                )
                    .replace(
                        ",",
                        "."
                    )
            );

        if (
            !Number.isFinite(
                trocoNumero
            )
        ) {

            alert(
                "Digite um valor válido para o troco."
            );

            return;
        }

        if (
            trocoNumero <
            calculateTotal()
        ) {

            alert(
                "O valor informado para troco não pode ser menor que o total do pedido."
            );

            return;
        }
    }

    if (
        pagamento ===
        "Dinheiro"
        &&
        !troco
    ) {

        const continuar =
            confirm(
                "Você não informou o valor para troco. Deseja continuar sem troco?"
            );

        if (
            !continuar
        ) {

            return;
        }
    }


    /* =====================================================
       NÚMERO DO PEDIDO
    ===================================================== */

    const numeroPedido =
        Date.now()
            .toString()
            .slice(
                -6
            );


    /* =====================================================
       VALORES
    ===================================================== */

    const taxaEntrega =
        getDeliveryFee();

    const totalPedido =
        subtotalProdutos +
        taxaEntrega;


    /* =====================================================
       DADOS DO PEDIDO
    ===================================================== */

    if (!storeSettings?.id) {
        alert("Erro: loja não identificada. Recarregue a página.");
        return;
    }

    const orderData = {

        order_number:
            numeroPedido,

        store_id:
            storeSettings?.id,

        customer_name:
            nome,

        customer_phone:
            telefone,

        order_type:
            tipoPedido,

        address:
            tipoPedido ===
                "Entrega"
                ? endereco
                : null,

        reference:
            tipoPedido ===
                "Entrega"
                ? referencia ||
                null
                : null,

        payment_method:
            pagamento,

        change_for:
            pagamento ===
                "Dinheiro"
                &&
                trocoNumero !==
                null

                ? trocoNumero
                : null,

        observation:
            observacao ||
            null,

        subtotal:
            subtotalProdutos,

        delivery_fee:
            taxaEntrega,

        total:
            totalPedido,

        status:
            "novo",

        items:
            cart.map(
                item => ({

                    product_id:
                        item.productId,

                    name:
                        item.name,

                    quantity:
                        item.quantity,

                    unit_price:
                        item.unitPrice,

                    extras:
                        item.extras ||
                        [],

                    observation:
                        item.observation ||
                        ""
                })
            )
    };


    /* =====================================================
       MENSAGEM WHATSAPP
    ===================================================== */

    /* =========================================
     MENSAGEM WHATSAPP
  ========================================= */

    let message =
        `*${storeSettings?.store_name || "Minha Loja"}*`
        +
        `\n\n*PEDIDO #${numeroPedido}*`
        +
        `\n\n*Cliente:* ${nome}`
        +
        `\n*Telefone:* ${telefone}`
        +
        `\n*Tipo:* ${tipoPedido}`;

    if (tipoPedido === "Entrega") {

        message +=
            `\n*Endereço:* ${endereco}`;

        if (referencia) {

            message +=
                `\n*Referência:* ${referencia}`;
        }
    }

    message +=
        `\n\n*ITENS DO PEDIDO*`;

    cart.forEach(item => {

        const subtotal =
            item.unitPrice *
            item.quantity;

        message +=
            `\n\n*${item.quantity}x ${item.name}*`
            +
            `\nValor unitário: ${formatCurrency(item.unitPrice)}`
            +
            `\nSubtotal: ${formatCurrency(subtotal)}`;

        if (item.extras && item.extras.length > 0) {

            message +=
                `\nAdicionais:`;

            item.extras.forEach(extra => {

                message +=
                    `\n- ${extra.name} (+${formatCurrency(extra.price)})`;
            });
        }

        if (item.observation) {

            message +=
                `\nObs.: ${item.observation}`;
        }
    });

    message +=
        `\n\n*RESUMO*`
        +
        `\nSubtotal: ${formatCurrency(subtotalProdutos)}`
        +
        `\nTaxa de entrega: ${formatCurrency(taxaEntrega)}`
        +
        `\n*TOTAL: ${formatCurrency(totalPedido)}*`
        +
        `\n\n*Pagamento:* ${pagamento}`;

    if (
        pagamento === "Dinheiro" &&
        trocoNumero !== null
    ) {

        message +=
            `\n*Troco para:* ${formatCurrency(trocoNumero)}`;
    }

    if (observacao) {

        message +=
            `\n\n*Observação geral:*`
            +
            `\n${observacao}`;
    }

    message +=
        `\n\nObrigado pela preferência!`;

    /* =====================================================
       BLOQUEAR DUPLO CLIQUE
    ===================================================== */

    setFinalizandoPedido(
        true
    );


    try {


        const pedidoSalvo =
            await salvarPedidoNoSupabase(
                orderData
            );

        if (
            !pedidoSalvo
        ) {

            const continuar =
                confirm(
                    "Não foi possível registrar o pedido no sistema.\n\nDeseja continuar mesmo assim para o WhatsApp?"
                );

            if (
                !continuar
            ) {

                return;
            }
        }

        const url =
            `https://wa.me/${whatsappNumber}`
            +
            `?text=${encodeURIComponent(
                message
            )}`;

        const whatsappWindow =
            window.open(
                url,
                "_blank"
            );

        if (
            !whatsappWindow
        ) {

            alert(
                "O navegador bloqueou a abertura do WhatsApp.\n\nPermita pop-ups para este site e tente novamente."
            );

            return;
        }

        /*
           Limpamos somente depois que conseguimos
           abrir o WhatsApp.
        */

        limparPedido();

    } catch (
    error
    ) {

        console.error(
            "Erro ao finalizar pedido:",
            error
        );

        alert(
            "Não foi possível finalizar o pedido. Tente novamente."
        );

    } finally {

        setFinalizandoPedido(
            false
        );
    }
}


/* =========================================================
   MODAL - CLICAR FORA
========================================================= */

modal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modal
        ) {

            fecharModal();
        }
    }
);


/* =========================================================
   ESC FECHA MODAL / CARRINHO
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            fecharModal();

            fecharCarrinhoMobile();
        }
    }
);


/* =========================================================
   EVENTOS
========================================================= */

/*
   Seu index.html atual ainda possui alguns eventos inline
   como oninput/onchange.
 
   Para não executar a mesma função duas vezes,
   NÃO adicionamos listeners duplicados aqui
   para busca, ordenação, entrega e pagamento.
*/

let storeSettingsRealtimeChannel = null;
let categoriesRealtimeChannel = null;

function iniciarRealtimeConfiguracoesLoja() {

    if (
        !supabaseClient ||
        !storeSettings?.id
    ) {
        return;
    }

    if (storeSettingsRealtimeChannel) {
        supabaseClient.removeChannel(
            storeSettingsRealtimeChannel
        );
    }

    storeSettingsRealtimeChannel =
        supabaseClient
            .channel(
                `store-settings-${storeSettings.id}`
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "store_settings",
                    filter:
                        `id=eq.${storeSettings.id}`
                },
                async () => {

                    await carregarConfiguracoesLoja();

                    updateCartTotal();
                }
            )
            .subscribe();
}
/* =========================================================
   INICIALIZAÇÃO
========================================================= */
function iniciarRealtimeCategorias() {

    if (
        !supabaseClient ||
        !storeSettings?.id
    ) {
        return;
    }

    if (categoriesRealtimeChannel) {
        supabaseClient.removeChannel(
            categoriesRealtimeChannel
        );
    }

    categoriesRealtimeChannel =
        supabaseClient
            .channel(
                `categories-${storeSettings.id}`
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "categories",
                    filter:
                        `store_id=eq.${storeSettings.id}`
                },
                async () => {

                    await carregarCategorias();

                    renderizarCategorias();
                }
            )
            .subscribe();
}

let produtosRealtimeChannel = null;

function iniciarRealtimeProdutos() {

    if (
        !supabaseClient ||
        !storeSettings?.id
    ) {
        return;
    }

    if (produtosRealtimeChannel) {
        supabaseClient.removeChannel(
            produtosRealtimeChannel
        );
    }

    produtosRealtimeChannel =
        supabaseClient
            .channel(
                `products-${storeSettings.id}`
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "products",
                    filter:
                        `store_id=eq.${storeSettings.id}`
                },
                async () => {
                    await carregarProdutos();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "products",
                    filter:
                        `store_id=eq.${storeSettings.id}`
                },
                async () => {
                    await carregarProdutos();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "products"
                },
                async () => {
                    await carregarProdutos();
                }
            )
            .subscribe();
}
async function iniciarCardapio() {


    alternarEntrega();

    alternarTroco();

    updateCart();

    const configuracoesCarregadas =
        await carregarConfiguracoesLoja();

    if (
        !configuracoesCarregadas
    ) {

        console.warn(
            "Configurações da loja não foram carregadas."
        );
    }

    if (configuracoesCarregadas) {
        iniciarRealtimeConfiguracoesLoja();
    }

    await carregarCategorias();
    renderizarCategorias();

    /*
       Recalculamos depois de carregar
       a taxa configurada no banco.
    */
    iniciarRealtimeCategorias();
    updateCartTotal();
    await carregarProdutos();
    iniciarRealtimeProdutos();


}

iniciarCardapio();