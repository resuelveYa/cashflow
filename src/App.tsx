// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from 'react';
import { supabase } from "./lib/supabase";
import { setTokenGetter } from "./services/apiService"; // Updated name
import { AuthProvider } from "./context/AuthContext";
import { CostCenterProvider } from "./context/CostCenterContext";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import CashFlow from "./pages/CashFlow/CashFlow";
import Cotizaciones from "./pages/Costs/Cotizaciones";
import SubcontratosCredito from "./pages/Costs/SubcontratosCredito";
import SubcontratosContado from "./pages/Costs/SubcontratosContado";
import GastosImprevistos from "./pages/Costs/GastosImprevistos";
import EgresossIndex from "./pages/Costs/CostsIndex";
import { BudgetAnalyzer } from "./components/BudgetAnalyzer/BudgetAnalyzer";
import IncomeTypesIndex from './pages/DynamicIncome/IncomeTypesIndex';
import IncomeDataList from './pages/DynamicIncome/IncomeDataList';
import IncomeDataForm from './pages/DynamicIncome/IncomeDataForm';
import IncomeDashboard from './pages/DynamicIncome/IncomeDashboard';
import ConsolidatedHome from './pages/Dashboard/ConsolidatedHome';
import ExpenseTypesIndex from './pages/DynamicExpense/ExpenseTypesIndex';
import ExpenseDataList from './pages/DynamicExpense/ExpenseDataList';
import ExpenseDataForm from './pages/DynamicExpense/ExpenseDataForm';
import ExpenseDashboard from './pages/DynamicExpense/ExpenseDashboard';
import CostCentersIndex from './pages/CostCenters/CostCentersIndex';
import { User } from "@supabase/supabase-js";

// Token provider (Supabase version)
function SupabaseTokenProvider({ session }: { session: any }) {
  useEffect(() => {
    if (session) {
      setTokenGetter(async () => {
        try {
          return session.access_token;
        } catch (error) {
          console.error('[SupabaseTokenProvider] Error:', error);
          return null;
        }
      });
    }
  }, [session]);

  return null;
}

// Loading screen
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to landing sign-in
    const baseUrl = 'https://resuelveya.cl'
    const redirectUrl = encodeURIComponent(window.location.origin + window.location.pathname)
    window.location.href = `${baseUrl}/sign-in?redirect_url=${redirectUrl}`
    return null;
  }

  return (
    <>
      <SupabaseTokenProvider session={session} />
      <Router>
        <AuthProvider>
          <CostCenterProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<ConsolidatedHome />} />
                <Route path="/cash-flow" element={<CashFlow />} />
                <Route path="/budget-analysis" element={<BudgetAnalyzer />} />
                {/* ... (rest of routes) */}
                <Route path="/costos" element={<EgresossIndex />} />
                <Route path="/costos/index" element={<EgresossIndex />} />
                <Route path="/costos/cotizaciones" element={<Cotizaciones />} />
                <Route path="/costos/subcontratos-credito" element={<SubcontratosCredito />} />
                <Route path="/costos/subcontratos-contado" element={<SubcontratosContado />} />
                <Route path="/costos/imprevistos" element={<GastosImprevistos />} />
                <Route path="/centros-costo" element={<CostCentersIndex />} />
                <Route path="/ingresos/resumen" element={<IncomeDashboard />} />
                <Route path="/ingresos/tipos" element={<IncomeTypesIndex />} />
                <Route path="/ingresos/datos/:typeName" element={<IncomeDataList />} />
                <Route path="/ingresos/datos/nuevo" element={<IncomeDataForm />} />
                <Route path="/ingresos/datos/:id/editar" element={<IncomeDataForm />} />
                <Route path="/egresos/resumen" element={<ExpenseDashboard />} />
                <Route path="/egresos/tipos" element={<ExpenseTypesIndex />} />
                <Route path="/egresos/datos/:typeName" element={<ExpenseDataList />} />
                <Route path="/egresos/datos/nuevo" element={<ExpenseDataForm />} />
                <Route path="/egresos/datos/:id/editar" element={<ExpenseDataForm />} />
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />
                <Route path="/form-elements" element={<FormElements />} />
                <Route path="/basic-tables" element={<BasicTables />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CostCenterProvider>
        </AuthProvider>
      </Router>
    </>
  );
}