import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'csm.refreshToken';

export function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function saveRefreshToken(refreshToken) {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export function removeRefreshToken() {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
