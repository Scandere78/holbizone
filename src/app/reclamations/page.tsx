"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createReclamation } from "@/actions/reclamation.action";
import toast from "react-hot-toast";
import {
  FaBug,
  FaLightbulb,
  FaRocket,
  FaQuestion,
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import { MdLowPriority, MdOutlineWarning, MdPriorityHigh } from "react-icons/md";

export default function ReclamationsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "improvement" as "bug" | "feature" | "improvement" | "other",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReclamation(formData);

      if (result.success) {
        toast.success("Votre suggestion a ete envoyee avec succes !");
        setFormData({
          type: "improvement",
          title: "",
          description: "",
          priority: "medium",
        });
        router.refresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    {
      value: "bug",
      label: "Bug / Probleme",
      icon: <FaBug className="text-red-500" />,
      description: "Signaler un dysfonctionnement",
      color: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
    },
    {
      value: "feature",
      label: "Nouvelle fonctionnalite",
      icon: <FaRocket className="text-blue-500" />,
      description: "Proposer une nouvelle feature",
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
    },
    {
      value: "improvement",
      label: "Amelioration",
      icon: <FaLightbulb className="text-yellow-500" />,
      description: "Suggerer une amelioration",
      color: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
    },
    {
      value: "other",
      label: "Autre",
      icon: <FaQuestion className="text-gray-500" />,
      description: "Autre type de suggestion",
      color: "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-900",
    },
  ];

  const priorityOptions = [
    {
      value: "low",
      label: "Basse priorite",
      icon: <MdLowPriority className="text-green-500" />,
      color: "text-green-600 dark:text-green-400",
    },
    {
      value: "medium",
      label: "Priorite moyenne",
      icon: <MdOutlineWarning className="text-orange-500" />,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      value: "high",
      label: "Haute priorite",
      icon: <MdPriorityHigh className="text-red-500" />,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-red-950/10 dark:to-orange-950/10 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaLightbulb className="w-12 h-12 text-yellow-500 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Suggestions & Ameliorations
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Aidez-nous a ameliorer <span className="font-bold text-red-600">Holbizone</span> !
            Partagez vos idees, signalez des bugs ou proposez de nouvelles fonctionnalites.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                <CardTitle className="text-sm font-medium">Soyez precis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Plus votre description est detaillee, plus nous pourrons repondre efficacement
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <CardTitle className="text-sm font-medium">Suivi garanti</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Chaque suggestion est lue et analysee par notre equipe
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-orange-500" />
                <CardTitle className="text-sm font-medium">Impact reel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Vos retours influencent directement l'evolution de la plateforme
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <Card className="shadow-2xl border-red-100 dark:border-red-950">
          <CardHeader>
            <CardTitle className="text-2xl">Formulaire de suggestion</CardTitle>
            <CardDescription>
              Tous les champs marques d'un <span className="text-red-500">*</span> sont obligatoires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-3">
                <Label htmlFor="type" className="text-base font-semibold">
                  Type de suggestion <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: option.value as any })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.type === option.value
                          ? `${option.color} border-current shadow-md`
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{option.icon}</div>
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Titre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Ajouter un mode sombre, Corriger le bug de connexion..."
                  className="h-12 text-base"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 caracteres
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description detaillee <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Decrivez en detail votre suggestion, le probleme rencontre, ou la fonctionnalite souhaitee..."
                  className="min-h-[150px] text-base resize-none"
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 caracteres (minimum 20)
                </p>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-base font-semibold">
                  Priorite
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: option.value as any })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.priority === option.value
                          ? "border-current shadow-md bg-gray-50 dark:bg-gray-900"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                      } ${option.color}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-2xl">{option.icon}</div>
                        <span className="text-xs font-medium text-center">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || formData.description.length < 20}
                  className="w-full h-12 text-base bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Envoyer ma suggestion
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Merci de contribuer a l'amelioration de Holbizone !
            <br />
            Vos suggestions nous aident a creer une meilleure experience pour tous.
          </p>
        </div>
      </div>
    </div>
  );
}
