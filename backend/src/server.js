const app = createApp({ /* igual ao que já está */ });

export default app;

if (!process.env.VERCEL) {
  const server = app.listen(env.port, () => {
    console.log(`Tom Music rodando em http://localhost:${env.port}  (docs: /api/docs)`);
  });
  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}