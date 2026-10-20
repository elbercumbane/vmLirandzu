export const environment = {
  production: true,
  /**
   * URL pública do backend (Railway). Não usar só "/api" no browser em produção:
   * pedidos POST disparam preflight OPTIONS; o proxy /api do Vercel devolve 403 em OPTIONS.
   * Ajusta em produção se o domínio do Railway mudar.
   */
  apiUrl: 'https://vmlirandzu-backend-production.up.railway.app/api'
};
