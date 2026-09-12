/* =========================================================
  CARDÁPIO DIGITAL
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

const createAccountBtn =
    document.getElementById("createAccountBtn");

const registerForm =
    document.getElementById("registerForm");

const backToLoginBtn =
    document.getElementById("backToLoginBtn");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const openStoreButton =
    document.getElementById("openStoreButton");

const copyStoreLinkButton =
    document.getElementById("copyStoreLinkButton");

const storePublicLink =
    document.getElementById("storePublicLink");

const exportBackupButton =
    document.getElementById("exportBackupButton");

const importBackupButton =
    document.getElementById("importBackupButton");

const importBackupFile =
    document.getElementById("importBackupFile");


/* =========================================================
   ELEMENTOS - CONFIGURAÇÕES DA LOJA
========================================================= */

const storeSettingsForm =
    document.getElementById("storeSettingsForm");

const storeSettingsId =
    document.getElementById("storeSettingsId");

const storeName =
    document.getElementById("storeName");

const storeSlogan =
    document.getElementById("storeSlogan");

const storeLogoUrl =
    document.getElementById("storeLogoUrl");

const storeSinceYear =
    document.getElementById("storeSinceYear");

const storeSecondaryPhone =
    document.getElementById("storeSecondaryPhone");

const storeThankYouMessage =
    document.getElementById("storeThankYouMessage");

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

const categoryForm =
    document.getElementById(
        "categoryForm"
    );

const categoryId =
    document.getElementById(
        "categoryId"
    );

const categoryName =
    document.getElementById(
        "categoryName"
    );

const categoryIcon =
    document.getElementById(
        "categoryIcon"
    );

const categoryActive =
    document.getElementById(
        "categoryActive"
    );

const categoriesList =
    document.getElementById(
        "categoriesList"
    );

let adminCategoriesData = [];

async function carregarCategorias() {

    if (!currentStoreSettingsId) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("categories")
            .select("*")
            .eq(
                "store_id",
                currentStoreSettingsId
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

        return;
    }

    adminCategoriesData =
        data || [];

    if (!categoriesList) {
        return;
    }

    categoriesList.innerHTML = "";

    adminCategoriesData.forEach(category => {

        const item =
            document.createElement("div");

        item.className =
            "category-admin-item";

        item.innerHTML = `
  <strong>${escapeHTML(category.name || "")}</strong>

    <span>
        ${category.active ? "Ativa" : "Inativa"}
    </span>

    <button
        type="button"
        class="category-status-button"
    >
        ${category.active ? "Inativar" : "Ativar"}
    </button>

    <button
        type="button"
        class="category-edit-button"
    >
        Editar
    </button>

    <button
        type="button"
        class="category-delete-button"
    >
        Excluir
    </button>
`;

        const statusButton =
            item.querySelector(
                ".category-status-button"
            );

        statusButton?.addEventListener(
            "click",
            async () => {

                const novoStatus =
                    !category.active;


                const {
                    error
                } =
                    await supabaseClient
                        .from("categories")
                        .update({
                            active: novoStatus
                        })
                        .eq(
                            "id",
                            category.id
                        )
                        .eq(
                            "store_id",
                            currentStoreSettingsId
                        );

                if (error) {

                    console.error(
                        "Erro ao alterar categoria:",
                        error
                    );

                    alert(
                        "Erro ao alterar categoria."
                    );

                    return;
                }

                await carregarCategorias();
                await carregarCategoriasNoSelect();
            }
        );

        const editButton =
            item.querySelector(
                ".category-edit-button"
            );

        editButton?.addEventListener(
            "click",
            () => {

                categoryId.value =
                    category.id;

                categoryName.value =
                    category.name;

                categoryActive.checked =
                    category.active;

                categoryIcon.value =
                    category.icon || "";

                categoryName.focus();
            }
        );


        const deleteButton =
            item.querySelector(
                ".category-delete-button"
            );

        deleteButton?.addEventListener(
            "click",
            async () => {

                const confirmar =
                    confirm(
                        `Excluir a categoria "${category.name}"?`
                    );

                if (!confirmar) {
                    return;
                }

                const {
                    error
                } =
                    await supabaseClient
                        .from("categories")
                        .delete()
                        .eq(
                            "id",
                            category.id
                        )
                        .eq(
                            "store_id",
                            currentStoreSettingsId
                        );

                if (error) {

                    console.error(
                        "Erro ao excluir categoria:",
                        error
                    );

                    alert(
                        "Erro ao excluir categoria."
                    );

                    return;
                }

                await carregarCategorias();
                await carregarCategoriasNoSelect();
            }
        );

        categoriesList.appendChild(
            item
        );
    });
}

async function carregarCategoriasNoSelect() {

    if (
        !currentStoreSettingsId ||
        !productCategory
    ) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("categories")
            .select("id, name, slug, active")
            .eq(
                "store_id",
                currentStoreSettingsId
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
            "Erro ao carregar categorias no produto:",
            error
        );

        return;
    }

    productCategory.innerHTML = `
        <option value="">
            Selecione uma categoria
        </option>
    `;

    data.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            category.slug;

        option.textContent =
            category.name;

        productCategory.appendChild(
            option
        );
    });
}

/* =========================================================
   ELEMENTOS - PEDIDOS
========================================================= */

const ordersList =
    document.getElementById("ordersList");

const refreshOrdersButton =
    document.getElementById("refreshOrdersButton");

const orderFilterButtons =
    document.querySelectorAll(".order-filter");

const orderPeriodButtons =
    document.querySelectorAll(
        ".order-period-button"
    );

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

const adminStoreName =
    document.getElementById(
        "adminStoreName"
    );

/* =========================================================
SALVAR CATEGORIA
========================================================= */

categoryForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const name =
            categoryName.value.trim();

        const active =
            categoryActive.checked;

        if (!name) {

            alert(
                "Informe o nome da categoria."
            );

            return;
        }

        if (!currentStoreSettingsId) {

            alert(
                "Erro: loja não identificada."
            );

            return;
        }

        const slug =
            name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

        const icon =
            categoryIcon?.value.trim() ||
            "🍽️";

        const categoryData = {
            name,
            slug,
            icon,
            active,
            store_id: currentStoreSettingsId
        };

        let error;

        if (categoryId.value) {

            const response =
                await supabaseClient
                    .from("categories")
                    .update(categoryData)
                    .eq(
                        "id",
                        categoryId.value
                    )
                    .eq(
                        "store_id",
                        currentStoreSettingsId
                    );

            error =
                response.error;

        } else {

            const response =
                await supabaseClient
                    .from("categories")
                    .insert(categoryData);

            error =
                response.error;
        }
        if (error) {

            console.error(
                "Erro ao salvar categoria:",
                error
            );

            alert(
                "Erro ao salvar categoria."
            );

            return;
        }

        alert(
            "Categoria cadastrada com sucesso!"
        );

        categoryForm.reset();

        categoryId.value = "";

        categoryActive.checked =
            true;

        await carregarCategorias();

        await carregarCategoriasNoSelect();
    }
);


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

let currentOrderPeriod = "hoje";

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

const productImageFile =
    document.getElementById("productImageFile");

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

createAccountBtn?.addEventListener(
    "click",
    () => {

        loginForm?.classList.add("hidden");

        registerForm?.classList.remove("hidden");

        loginError.textContent = "";
    }
);

backToLoginBtn?.addEventListener(
    "click",
    () => {

        registerForm?.classList.add("hidden");

        loginForm?.classList.remove("hidden");

        loginError.textContent = "";
    }
);

registerForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        if (!verificarSupabase()) {
            return;
        }

        const email =
            document
                .getElementById("registerEmail")
                ?.value
                .trim() || "";

        const password =
            document
                .getElementById("registerPassword")
                ?.value || "";

        const passwordConfirm =
            document
                .getElementById("registerPasswordConfirm")
                ?.value || "";

        loginError.textContent = "";

        if (!email) {
            loginError.textContent =
                "Informe um e-mail.";
            return;
        }

        if (password.length < 6) {
            loginError.textContent =
                "A senha deve ter pelo menos 6 caracteres.";
            return;
        }

        if (password !== passwordConfirm) {
            loginError.textContent =
                "As senhas não coincidem.";
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo:
                            "https://andersonnewdev-svg.github.io/card-pio-digital-Netinho-lanches/admin.html"
                    }
                });

        if (error) {
            console.error(
                "Erro ao criar conta:",
                error
            );

            loginError.textContent =
                "Não foi possível criar a conta: " +
                error.message;

            return;
        }

        if (data.session) {
            alert("✅ Conta criada com sucesso!");

            await showAdminPanel();
            return;
        }

        alert(
            "✅ Conta criada! Verifique seu e-mail para confirmar o cadastro."
        );

        registerForm.reset();

        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
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

    await carregarConfiguracoesLoja();

    await Promise.all([
        carregarProdutos(),
        carregarPedidos(),
        carregarCategorias(),
        carregarCategoriasNoSelect()
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

    if (!verificarSupabase()) {
        return false;
    }

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient.auth
            .getUser();

    if (
        userError ||
        !userData?.user
    ) {

        console.error(
            "Erro ao identificar usuário:",
            userError
        );

        return false;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("store_settings")
            .select("*")
            .eq(
                "owner_id",
                userData.user.id
            )
            .limit(1)
            .maybeSingle();

    if (error) {

        console.error(
            "Erro ao carregar configurações:",
            error
        );

        return false;
    }

    if (!data) {

        console.warn(
            "Nenhuma loja encontrada para este usuário."
        );

        currentStoreSettingsId =
            null;

        alert(
            "👋 Bem-vindo ao Cardápio Digital!\n\n" +
            "Para começar, configure os dados da sua loja abaixo.\n\n" +
            "Depois de salvar, você poderá cadastrar categorias, produtos e receber pedidos."
        );

        return false;
    }

    currentStoreSettingsId =
        data.id;

    if (storePublicLink) {
        if (data.slug) {
            const publicUrl =
                new URL(
                    "index.html",
                    window.location.href
                );

            publicUrl.searchParams.set(
                "loja",
                data.slug
            );

            storePublicLink.value =
                publicUrl.href;
        } else {
            storePublicLink.value = "";
        }
    }

    if (openStoreButton) {
        openStoreButton.onclick = () => {

            if (!data.slug) {
                alert("Esta loja ainda não possui um link.");
                return;
            }

            window.open(
                `index.html?loja=${encodeURIComponent(data.slug)}`,
                "_blank"
            );
        };
    }

    if (copyStoreLinkButton) {
        copyStoreLinkButton.onclick = async () => {

            if (!data.slug) {
                alert("Esta loja ainda não possui um link.");
                return;
            }

            const storeLinkUrl =
                new URL(
                    "index.html",
                    window.location.href
                );

            storeLinkUrl.searchParams.set(
                "loja",
                data.slug
            );

            const storeLink =
                storeLinkUrl.href;

            try {
                await navigator.clipboard.writeText(storeLink);

                alert("✅ Link do cardápio copiado!");
            } catch (error) {
                console.error(
                    "Erro ao copiar link:",
                    error
                );

                alert("❌ Não foi possível copiar o link.");
            }
        };
    }

    if (adminStoreName) {
        adminStoreName.textContent =
            `🍔 ${data.store_name || "Minha Loja"}`;
    }

    if (storeSettingsId) {

        storeSettingsId.value =
            data.id;
    }

    storeName.value =
        data.store_name || "";

    storeSlogan.value =
        data.slogan || "";

    storeLogoUrl.value =
        data.logo_url || "";

    if (storeLogoPreview) {

        storeLogoPreview.innerHTML =
            data.logo_url
                ? `
                    <img
                        src="${escapeHTML(data.logo_url)}"
                        alt="Logo atual da loja"
                        style="
                            width: 90px;
                            height: 90px;
                            object-fit: contain;
                            border-radius: 12px;
                            margin-top: 10px;
                        "
                    >
                `
                : "";
    }

    storeSinceYear.value =
        data.since_year || "";

    storeWhatsapp.value =
        data.whatsapp || "";

    storeSecondaryPhone.value =
        data.secondary_phone || "";

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

    storeThankYouMessage.value =
        data.thank_you_message || "";

    return true;
}

/* =========================================================
   SALVAR CONFIGURAÇÕES
========================================================= */

storeSettingsForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        let id =
            currentStoreSettingsId;

        const {
            data: userData,
            error: userError
        } =
            await supabaseClient.auth.getUser();

        if (
            userError ||
            !userData?.user
        ) {

            alert(
                "❌ Usuário não autenticado."
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

        let logoUrl =
            storeLogoUrl?.value || null;

        if (id) {

            try {

                logoUrl =
                    await uploadLogoLoja();

            } catch (error) {

                alert(
                    "❌ Não foi possível enviar a logo.\n\n" +
                    error.message
                );

                return;
            }
        }

        const settingsData = {

            store_name:
                storeName.value.trim(),

            slogan:
                storeSlogan.value.trim(),

            logo_url:
                logoUrl,

            since_year:
                storeSinceYear.value.trim() || null,

            whatsapp:
                storeWhatsapp.value.trim(),

            secondary_phone:
                storeSecondaryPhone.value.trim() || null,

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
                openingTime.value || null,

            closing_time:
                closingTime.value || null,

            thank_you_message:
                storeThankYouMessage.value.trim() || null,

            updated_at:
                new Date().toISOString()

        };

        let error;

        const botaoSalvar = event.submitter;
        const textoOriginalBotao =
            botaoSalvar?.innerHTML;

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.innerHTML = "Salvando...";
        }

        if (!id) {

            const slugBase =
                storeName.value
                    .trim()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");

            const novoSlug =
                `${slugBase}-${Date.now()}`;

            const {
                data: novaLoja,
                error: insertError
            } =
                await supabaseClient
                    .from("store_settings")
                    .insert({
                        ...settingsData,
                        owner_id:
                            userData.user.id,
                        slug:
                            novoSlug
                    })
                    .select("id")
                    .single();

            error =
                insertError;

            if (!error) {

                id =
                    novaLoja.id;

                currentStoreSettingsId =
                    novaLoja.id;

                try {
                    logoUrl =
                        await uploadLogoLoja();

                    const { error: logoUpdateError } =
                        await supabaseClient
                            .from("store_settings")
                            .update({
                                logo_url: logoUrl
                            })
                            .eq(
                                "id",
                                novaLoja.id
                            )
                            .eq(
                                "owner_id",
                                userData.user.id
                            );

                    if (logoUpdateError) {
                        throw logoUpdateError;
                    }

                } catch (logoError) {
                    console.error(
                        "Erro ao enviar logo da nova loja:",
                        logoError
                    );
                }
            }

        } else {

            const {
                error: updateError
            } =
                await supabaseClient
                    .from("store_settings")
                    .update(
                        settingsData
                    )
                    .eq(
                        "id",
                        id
                    )
                    .eq(
                        "owner_id",
                        userData.user.id
                    );

            error =
                updateError;
        }

        if (error) {

            console.error(
                "Erro ao salvar configurações:",
                error
            );

            alert(
                "❌ Erro ao salvar configurações:\n\n" +
                error.message
            );

            if (botaoSalvar) {
                botaoSalvar.disabled = false;
                botaoSalvar.innerHTML =
                    textoOriginalBotao;
            }

            return;
        }

        if (botaoSalvar) {
            botaoSalvar.disabled = false;
            botaoSalvar.innerHTML =
                textoOriginalBotao;
        }

        alert(
            "✅ Configurações salvas com sucesso!"
        );

        await carregarConfiguracoesLoja();
    }
);

const storeLogoFile =
    document.getElementById("storeLogoFile");

const storeLogoPreview =
    document.getElementById("storeLogoPreview");
/* =========================================================
   PEDIDO É DE HOJE
========================================================= */

storeLogoFile?.addEventListener(
    "change",
    () => {

        const file =
            storeLogoFile.files?.[0];

        if (!file) {
            return;
        }

        const previewUrl =
            URL.createObjectURL(file);

        storeLogoPreview.innerHTML = `
            <img
                src="${previewUrl}"
                alt="Prévia da logo"
                style="
                    width: 90px;
                    height: 90px;
                    object-fit: contain;
                    border-radius: 12px;
                    margin-top: 10px;
                "
            >
        `;
    }
);

async function uploadLogoLoja() {

    if (
        !storeLogoFile ||
        !storeLogoFile.files ||
        storeLogoFile.files.length === 0
    ) {
        return storeLogoUrl?.value || null;
    }

    const file =
        storeLogoFile.files[0];

    // Validação do tipo de arquivo
    if (!file.type.startsWith("image/")) {
        throw new Error(
            "Selecione um arquivo de imagem válido para a logo."
        );
    }

    // Limite máximo: 5 MB
    const maxSize =
        5 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error(
            "A logo deve ter no máximo 5 MB."
        );
    }

    // Formatos permitidos
    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const formatosPermitidos =
        ["jpg", "jpeg", "png", "webp"];

    if (!formatosPermitidos.includes(extension)) {
        throw new Error(
            "Formato não permitido. Use JPG, JPEG, PNG ou WEBP."
        );
    }
    const fileName =
        `logo.${extension}`;

    const filePath =
        `${currentStoreSettingsId}/logos/${fileName}`;

    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from("product-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: true
                }
            );

    if (uploadError) {

        console.error(
            "Erro ao enviar logo:",
            uploadError
        );

        throw uploadError;
    }

    const {
        data
    } =
        supabaseClient
            .storage
            .from("product-images")
            .getPublicUrl(
                filePath
            );

    const publicUrl =
        data?.publicUrl
            ? `${data.publicUrl}?v=${Date.now()}`
            : null;

    if (storeLogoUrl) {
        storeLogoUrl.value =
            publicUrl || "";
    }

    return publicUrl;
}

async function uploadImagemProduto() {

    if (!productImageFile?.files?.length) {
        return productImage?.value?.trim() || null;
    }

    if (!currentStoreSettingsId) {
        throw new Error("Loja não identificada.");
    }

    const file =
        productImageFile.files[0];

    // Validação do tipo de arquivo
    if (!file.type.startsWith("image/")) {
        throw new Error(
            "Selecione um arquivo de imagem válido."
        );
    }

    // Limite máximo: 5 MB
    const maxSize =
        5 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error(
            "A imagem deve ter no máximo 5 MB."
        );
    }

    const extension =
        file.name
            .split(".")
            .pop()
            ?.toLowerCase();

    const formatosPermitidos =
        ["jpg", "jpeg", "png", "webp"];

    if (
        !extension ||
        !formatosPermitidos.includes(extension)
    ) {
        throw new Error(
            "Formato não permitido. Use JPG, JPEG, PNG ou WebP."
        );
    }

    const fileName =
        `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${extension}`;

    const filePath =
        `${currentStoreSettingsId}/products/${fileName}`;

    const { error: uploadError } =
        await supabaseClient.storage
            .from("product-images")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );

    if (uploadError) {
        throw uploadError;
    }

    const {
        data: publicUrlData
    } =
        supabaseClient.storage
            .from("product-images")
            .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}
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
    if (!currentStoreSettingsId) {
        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .eq(
                "store_id",
                currentStoreSettingsId
            )
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

    const pedidosPeriodo =
        currentOrderPeriod ===
            "todos"

            ? orders

            : orders.filter(
                pedidoEhDeHoje
            );

    if (countTodos) {

        countTodos.textContent =
            pedidosPeriodo.length;
    }

    if (countNovo) {

        countNovo.textContent =
            pedidosPeriodo.filter(
                pedido =>
                    pedido.status ===
                    "novo"
            ).length;
    }

    if (countPreparando) {

        countPreparando.textContent =
            pedidosPeriodo.filter(
                pedido =>
                    pedido.status ===
                    "preparando"
            ).length;
    }

    if (countSaiuEntrega) {

        countSaiuEntrega.textContent =
            pedidosPeriodo.filter(
                pedido =>
                    pedido.status ===
                    "saiu_entrega"
            ).length;
    }

    if (countConcluido) {

        countConcluido.textContent =
            pedidosPeriodo.filter(
                pedido =>
                    pedido.status ===
                    "concluido"
            ).length;
    }

    if (countCancelado) {

        countCancelado.textContent =
            pedidosPeriodo.filter(
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

orderPeriodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentOrderPeriod =
                    button.dataset.period;

                orderPeriodButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );

                button.classList.add(
                    "active"
                );

                atualizarContadoresPedidos();

                renderizarPedidos();
            }
        );
    }
);

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

    const pedidosPeriodo =
        currentOrderPeriod ===
            "todos"

            ? orders

            : orders.filter(
                pedidoEhDeHoje
            );

    const pedidosFiltrados =
        currentOrderStatus ===
            "todos"

            ? pedidosPeriodo

            : pedidosPeriodo.filter(
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
                status: novoStatus
            })
            .eq(
                "id",
                id
            )
            .eq(
                "store_id",
                currentStoreSettingsId
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
                    table: "orders",
                    filter: `store_id=eq.${currentStoreSettingsId}`
                },

                async payload => {

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
                    table: "orders",
                    filter:
                        `store_id=eq.${currentStoreSettingsId}`
                },
                async () => {
                    await carregarPedidos();
                }
            )
            .subscribe(
                status => {


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


}


/* =========================================================
   TOCAR BEEP
========================================================= */

function tocarSomNovoPedido() {

    if (!orderAudioContext) {



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
async function exportarBackupLoja() {

    if (!currentStoreSettingsId) {
        alert("❌ Loja não identificada.");
        return;
    }

    try {

        const {
            data: userData,
            error: userError
        } =
            await supabaseClient.auth.getUser();

        if (
            userError ||
            !userData?.user
        ) {
            alert("❌ Usuário não autenticado.");
            return;
        }

        const [
            configuracoesResult,
            categoriasResult,
            produtosResult,
            pedidosResult
        ] = await Promise.all([

            supabaseClient
                .from("store_settings")
                .select("*")
                .eq(
                    "id",
                    currentStoreSettingsId
                )
                .eq(
                    "owner_id",
                    userData.user.id
                )
                .single(),

            supabaseClient
                .from("categories")
                .select("*")
                .eq("store_id", currentStoreSettingsId),

            supabaseClient
                .from("products")
                .select("*")
                .eq("store_id", currentStoreSettingsId),

            supabaseClient
                .from("orders")
                .select("*")
                .eq(
                    "store_id",
                    currentStoreSettingsId
                )
        ]);

        if (configuracoesResult.error) {
            throw configuracoesResult.error;
        }

        if (categoriasResult.error) {
            throw categoriasResult.error;
        }

        if (produtosResult.error) {
            throw produtosResult.error;
        }

        if (pedidosResult.error) {
            throw pedidosResult.error;
        }

        const backup = {
            version: "4.0",
            exported_at:
                new Date().toISOString(),

            store:
                configuracoesResult.data,

            categories:
                categoriasResult.data || [],

            products:
                produtosResult.data || [],

            orders:
                pedidosResult.data || []
        };

        const json =
            JSON.stringify(
                backup,
                null,
                2
            );

        const blob =
            new Blob(
                [json],
                {
                    type: "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        const slug =
            configuracoesResult.data?.slug ||
            "loja";

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        link.href = url;

        link.download =
            `backup-${slug}-${date}.json`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        alert(
            "✅ Backup exportado com sucesso!"
        );

    } catch (error) {

        console.error(
            "Erro ao exportar backup:",
            error
        );

        alert(
            "❌ Não foi possível exportar o backup.\n\n" +
            error.message
        );
    }
}


exportBackupButton?.addEventListener(
    "click",
    exportarBackupLoja
);

importBackupButton?.addEventListener(
    "click",
    () => {
        importBackupFile?.click();
    }
);

importBackupFile?.addEventListener(
    "change",
    async () => {

        const file =
            importBackupFile.files?.[0];

        if (!file) {
            return;
        }

        try {

            if (
                file.type &&
                file.type !== "application/json"
            ) {
                throw new Error(
                    "Selecione um arquivo JSON válido."
                );
            }

            const text =
                await file.text();

            const backup =
                JSON.parse(text);

            if (
                !backup ||
                !backup.store ||
                !Array.isArray(backup.categories) ||
                !Array.isArray(backup.products)
            ) {
                throw new Error(
                    "Este arquivo não parece ser um backup válido do Cardápio Digital."
                );
            }

            if (backup.version !== "4.0") {
                throw new Error(
                    "Versão de backup incompatível."
                );
            }

            const confirmado =
                confirm(
                    "⚠️ Backup válido encontrado.\n\n" +
                    `Loja: ${backup.store.store_name || "Sem nome"}\n` +
                    `Categorias: ${backup.categories.length}\n` +
                    `Produtos: ${backup.products.length}\n\n` +
                    "Deseja continuar com a restauração?"
                );

            if (!confirmado) {
                importBackupFile.value = "";
                return;
            }

            const {
                error: restoreError
            } =
                await supabaseClient
                    .rpc(
                        "restore_store_backup",
                        {
                            p_store_id:
                                currentStoreSettingsId,

                            p_store:
                                backup.store,

                            p_categories:
                                backup.categories,

                            p_products:
                                backup.products,

                            p_orders:
                                Object.prototype.hasOwnProperty.call(
                                    backup,
                                    "orders"
                                )
                                    ? backup.orders
                                    : null
                        }
                    );

            if (restoreError) {
                throw restoreError;
            }

            await carregarConfiguracoesLoja();

            await Promise.all([
                carregarCategorias(),
                carregarCategoriasNoSelect(),
                carregarProdutos()
            ]);

            alert(
                "✅ Backup restaurado com sucesso!"
            );
        } catch (error) {

            console.error(
                "Erro ao ler backup:",
                error
            );

            alert(
                "❌ Não foi possível importar o backup.\n\n" +
                error.message
            );

        } finally {

            importBackupFile.value = "";

        }
    }
);
async function carregarProdutos() {

    if (!verificarSupabase()) {
        return;
    }
    if (!currentStoreSettingsId) {

        if (adminProducts) {
            adminProducts.innerHTML = "";
        }

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
            .eq(
                "store_id",
                currentStoreSettingsId
            )
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

    const foundCategory =
        adminCategoriesData.find(
            item =>
                item.slug ===
                category
        );

    return (
        foundCategory?.name ||
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

        let imagemAntigaUrl = null;

        if (productId?.value) {
            const produtoAtual =
                adminProductsData.find(
                    product =>
                        String(product.id) ===
                        String(productId.value)
                );

            imagemAntigaUrl =
                produtoAtual?.image_url || null;
        }

        let image_url;

        try {
            image_url =
                await uploadImagemProduto();
        } catch (error) {
            console.error(
                "Erro ao enviar imagem do produto:",
                error
            );

            alert(
                "❌ Não foi possível enviar a imagem do produto.\n\n" +
                error.message
            );

            return;
        }
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
            available,
            store_id: currentStoreSettingsId
        };

        const id =
            productId.value;

        let error =
            null;

        if (id) {

            const result =
                await supabaseClient
                    .from("products")
                    .update(productData)
                    .eq(
                        "id",
                        id
                    )
                    .eq(
                        "store_id",
                        currentStoreSettingsId
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

        if (
            id &&
            productImageFile?.files?.length &&
            imagemAntigaUrl &&
            imagemAntigaUrl !== image_url &&
            imagemAntigaUrl.includes(
                "/storage/v1/object/public/product-images/"
            )
        ) {
            try {
                const storagePath =
                    imagemAntigaUrl
                        .split(
                            "/storage/v1/object/public/product-images/"
                        )[1]
                        ?.split("?")[0];

                if (storagePath) {
                    const { error: storageError } =
                        await supabaseClient.storage
                            .from("product-images")
                            .remove([
                                decodeURIComponent(storagePath)
                            ]);

                    if (storageError) {
                        console.error(
                            "Erro ao excluir imagem antiga:",
                            storageError
                        );
                    }
                }

            } catch (storageError) {
                console.error(
                    "Erro ao processar imagem antiga:",
                    storageError
                );
            }
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
            .eq(
                "store_id",
                currentStoreSettingsId
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
        data.category || "";

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
                available: novoStatus
            })
            .eq(
                "id",
                id
            )
            .eq(
                "store_id",
                currentStoreSettingsId
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
        data: produto,
        error: produtoError
    } =
        await supabaseClient
            .from("products")
            .select("image_url")
            .eq("id", id)
            .eq(
                "store_id",
                currentStoreSettingsId
            )
            .maybeSingle();

    if (produtoError) {
        console.error(
            "Erro ao buscar imagem do produto:",
            produtoError
        );

        alert(
            "❌ Não foi possível localizar o produto."
        );

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
            )
            .eq(
                "store_id",
                currentStoreSettingsId
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

    if (
        produto?.image_url &&
        produto.image_url.includes(
            "/storage/v1/object/public/product-images/"
        )
    ) {
        try {
            const storagePath =
                produto.image_url
                    .split(
                        "/storage/v1/object/public/product-images/"
                    )[1]
                    ?.split("?")[0];

            if (storagePath) {
                const { error: storageError } =
                    await supabaseClient.storage
                        .from("product-images")
                        .remove([
                            decodeURIComponent(storagePath)
                        ]);

                if (storageError) {
                    console.error(
                        "Erro ao excluir imagem do Storage:",
                        storageError
                    );
                }
            }

        } catch (storageError) {
            console.error(
                "Erro ao processar exclusão da imagem:",
                storageError
            );
        }
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



    await checkLogin();
}


iniciarAdmin();