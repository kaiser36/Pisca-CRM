"use client";

import React from 'react';
import { Company, Negocio, CompanyAdditionalExcelData } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BellRing, CheckCircle, Info } from 'lucide-react';
import { isPast, parseISO, differenceInMonths, differenceInDays, format } from 'date-fns';

interface AlertsCardProps {
  crmCompany: Company | undefined;
  deals: Negocio[];
  companyAdditional: CompanyAdditionalExcelData | null;
}

const AlertsCard: React.FC<AlertsCardProps> = ({ crmCompany, deals, companyAdditional }) => {
  const isVisitOld = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    try {
      const date = parseISO(dateString);
      return differenceInMonths(new Date(), date) >= 3;
    } catch {
      return false;
    }
  };

  const alerts: string[] = [];

  const planExpirationDate = crmCompany?.Plan_Expiration_Date || null;
  if (planExpirationDate && isPast(parseISO(planExpirationDate))) {
    alerts.push("O plano da empresa expirou!");
  }

  if (!crmCompany?.Plan_Active) {
    alerts.push("O plano da empresa não está ativo!");
  }

  const lastVisitDate = companyAdditional?.["Data ultima visita"] || crmCompany?.Last_Visit_Date || null;
  if (isVisitOld(lastVisitDate)) {
    alerts.push("A última visita foi há mais de 3 meses.");
  }

  const lastLoginDate = crmCompany?.Last_Login_Date;
  if (lastLoginDate) {
    try {
      const loginDate = parseISO(lastLoginDate);
      if (differenceInDays(new Date(), loginDate) > 7) {
        alerts.push(`Último login há mais de uma semana: ${format(loginDate, 'dd/MM/yyyy')}`);
      }
    } catch (e) {
      console.warn(`Could not parse Last_Login_Date for CRM Company ${crmCompany?.Company_id}: ${lastLoginDate}`);
    }
  }

  deals.forEach(deal => {
    if (deal.expected_close_date) {
      try {
        const expectedCloseDate = parseISO(deal.expected_close_date);
        if (isPast(expectedCloseDate)) {
          alerts.push(`Negócio "${deal.deal_name}" com data de fecho expirada: ${format(expectedCloseDate, 'dd/MM/yyyy')}`);
        }
      } catch (e) {
        console.warn(`Could not parse expected_close_date for deal ${deal.id}: ${deal.expected_close_date}`);
      }
    }
  });

  if (crmCompany?.Is_CRB_Partner === true && crmCompany?.Financing_Simulator_On === false) {
    alerts.push("É Parceiro Credibom, mas o Simulador de Financiamento está desativado.");
  }

  if (crmCompany?.Plan_Active === true && crmCompany?.Plan_Auto_Renewal === false) {
    alerts.push("Plano ativo, mas a Renovação Automática está desativada.");
  }

  if (companyAdditional?.["Classificação"] === "Empresa encerrada") {
    alerts.push("⛔ Empresa encerrada.");
  }

  return (
    <Card className={`shadow-sm ${alerts.length > 0 ? 'bg-destructive/5 border-destructive/50' : 'bg-yellow-50 border-yellow-200'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center ${alerts.length > 0 ? 'text-destructive' : 'text-yellow-800'}`}>
          <BellRing className="mr-2 h-5 w-5" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <Alert className="bg-transparent border-none p-0 text-yellow-800">
            <AlertDescription className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" /> Sem alertas pendentes.
            </AlertDescription>
          </Alert>
        ) : (
          alerts.map((alert, index) => (
            <Alert key={index} variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive p-2">
              <AlertDescription className="flex items-center">
                <Info className="mr-2 h-4 w-4" /> {alert}
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsCard;