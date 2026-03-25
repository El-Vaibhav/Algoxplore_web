import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import GraphPage from "./pages/GraphPage.tsx";
import SortingPage from "./pages/SortingPage.tsx";
import SchedulingPage from "./pages/SchedulingPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import GraphComparePage from "./pages/GraphComparePage";
import SortingComparePage from "./pages/SortingComparePage";
import SchedulingComparePage from "./pages/SchedulingComparePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/sorting" element={<SortingPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/graph-compare" element={<GraphComparePage />} />
          <Route path="/sorting-compare" element={<SortingComparePage />} />
          <Route path="/scheduling-compare" element={<SchedulingComparePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
