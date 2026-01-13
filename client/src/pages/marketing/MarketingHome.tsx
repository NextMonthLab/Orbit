import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import businessOrbitLogo from "@assets/business-orbit-logo-cropped.png";
import { 
  ArrowRight, 
  ArrowDown,
  MessageSquare, 
  Brain, 
  Zap,
  BarChart3,
  Users,
  Target,
  ShieldCheck,
  Building2,
  Briefcase,
  LineChart,
  Clock,
  TrendingUp,
  CheckCircle,
  Linkedin,
  Twitter,
  Youtube
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 }
};

const stats = [
  { value: "80%", label: "of analytics insights fail to deliver business outcomes", source: "Gartner" },
  { value: "6 weeks", label: "wasted annually by executives searching for information", source: "IDC Research" },
  { value: "72%", label: "of leaders stopped by data volume from making decisions", source: "Oracle Study" },
  { value: "85%", label: "of analytics projects fail to meet objectives", source: "Gartner" },
];

const differentiators = [
  {
    icon: MessageSquare,
    title: "Strategic Dialogue",
    description: "Not query-response. Real conversation that explores alternatives, pressure-tests thinking, and surfaces blind spots."
  },
  {
    icon: Brain,
    title: "Learns Your Business",
    description: "Every interaction builds institutional memory. Context compounds. Strategic history becomes accessible."
  },
  {
    icon: Zap,
    title: "Constructive Challenge",
    description: "The best advisors don't just answer—they ask. Intelligence that earns the right to push back on incomplete thinking."
  }
];

const howItWorks = [
  {
    step: 1,
    icon: BarChart3,
    title: "Build your knowledge base",
    description: "Connect your business data, upload strategic documents, and define the knowledge nodes that matter. Business Orbit creates a structured intelligence layer."
  },
  {
    step: 2,
    icon: MessageSquare,
    title: "Start the conversation",
    description: "Ask strategic questions. Explore positioning alternatives. Pressure-test decisions. Business Orbit learns your business context with every dialogue."
  },
  {
    step: 3,
    icon: TrendingUp,
    title: "Make better decisions, faster",
    description: "Access strategic intelligence whenever you need it—2 AM before a board meeting, during competitive crises, or in the quiet moments when clarity matters most."
  }
];

const personas = [
  {
    id: "executives",
    icon: Briefcase,
    title: "C-Suite Executives",
    quote: "I need synthesis across domains quickly, validation for intuition, and confidence in high-velocity decisions.",
    description: "Business Orbit delivers clarity through noise, helps you trust decisions without second-guessing, and provides strategic dialogue when you need it most—not just during quarterly reviews.",
    outcomes: ["Scenario testing", "Risk identification", "Board communication"]
  },
  {
    id: "cmo",
    icon: Target,
    title: "Chief Marketing Officers",
    quote: "I need to prove ROI in CFO language, but connecting attribution across fragmented channels is nearly impossible.",
    description: "Business Orbit synthesizes customer intelligence across touchpoints, helps articulate marketing value in business terms, and identifies positioning opportunities competitors miss.",
    outcomes: ["Attribution clarity", "Positioning refinement", "Campaign intelligence"]
  },
  {
    id: "strategy",
    icon: LineChart,
    title: "Strategic Planning Teams",
    quote: "4 out of 5 executives say our strategy isn't well understood. We need shared mental models, not more static documents.",
    description: "Business Orbit creates transparency across initiatives, surfaces alignment gaps before they become problems, and enables rapid scenario evaluation when conditions change.",
    outcomes: ["Strategy alignment", "Scenario planning", "Progress visibility"]
  },
  {
    id: "board",
    icon: Users,
    title: "Board Members & Investors",
    quote: "I need to fulfill fiduciary responsibilities but face significant knowledge gaps between quarterly meetings.",
    description: "Business Orbit provides succinct, outcome-focused intelligence with clear connections between initiatives and strategic value—enabling informed questions without technical depth.",
    outcomes: ["Strategic oversight", "Risk visibility", "Informed governance"]
  }
];

const comparisons = [
  { 
    old: "Traditional BI Dashboards", 
    oldDesc: "Shows what happened",
    new: "Business Orbit",
    newDesc: "Helps decide what to do about it"
  },
  { 
    old: "Knowledge Management Tools", 
    oldDesc: "Stores information",
    new: "Business Orbit",
    newDesc: "Activates it strategically"
  },
  { 
    old: "AI Chatbots", 
    oldDesc: "Answers your questions",
    new: "Business Orbit",
    newDesc: "Challenges the questions you should be asking"
  },
  { 
    old: "Management Consultants", 
    oldDesc: "Strategic dialogue quarterly, at premium cost",
    new: "Business Orbit",
    newDesc: "Continuous strategic dialogue, always available"
  }
];

const trustStats = [
  { value: "70%", label: "of business leaders would prefer intelligent assistance for decisions", source: "Oracle Global Study" },
  { value: "$15B+", label: "spent annually on BI tools that deliver 25% workforce adoption", source: "Gartner Research" },
  { value: "76%", label: "of category value captured by the company that defines it", source: "Category Design Research" },
];

export default function MarketingHome() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/app");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#1a1b2e] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img 
                src={businessOrbitLogo} 
                alt="Business Orbit" 
                className="h-28 w-auto object-contain"
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5" data-testid="button-header-login">
                Sign In
              </Button>
            </Link>
            <Link href="/orbit/claim">
              <Button className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] text-white border-0 hover:opacity-90" data-testid="button-header-trial">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* SECTION 1: HERO */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
          <div className="absolute inset-0 bg-[#1a1b2e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff6b4a]/10 via-[#ff4d8f]/5 to-transparent" />
          
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10 py-24">
            <motion.div {...fadeInUp}>
              <p className="text-sm font-medium text-slate-400 mb-6 tracking-wide uppercase" data-testid="text-hero-overline">
                For established companies
              </p>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]" data-testid="text-hero-title">
                Your business already has the answers.
                <br />
                <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent">
                  It just can't talk to you yet.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed" data-testid="text-hero-description">
                Traditional BI was built when analytics meant creating dashboards for passive viewers. 
                Business Orbit is conversational intelligence that learns your business, challenges your thinking, 
                and turns data into strategic dialogue.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link href="/orbit/claim">
                  <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] text-white border-0 shadow-lg shadow-[#ff4d8f]/20 gap-3 rounded-xl hover:opacity-90" data-testid="button-hero-cta">
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-lg bg-transparent border-white/20 text-white hover:bg-white/5 gap-3 rounded-xl"
                  onClick={scrollToHowItWorks}
                  data-testid="button-hero-scroll"
                >
                  See how it works
                  <ArrowDown className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-sm text-slate-500">
                Built for strategic leaders at established companies
              </p>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1b2e] to-transparent" />
        </section>

        {/* SECTION 2: PROBLEM AGITATION */}
        <section className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <p className="text-sm font-medium text-[#ff6b4a] mb-4 tracking-wide uppercase">
                The failure of static intelligence
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-problem-title">
                You have more data than ever.
                <br />
                <span className="text-slate-400">And less clarity than you need.</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                Executives waste six weeks annually searching for documents they can't find. 
                Workers spend 30% of their day hunting for information across disconnected systems. 
                72% of leaders admit data volume has stopped them from making decisions altogether.
              </p>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto mt-6 font-medium">
                The problem isn't data access. It's that dashboards show what happened without helping you decide what to do about it.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group"
                  data-testid={`card-stat-${index}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b4a]/5 via-[#ff4d8f]/5 to-[#a855f7]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7]" />
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-sm mb-3 leading-relaxed">
                    {stat.label}
                  </p>
                  <p className="text-slate-500 text-xs">
                    — {stat.source}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: SOLUTION INTRODUCTION */}
        <section className="py-24 px-6 relative bg-[#252640]">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <p className="text-sm font-medium text-[#a855f7] mb-4 tracking-wide uppercase">
                A different kind of intelligence
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-solution-title">
                Business intelligence that thinks{" "}
                <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent">with you</span>,
                <br />
                not just for you.
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Business Orbit is built around structured knowledge nodes that you discuss with an AI entity 
                designed specifically for your business. It doesn't just answer questions—it asks the ones you should be asking.
              </p>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto mt-4 leading-relaxed">
                Unlike dashboards you browse or chatbots you query, Business Orbit engages in strategic dialogue. 
                It learns from every conversation, remembers what matters, and challenges assumptions the way a trusted advisor would.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {differentiators.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="p-6 rounded-2xl bg-[#1a1b2e]/50 border border-white/10"
                  data-testid={`card-differentiator-${index}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6b4a]/20 via-[#ff4d8f]/20 to-[#a855f7]/20 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-[#ff4d8f]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-6 relative scroll-mt-24">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-howitworks-title">
                From setup to strategic advantage{" "}
                <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent">
                  in three steps
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                  data-testid={`card-step-${index}`}
                >
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] flex items-center justify-center mb-4">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-sm font-medium text-[#ff4d8f] mb-2">Step {step.step}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-[#ff4d8f]/50" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.p 
              {...fadeInUp}
              className="text-center text-slate-400 mt-12"
            >
              No implementation teams. No months-long rollouts. No consultant dependencies.
            </motion.p>
          </div>
        </section>

        {/* SECTION 5: USE CASES / WHO IT'S FOR */}
        <section className="py-24 px-6 relative bg-[#252640]">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-personas-title">
                Built for{" "}
                <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent">
                  strategic leaders
                </span>{" "}
                navigating complexity
              </h2>
            </motion.div>

            <Tabs defaultValue="executives" className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent mb-8 h-auto">
                {personas.map((persona) => (
                  <TabsTrigger 
                    key={persona.id}
                    value={persona.id}
                    className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff6b4a] data-[state=active]:via-[#ff4d8f] data-[state=active]:to-[#a855f7] data-[state=active]:text-white data-[state=active]:border-transparent"
                    data-testid={`tab-persona-${persona.id}`}
                  >
                    <persona.icon className="w-4 h-4 mr-2" />
                    {persona.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {personas.map((persona) => (
                <TabsContent 
                  key={persona.id} 
                  value={persona.id}
                  className="mt-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 rounded-2xl bg-[#1a1b2e]/50 border border-white/10 border-l-4 border-l-[#ff4d8f]"
                    data-testid={`content-persona-${persona.id}`}
                  >
                    <p className="text-xl text-slate-300 italic mb-6">"{persona.quote}"</p>
                    <p className="text-slate-400 mb-6 leading-relaxed">{persona.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {persona.outcomes.map((outcome, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 rounded-full text-sm bg-[#ff4d8f]/10 text-[#ff4d8f] border border-[#ff4d8f]/20"
                        >
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* SECTION 6: DIFFERENTIATION */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-differentiation-title">
                What makes{" "}
                <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent">
                  conversational intelligence
                </span>{" "}
                different
              </h2>
            </motion.div>

            <div className="grid gap-4">
              {comparisons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col md:flex-row items-stretch gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                  data-testid={`card-comparison-${index}`}
                >
                  <div className="flex-1 p-4 rounded-xl bg-[#1a1b2e]/50">
                    <p className="text-slate-500 text-sm mb-1">{item.old}</p>
                    <p className="text-slate-400">{item.oldDesc}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-[#ff6b4a]/10 via-[#ff4d8f]/10 to-[#a855f7]/10 border border-[#ff4d8f]/20">
                    <p className="text-[#ff4d8f] text-sm mb-1 font-medium">{item.new}</p>
                    <p className="text-white">{item.newDesc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p 
              {...fadeInUp}
              className="text-center text-slate-300 mt-12 text-lg max-w-3xl mx-auto"
            >
              Business Orbit occupies genuine whitespace—the intersection of strategic dialogue, 
              institutional learning, and constructive challenge that no existing tool delivers.
            </motion.p>
          </div>
        </section>

        {/* SECTION 7: SOCIAL PROOF */}
        <section className="py-24 px-6 relative bg-[#252640]">
          <div className="max-w-5xl mx-auto">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-proof-title">
                The{" "}
                <span className="bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent">
                  Strategic Intelligence
                </span>{" "}
                Gap
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {trustStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-[#1a1b2e]/50 border border-white/10 text-center"
                  data-testid={`card-trust-${index}`}
                >
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] bg-clip-text text-transparent mb-3">
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-sm mb-2 leading-relaxed">
                    {stat.label}
                  </p>
                  <p className="text-slate-500 text-xs">
                    — {stat.source}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              {...fadeInUp}
              className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/10"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-5 h-5 text-[#a855f7]" />
                <span className="text-sm">Enterprise-grade security</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-5 h-5 text-[#ff4d8f]" />
                <span className="text-sm">Built for regulated industries</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle className="w-5 h-5 text-[#ff6b4a]" />
                <span className="text-sm">Your data stays yours</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 8: FINAL CTA */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b4a]/20 via-[#ff4d8f]/20 to-[#a855f7]/20" />
          <div className="absolute inset-0 bg-[#1a1b2e]/80" />
          
          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6" data-testid="text-cta-title">
                Your decisions deserve more than dashboards
              </h2>
              <p className="text-lg text-slate-300 mb-10">
                Join the leaders defining what business intelligence becomes next.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto mb-6">
                <Input
                  type="email"
                  placeholder="Business email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 px-6 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:border-[#ff4d8f] focus:ring-[#ff4d8f]"
                  data-testid="input-cta-email"
                />
                <Link href="/orbit/claim">
                  <Button 
                    size="lg" 
                    className="h-14 px-8 bg-gradient-to-r from-[#ff6b4a] via-[#ff4d8f] to-[#a855f7] text-white border-0 hover:opacity-90 whitespace-nowrap rounded-xl"
                    data-testid="button-cta-submit"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ff4d8f]" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ff4d8f]" />
                  Full access for 14 days
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#ff4d8f]" />
                  Set up in minutes
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 9: FOOTER */}
        <footer className="py-16 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src={businessOrbitLogo} 
                    alt="Business Orbit" 
                    className="h-28 w-auto object-contain"
                  />
                </div>
                <p className="text-slate-500 text-sm">
                  Conversational intelligence for strategic leaders.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white">Product</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="#how-it-works" className="hover:text-[#ff4d8f] transition-colors">How It Works</Link></li>
                  <li><Link href="/pricing" className="hover:text-[#ff4d8f] transition-colors">Pricing</Link></li>
                  <li><Link href="/security" className="hover:text-[#ff4d8f] transition-colors">Security</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white">Company</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/about" className="hover:text-[#ff4d8f] transition-colors">About</Link></li>
                  <li><Link href="/careers" className="hover:text-[#ff4d8f] transition-colors">Careers</Link></li>
                  <li><Link href="/contact" className="hover:text-[#ff4d8f] transition-colors">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white">Resources</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><Link href="/blog" className="hover:text-[#ff4d8f] transition-colors">Blog</Link></li>
                  <li><Link href="/docs" className="hover:text-[#ff4d8f] transition-colors">Documentation</Link></li>
                  <li><Link href="/case-studies" className="hover:text-[#ff4d8f] transition-colors">Case Studies</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-4">
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ff4d8f] hover:border-[#ff4d8f]/50 transition-colors" data-testid="link-social-linkedin">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ff4d8f] hover:border-[#ff4d8f]/50 transition-colors" data-testid="link-social-twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#ff4d8f] hover:border-[#ff4d8f]/50 transition-colors" data-testid="link-social-youtube">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                <span>© 2025 Business Orbit. All rights reserved.</span>
                <Link href="/privacy" className="hover:text-[#ff4d8f] transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-[#ff4d8f] transition-colors">Terms of Service</Link>
                <Link href="/security" className="hover:text-[#ff4d8f] transition-colors">Security</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
