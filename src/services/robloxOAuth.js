function createRobloxOAuth(config, fetchImpl = fetch) {
  function authorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: config.robloxClientId,
      redirect_uri: config.robloxRedirectUri,
      response_type: "code",
      scope: "openid profile",
      state
    });
    return `https://apis.roblox.com/oauth/v1/authorize?${params}`;
  }

  async function request(url, options, label) {
    const response = await fetchImpl(url, options);
    if (!response.ok) throw new Error(`${label} failed`);
    return response.json();
  }

  async function exchangeCode(code) {
    const body = new URLSearchParams({
      grant_type: "authorization_code", code,
      client_id: config.robloxClientId,
      client_secret: config.robloxClientSecret,
      redirect_uri: config.robloxRedirectUri
    });
    return request("https://apis.roblox.com/oauth/v1/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body
    }, "Roblox token exchange");
  }

  const getProfile = (accessToken) => request("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` }
  }, "Roblox profile lookup");

  return { authorizationUrl, exchangeCode, getProfile };
}

module.exports = { createRobloxOAuth };
