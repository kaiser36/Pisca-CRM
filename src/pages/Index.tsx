import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CompanyOverviewDashboard from "@/components/dashboard/CompanyOverviewDashboard";
import Layout from "@/components/layout/Layout";

const Index = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="text-center p-8 bg-card rounded-lg shadow-md mb-8 w-full max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-primary">Bem-vindo à sua Aplicação CRM</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Comece a gerir os seus clientes do setor automóvel aqui!
          </p>
          <Link to="/crm">
            <Button size="lg" className="px-8 py-4 text-lg shadow-sm hover:shadow-md transition-shadow">
              Ver CRM de Clientes
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-2xl mb-8">
          <CompanyOverviewDashboard />
        </div>

        <MadeWithDyad />
      </div>
    </Layout>
  );
};

export default Index;