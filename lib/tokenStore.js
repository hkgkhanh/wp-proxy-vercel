// lib/tokenStore.js
const tokenStore = {};

export function storeSecret(oauthToken, oauthTokenSecret) {
  tokenStore[oauthToken] = oauthTokenSecret;
}

export function getSecret(oauthToken) {
  return tokenStore[oauthToken];
}

export function deleteSecret(oauthToken) {
  delete tokenStore[oauthToken];
}