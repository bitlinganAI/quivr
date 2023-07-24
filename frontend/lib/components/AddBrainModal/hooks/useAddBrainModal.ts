import axios from "axios";
import { FormEvent, useState } from "react";
import { useForm } from "react-hook-form";

import { useBrainConfig } from "@/lib/context/BrainConfigProvider";
import { useBrainContext } from "@/lib/context/BrainProvider/hooks/useBrainContext";
import { useToast } from "@/lib/hooks";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAddBrainModal = () => {
  const [isPending, setIsPending] = useState(false);
  const { publish } = useToast();
  const { createBrain } = useBrainContext();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { config } = useBrainConfig();
  const defaultValues = {
    ...config,
    name: "",
    description: "",
    setDefault: false,
  };

  const { register, getValues, reset, watch } = useForm({
    defaultValues,
  });

  const openAiKey = watch("openAiKey");
  const model = watch("model");
  const temperature = watch("temperature");
  const maxTokens = watch("maxTokens");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { name, description, setDefault } = getValues();

    console.log({
      name,
      description,
      maxTokens,
      model,
      setDefault,
      openAiKey,
      temperature,
    });

    if (name.trim() === "" || isPending) {
      return;
    }

    try {
      setIsPending(true);
      await createBrain(name);

      setIsShareModalOpen(false);
      reset(defaultValues);
      publish({
        variant: "success",
        text: "Brain created successfully",
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        publish({
          variant: "danger",
          text: `${JSON.stringify(
            (
              err.response as {
                data: { detail: string };
              }
            ).data.detail
          )}`,
        });
      } else {
        publish({
          variant: "danger",
          text: `${JSON.stringify(err)}`,
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return {
    isShareModalOpen,
    setIsShareModalOpen,
    handleSubmit,
    register,
    openAiKey,
    model,
    temperature,
    maxTokens,
    isPending,
  };
};