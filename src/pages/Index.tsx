import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout"; // Import Layout
import MissingAdditionalDataList from "@/components/dashboard/MissingAdditionalDataList"; // Import new component

const Index = () => {
  return (
    <Layout> {/* Wrap content with Layout */}
      <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo à sua Aplicação CRM</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Comece a gerir os seus clientes do setor automóvel aqui!
          </p>
          <Link to="/crm">
            <Button size="lg" className="px-8 py-4 text-lg">
              Ver CRM de Clientes
            </Button>
          </Link>
        </div>
        <div className="w-full max-w-2xl"> {/* Container for the new list */}
          <MissingAdditionalDataList />
        </div>
      </div>
    </Layout>
  );
};

export default Index;