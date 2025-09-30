import { useState, useMemo, ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Building, User, Phone, Mail, Globe, Briefcase, Star, Tag, Users, Package, DollarSign, BarChart2, Info, Link as LinkIcon, Calendar, Truck, Percent, ShoppingCart, FileText } from "lucide-react";
import { Company, CompanyAdditionalExcelData } from "@/types";
import CompanyAdditionalOverviewCards from "./CompanyAdditionalOverviewCards";

interface CompanyAdditionalDetailCardProps {
  company: CompanyAdditionalExcelData;
  crmCompany: Company;
}

const CompanyAdditionalDetailCard = ({ company, crmCompany }: CompanyAdditionalDetailCardProps) => {
  const [showAllStands, setShowAllStands] = useState(false);

  const stands = crmCompany?.stands || [];
  const visibleStands = showAllStands ? stands : stands.slice(0, 3);

  const alerts = useMemo(() => {
    const alertsList: string[] = [];
    if (company?.["Stock STV"] === 0) {
      alertsList.push("Stock STV está a zero.");
    }
    if (company?.["Stock na empresa"] === 0) {
      alertsList.push("Stock na empresa está a zero.");
    }
    if (!company?.["Site"]) {
      alertsList.push("Não tem site configurado.");
    }
    if (company?.["Utiliza CRM"] === false) {
      alertsList.push("Não utiliza CRM.");
    }
    return alertsList;
  }, [company]);

  const totalPublicados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.publicados || 0), 0), [stands]);
  const totalArquivados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.arquivados || 0), 0), [stands]);
  const totalGuardados = useMemo(() => stands.reduce((acc, stand) => acc + (stand.guardados || 0), 0), [stands]);
  const totalLeadsRecebidas = useMemo(() => stands.reduce((acc, stand) => acc + (stand.leads_recebidas || 0), 0), [stands]);
  const totalLeadsPendentes = useMemo(() => stands.reduce((acc, stand) => acc + (stand.leads_pendentes || 0), 0), [stands]);
  const totalLeadsExpiradas = useMemo(() => stands.reduce((acc, stand) => acc + (stand.leads_expiradas || 0), 0), [stands]);

  const renderField = (Icon: ElementType, label: string, value: string | number | boolean | undefined | null, { isLink = false, isBoolean = false } = {}) => {
    if (value === null || value === undefined || value === '') return null;

    let displayValue: React.ReactNode = value;
    if (isBoolean) {
      displayValue = value ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
    }

    return (
      <div className="flex items-start space-x-3 mb-2">
        <Icon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          {isLink && typeof value === 'string' ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all flex items-center">
              {value} <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          ) : (
            <div className="text-sm text-gray-800">{displayValue}</div>
          )}
        </div>
      </div>
    );
  };

  if (!company) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detalhes Adicionais da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foram encontrados dados adicionais para esta empresa.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="mr-2" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-yellow-700">
              {alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <CompanyAdditionalOverviewCards
        additionalData={company}
      />

      {/* Stands Section */}
      <Card>
        <CardHeader>
          <CardTitle>Stands ({stands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {stands.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleStands.map((stand) => (
                  <Card key={stand.id} className="p-4">
                    <CardTitle className="text-md mb-2">{stand.stand_name || 'Stand sem nome'}</CardTitle>
                    {renderField(Building, "Morada", `${stand.address}, ${stand.city}`)}
                    {renderField(Phone, "Telefone", stand.phone)}
                    {renderField(Mail, "Email", stand.email)}
                    {renderField(User, "Pessoa de Contacto", stand.contact_person)}
                  </Card>
                ))}
              </div>
              {stands.length > 3 && (
                <Button onClick={() => setShowAllStands(!showAllStands)} variant="link" className="mt-4">
                  {showAllStands ? 'Mostrar menos' : 'Mostrar todos'}
                </Button>
              )}
              <hr className="my-6" />
              <h3 className="text-lg font-semibold mb-4">Resumo dos Stands</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-gray-100 rounded">
                  <p className="text-sm text-gray-500">Publicados</p>
                  <p className="text-xl font-bold">{totalPublicados}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <p className="text-sm text-gray-500">Arquivados</p>
                  <p className="text-xl font-bold">{totalArquivados}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded">
                  <p className="text-sm text-gray-500">Guardados</p>
                  <p className="text-xl font-bold">{totalGuardados}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded">
                  <p className="text-sm text-blue-500">Leads Recebidas</p>
                  <p className="text-xl font-bold text-blue-700">{totalLeadsRecebidas}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded">
                  <p className="text-sm text-yellow-500">Leads Pendentes</p>
                  <p className="text-xl font-bold text-yellow-700">{totalLeadsPendentes}</p>
                </div>
                <div className="p-2 bg-red-100 rounded">
                  <p className="text-sm text-red-500">Leads Expiradas</p>
                  <p className="text-xl font-bold text-red-700">{totalLeadsExpiradas}</p>
                </div>
              </div>
            </>
          ) : (
            <p>Não existem stands associados a esta empresa.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyAdditionalDetailCard;