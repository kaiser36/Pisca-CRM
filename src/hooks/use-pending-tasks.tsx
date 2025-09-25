"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/crm';
import { fetchTasksForUser } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

export function usePendingTasks() {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPendingTasks = useCallback(async () => {
    if (!userId) {
      setPendingTasks([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const tasks = await fetchTasksForUser(userId, 'Pending');
      setPendingTasks(tasks);
    } catch (err: any) {
      console.error("Erro ao carregar tarefas pendentes:", err);
      setError(err.message || "Falha ao carregar tarefas pendentes.");
      showError(err.message || "Falha ao carregar tarefas pendentes.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadPendingTasks();
    }
  }, [userId, loadPendingTasks]);

  return { pendingTasks, isLoading, error, refreshTasks: loadPendingTasks };
}