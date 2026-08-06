# Configuração do e-mail de redefinição no Supabase hospedado

O `config.toml` e o arquivo `recovery.html` configuram o ambiente local. No projeto hospedado, abra:

1. **Authentication → URL Configuration**
2. Use `https://billieilishtv.site` como Site URL.
3. Adicione às Redirect URLs:
   - `https://billieilishtv.site/pt-br/reset-password`
   - `https://billieilishtv.site/en-us/reset-password`
   - `https://billieilishtv.site/es/reset-password`
4. Abra **Authentication → Email Templates → Reset password**.
5. Use como assunto: `Redefinir senha / Reset password / Restablecer contraseña`.
6. Cole o conteúdo de `supabase/templates/recovery.html` no corpo do template e salve.

A aplicação envia a Redirect URL correspondente ao idioma atual. O template verifica `.RedirectTo` e mostra português, inglês ou espanhol.
