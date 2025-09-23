import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout"; // Import Layout
import MissingAdditionalDataList from "@/components/dashboard/MissingAdditionalDataList"; // New import

const Index = () => {
  return (
    <Layout> {/* Wrap content with Layout */}
      <div className="container mx-auto p-6 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo à sua Aplicação CRM</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Comece a gerir os seus clientes do setor automóvel aqui!
            </p>
            <Link to="/crm">
              <Button size="lg" className="px-8 py-4 text-lg">
                Ver CRM de Clientes
              </Button>
            </Link>
          </div>
          <MissingAdditionalDataList /> {/* Add the new component here */}
        </div>
      </div>
    </Layout>
  );
};

export default Index;