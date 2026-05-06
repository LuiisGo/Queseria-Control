function authLogin(payload) {
  requireFields(payload, ["username", "password"]);
  assertLoginRate(payload);
  var user = getRows("Users").find(function(row) {
    return String(row.Username).toLowerCase() === String(payload.username).toLowerCase();
  });
  if (!user || String(user.Active) === "FALSE") {
    recordFailedLogin(payload);
    throw new Error("Usuario o contraseña inválidos.");
  }
  var hash = hashPassword(payload.password, user.Password_Salt);
  if (hash !== user.Password_Hash) {
    recordFailedLogin(payload);
    throw new Error("Usuario o contraseña inválidos.");
  }
  clearFailedLogin(payload);
  logAudit(user, "AUTH_LOGIN", "Auth", user.ID, null, { username: user.Username }, "Inicio de sesión");
  return success(mapUser(user), "Bienvenido.");
}

function loginRateKey(payload) {
  return "login_" + sha256(String(payload.clientIp || "unknown") + ":" + String(payload.username || "").toLowerCase()).slice(0, 32);
}

function assertLoginRate(payload) {
  var cache = CacheService.getScriptCache();
  var attempts = Number(cache.get(loginRateKey(payload)) || 0);
  if (attempts >= 8) throw new Error("Demasiados intentos. Espera unos minutos.");
}

function recordFailedLogin(payload) {
  var cache = CacheService.getScriptCache();
  var key = loginRateKey(payload);
  var attempts = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(attempts), 600);
}

function clearFailedLogin(payload) {
  CacheService.getScriptCache().remove(loginRateKey(payload));
}
