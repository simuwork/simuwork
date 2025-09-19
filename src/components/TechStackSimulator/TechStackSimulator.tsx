import { useEffect, useState, type ReactNode } from 'react';
import { Play, Code, CheckCircle, AlertCircle, Target, Users, Zap, Book } from 'lucide-react';
import { scenarios } from '../../data/scenarios';
import { techStacks } from '../../data/techStacks';
import { simulationSteps } from '../../data/simulationSteps';
import { useSimulationProgress } from '../../hooks/useSimulationProgress';
import type { TechStack } from '../../types/simulator';
import logo from '../../assets/logo.png';

type View = 'dashboard' | 'loading' | 'simulator';

type DashboardViewProps = {
  onStart: (stack: TechStack) => void;
};

type LoadingViewProps = {
  steps: readonly string[];
  currentStep: number;
  stack?: TechStack | null;
};

type SimulatorViewProps = {
  onComplete: () => void;
  stack?: TechStack | null;
};

export const TechStackSimulator = () => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedStack, setSelectedStack] = useState<TechStack | null>(null);

  const { stepIndex, status, isRunning, hasCompleted, start, reset } = useSimulationProgress(simulationSteps);

  useEffect(() => {
    if (hasCompleted) {
      setView('simulator');
    }
  }, [hasCompleted]);

  const handleStart = (stack: TechStack) => {
    setSelectedStack(stack);
    setView('loading');
    start();
  };

  const handleComplete = () => {
    reset();
    setView('dashboard');
  };

  if (view === 'dashboard') {
    return <DashboardView onStart={handleStart} />;
  }

  if (view === 'loading' && isRunning) {
    return <LoadingView steps={simulationSteps} currentStep={stepIndex} stack={selectedStack} />;
  }

  if (view === 'simulator' || (view === 'loading' && status === 'completed')) {
    return <SimulatorView onComplete={handleComplete} stack={selectedStack} />;
  }

  return null;
};

const DashboardView = ({ onStart }: DashboardViewProps) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:gap-6">
        <img src={logo} alt="SimuWork logo" className="h-16 w-auto mb-4 sm:mb-0 rounded-lg shadow-sm" loading="lazy" />
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SimuWork</h1>
          <p className="text-xl text-gray-600">Practice real company workflows with AI-powered environments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<CheckCircle className="h-8 w-8 text-blue-500" />} label="Scenarios Completed" value="12/45" />
        <StatCard icon={<Zap className="h-8 w-8 text-orange-500" />} label="Current Streak" value="7 days" />
        <StatCard icon={<Target className="h-8 w-8 text-green-500" />} label="Practice Hours" value="23.5 hrs" />
        <StatCard icon={<Users className="h-8 w-8 text-purple-500" />} label="This Week's Progress" value="5 scenarios" />
      </div>

      <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Target Tech Stack</h2>
            <p className="text-sm text-gray-600">Match SimuWork to the companies you want to impress.</p>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {techStacks.map((stack) => (
            <article key={stack.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${stack.color}`} aria-hidden="true" />
                {stack.name}
              </h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Market Demand</span>
                  <span className="text-sm font-medium">{stack.popularity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={stack.popularity} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`${stack.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${stack.popularity}%` }} />
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Top Companies:</p>
                <div className="flex flex-wrap gap-1">
                  {stack.companies.map((company) => (
                    <span key={company} className="px-2 py-1 bg-gray-100 text-xs rounded">{company}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onStart(stack)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <Play className="h-4 w-4" />
                Start Simulation
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm border p-6">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Training Scenarios</h2>
            <p className="text-sm text-gray-600">Preview the kinds of challenges SimuWork can throw at you.</p>
          </div>
          <Book className="h-6 w-6 text-blue-500" />
        </header>
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <article key={scenario.title} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{scenario.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${difficultyBadgeClass(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">~{scenario.estimatedTime}</span>
                </div>
                <p className="text-gray-600 mb-2">{scenario.description}</p>
                <div className="flex flex-wrap gap-2">
                  {scenario.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{skill}</span>
                  ))}
                </div>
              </div>
              <button className="ml-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors" type="button">
                View Details
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const LoadingView = ({ steps, currentStep, stack }: LoadingViewProps) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
    <div className="text-center max-w-lg w-full">
      <div className="mb-8">
        <img src={logo} alt="SimuWork logo" className="h-14 w-auto mx-auto mb-6 drop-shadow-md" />
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Spinning up SimuWork</h2>
        <p className="text-gray-400">
          {stack ? `Building the ${stack.name} environment so you can dive in.` : 'Setting up your personalized training simulation...'}
        </p>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 text-left">
        {steps.map((step, index) => {
          const beforeStep = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 py-2 ${beforeStep ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-gray-500'}`}
            >
              {beforeStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : isActive ? (
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
              )}
              <span className="text-sm">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const SimulatorView = ({ onComplete, stack }: SimulatorViewProps) => (
  <div className="min-h-screen bg-gray-100 flex">
    <aside className="w-80 bg-white border-r">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">API Integration Challenge</h2>
        <p className="text-sm text-gray-600 mt-1">{stack ? `${stack.name} focus` : 'Stripe-like payment processing'}</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" />
          <span className="text-sm text-green-600">Environment Active</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <section>
          <h3 className="font-semibold text-gray-900 mb-3">Your Task</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              The payment dashboard is showing errors. Users can't complete transactions. You need to debug the API integration
              and restore the connection between the frontend React component and the Node.js payment service.
            </p>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 mb-3">AI Mentor</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  I've detected the error is in the payment validation. Check the API endpoint configuration. Would you like me to show you the network tab?
                </p>
                <button className="text-blue-600 text-sm mt-2 hover:underline" type="button">
                  Ask for hint
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
          <div className="space-y-3">
            <ProgressItem icon={<CheckCircle className="h-5 w-5 text-green-500" />} label="Identify the bug location" />
            <ProgressItem icon={<CheckCircle className="h-5 w-5 text-green-500" />} label="Review API documentation" />
            <ProgressItem icon={<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />} label="Fix the validation logic" labelClassName="text-blue-600" />
            <ProgressItem icon={<div className="w-5 h-5 border-2 border-gray-300 rounded-full" />} label="Test the solution" labelClassName="text-gray-400" />
          </div>
        </section>
      </div>
    </aside>

    <main className="flex-1 flex flex-col">
      <div className="bg-white border-b p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SimuWork logo" className="h-10 w-auto rounded-md shadow-sm" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-gray-900">SimuWork Simulator</p>
              <p className="text-xs text-gray-500">{stack ? `${stack.name} track` : 'API integration training'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6 lg:gap-8 lg:flex-1">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm" type="button">
                <Play className="h-4 w-4" />
                Run Code
              </button>
              <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm" type="button">
                <AlertCircle className="h-4 w-4" />
                Debug Mode
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Time: 23:45</span>
              <button onClick={onComplete} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" type="button">
                Complete Challenge
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <section className="w-1/2 bg-gray-900 text-gray-100">
          <header className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="text-sm">PaymentService.js</span>
            </div>
          </header>
          <div className="p-4 font-mono text-sm overflow-auto">
            <pre className="text-gray-300 whitespace-pre-wrap">{`// Payment validation endpoint
app.post('/api/payments/validate', async (req, res) => {
  const { amount, currency, paymentMethod } = req.body;
  
  // BUG: Missing validation for required fields
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount'
    });
  }
  
  try {
    const result = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency || 'usd',
      payment_method: paymentMethod,
      confirm: true
    });
    
    res.json({ success: true, paymentIntent: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`}</pre>
          </div>
        </section>

        <section className="w-1/2 bg-white border-l">
          <header className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" aria-hidden="true" />
              <span className="text-sm">Payment Dashboard (Preview)</span>
            </div>
          </header>
          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-800 font-medium">Payment Failed</span>
              </div>
              <p className="text-red-700 text-sm mt-1">Error: Cannot read property 'currency' of undefined</p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Test Payment</h3>
              <label className="block text-sm font-medium text-gray-700">
                Amount
                <input type="number" className="mt-1 w-full border rounded-lg px-3 py-2" value="99.99" disabled />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Currency
                <select className="mt-1 w-full border rounded-lg px-3 py-2" disabled>
                  <option>USD</option>
                </select>
              </label>
              <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg opacity-50 cursor-not-allowed" type="button">
                Process Payment (Failing)
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
);

const StatCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const ProgressItem = ({ icon, label, labelClassName }: { icon: ReactNode; label: string; labelClassName?: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span className={`text-sm ${labelClassName ?? 'text-gray-700'}`}>{label}</span>
  </div>
);

const difficultyBadgeClass = (difficulty: string) => {
  switch (difficulty) {
    case 'Advanced':
      return 'bg-red-100 text-red-800';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
};
