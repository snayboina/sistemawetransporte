import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/Icon';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[80%] h-[35%] bg-gradient-to-bl from-primary/20 via-primary/5 to-transparent z-0 pointer-events-none rounded-bl-full opacity-60" />
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary blur-[80px] rounded-full opacity-20 z-0" />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pt-12 pb-8 h-full justify-between max-w-md mx-auto w-full">
        {/* Back Button */}
        <Link 
          to="/"
          className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md border border-border text-foreground hover:bg-surface-hover transition-colors"
        >
          <Icon name="arrow_back" size={20} />
        </Link>

        {/* Top Section: Icon & Header */}
        <div className="flex flex-col items-center justify-center mt-16">
          {/* Icon Wrapper */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-surface border border-border mb-8 shadow-lg shadow-background/50">
            <Icon name="shield_lock" size={48} className="text-primary" />
          </div>
          <h1 className="text-foreground tracking-tight text-[28px] font-bold leading-tight text-center mb-2">
            Acesso Administrativo
          </h1>
          <p className="text-muted-foreground text-sm text-center font-normal">
            Secure Transport System
          </p>
        </div>

        {/* Middle Section: Form */}
        <div className="w-full flex flex-col gap-5 mt-8">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-sm font-medium ml-1" htmlFor="email">
              E-mail corporativo
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground">
                <Icon name="mail" size={20} />
              </span>
              <input
                className="input-field pl-12"
                id="email"
                placeholder="admin@empresa.com"
                type="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-sm font-medium ml-1" htmlFor="password">
              Senha de acesso
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-muted-foreground">
                <Icon name="lock" size={20} />
              </span>
              <input
                className="input-field pl-12 pr-12"
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'visibility' : 'visibility_off'} size={20} />
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <a className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">
              Esqueceu a senha?
            </a>
          </div>

          {/* Main Action Button */}
          <button className="btn-primary w-full mt-4">
            <span className="uppercase">Entrar</span>
            <Icon name="arrow_forward" size={20} />
          </button>
        </div>

        {/* Bottom Section: Footer/Support */}
        <div className="flex flex-col items-center justify-end gap-4 mt-auto pt-8">
          <div className="flex items-center gap-2 opacity-50">
            <Icon name="qr_code_scanner" size={18} className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-medium tracking-wider">SECURE QR READER</span>
          </div>
          <p className="text-muted-foreground/60 text-[11px] text-center max-w-[200px] leading-relaxed">
            Problemas com o acesso?<br />Contate o suporte: 0800-123-456
          </p>
        </div>
      </div>

      {/* Decorative line at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
};

export default AdminLogin;
