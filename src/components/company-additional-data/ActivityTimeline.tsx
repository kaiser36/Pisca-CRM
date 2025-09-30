"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { fetchAccountContactsByCompanyExcelId, fetchTasksByCompanyExcelId, fetchEasyvistasByCompanyExcelId, fetchDealsByCompanyExcelId, fetchAccounts } from '@/integrations/supabase/utils';
import { AccountContact, Task, Easyvista, Negocio, Account } from '@/types/crm';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Loader2, MessageSquare, ListTodo, Eye, Handshake, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimelineItem = {
  id: string;
  type: 'contact' | 'task' | 'easyvista' | 'deal';
  date: Date;
  title: string;
  description: string | null;
  actorName: string | null;
  actorAvatar: string | null;
};

const ActivityTimeline: React.FC = () => {
  const { companyExcelId } = useParams<{ companyExcelId: string }>();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getSession();
  }, []);

  useEffect(() => {
    if (!userId || !companyExcelId) return;

    const fetchAllActivities = async () => {
      setIsLoading(true);
      try {
        const [contacts, tasks, easyvistas, deals, accounts] = await Promise.all([
          fetchAccountContactsByCompanyExcelId(userId, companyExcelId),
          fetchTasksByCompanyExcelId(userId, companyExcelId),
          fetchEasyvistasByCompanyExcelId(userId, companyExcelId),
          fetchDealsByCompanyExcelId(userId, companyExcelId),
          fetchAccounts(userId)
        ]);

        const accountsMap = new Map<string, Account>();
        accounts.forEach(acc => {
          if (acc.am) accountsMap.set(acc.am, acc);
          if (acc.account_name) accountsMap.set(acc.account_name, acc);
        });

        const getActor = (name: string | null | undefined) => {
          if (!name) return { actorName: 'Sistema', actorAvatar: null };
          const account = accountsMap.get(name);
          return {
            actorName: name,
            actorAvatar: account?.photo_url || null
          };
        };

        const contactItems: TimelineItem[] = contacts.map(c => ({
          id: `contact-${c.id}`,
          type: 'contact',
          date: new Date(c.created_at || c.contact_date || Date.now()),
          title: `Criou um contacto: ${c.subject || 'Sem assunto'}`,
          description: c.report_text || null,
          ...getActor(c.account_am),
        }));

        const taskItems: TimelineItem[] = tasks.map(t => ({
          id: `task-${t.id}`,
          type: 'task',
          date: new Date(t.created_at || Date.now()),
          title: `Criou uma tarefa: ${t.title}`,
          description: t.description || null,
          ...getActor(t.assigned_to_employee_name),
        }));

        const easyvistaItems: TimelineItem[] = easyvistas.map(e => ({
          id: `easyvista-${e.id}`,
          type: 'easyvista',
          date: new Date(e.created_at || e["Data Criação"] || Date.now()),
          title: `Criou um registo Easyvista: ${e["Titulo"] || 'Sem título'}`,
          description: e["Descrição"] || null,
          ...getActor(e["Account"]),
        }));

        const dealItems: TimelineItem[] = deals.map(d => ({
          id: `deal-${d.id}`,
          type: 'deal',
          date: new Date(d.created_at || Date.now()),
          title: `Criou um negócio: ${d.deal_name}`,
          description: d.notes || null,
          ...getActor(d.assigned_to_am_name),
        }));

        const allItems = [...contactItems, ...taskItems, ...easyvistaItems, ...dealItems];
        allItems.sort((a, b) => b.date.getTime() - a.date.getTime());

        setTimeline(allItems);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllActivities();
  }, [userId, companyExcelId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feed de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Nenhuma atividade recente para esta empresa.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feed de Atividade</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="relative pl-8">
            <div className="absolute left-3 top-0 h-full w-px bg-gray-200"></div>
            {timeline.map((item) => (
              <div key={item.id} className="relative mb-8">
                <div className="absolute -left-5 top-0">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={item.actorAvatar || undefined} />
                    <AvatarFallback className="bg-gray-200 text-gray-500">
                      {item.actorName ? item.actorName.charAt(0) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-4">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800">{item.actorName}</span>
                    <span className="text-gray-500">
                      {' '}
                      - {formatDistanceToNow(item.date, { addSuffix: true, locale: pt })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;