export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-foreground mb-4">
          SPVM Vendas
        </h1>
        <p className="text-lg text-primary-foreground/80 mb-8">
          Plataforma de gestão de vendas escalável
        </p>
        <a
          href="/auth/login"
          className="inline-block px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition"
        >
          Entrar
        </a>
      </div>
    </div>
  )
}
