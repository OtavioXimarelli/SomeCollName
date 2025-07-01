"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, Mail, Check, X, Clock, Users } from 'lucide-react';
import { createCouple, createCoupleInvitation, acceptInvitation } from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';
import type { CoupleInvitation } from '@/types';

interface CoupleManagerProps {
  // This component doesn't take any props currently
}

export default function CoupleManager({}: CoupleManagerProps) {
  const { user, userProfile, pendingInvitations, refreshUserProfile, refreshInvitations } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [newCoupleName, setNewCoupleName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');

  // Validation functions
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPartnerEmailValid = partnerEmail.trim() && isValidEmail(partnerEmail.trim());

  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCoupleName.trim() || !startDate) return;

    // Additional validation
    if (userProfile?.coupleId) {
      toast({
        title: "Erro",
        description: "Você já faz parte de um espaço de casal. Cada usuário pode pertencer a apenas um espaço por vez.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const couple = await createCouple(user.uid, newCoupleName.trim(), startDate);
      await refreshUserProfile();
      
      toast({
        title: "Espaço do casal criado! 💕",
        description: `${newCoupleName} foi criado com sucesso. ID único: ${couple.id.slice(-8)}...`,
      });

      setNewCoupleName('');
      setStartDate('');
      router.push(`/couple/${couple.id}`);
    } catch (error) {
      console.error('Error creating couple:', error);
      toast({
        title: "Erro ao criar espaço",
        description: (error as Error).message || "Não foi possível criar o espaço do casal. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile?.coupleId || !partnerEmail.trim()) return;

    // Additional validation
    if (!isPartnerEmailValid) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      });
      return;
    }

    if (partnerEmail.trim().toLowerCase() === user.email?.toLowerCase()) {
      toast({
        title: "Email inválido",
        description: "Você não pode convidar a si mesmo.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      await createCoupleInvitation(
        userProfile.coupleId,
        user.uid,
        user.displayName || 'Usuário',
        partnerEmail.trim().toLowerCase()
      );

      toast({
        title: "Convite enviado! 💌",
        description: `Um convite foi enviado para ${partnerEmail}. Eles receberão uma notificação quando fizerem login.`,
      });

      setPartnerEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erro ao enviar convite",
        description: (error as Error).message || "Não foi possível enviar o convite. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvitation = async (invitation: CoupleInvitation) => {
    if (!user) return;

    try {
      await acceptInvitation(invitation.id, user.uid);
      await refreshUserProfile();
      await refreshInvitations();

      toast({
        title: "Convite aceito!",
        description: `Você agora faz parte do espaço de casal de ${invitation.inviterName}.`,
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erro ao aceitar convite",
        description: "Não foi possível aceitar o convite. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // User already has a couple
  if (userProfile?.coupleId) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Heart className="h-5 w-5" />
            Espaço do Casal Ativo
          </CardTitle>
          <CardDescription className="text-green-600">
            Você já faz parte de um espaço de casal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Users className="h-3 w-3 mr-1" />
              Membro ativo
            </Badge>
            
            {/* Partner invitation form if no partner yet */}
            {!userProfile.partnerUid && (
              <form onSubmit={handleInvitePartner} className="space-y-3 pt-3 border-t border-green-200">
                <Label htmlFor="partner-email" className="text-green-700 font-medium">
                  Convidar Parceiro(a)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="partner-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isInviting || !isPartnerEmailValid}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isInviting ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Mail className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription className="text-blue-600">
              Você tem {pendingInvitations.length} convite(s) para espaços de casal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-gray-900">
                    {invitation.inviterName} te convidou
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(invitation.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create New Couple */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-fuchsia-700">
            <Plus className="h-5 w-5" />
            Criar Novo Espaço de Casal
          </CardTitle>
          <CardDescription>
            Crie um espaço especial para você e seu parceiro(a) compartilharem memórias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCouple} className="space-y-4">
            <div>
              <Label htmlFor="couple-name" className="text-fuchsia-700 font-medium">
                Nome do Casal
              </Label>
              <Input
                id="couple-name"
                type="text"
                placeholder="Ex: João & Maria"
                value={newCoupleName}
                onChange={(e) => setNewCoupleName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="start-date" className="text-fuchsia-700 font-medium">
                Data de Início do Relacionamento
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isCreating || !newCoupleName.trim() || !startDate}
              className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600"
            >
              {isCreating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Criar Espaço de Casal
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
