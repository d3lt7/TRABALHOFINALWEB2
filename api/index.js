// TEMPORÁRIO (diagnóstico): se o app não iniciar, devolve o erro em JSON em vez de 500 em branco.
let handler;
try {
  handler = (await import('../backend/src/server.js')).default;
} catch (error) {
  console.error('ERRO AO INICIAR A API:', error);
  handler = (_req, res) => {
    res.status(500).json({
      error: 'A API não iniciou',
      message: String(error?.message),
      stack: String(error?.stack).split('\n').slice(0, 8),
    });
  };
}

export default handler;
