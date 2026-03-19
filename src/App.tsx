import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { BestCardTool } from './components/BestCardTool';
import { PaycheckExplainer } from './components/PaycheckExplainer';
import { StatementExplainer } from './components/StatementExplainer';
import { TrueCostCalculator } from './components/TrueCostCalculator';
import { FinanceCoach } from './components/FinanceCoach';
import { ExplainMyBill } from './components/ExplainMyBill';
import { MoneyHealthScore, HealthScoreData } from './components/MoneyHealthScore';
import { AnimatedHome, AnimatedWallet, AnimatedTools, AnimatedCoach } from './components/AnimatedNavIcons';
import { AnimatedLogo } from './components/AnimatedLogo';
import { InsightChip } from './components/InsightChip';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button, Card } from './components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wallet, Wrench, MessageCircle, CreditCard, DollarSign, FileText, Calculator, Receipt, ChevronLeft, Edit2, User, X } from 'lucide-react';
import { APP_VERSION, STORAGE_VERSION } from './constants';
import { usePersonalization } from './hooks/usePersonalization';
import { Input } from './components/ui';

function AmbientHeaderBackground({ pathname }: { pathname: string }) {
  let theme = 'home';
  if (pathname === '/best-card') theme = 'wallet';
  else if (pathname === '/coach') theme = 'coach';
  else if (pathname !== '/') theme = 'tools';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatePresence mode="wait">
        {theme === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* deep navy + subtle copper glow */}
            <div className="absolute inset-0 bg-[#0A192F]" />
            <div className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B87333]/20 via-transparent to-transparent blur-[80px]" />
          </motion.div>
        )}

        {theme === 'wallet' && (
          <motion.div 
            key="wallet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* warm leather brown gradient + soft gold light */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#3D2B1F] to-[#5C4033]" />
            <div className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFD700]/15 via-transparent to-transparent blur-[70px]" />
          </motion.div>
        )}

        {theme === 'tools' && (
          <motion.div 
            key="tools"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* graphite gray + minimal neon accent */}
            <div className="absolute inset-0 bg-[#2F2F2F]" />
            <div className="absolute w-[200%] h-[100%] -top-[20%] -left-[50%] bg-gradient-to-r from-transparent via-[#00FFCC]/10 to-transparent blur-[50px]" />
          </motion.div>
        )}

        {theme === 'coach' && (
          <motion.div 
            key="coach"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* calm sky blue + sunrise tint */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#B0E0E6]" />
            <div className="absolute w-[100%] h-[100%] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFCC33]/20 via-transparent to-transparent blur-[60px]" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Glass overlay with grain and inner highlight */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-white/10">
        {/* Inner highlight */}
        <div className="absolute inset-0 border-b border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
        {/* Grain simulation overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
    </div>
  );
}

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { userName, updateName } = usePersonalization();
  const [greeting, setGreeting] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';
    
    setGreeting(timeGreeting);
  }, []);

  const handleSaveName = () => {
    updateName(tempName);
    setIsEditingName(false);
  };

  return (
    <header className="cardxs-premium-header shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <AmbientHeaderBackground pathname={location.pathname} />
      
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="logo-greeting-wrapper">
          {/* Back Button (Existing Feature) */}
          {!isHome && (
            <Link to="/" className="p-2 -ml-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10 shrink-0">
              <ChevronLeft size={20} />
            </Link>
          )}

          {/* User's Logo Structure */}
          <div className="cardxs-logo-container anim-fade-scale-in" id="cardxsLogoContainer">
            <img
              src="/assets/cardxs-logo.png"
              alt="CardXS"
              className="cardxs-logo-image"
              id="cardxsLogoImage"
              style={{ display: logoError ? 'none' : 'block' }}
              onError={() => setLogoError(true)}
            />
            <span 
              className="cardxs-logo-fallback text-elegant-semibold" 
              id="cardxsLogoFallback"
              style={{ display: logoError ? 'inline-block' : 'none' }}
            >
              CardXS
            </span>
          </div>

          {/* User's Greeting Structure */}
          <div 
            className="header-greeting text-premium cursor-pointer hover:opacity-80 transition-opacity" 
            id="headerGreeting"
            onClick={() => {
              setTempName(userName === 'there' ? '' : userName);
              setIsEditingName(true);
            }}
          >
            {greeting}, <span className="user-name" id="userName">{userName}</span>
          </div>
        </div>

        {/* Right: Insight Chip (Existing Feature, Responsive) */}
        <div className="shrink-0 flex justify-end min-w-0 ml-2">
          <div className="hidden xs:block">
            <InsightChip />
          </div>
        </div>
      </div>

      {/* Name Editing Modal (Existing Feature) */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingName(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-app-primary/10 flex items-center justify-center text-app-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-app-text">Personalize</h3>
                    <p className="text-xs text-app-text-secondary">What should we call you?</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingName(false)}
                  className="p-2 text-app-text-secondary hover:text-app-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <Input 
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Your name"
                  className="h-12 text-base rounded-2xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <Button 
                  onClick={handleSaveName}
                  className="w-full h-12 rounded-2xl text-base font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: AnimatedHome, label: 'Home' },
    { path: '/best-card', icon: AnimatedWallet, label: 'Wallet' },
    { path: '/tools', icon: AnimatedTools, label: 'Tools' },
    { path: '/coach', icon: AnimatedCoach, label: 'Coach' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 pointer-events-none">
      <nav className="pointer-events-auto relative mx-auto max-w-md bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[28px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/20 pointer-events-none" />
        <div className="flex items-center justify-around h-[72px] px-2 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/tools' && location.pathname !== '/' && location.pathname !== '/best-card' && location.pathname !== '/coach');
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center flex-1 h-full z-10"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute w-14 h-14 bg-black/[0.04] rounded-[20px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <motion.div 
                  whileTap={{ scale: 0.92 }}
                  className={`relative flex flex-col items-center justify-center gap-1 z-20 transition-colors duration-300 ${isActive ? 'text-app-text' : 'text-app-text-secondary'}`}
                >
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <item.icon isActive={isActive} />
                  </div>
                  <span className={`text-[10px] tracking-wide transition-all duration-300 ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const TOOLS = [
  { path: '/best-card', title: 'Best Card', description: 'Find the best card for any purchase.', icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
  { path: '/explain-paycheck', title: 'Explain Paycheck', description: 'See where your money goes.', icon: DollarSign, color: 'bg-green-50 text-green-600' },
  { path: '/explain-statement', title: 'Explain Statement', description: 'Understand your credit card bill.', icon: FileText, color: 'bg-purple-50 text-purple-600' },
  { path: '/true-cost', title: 'True Cost', description: 'Calculate the real price after interest.', icon: Calculator, color: 'bg-orange-50 text-orange-600' },
  { path: '/explain-bill', title: 'Explain Bill', description: 'Understand any financial statement.', icon: Receipt, color: 'bg-pink-50 text-pink-600' },
  { path: '/coach', title: 'Finance Coach', description: 'Get unbiased financial answers.', icon: MessageCircle, color: 'bg-indigo-50 text-indigo-600' },
];

function ToolGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3">
      {TOOLS.map((tool) => (
        <Link key={tool.path} to={tool.path}>
          <Card className="h-full p-3 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 border border-app-border/50 hover:border-app-border active:scale-[0.98]">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
              <tool.icon size={16} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-app-text leading-tight">{tool.title}</h3>
              <p className="text-[11px] text-app-text-secondary mt-0.5 leading-snug line-clamp-2">{tool.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function PageWrapper({ children, title, description }: { children: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-4 md:py-10"
    >
      <div className="mb-4 md:mb-8 text-center md:text-left">
        <h1 className="text-xl md:text-3xl font-semibold tracking-tight text-app-text mb-1 md:mb-2">{title}</h1>
        <p className="text-[14px] md:text-[16px] text-app-text-secondary tracking-tight">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function App() {
  useEffect(() => {
    console.log(`[App] Version: ${APP_VERSION}`);
    console.log(`[App] Storage Version: ${STORAGE_VERSION}`);
  }, []);

  console.log('[App] Initializing...');
  
  const [healthData, setHealthData] = useState<HealthScoreData>({
    utilization: null,
    interestRisk: null,
    usingBestCard: null,
    takeHomePercentage: null,
  });

  const updateHealthData = (newData: Partial<HealthScoreData>) => {
    setHealthData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-app-bg selection:bg-app-primary/20 flex flex-col">
          <Toaster position="top-center" />
          <Header />
          
          <main className="flex-1 pb-24 md:pb-32 -mt-8 pt-8 relative z-0">
            <Routes>
              <Route path="/" element={
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-8 space-y-6 md:space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-app-text mb-1 md:mb-2">
                      Dashboard
                    </h1>
                    <p className="text-[14px] md:text-lg text-app-text-secondary tracking-tight mb-4 md:mb-6">
                      Your financial health at a glance.
                    </p>
                    <MoneyHealthScore data={healthData} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 className="text-lg md:text-2xl font-semibold tracking-tight text-app-text mb-3 md:mb-4">Tools</h2>
                    <ToolGrid />
                  </motion.div>
                </div>
              } />

              <Route path="/tools" element={
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 md:py-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h1 className="text-xl md:text-4xl font-semibold tracking-tight text-app-text mb-1 md:mb-2">All Tools</h1>
                    <p className="text-[14px] md:text-lg text-app-text-secondary tracking-tight mb-4 md:mb-6">
                      Select a tool to get started.
                    </p>
                    <ToolGrid />
                  </motion.div>
                </div>
              } />

              <Route path="/best-card" element={
                <PageWrapper title="Maximize Rewards" description="Find the best card in your wallet for any purchase.">
                  <BestCardTool onResult={(isBest: boolean) => updateHealthData({ usingBestCard: isBest })} />
                </PageWrapper>
              } />

              <Route path="/explain-paycheck" element={
                <PageWrapper title="Demystify Income" description="See exactly where your hard-earned money is going.">
                  <PaycheckExplainer onResult={(takeHome: number) => updateHealthData({ takeHomePercentage: takeHome })} />
                </PageWrapper>
              } />

              <Route path="/explain-statement" element={
                <PageWrapper title="Avoid Debt Traps" description="Understand the true cost of carrying a balance.">
                  <StatementExplainer onResult={(utilization: number, risk: any) => updateHealthData({ utilization, interestRisk: risk })} />
                </PageWrapper>
              } />

              <Route path="/true-cost" element={
                <PageWrapper title="The Real Price" description="See what a purchase actually costs after interest.">
                  <TrueCostCalculator />
                </PageWrapper>
              } />

              <Route path="/explain-bill" element={
                <PageWrapper title="Explain My Bill" description="Understand any financial statement or bill instantly.">
                  <ExplainMyBill />
                </PageWrapper>
              } />

              <Route path="/coach" element={
                <FinanceCoach />
              } />
            </Routes>
          </main>

          <BottomNav />

          <footer className="hidden md:block border-t border-app-border/50 py-12 px-6 bg-white mt-auto">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[14px] text-app-text-secondary font-medium">
              <p>© 2026 CardXS. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-app-text transition-colors">Privacy</a>
                <a href="#" className="hover:text-app-text transition-colors">Terms</a>
                <a href="#" className="hover:text-app-text transition-colors">Security</a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
