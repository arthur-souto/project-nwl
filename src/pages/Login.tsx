import { GOOGLE_AUTH_URL } from '../api/client'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LogoMark } from '../components/ui/Navbar'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-1.9 14-5.4l-6.4-5.3c-2 1.4-4.6 2.2-7.6 2.2-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.4 5.3C41.5 35.7 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="currentColor" fillOpacity={0.15} />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const features = [
  'Rastreabilidade completa de lotes',
  'Alertas automáticos de validade',
  'Conformidade com normas da ANVISA',
]

export default function Login() {
  const handleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL
  }

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <section className="relative flex flex-1 flex-col justify-between overflow-hidden bg-primary-dark px-8 py-10 text-white sm:px-12 lg:px-16 lg:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5"
        />

        <div className="relative z-10 flex items-center gap-2 text-lg font-extrabold">
          <LogoMark tone="light" />
          Pharmly
        </div>

        <div className="relative z-10 max-w-md py-12 lg:py-0">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Gerencie seus ativos.
            <br />
            Com precisão.
          </h1>
          <p className="mt-5 text-base text-white/80 sm:text-lg">
            A plataforma completa para controle de lotes, validades e conformidade regulatória de ativos
            farmacêuticos.
          </p>

          <ul className="mt-10 flex flex-col gap-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium text-white/90 sm:text-base">
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          &copy; {new Date().getFullYear()} Pharmly. Todos os direitos reservados.
        </p>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16 sm:px-12">
        <Card variant="elevated" className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-text">Acesse sua conta</h2>
          <p className="mt-2 text-sm text-text-muted">Entre com sua conta Google para continuar</p>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="mt-8 w-full"
            icon={<GoogleIcon />}
            iconPosition="left"
            onClick={handleLogin}
          >
            Entrar com Google
          </Button>

          <p className="mt-6 text-center text-xs text-text-muted">
            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </Card>

        <div className="mt-10 flex items-center gap-2 text-xs font-medium text-text-muted">
          <ShieldIcon className="text-primary-dark" />
          Plataforma segura e certificada
        </div>
      </section>
    </div>
  )
}
