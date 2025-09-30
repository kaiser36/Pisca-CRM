import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Package, Users, Building, Info, Link as LinkIcon, Calendar, User, Star, Percent, ShoppingCart, Briefcase, DollarSign, BarChart2, CheckCircle, XCircle, ExternalLink, Truck, Tag, FileText, Globe, Mail } from "lucide-react";

const CompanyAdditionalOverviewCards = ({ additionalData }) => {
  if (!additionalData) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Nenhuma informação adicional disponível.</p>
      </div>
    );
  }

  const renderField = (Icon, label, value, { isLink = false, isBoolean = false, theme = 'default' } = {}) => {
    if (value === null || value === undefined || value === '') return null;

    let displayValue = value;
    if (isBoolean) {
      // Adjusted colors for better visibility on different backgrounds
      displayValue = value ? <CheckCircle className="h-5 w-5 text-green-400" /> : <XCircle className="h-5 w-5 text-red-400" />;
    }
    
    const themeClasses = {
      default: {
        icon: "text-gray-400",
        label: "text-gray-600",
        value: "text-gray-800",
        link: "text-blue-500 hover:underline",
      },
      inverse: {
        icon: "text-blue-200",
        label: "text-blue-100",
        value: "text-white",
        link: "text-white hover:underline font-medium",
      }
    }
    
    const classes = themeClasses[theme];

    return (
      <div className="flex items-start space-x-3 mb-3">
        <Icon className={`h-5 w-5 ${classes.icon} mt-1 flex-shrink-0`} />
        <div className="min-w-0">
          <p className={`text-sm font-medium ${classes.label}`}>{label}</p>
          {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className={`text-sm ${classes.link} break-all flex items-center`}>
              {value} <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          ) : (
            <div className={`text-sm ${classes.value}`}>{displayValue}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {/* Pisca Card */}
      <Card className="p-4 shadow-lg rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-white">
          <Package className="mr-2 h-5 w-5" /> Pisca
        </CardTitle>
        <CardContent>
          {renderField(Info, "Nome Comercial", additionalData["Nome Comercial"], { theme: 'inverse' })}
          {renderField(Mail, "Email da empresa", additionalData["Email da empresa"], { theme: 'inverse' })}
          {renderField(Building, "Morada", additionalData["Morada"], { theme: 'inverse' })}
          {renderField(Building, "Cidade", additionalData["Cidade"], { theme: 'inverse' })}
          {renderField(Building, "Distrito", additionalData["Distrito"], { theme: 'inverse' })}
          {renderField(Building, "Código Postal", additionalData["STAND_POSTAL_CODE"], { theme: 'inverse' })}
        </CardContent>
      </Card>

      {/* AM & Stock Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-green-500/50 bg-green-500/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-green-700">
          <Users className="mr-2 h-5 w-5" /> AM & Stock
        </CardTitle>
        <CardContent>
          {renderField(User, "AM (Antigo)", additionalData["AM_OLD"])}
          {renderField(User, "AM (Atual)", additionalData["AM"])}
          {renderField(Package, "Stock STV", additionalData["Stock STV"])}
          {renderField(ShoppingCart, "Stock na empresa", additionalData["Stock na empresa"])}
        </CardContent>
      </Card>

      {/* Online Presence Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-blue-500/50 bg-blue-500/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-blue-700">
          <Globe className="mr-2 h-5 w-5" /> Presença Online
        </CardTitle>
        <CardContent>
          {renderField(LinkIcon, "API", additionalData["API"], { isLink: true })}
          {renderField(Globe, "Site", additionalData["Site"], { isLink: true })}
          {renderField(DollarSign, "Investimento Redes Sociais", additionalData["Investimento redes sociais"])}
          {renderField(DollarSign, "Investimento em Portais", additionalData["Investimento em portais"])}
        </CardContent>
      </Card>

      {/* Business Info Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-purple-500/50 bg-purple-500/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-purple-700">
          <Briefcase className="mr-2 h-5 w-5" /> Informações de Negócio
        </CardTitle>
        <CardContent>
          {renderField(Star, "Classificação", additionalData["Classificação"])}
          {renderField(Percent, "Percentagem de Importados", additionalData["Percentagem de Importados"])}
          {renderField(Truck, "Onde compra as viaturas", additionalData["Onde compra as viaturas"])}
          {renderField(Users, "Concorrência", additionalData["Concorrencia"])}
          {renderField(CheckCircle, "Mercado B2B", additionalData["Mercado b2b"], { isBoolean: true })}
        </CardContent>
      </Card>

      {/* CRM & Credit Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-yellow-500/50 bg-yellow-500/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-yellow-700">
          <BarChart2 className="mr-2 h-5 w-5" /> CRM & Crédito
        </CardTitle>
        <CardContent>
          {renderField(CheckCircle, "Utiliza CRM", additionalData["Utiliza CRM"], { isBoolean: true })}
          {renderField(FileText, "Qual o CRM", additionalData["Qual o CRM"])}
          {renderField(Tag, "Plano Indicado", additionalData["Plano Indicado"])}
          {renderField(CheckCircle, "Mediador de crédito", additionalData["Mediador de credito"], { isBoolean: true })}
          {renderField(LinkIcon, "Link do Banco de Portugal", additionalData["Link do Banco de Portugal"], { isLink: true })}
          {renderField(FileText, "Financeiras com acordo", additionalData["Financeiras com acordo"])}
        </CardContent>
      </Card>

      {/* Other Info Card */}
      <Card className="p-4 shadow-subtle border-l-4 border-red-500/50 bg-red-500/5 rounded-lg">
        <CardTitle className="text-lg font-semibold mb-3 flex items-center text-red-700">
          <Info className="mr-2 h-5 w-5" /> Outras Informações
        </CardTitle>
        <CardContent>
          {renderField(Calendar, "Data última visita", additionalData["Data ultima visita"])}
          {renderField(Users, "Grupo", additionalData["Grupo"])}
          {renderField(Tag, "Marcas representadas", additionalData["Marcas representadas"])}
          {renderField(Briefcase, "Tipo de empresa", additionalData["Tipo de empresa"])}
          {renderField(CheckCircle, "Quer CT", additionalData["Quer CT"], { isBoolean: true })}
          {renderField(CheckCircle, "Quer ser parceiro Credibom", additionalData["Quer ser parceiro Credibom"], { isBoolean: true })}
          {renderField(Info, "Autobiz", additionalData["Autobiz"])}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyAdditionalOverviewCards;