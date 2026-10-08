/* ==========================================
   LOGIN EXCLUSIVO DO PAINEL SAAS
========================================== */

const saasLoginForm =
    document.getElementById("saasLoginForm");

const loginError =
    document.getElementById("loginError");

saasLoginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const submitButton =
        saasLoginForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Entrando...";

    try {

        // Autenticar usuário
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error || !data?.user) {
            loginError.textContent =
                "E-mail ou senha incorretos.";
            return;
        }

        // Verificar permissão de administrador SaaS
        const { data: administrador, error: adminError } =
            await supabaseClient
                .from("saas_admins")
                .select("role")
                .eq("user_id", data.user.id)
                .in("role", ["admin", "super_admin"])
                .maybeSingle();

        if (adminError || !administrador) {

            await supabaseClient.auth.signOut();

            loginError.textContent =
                "Acesso permitido apenas para administradores SaaS.";

            return;
        }

        // Login autorizado
        window.location.replace("saas-admin.html");

    } catch (error) {

        console.error("Erro no login SaaS:", error);

        loginError.textContent =
            "Ocorreu um erro ao tentar entrar.";

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Entrar no SaaS";

    }

});