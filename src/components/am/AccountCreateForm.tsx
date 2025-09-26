"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Account } from '@/types/crm';
import { insertAccount, fetchAuthUsersNotLinkedToAccount } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Image as ImageIcon } from 'lucide-react'; // Import Image icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccountCreateFormProps {
  onSave: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  account_name: z.string().min(1, "Nome da Conta é obrigatório"),
  am: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  photo_url: z.string().url("URL inválido").nullable().optional().or(z.literal('')),
  district: z.string().nullable().optional(),
  credibom_email: z.string().email("Email inválido").nullable().optional().or(z.literal('')),
  role: z.string().nullable().optional(),
  imageFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(File).nullable().optional(),
  auth_user_id: z.string().nullable().optional(), // NEW: Field for linking to auth.users.id
});

type FormData = z.infer<typeof formSchema>;

const AccountCreateForm: React.FC<AccountCreateFormProps> = ({ onSave, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [availableAuthUsers, setAvailableAuthUsers] = useState<{ id: string; email: string }[]>([]);
  const [isAuthUsersLoading, setIsAuthUsersLoading] = useState(true);

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

  useEffect(() => {
    const loadAuthUsers = async () => {
      setIsAuthUsersLoading(true);
      try {
        const users = await fetchAuthUsersNotLinkedToAccount();
        setAvailableAuthUsers(users);
      } catch (err: any) {
        console.error("Erro ao carregar utilizadores autenticados:", err);
        showError(err.message || "Falha ao carregar a lista de utilizadores.");
      } finally {
        setIsAuthUsersLoading(false);
      }
    };
    loadAuthUsers();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_name: '',
      am: '',
      phone_number: '',
      email: '',
      photo_url: '',
      district: '',
      credibom_email: '',
      role: 'user',
      imageFile: null,
      auth_user_id: '', // Default to empty string
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      form.setValue('imageFile', event.target.files[0]);
    } else {
      setSelectedImage(null);
      form.setValue('imageFile', null);
    }
  };

  const uploadImage = async (file: File, currentUserId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUserId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(`Falha ao carregar a imagem: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para criar a conta.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | null = values.photo_url || null;

    try {
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, userId);
      }

      const newAccount: Omit<Account, 'id' | 'created_at'> = {
        user_id: userId,
        account_name: values.account_name,
        am: values.am || null,
        phone_number: values.phone_number || null,
        email: values.email || null,
        photo_url: imageUrl,
        district: values.district || null,
        credibom_email: values.credibom_email || null,
        role: values.role || 'user',
        auth_user_id: values.auth_user_id || null, // NEW: Include auth_user_id
      };

      await insertAccount(newAccount);
      showSuccess("Conta criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      showError(error.message || "Falha ao criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "account_name", label: "Nome da Conta", type: "text", required: true },
    { name: "am", label: "AM", type: "text" },
    { name: "phone_number", label: "Número de Telefone", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "district", label: "Distrito", type: "text" },
    { name: "credibom_email", label: "Email Credibom", type: "email" },
    { name: "role", label: "Função do AM", type: "select", options: ["user", "admin", "editor"] },
    {
      name: "auth_user_id",
      label: "Associar a Utilizador",
      type: "select",
      options: availableAuthUsers.map(u => ({ value: u.id, label: u.email })),
      placeholder: "Selecione um utilizador",
      disabled: isAuthUsersLoading,
      optional: true,
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name as keyof FormData}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                  <FormControl>
                    {field.type === "select" ? (
                      <Select onValueChange={formField.onChange} value={formField.value as string} disabled={field.disabled}>
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || `Selecione uma ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.optional && <SelectItem value="">Nenhum</SelectItem>}
                          {field.options?.length === 0 && field.disabled ? (
                            <SelectItem value="loading" disabled>A carregar...</SelectItem>
                          ) : field.options?.length === 0 && !field.disabled ? (
                            <SelectItem value="no-users" disabled>Nenhum utilizador disponível</SelectItem>
                          ) : (
                            field.options?.map((option: any) => (
                              <SelectItem key={option.value || option} value={option.value || option}>{option.label || option}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        {...formField}
                        value={formField.value as string || ''}
                        onChange={formField.onChange}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <FormItem className="md:col-span-2">
            <FormLabel>Fotografia do AM</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file:text-primary file:bg-primary/10 file:border-primary/20 file:hover:bg-primary/20"
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
            name="photo_url"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>URL da Foto Existente (se aplicável)</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    {...field}
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={!!selectedImage}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !userId}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Criar...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountCreateForm;