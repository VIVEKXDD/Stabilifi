import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, BarChart, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navigation/navbar';
import Footer from '@/components/navigation/footer';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Behavioral Risk Modeling',
    description: 'Our AI analyzes your financial habits, not just your numbers, to provide a holistic risk assessment.',
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
    title: 'Liquidity Stress Detection',
    description: 'Identify potential cash flow issues before they become critical, ensuring you stay afloat.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-amber-500" />,
    title: 'Credit Utilization Monitoring',
    description: 'Keep your credit health in check with smart monitoring and actionable insights.',
  },
  {
    icon: <Cpu className="h-10 w-10 text-rose-500" />,
    title: 'Personalized Recommendations',
    description: 'Receive a tailored action plan powered by AI to improve your financial stability.',
  },
];

const howItWorksSteps = [
  {
    step: 1,
    title: 'Input Behavioral Metrics',
    description: 'Anonymously share a few key indicators about your financial habits. It takes less than 2 minutes.',
    image: PlaceHolderImages[0],
  },
  {
    step: 2,
    title: 'AI Evaluates Patterns',
    description: 'Our advanced models analyze your data to detect hidden patterns of liquidity and credit stress.',
    image: PlaceHolderImages[1],
  },
  {
    step: 3,
    title: 'Receive Risk Score & Action Plan',
    description: 'Get your personalized financial stress score and a clear, actionable plan to improve it.',
    image: PlaceHolderImages[2],
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Predict Financial Stress Before It Happens
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  AI-driven behavioral financial risk detection. Get your free, anonymous risk score and a personalized action plan in minutes.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Analyze My Risk</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#how-it-works">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                 <Image
                  src={PlaceHolderImages[3].imageUrl}
                  alt="Financial dashboard"
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-2xl object-cover"
                  data-ai-hint={PlaceHolderImages[3].imageHint}
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-32 bg-secondary">
          <div className="container mx-auto space-y-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Clear Path to Financial Stability</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our three-step process makes understanding your financial health simple and effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              {howItWorksSteps.map((step) => (
                <div key={step.step} className="grid gap-4 text-center">
                  <div className="relative mx-auto mb-4 h-48 w-full">
                    <Image
                      src={step.image.imageUrl}
                      alt={step.title}
                      fill
                      className="rounded-2xl object-cover"
                      data-ai-hint={step.image.imageHint}
                    />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Step {step.step}: {step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Stabilifi?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Go beyond traditional credit scores. We focus on the behavioral patterns that truly define financial risk.
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl md:grid-cols-2 md:gap-12 lg:max-w-5xl">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/60 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
