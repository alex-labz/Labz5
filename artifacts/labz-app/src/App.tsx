import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BASE_URL } from "@/lib/utils";

// Pages
import Home from "@/pages/home";
import AppPage from "@/pages/app";
import InfluencersPage from "@/pages/influencers";
import CasesPage from "@/pages/cases";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/app" component={AppPage} />
      <Route path="/influencers" component={InfluencersPage} />
      <Route path="/cases" component={CasesPage} />
      <Route path="/dhbesjxbx" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={BASE_URL}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
