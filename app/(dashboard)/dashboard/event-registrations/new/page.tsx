"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { eventRegistrationsService } from "@/services/event-registrations.service";
import { registrantsService } from "@/services/registrants.service";
import { eventsService, Event } from "@/services/events.service";

type LodgingType = "ESCOLA" | "HOTEL" | "NAO_PRECISA";

export default function NewEventRegistrationPage() {
  const router = useRouter();
  
  const [eventId, setEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Dados da pessoa
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [congregation, setCongregation] = useState("");
  
  // Dados da inscrição
  const [lodgingType, setLodgingType] = useState<LodgingType>("ESCOLA");
  const [wantsShirt, setWantsShirt] = useState(false);
  const [shirtNote, setShirtNote] = useState("");

  // Buscar o evento UMADÊGO Norte 2026 automaticamente
  useEffect(() => {
    loadDefaultEvent();
  }, []);

  const loadDefaultEvent = async () => {
    try {
      const events = await eventsService.getAll();
      // Buscar o evento UMADÊGO Norte 2026
      const umadegoEvent = events.find(e => e.name.includes("UMADÊGO") || e.name.includes("Norte 2026"));
      if (umadegoEvent) {
        setEventId(umadegoEvent.id);
      } else if (events.length > 0) {
        // Se não encontrar, pega o primeiro evento disponível
        setEventId(events[0].id);
      }
    } catch (error) {
      toast.error("Erro ao carregar evento");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) {
      toast.error("Erro: Evento não encontrado");
      return;
    }

    if (!fullName || !cpf) {
      toast.error("Preencha nome e CPF");
      return;
    }

    try {
      setLoading(true);

      // 1. Primeiro, verifica se o inscrito já existe pelo CPF
      let registrantId: number;
      try {
        const existingRegistrant = await registrantsService.getByCpf(cpf);
        registrantId = existingRegistrant.id;
        toast.info("Inscrito já cadastrado, criando inscrição...");
      } catch {
        // 2. Se não existir, cria o inscrito
        const newRegistrant = await registrantsService.create({
          full_name: fullName,
          cpf: cpf,
          phone: phone || undefined,
          city: city || undefined,
          congregation: congregation || undefined,
        });
        registrantId = newRegistrant.id;
      }

      // 3. Cria a inscrição no evento
      await eventRegistrationsService.create({
        event_id: eventId,
        registrant_id: registrantId,
        lodging_type: lodgingType,
        wants_shirt: wantsShirt,
        shirt_note: shirtNote || undefined,
      });

      toast.success("Inscrição criada com sucesso!");
      router.push("/dashboard/event-registrations");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar inscrição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Inscrição</h1>
            <p className="text-muted-foreground mt-1">UMADÊGO Norte 2026 - Preencha os dados do inscrito</p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6"
            >
              {loading ? "Criando..." : "Criar Inscrição"}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Dados Pessoais */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm">1</span>
                </div>
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Digite o nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium">
                  CPF <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    placeholder="Ex: Uruaçu"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="congregation" className="text-sm font-medium">
                  Congregação
                </Label>
                <Input
                  id="congregation"
                  placeholder="Ex: AD Sede Uruaçu"
                  value={congregation}
                  onChange={(e) => setCongregation(e.target.value)}
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Configurações */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm">2</span>
                </div>
                Configurações da Inscrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lodging" className="text-sm font-medium">
                  Tipo de Hospedagem <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={lodgingType}
                  onValueChange={(value) => setLodgingType(value as LodgingType)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESCOLA">🏫 Escola</SelectItem>
                    <SelectItem value="HOTEL">🏨 Hotel</SelectItem>
                    <SelectItem value="NAO_PRECISA">🚫 Não Precisa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white border">
                  <Checkbox
                    id="shirt"
                    checked={wantsShirt}
                    onCheckedChange={(checked) => setWantsShirt(checked as boolean)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="shirt" className="cursor-pointer text-sm font-medium">
                    Deseja camiseta do evento
                  </Label>
                </div>

                {wantsShirt && (
                  <div className="space-y-2">
                    <Label htmlFor="shirtNote" className="text-sm font-medium">
                      Observações da Camiseta
                    </Label>
                    <Input
                      id="shirtNote"
                      placeholder="Ex: Tamanho G, Gola V..."
                      value={shirtNote}
                      onChange={(e) => setShirtNote(e.target.value)}
                      className="h-10"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm">ℹ</span>
                </div>
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>O valor será calculado automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Se o CPF já existe, os dados serão atualizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>O pagamento pode ser registrado depois</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}


  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header Compacto */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Inscrição</h1>
            <p className="text-muted-foreground mt-1">Preencha os dados abaixo para criar a inscrição</p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6"
            >
              {loading ? "Criando..." : "Criar Inscrição"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Event Selection - Azul */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm">1</span>
                </div>
                Selecione o Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="event" className="text-sm font-medium">
                  Evento <span className="text-destructive">*</span>
                </Label>
                <Select value={eventId} onValueChange={setEventId} required>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Escolha o evento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Registrant Search - Verde */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm">2</span>
                </div>
                Buscar Inscrito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium">
                  CPF do Inscrito <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={searchCpf}
                    onChange={(e) => setSearchCpf(e.target.value)}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    onClick={searchByCpf}
                    variant="secondary"
                    className="h-10 px-4"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push("/dashboard/registrants?modal=create")}
                    className="h-10 px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedRegistrant && (
                <div className="p-4 bg-white rounded-lg border border-green-200 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-sm">Inscrito Encontrado</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Nome</span>
                      <p className="font-medium text-sm">{selectedRegistrant.full_name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">CPF</span>
                      <p className="font-medium text-sm">{selectedRegistrant.cpf}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Telefone</span>
                      <p className="font-medium text-sm">{selectedRegistrant.phone || "-"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Cidade</span>
                      <p className="font-medium text-sm">{selectedRegistrant.city || "-"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Registration Details - Roxo */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm">3</span>
                </div>
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lodging" className="text-sm font-medium">
                  Tipo de Hospedagem <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={lodgingType}
                  onValueChange={(value) => setLodgingType(value as LodgingType)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESCOLA">🏫 Escola</SelectItem>
                    <SelectItem value="HOTEL">🏨 Hotel</SelectItem>
                    <SelectItem value="NAO_PRECISA">🚫 Não Precisa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white border">
                  <Checkbox
                    id="shirt"
                    checked={wantsShirt}
                    onCheckedChange={(checked) => setWantsShirt(checked as boolean)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="shirt" className="cursor-pointer text-sm font-medium">
                    Deseja camiseta do evento
                  </Label>
                </div>

                {wantsShirt && (
                  <div className="space-y-2">
                    <Label htmlFor="shirtNote" className="text-sm font-medium">
                      Observações da Camiseta
                    </Label>
                    <Input
                      id="shirtNote"
                      placeholder="Ex: Tamanho G, Gola V..."
                      value={shirtNote}
                      onChange={(e) => setShirtNote(e.target.value)}
                      className="h-10"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card - Laranja */}
          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm">ℹ</span>
                </div>
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>O valor da inscrição será calculado automaticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>O inscrito precisa estar cadastrado no sistema</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>O pagamento pode ser registrado posteriormente</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
