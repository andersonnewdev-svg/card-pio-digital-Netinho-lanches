/* =========================================================
   NETTINHO LANCHES - PAINEL SAAS
   ADMINISTRAÇÃO GERAL
========================================================= */


/* =========================================================
   ELEMENTOS DA INTERFACE
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const accessDenied =
    document.getElementById("accessDenied");

const app =
    document.getElementById("saasPanel");


/* =========================================================
   ESTADO DO PAINEL
========================================================= */

let currentUser = null;

let currentAdmin = null;

let stores = [];

let subscriptions = [];

let selectedStore = null;
let selectedSubscription = null;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await iniciarPainelSaas();

        } catch (error) {

            console.error(
                "Erro ao iniciar painel SaaS:",
                error
            );

            mostrarAcessoNegado();

        }

    }
);


/* =========================================================
   INICIAR PAINEL SAAS
========================================================= */
async function iniciarPainelSaas() {

    console.log(
        "Iniciando painel SaaS..."
    );

    const usuarioValido =
        await verificarUsuario();

    if (!usuarioValido) {
        window.location.replace("saas-login.html");
        return;
    }

    const administradorValido =
        await verificarAdministradorSaas();

    if (!administradorValido) {
        mostrarAcessoNegado();
        return;
    }

    console.log(
        "Acesso autorizado ao painel SaaS."
    );

    await carregarLojas();

    await carregarAssinaturas();

    mostrarPainel();

}

async function carregarLojas() {

    const { data, error } = await supabaseClient
        .from("store_settings")
        .select("*")
        .order("store_name", { ascending: true });

    if (error) {
        console.error(
            "Erro ao carregar lojas:",
            error
        );

        stores = [];
        return;
    }

    stores = data || [];

    console.log(
        "Lojas carregadas:",
        stores
    );
}

async function carregarAssinaturas() {

    const { data, error } = await supabaseClient
        .from("subscriptions")
        .select("*");

    if (error) {
        console.error(
            "Erro ao carregar assinaturas:",
            error
        );

        subscriptions = [];
        return;
    }

    subscriptions = data || [];

    console.log(
        "Assinaturas carregadas:",
        subscriptions
    );
}

/* =========================================================
   VERIFICAR USUÁRIO AUTENTICADO
========================================================= */

async function verificarUsuario() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {

        if (error.name === "AuthSessionMissingError") {
            console.warn("Nenhuma sessão ativa.");
            return false;
        }

        throw error;
    }
    if (!data?.user) {

        console.warn(
            "Nenhum usuário autenticado."
        );

        return false;
    }

    currentUser = data.user;

    console.log(
        "Usuário autenticado:",
        currentUser.email
    );

    return true;
}


/* =========================================================
   VERIFICAR ADMINISTRADOR SAAS
========================================================= */

async function verificarAdministradorSaas() {

    if (!currentUser) {
        return false;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("saas_admins")
        .select("id, user_id, role, created_at")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {

        console.warn(
            "Usuário não possui acesso ao painel SaaS."
        );

        return false;
    }

    currentAdmin = data;

    console.log(
        "Administrador SaaS:",
        currentAdmin.role
    );

    return (
        currentAdmin.role === "admin" ||
        currentAdmin.role === "super_admin"
    );
}


/* =========================================================
   CONTROLE DE ACESSO
========================================================= */

function mostrarAcessoNegado() {

    if (loadingScreen) {
        loadingScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }

    if (accessDenied) {
        accessDenied.classList.remove("hidden");
    }

}


function mostrarPainel() {

    if (loadingScreen) {
        loadingScreen.classList.add("hidden");
    }

    if (accessDenied) {
        accessDenied.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }

    const totalStores =
        document.getElementById("totalStores");

    if (totalStores) {
        totalStores.textContent = stores.length;
    }

    const trialStores =
        document.getElementById("trialStores");

    const activeStores =
        document.getElementById("activeStores");

    const blockedStores =
        document.getElementById("blockedStores");

    const expiredStores =
        document.getElementById("expiredStores");

    const totalTrial = subscriptions.filter(
        subscription => subscription.status === "trial"
    ).length;

    const totalActive = subscriptions.filter(
        subscription => subscription.status === "active"
    ).length;

    const totalBlocked = subscriptions.filter(
        subscription => subscription.status === "blocked"
    ).length;

    const totalExpired = subscriptions.filter(
        subscription => subscription.status === "overdue"
    ).length;

    if (trialStores) {
        trialStores.textContent = totalTrial;
    }

    if (activeStores) {
        activeStores.textContent = totalActive;
    }

    if (blockedStores) {
        blockedStores.textContent = totalBlocked;
    }

    if (expiredStores) {
        expiredStores.textContent = totalExpired;
    }

    const recentStoresTable =
        document.getElementById("recentStoresTable");

    if (recentStoresTable) {

        recentStoresTable.innerHTML = "";

        stores.slice(0, 5).forEach((store) => {

            const subscription = subscriptions.find(
                (sub) => sub.store_id === store.id
            );

            const row = document.createElement("tr");

            row.innerHTML = `
    <td>${store.store_name || "Sem nome"}</td>
    <td>${subscription?.plan || "-"}</td>
    <td>${subscription?.status || "-"}</td>
`;

            recentStoresTable.appendChild(row);
        });
    }

    const storesTable =
        document.getElementById("storesTable");

    if (storesTable) {

        storesTable.innerHTML = "";

        stores.forEach((store) => {

            const subscription = subscriptions.find(
                (sub) => sub.store_id === store.id
            );

            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${store.store_name || "Sem nome"}</td>
            <td>${store.whatsapp || "-"}</td>
            <td>${store.slug || "-"}</td>
            <td>${subscription?.plan || "-"}</td>
            <td>${subscription?.status || "-"}</td>
            <td>
    <button
        class="manage-store-button"
        data-store-id="${store.id}"
    >
        Gerenciar
    </button>
</td>
        `;

            storesTable.appendChild(row);
            const manageButton =
                row.querySelector(".manage-store-button");

            manageButton.addEventListener("click", () => {

                const subscription = subscriptions.find(
                    (sub) => sub.store_id === store.id
                );
                selectedStore = store;
                selectedSubscription = subscription || null;

                const seletorPlano =
                    document.getElementById("subscriptionPlan");

                if (seletorPlano) {
                    seletorPlano.value =
                        selectedSubscription?.plan === "pro"
                            ? "pro"
                            : "basic";
                }

                const botaoAlterarPlanoModal =
                    document.getElementById("changePlanButton");

                if (botaoAlterarPlanoModal) {
                    botaoAlterarPlanoModal.style.display =
                        selectedSubscription?.status === "active"
                            ? "inline-block"
                            : "none";
                }

                console.log(
                    "Loja para gerenciamento:",
                    selectedStore?.store_name,
                    selectedStore?.id
                );

                console.log(
                    "Assinatura para gerenciamento:",
                    selectedSubscription
                );

                const storeModal =
                    document.getElementById("storeModal");

                document.getElementById("modalStoreName")
                    .textContent = store.store_name || "-";

                document.getElementById("modalStoreWhatsapp")
                    .textContent = store.whatsapp || "-";

                document.getElementById("modalStoreSlug")
                    .textContent = store.slug || "-";

                document.getElementById("modalStorePlan")
                    .textContent =
                    subscription?.plan === "trial"
                        ? "Teste"
                        : subscription?.plan === "basic"
                            ? "Básico"
                            : subscription?.plan === "pro"
                                ? "Pro"
                                : "-";
                document.getElementById("modalStoreStatus")
                    .textContent =
                    subscription?.status === "trial"
                        ? "Em teste"
                        : subscription?.status === "active"
                            ? "Ativa"
                            : subscription?.status === "overdue"
                                ? "Vencida"
                                : subscription?.status === "blocked"
                                    ? "Bloqueada"
                                    : "-";
                const blockButton =
                    document.getElementById("blockStoreButton");

                const unblockButton =
                    document.getElementById("unblockStoreButton");

                const activateSubscriptionButton =
                    document.getElementById("activateSubscriptionButton");

                const isBlocked =
                    subscription?.status === "blocked";

                if (blockButton) {
                    blockButton.style.display =
                        isBlocked ? "none" : "inline-block";
                }

                if (unblockButton) {
                    unblockButton.style.display =
                        isBlocked ? "inline-block" : "none";
                }

                if (activateSubscriptionButton) {
                    activateSubscriptionButton.style.display =
                        subscription?.status === "overdue"
                            ? "inline-block"
                            : "none";
                }

                const trialEnd = subscription?.trial_ends_at
                    ? new Date(subscription.trial_ends_at)
                        .toLocaleDateString("pt-BR")
                    : "-";

                const modalTrialEnd =
                    document.getElementById("modalTrialEnd");

                const trialEndRow =
                    modalTrialEnd.parentElement;

                if (subscription?.plan === "trial") {
                    trialEndRow.style.display = "";
                    modalTrialEnd.textContent = trialEnd;
                } else {
                    trialEndRow.style.display = "none";
                }
                const subscriptionEnd =
                    subscription?.subscription_ends_at
                        ? new Date(subscription.subscription_ends_at)
                            .toLocaleDateString("pt-BR")
                        : "-";

                document.getElementById("modalSubscriptionEnd")
                    .textContent = subscriptionEnd;

                storeModal.classList.remove("hidden");

            });

        });

    }

    const subscriptionsTable =
        document.getElementById("subscriptionsTable");

    if (subscriptionsTable) {

        subscriptionsTable.innerHTML = "";

        subscriptions.forEach((subscription) => {

            const store = stores.find(
                (item) => item.id === subscription.store_id
            );

            const trialEnd = subscription.trial_ends_at
                ? new Date(subscription.trial_ends_at)
                    .toLocaleDateString("pt-BR")
                : "-";

            const subscriptionEnd =
                subscription.subscription_ends_at
                    ? new Date(subscription.subscription_ends_at)
                        .toLocaleDateString("pt-BR")
                    : "-";

            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${store?.store_name || "Loja não encontrada"}</td>
            <td>${subscription.plan || "-"}</td>
            <td>${subscription.status || "-"}</td>
            <td>${trialEnd}</td>
            <td>${subscriptionEnd}</td>
        `;

            subscriptionsTable.appendChild(row);
        });
    }

}

/* =========================================================
   NAVEGAÇÃO DO PAINEL SAAS
========================================================= */

const menuItems = document.querySelectorAll(".menu-item");
const pageSections = document.querySelectorAll(".page-section");

menuItems.forEach((button) => {

    button.addEventListener("click", () => {

        const sectionName = button.dataset.section;

        // Remove o ativo dos botões
        menuItems.forEach((item) => {
            item.classList.remove("active");
        });

        // Ativa o botão clicado
        button.classList.add("active");

        // Esconde todas as seções
        pageSections.forEach((section) => {
            section.classList.remove("active");
        });

        // Procura a seção correspondente
        const targetSection =
            document.getElementById(
                `${sectionName}Section`
            );

        if (targetSection) {
            targetSection.classList.add("active");
        } else {
            console.error(
                "Seção não encontrada:",
                `${sectionName}Section`
            );
        }

    });

});

/* =========================================================
   FECHAR MODAL - GERENCIAR LOJA
========================================================= */

const storeModal =
    document.getElementById("storeModal");

const closeStoreModal =
    document.getElementById("closeStoreModal");

if (closeStoreModal && storeModal) {

    closeStoreModal.addEventListener("click", () => {
        storeModal.classList.add("hidden");
    });

}

/* =========================================================
   BLOQUEAR LOJA
========================================================= */

const blockStoreButton =
    document.getElementById("blockStoreButton");

if (blockStoreButton) {

    blockStoreButton.addEventListener("click", async () => {
        if (!selectedStore || !selectedSubscription) {
            alert("Nenhuma loja válida selecionada.");
            return;
        }

        console.log(
            "Preparando bloqueio da loja:",
            selectedStore.store_name,
            selectedStore.id
        );

        const confirmar = confirm(
            `Deseja realmente bloquear a loja "${selectedStore.store_name}"?`
        );

        if (!confirmar) {
            return;
        }

        console.log(
            "Bloqueio confirmado:",
            selectedStore.store_name
        );

        const { error } = await supabaseClient
            .from("subscriptions")
            .update({
                status: "blocked"
            })
            .eq("id", selectedSubscription.id);

        if (error) {
            console.error(
                "Erro ao bloquear loja:",
                error
            );

            alert("Erro ao bloquear a loja.");
            return;
        }

        await carregarAssinaturas();
        mostrarPainel();

        alert("Loja bloqueada com sucesso.");
    });

}

/* =========================================================
   DESBLOQUEAR LOJA
========================================================= */

const unblockStoreButton =
    document.getElementById("unblockStoreButton");

if (unblockStoreButton) {

    unblockStoreButton.addEventListener("click", async () => {
        if (!selectedStore || !selectedSubscription) {
            alert("Nenhuma loja válida selecionada.");
            return;
        }

        console.log(
            "Preparando desbloqueio da loja:",
            selectedStore.store_name,
            selectedStore.id
        );

        const confirmar = confirm(
            `Deseja realmente desbloquear a loja "${selectedStore.store_name}"?`
        );

        if (!confirmar) {
            return;
        }

        console.log(
            "Desbloqueio confirmado:",
            selectedStore.store_name
        );

        const { error } = await supabaseClient
            .from("subscriptions")
            .update({
                status: "trial"
            })
            .eq("id", selectedSubscription.id);

        if (error) {
            console.error(
                "Erro ao desbloquear loja:",
                error
            );

            alert("Erro ao desbloquear a loja.");
            return;
        }

        await carregarAssinaturas();
        mostrarPainel();

        alert("Loja desbloqueada com sucesso.");

    });

}

/* =========================================================
   ATIVAR ASSINATURA
========================================================= */

const activateSubscriptionButton =
    document.getElementById("activateSubscriptionButton");

if (activateSubscriptionButton) {

    activateSubscriptionButton.addEventListener("click", async () => {

        if (!selectedStore || !selectedSubscription) {
            alert("Nenhuma loja válida selecionada.");
            return;
        }

        console.log(
            "Preparando ativação da assinatura:",
            selectedStore.store_name,
            selectedSubscription.id
        );

        const confirmar = confirm(
            `Deseja ativar a assinatura da loja "${selectedStore.store_name}" por 30 dias?`
        );

        if (!confirmar) {
            return;
        }

        const subscriptionEndsAt =
            new Date();

        subscriptionEndsAt.setDate(
            subscriptionEndsAt.getDate() + 30
        );

        console.log(
            "Ativação confirmada:",
            selectedStore.store_name
        );

        console.log(
            "Novo vencimento:",
            subscriptionEndsAt
        );

        const selectedPlan =
            document.getElementById("subscriptionPlan").value;

        const { error } = await supabaseClient
            .from("subscriptions")
            .update({
                plan: selectedPlan,
                status: "active",
                subscription_ends_at: subscriptionEndsAt.toISOString()
            })
            .eq("id", selectedSubscription.id);

        if (error) {
            console.error(
                "Erro ao ativar assinatura:",
                error
            );

            alert("Erro ao ativar a assinatura.");
            return;
        }

        await carregarAssinaturas();
        mostrarPainel();

        selectedSubscription = subscriptions.find(
            (sub) => sub.store_id === selectedStore.id
        );

        document.getElementById("modalStorePlan")
            .textContent =
            selectedSubscription?.plan === "trial"
                ? "Teste"
                : selectedSubscription?.plan === "basic"
                    ? "Básico"
                    : selectedSubscription?.plan === "pro"
                        ? "Pro"
                        : "-";

        document.getElementById("modalStoreStatus")
            .textContent =
            selectedSubscription?.status === "trial"
                ? "Em teste"
                : selectedSubscription?.status === "active"
                    ? "Ativa"
                    : selectedSubscription?.status === "overdue"
                        ? "Vencida"
                        : selectedSubscription?.status === "blocked"
                            ? "Bloqueada"
                            : "-";

        const botaoAlterarPlano =
            document.getElementById("changePlanButton");

        if (botaoAlterarPlano) {
            botaoAlterarPlano.style.display =
                selectedSubscription?.status === "active"
                    ? "inline-block"
                    : "none";
        }

        const novoVencimento =
            selectedSubscription?.subscription_ends_at
                ? new Date(selectedSubscription.subscription_ends_at)
                    .toLocaleDateString("pt-BR")
                : "-";

        document.getElementById("modalSubscriptionEnd")
            .textContent = novoVencimento;

        alert("Assinatura ativada com sucesso.");

    });

}

/* ==========================================
   ALTERAR PLANO DA ASSINATURA
========================================== */

const changePlanButton =
    document.getElementById("changePlanButton");

if (changePlanButton) {

    changePlanButton.addEventListener("click", async () => {

        if (!selectedStore || !selectedSubscription) {
            alert("Selecione uma loja válida.");
            return;
        }

        if (selectedSubscription.status !== "active") {
            alert("Somente assinaturas ativas podem mudar de plano.");
            return;
        }

        const novoPlano =
            document.getElementById("subscriptionPlan").value;

        if (!["basic", "pro"].includes(novoPlano)) {
            alert("Plano inválido.");
            return;
        }

        if (novoPlano === selectedSubscription.plan) {
            alert("A loja já utiliza esse plano.");
            return;
        }

        const confirmar = confirm(
            `Deseja alterar o plano da loja "${selectedStore.store_name}" para ${novoPlano.toUpperCase()}?`
        );

        if (!confirmar) return;

        const { data, error } = await supabaseClient
            .from("subscriptions")
            .update({ plan: novoPlano })
            .eq("id", selectedSubscription.id)
            .select()
            .single();

        if (error) {
            console.error("Erro ao alterar plano:", error);
            alert("Erro ao alterar plano.");
            return;
        }

        selectedSubscription = data;

        await carregarAssinaturas();
        mostrarPainel();

        document.getElementById("modalStorePlan").textContent =
            novoPlano === "basic" ? "Básico" : "Pro";

        alert("Plano alterado com sucesso.");
    });
}

/* ==========================================
   SAIR DO PAINEL SAAS
========================================== */

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        const confirmar = confirm(
            "Deseja realmente sair do painel SaaS?"
        );

        if (!confirmar) return;

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            console.error("Erro ao sair:", error);
            alert("Não foi possível encerrar a sessão.");
            return;
        }

        window.location.replace("saas-login.html");

    });

}