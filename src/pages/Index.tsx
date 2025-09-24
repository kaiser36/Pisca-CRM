import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import CompanyOverviewDashboard from "@/components/dashboard/CompanyOverviewDashboard";
import Layout from "@/components/layout/Layout";
import { showSuccess } from "@/utils/toast"; // Importar a função showSuccess

import Button from '@mui/material/Button'; // Import MUI Button
import Card from '@mui/material/Card'; // Import MUI Card
import CardContent from '@mui/material/CardContent'; // Import MUI CardContent
import Typography from '@mui/material/Typography'; // Import MUI Typography

const Index = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card sx={{ textAlign: 'center', padding: 4, marginBottom: 4, width: '100%', maxWidth: 600, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Bem-vindo à sua Aplicação CRM
            </Typography>
            <Typography variant="h6" component="p" sx={{ marginBottom: 4, color: 'text.secondary' }}>
              Comece a gerir os seus clientes do setor automóvel aqui!
            </Typography>
            <Link to="/crm">
              <Button variant="contained" size="large" sx={{ px: 4, py: 2, fontSize: '1.125rem', boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                Ver CRM de Clientes
              </Button>
            </Link>
            <Button 
              onClick={() => showSuccess("Este é um toast de teste!")} 
              sx={{ mt: 2, ml: 2, px: 4, py: 2, fontSize: '1.125rem', boxShadow: 1, '&:hover': { boxShadow: 3 } }}
              variant="outlined"
            >
              Mostrar Toast de Teste
            </Button>
          </CardContent>
        </Card>

        <div className="w-full max-w-2xl mb-8">
          <CompanyOverviewDashboard />
        </div>

        <MadeWithDyad />
      </div>
    </Layout>
  );
};

export default Index;