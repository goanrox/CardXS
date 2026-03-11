import React, { useState } from 'react';
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
import { Button, Card } from './components/ui';
import { motion } from 'motion/react';
import { Home, Wallet, Wrench, MessageCircle, CreditCard, DollarSign, FileText, Calculator, Receipt, ChevronLeft } from 'lucide-react';

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-app-bg/80 backdrop-blur-xl border-b border-app-border/50">
      <div className="max-w-5xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome && (
            <Link to="/" className="md:hidden mr-2 p-2 -ml-2 text-app-text-secondary hover:text-app-text transition-colors rounded-full hover:bg-black/5">
              <ChevronLeft size={24} />
            </Link>
          )}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-app-text rounded-[10px] md:rounded-[12px] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg md:text-xl leading-none">C</span>
            </div>
            <span className="font-semibold text-lg md:text-xl tracking-tight text-app-text hidden sm:block">CardXS</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-app-text-secondary">
          <Link to="/" className={`transition-colors ${isHome ? 'text-app-text' : 'hover:text-app-text'}`}>Dashboard</Link>
          <Link to="/best-card" className={`transition-colors ${location.pathname === '/best-card' ? 'text-app-text' : 'hover:text-app-text'}`}>Best Card</Link>
          <Link to="/tools" className={`transition-colors ${location.pathname === '/tools' ? 'text-app-text' : 'hover:text-app-text'}`}>Tools</Link>
          <Link to="/coach" className={`transition-colors ${location.pathname === '/coach' ? 'text-app-text' : 'hover:text-app-text'}`}>Coach</Link>
        </nav>
        <Button variant="ghost" className="hidden md:inline-flex font-medium text-[15px]">Sign In</Button>
      </div>
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
    <BrowserRouter>
      <div className="min-h-screen bg-app-bg selection:bg-app-primary/20 flex flex-col">
        <Toaster position="top-center" />
        <Header />
        
        <main className="flex-1 pb-24 md:pb-32">
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
  );
}
