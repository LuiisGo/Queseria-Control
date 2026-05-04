function authLogin(payload) {
  requireFields(payload, ["username", "password"]);
  var user = getRows("Users").find(function(row) {
    return String(row.Username).toLowerCase() === String(payload.username).toLowerCase();
  });
  if (!user || String(user.Active) === "FALSE") throw new Error("Usuario o contraseña inválidos.");
  var hash = hashPassword(payload.password, user.Password_Salt);
  if (hash !== user.Password_Hash) throw new Error("Usuario o contraseña inválidos.");
  logAudit(user, "AUTH_LOGIN", "Auth", user.ID, null, { username: user.Username }, "Inicio de sesión");
  return success(mapUser(user), "Bienvenido.");
}
