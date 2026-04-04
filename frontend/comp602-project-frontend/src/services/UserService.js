const BASE_URL = 'http://localhost:8080';

export const login = (username, password) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', body: JSON.stringify({ username, password }) });

export const getUserById = (id) =>
  fetch(`${BASE_URL}/users/${id}`);