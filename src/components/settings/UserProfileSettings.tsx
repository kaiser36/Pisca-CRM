"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from '@/context/SessionContext';
import { updateUserProfile, uploadUserAvatar, deleteUserAvatar, fetchAvailableAmAccountsForLinking, updateAmAccountLink } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { UserProfile, Account } from '@/types/crm';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Image as ImageIcon, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  first_name: z.string().min(1, "O nome é obrigatório").nullable().optional(),
  last_name: z.string().min(1, "O apelido é obrigatório").nullable().optional(),
  avatarFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(File).nullable().optional(),
  am_account_id: z.string().nullable().optional(), // NEW: Field for linking to AM account
  phone_views_conversion_percentage: z.preprocess( // NEW
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "A percentagem não pode ser negativa").max(100, "A percentagem não pode ser superior a 100").nullable().optional()
  ),
  whatsapp_interactions_conversion_percentage: z.preprocess( // NEW
    (val) => (val === "" ? null : Number(val)),
    z.number().min(0, "A percentagem não pode ser negativa").max(100, "A percentagem não pode ser superior a 100").nullable().optional()
  ),
});

type FormData = z.infer<typeof formSchema>;

const UserProfileSettings: React.FC = () => {
  const { user, profile, amAccount, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [availableAmAccounts, setAvailableAmAccounts] = useState<Account[]>([]); // NEW: State for available AMs
  const [isAmAccountsLoading, setIsAmAccountsLoading] = useState(true); // NEW: Loading state for AMs

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      avatarFile: null,
      am_account_id: amAccount?.id || '', // NEW: Initialize with current linked AM
      phone_views_conversion_percentage: profile?.phone_views_conversion_percentage ?? 100, // NEW
      whatsapp_interactions_conversion_percentage: profile?.whatsapp_interactions_conversion_percentage ?? 100, // NEW
    },
  });

  // Update form defaults when profile or amAccount changes
  useEffect(() => {
    form.reset({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      avatarFile: null,
      am_account_id: amAccount?.id || '',
      phone_views_conversion_percentage: profile?.phone_views_conversion_percentage ?? 100, // NEW
      whatsapp_interactions_conversion_percentage: profile?.whatsapp_interactions_conversion_percentage ?? 100, // NEW
    });
    setCurrentAvatarUrl(profile?.avatar_url || null);
    setSelectedImage(null);
  }, [profile, amAccount, form]);

  // NEW: Fetch available AM accounts for linking
  useEffect(() => {
    const loadAvailableAmAccounts = async () => {
      if (!user?.id) return;
      setIsAmAccountsLoading(true);
      try {
        const accounts = await fetchAvailableAmAccountsForLinking(user.id);
        setAvailableAmAccounts(accounts);
      } catch (err: any) {
        console.error("Erro ao carregar contas AM disponíveis:", err);
        showError(err.message || "Falha ao carregar a lista de contas AM.");
      } finally {
        setIsAmAccountsLoading(false);
      }
    };

    if (user?.id) {
      loadAvailableAmAccounts();
    }
  }, [user?.id]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      form.setValue('avatarFile', event.target.files[0]);
      setCurrentAvatarUrl(URL.createObjectURL(event.target.files[0])); // Show preview of new image
    } else {
      setSelectedImage(null);
      form.setValue('avatarFile', null);
      setCurrentAvatarUrl(profile?.avatar_url || null); // Revert to original if no new file
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.id || !profile?.avatar_url) {
      showError("Utilizador não autenticado ou sem avatar para remover.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract file path from URL
      const urlParts = profile.avatar_url.split(`${user.id}/avatars/`);
      if (urlParts.length < 2) {
        throw new Error("URL de imagem inválido para remoção.");
      }
      const filePath = `${user.id}/avatars/${urlParts[1]}`;

      await deleteUserAvatar(filePath);
      await updateUserProfile(user.id, { avatar_url: null });
      
      showSuccess("Fotografia de perfil eliminada com sucesso!");
      await refreshProfile(); // Refresh session context to update UI
    } catch (error: any) {
      console.error("Erro ao eliminar fotografia:", error);
      showError(error.message || "Falha ao eliminar a fotografia de perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: FormData) => {
    if (!user?.id) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }

    setIsSubmitting(true);
    let newAvatarUrl: string | null = profile?.avatar_url || null;

    try {
      // Handle avatar upload/removal
      if (selectedImage) {
        newAvatarUrl = await uploadUserAvatar(selectedImage, user.id);
      } else if (currentAvatarUrl === null && profile?.avatar_url !== null) {
        newAvatarUrl = null;
      }

      // Update user profile (first_name, last_name, avatar_url)
      const updatedProfileData: Partial<Omit<UserProfile, 'id' | 'updated_at'>> = {
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        avatar_url: newAvatarUrl,
        phone_views_conversion_percentage: values.phone_views_conversion_percentage, // NEW
        whatsapp_interactions_conversion_percentage: values.whatsapp_interactions_conversion_percentage, // NEW
      };
      await updateUserProfile(user.id, updatedProfileData);

      // NEW: Handle AM account linking
      const newAmAccountId = values.am_account_id === "null-am" ? null : values.am_account_id;
      if (newAmAccountId !== (amAccount?.id || null)) { // Only update if changed
        await updateAmAccountLink(user.id, newAmAccountId);
      }
      
      showSuccess("Perfil atualizado com sucesso!");
      await refreshProfile(); // Refresh session context to update UI
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      showError(error.message || "Falha ao atualizar o perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentAvatarUrl || undefined} alt={profile?.first_name || 'Avatar'} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {profile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {currentAvatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
              >
                <XCircle className="h-5 w-5 text-destructive" />
              </Button>
            )}
          </div>
          <div className="flex-1">
            <FormItem>
              <FormLabel>Alterar Fotografia de Perfil</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file:text-primary file:bg-primary/10 file:border-primary/20 file:hover:bg-primary/20"
                  disabled={isSubmitting}
                />
              </FormControl>
              {selectedImage && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>{selectedImage.name}</span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apelido</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* NEW: AM Account Link Field */}
          <FormField
            control={form.control}
            name="am_account_id"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Associar a Conta AM</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value === "null-am" ? null : value)}
                    value={field.value === null ? "null-am" : (field.value as string)}
                    disabled={isAmAccountsLoading || isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta AM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null-am">Nenhum</SelectItem>
                      {isAmAccountsLoading ? (
                        <SelectItem value="loading" disabled>A carregar AMs...</SelectItem>
                      ) : availableAmAccounts.length === 0 && !amAccount ? (
                        <SelectItem value="no-ams" disabled>Nenhuma conta AM disponível</SelectItem>
                      ) : (
                        availableAmAccounts.map((am) => (
                          <SelectItem key={am.id} value={am.id}>
                            {am.account_name || am.am || am.email || 'AM sem nome'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
            Redefinir
          </Button>
          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty || !form.formState.isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Guardar...
              </>
            ) : (
              "Guardar Alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserProfileSettings;