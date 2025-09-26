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
import { Loader2, Image as ImageIcon, XCircle, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  avatar_url: z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  imageFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(File).nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const UserProfileForm: React.FC = () => {
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      avatar_url: profile?.avatar_url || '',
      imageFile: null,
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
      });
      setCurrentAvatarUrl(profile.avatar_url || null);
    }
  }, [profile, form]);

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
        // If currentAvatarUrl was explicitly set to null (removed), and original had a photo
        newAvatarUrl = null;
      } else if (!selectedImage && currentAvatarUrl !== null && profile?.avatar_url !== currentAvatarUrl) {
        // If no new image selected, but avatar_url was manually changed (e.g., pasted a new URL)
        newAvatarUrl = values.avatar_url;
      } else if (!selectedImage && currentAvatarUrl !== null && profile?.avatar_url === currentAvatarUrl) {
        // If no new image selected, and no change to avatar_url, keep original
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
      await refreshProfile(); // Refresh profile in context
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

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="submit" disabled={isSubmitting || !user?.id || !form.formState.isDirty}>
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

export default UserProfileForm;