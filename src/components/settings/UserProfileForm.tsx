"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Image as ImageIcon, XCircle, User as UserIcon, Link as LinkIcon, PlusCircle, Building } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  fetchAccountByUserId,
  fetchAccountByEmailAndNullUserId,
  linkAccountToUser,
  insertAccount,
  fetchDistinctAccountRoles,
} from '@/integrations/supabase/utils';
import { Account } from '@/types/crm';

const formSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  avatar_url: z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  imageFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(File).nullable().optional(),
  // Fields for creating a new AM account
  new_am_account_name: z.string().nullable().optional(),
  new_am_phone_number: z.string().nullable().optional(),
  new_am_district: z.string().nullable().optional(),
  new_am_credibom_email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  new_am_role: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const UserProfileForm: React.FC = () => {
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  const [linkedAmAccount, setLinkedAmAccount] = useState<Account | null>(null);
  const [existingUnlinkedAmAccount, setExistingUnlinkedAmAccount] = useState<Account | null>(null);
  const [isAmLoading, setIsAmLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [isCreatingNewAmAccount, setIsCreatingNewAmAccount] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      avatar_url: profile?.avatar_url || '',
      imageFile: null,
      new_am_account_name: '',
      new_am_phone_number: '',
      new_am_district: '',
      new_am_credibom_email: '',
      new_am_role: 'user',
    },
  });

  // Update form defaults when profile data changes
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        imageFile: null,
        new_am_account_name: '',
        new_am_phone_number: '',
        new_am_district: '',
        new_am_credibom_email: '',
        new_am_role: 'user',
      });
      setCurrentAvatarUrl(profile.avatar_url || null);
    }
  }, [profile, form]);

  // Load AM account status and roles
  useEffect(() => {
    const loadAmData = async () => {
      if (!user?.id || !user?.email) {
        setIsAmLoading(false);
        return;
      }
      setIsAmLoading(true);
      try {
        // 1. Check if user is already linked to an AM account
        const linkedAccount = await fetchAccountByUserId(user.id);
        setLinkedAmAccount(linkedAccount);

        // 2. If not linked, check for an existing unlinked AM account by email
        if (!linkedAccount) {
          const unlinkedAccount = await fetchAccountByEmailAndNullUserId(user.email);
          setExistingUnlinkedAmAccount(unlinkedAccount);
        } else {
          setExistingUnlinkedAmAccount(null);
        }

        // 3. Fetch distinct roles for the new AM account form
        const roles = await fetchDistinctAccountRoles();
        setAvailableRoles(roles);

      } catch (error: any) {
        console.error("Error loading AM data:", error);
        showError(error.message || "Falha ao carregar dados do AM.");
      } finally {
        setIsAmLoading(false);
      }
    };

    if (user) {
      loadAmData();
    } else {
      setLinkedAmAccount(null);
      setExistingUnlinkedAmAccount(null);
      setIsAmLoading(false);
    }
  }, [user, refreshProfile]); // Depend on user and refreshProfile to reload AM data

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      form.setValue('imageFile', event.target.files[0]);
      setCurrentAvatarUrl(URL.createObjectURL(event.target.files[0])); // Show preview of new image
    } else {
      setSelectedImage(null);
      form.setValue('imageFile', null);
      setCurrentAvatarUrl(profile?.avatar_url || null); // Revert to original if no new file
    }
  };

  const handleRemoveImage = async () => {
    if (!user?.id) {
      showError("Utilizador não autenticado.");
      return;
    }
    if (!profile?.avatar_url) return;

    setIsSubmitting(true);
    try {
      // Extract file path from URL
      const urlParts = profile.avatar_url.split('/avatars/');
      if (urlParts.length < 2) {
        throw new Error("URL de imagem inválido para remoção.");
      }
      const filePath = urlParts[1]; // e.g., 'user_id/filename.jpg'

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting image:', deleteError);
        throw new Error(`Falha ao eliminar a imagem: ${deleteError.message}`);
      }

      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      setCurrentAvatarUrl(null);
      setSelectedImage(null);
      form.setValue('avatar_url', null);
      showSuccess("Fotografia eliminada com sucesso!");
      await refreshProfile(); // Refresh profile in context
    } catch (error: any) {
      console.error("Erro ao eliminar fotografia:", error);
      showError(error.message || "Falha ao eliminar a fotografia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`; // Unique name per user and timestamp
    const filePath = `${userId}/${fileName}`; // Store under user's ID

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      throw new Error(`Falha ao carregar o avatar: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (values: FormData) => {
    if (!user?.id) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar os dados.");
      return;
    }

    setIsSubmitting(true);
    let newAvatarUrl: string | null = values.avatar_url || null;

    try {
      if (selectedImage) {
        newAvatarUrl = await uploadAvatar(selectedImage, user.id);
      } else if (currentAvatarUrl === null && profile?.avatar_url !== null) {
        newAvatarUrl = null;
      } else if (!selectedImage && currentAvatarUrl !== null && profile?.avatar_url !== currentAvatarUrl) {
        newAvatarUrl = values.avatar_url;
      } else if (!selectedImage && currentAvatarUrl !== null && profile?.avatar_url === currentAvatarUrl) {
        newAvatarUrl = profile?.avatar_url || null;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name || null,
          last_name: values.last_name || null,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message);
      }

      showSuccess("Perfil atualizado com sucesso!");
      await refreshProfile();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      showError(error.message || "Falha ao atualizar o perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkExistingAmAccount = async () => {
    if (!user?.id || !existingUnlinkedAmAccount?.id) {
      showError("Dados insuficientes para ligar a conta de AM.");
      return;
    }
    setIsSubmitting(true);
    try {
      await linkAccountToUser(existingUnlinkedAmAccount.id, user.id);
      showSuccess(`Conta de AM "${existingUnlinkedAmAccount.account_name}" ligada com sucesso!`);
      await refreshProfile(); // This will trigger re-fetch of AM data
    } catch (error: any) {
      console.error("Error linking AM account:", error);
      showError(error.message || "Falha ao ligar a conta de AM.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewAmAccount = async (values: FormData) => {
    if (!user?.id || !user?.email) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a conta de AM.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newAmAccount: Omit<Account, 'id' | 'created_at'> = {
        user_id: user.id,
        account_name: values.new_am_account_name || profile?.first_name || user.email.split('@')[0],
        am: values.new_am_account_name || profile?.first_name || user.email.split('@')[0], // Use account_name as AM name by default
        phone_number: values.new_am_phone_number || null,
        email: user.email, // Always use the authenticated user's email
        photo_url: profile?.avatar_url || null, // Use user's profile avatar
        district: values.new_am_district || null,
        credibom_email: values.new_am_credibom_email || null,
        role: values.new_am_role || 'user',
      };
      await insertAccount(newAmAccount);
      showSuccess("Nova conta de AM criada e ligada com sucesso!");
      setIsCreatingNewAmAccount(false);
      await refreshProfile(); // This will trigger re-fetch of AM data
    } catch (error: any) {
      console.error("Error creating new AM account:", error);
      showError(error.message || "Falha ao criar a nova conta de AM.");
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

  if (!user) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Por favor, faça login para gerir o seu perfil.
      </p>
    );
  }

  const userDisplayName = profile?.first_name || user.email?.split('@')[0] || 'Utilizador';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informações Pessoais</CardTitle>
            <CardDescription className="text-muted-foreground">Atualize os seus dados pessoais e avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentAvatarUrl || undefined} alt={userDisplayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {currentAvatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-background/80 hover:bg-background"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <FormItem>
                  <FormLabel>Alterar Avatar</FormLabel>
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
                    <div className="mt-2 flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{selectedImage.name}</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Avatar (ou carregue um ficheiro)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            field.onChange(e);
                            setCurrentAvatarUrl(e.target.value); // Update preview if URL is manually changed
                            setSelectedImage(null); // Clear file input if URL is manually entered
                          }}
                          placeholder="https://example.com/avatar.jpg"
                          disabled={!!selectedImage || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primeiro Nome</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} value={field.value || ''} disabled={isSubmitting} />
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
                    <FormLabel>Último Nome</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} value={field.value || ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !user?.id || !form.formState.isDirty}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A Guardar...
                  </>
                ) : (
                  "Guardar Alterações do Perfil"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gestão de Conta de AM</CardTitle>
            <CardDescription className="text-muted-foreground">
              Associe a sua conta de utilizador a um perfil de Account Manager no CRM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAmLoading ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">A carregar dados do AM...</span>
              </div>
            ) : linkedAmAccount ? (
              <div className="flex items-center space-x-3 p-3 border rounded-md bg-green-50/50 text-green-800">
                <LinkIcon className="h-5 w-5" />
                <p className="font-medium">
                  Conta de AM ligada: <span className="font-semibold">{linkedAmAccount.account_name}</span> (Email: {linkedAmAccount.email})
                </p>
              </div>
            ) : existingUnlinkedAmAccount ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-blue-50/50 text-blue-800">
                <div className="flex items-center space-x-3">
                  <LinkIcon className="h-5 w-5" />
                  <p className="font-medium">
                    Encontrada conta de AM não ligada: <span className="font-semibold">{existingUnlinkedAmAccount.account_name}</span> (Email: {existingUnlinkedAmAccount.email})
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleLinkExistingAmAccount}
                  disabled={isSubmitting}
                  className="mt-3 sm:mt-0"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="mr-2 h-4 w-4" />
                  )}
                  Ligar à Minha Conta
                </Button>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Nenhuma conta de AM ligada ou encontrada para o seu email.
                </p>
                {!isCreatingNewAmAccount && (
                  <Button type="button" onClick={() => setIsCreatingNewAmAccount(true)} disabled={isSubmitting}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Conta de AM
                  </Button>
                )}
              </>
            )}

            {isCreatingNewAmAccount && !linkedAmAccount && (
              <Card className="mt-4 p-4 bg-muted/50 shadow-inner">
                <CardTitle className="text-md font-semibold mb-3 flex items-center">
                  <Building className="mr-2 h-4 w-4" /> Criar Nova Conta de AM
                </CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="new_am_account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Conta de AM <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="text" {...field} value={field.value || ''} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_am_phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Telefone</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} value={field.value || ''} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_am_district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distrito</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} value={field.value || ''} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_am_credibom_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Credibom</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ''} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="new_am_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função do AM</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'user'} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma função" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRoles.map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreatingNewAmAccount(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(handleCreateNewAmAccount)}
                    disabled={isSubmitting || !form.watch("new_am_account_name")}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="mr-2 h-4 w-4" />
                    )}
                    Criar e Ligar
                  </Button>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default UserProfileForm;