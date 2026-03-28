import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { CampaignSubmission } from "./generated/api.schemas";

export const useListSubmissions = () =>
  useQuery<CampaignSubmission[]>({
    queryKey: ["/api/submissions"],
    queryFn: () => customFetch("/api/submissions"),
  });

export const useListUserSubmissions = (userId: number | null | undefined) =>
  useQuery<CampaignSubmission[]>({
    queryKey: ["/api/submissions/user", userId],
    queryFn: () => customFetch(`/api/submissions/user/${userId}`),
    enabled: !!userId,
  });

export const useSubmitCampaignApplication = () => {
  const qc = useQueryClient();
  return useMutation<CampaignSubmission, unknown, { campaignId: number; userId: number; answers: Record<string, string> }>({
    mutationFn: ({ campaignId, userId, answers }) =>
      customFetch(`/api/campaigns/${campaignId}/submissions`, {
        method: "POST",
        body: JSON.stringify({ userId, answers }),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/submissions"] });
      qc.invalidateQueries({ queryKey: ["/api/submissions/user", vars.userId] });
    },
  });
};

export const useUpdateSubmissionStatus = () => {
  const qc = useQueryClient();
  return useMutation<CampaignSubmission, unknown, { id: number; status: string }>({
    mutationFn: ({ id, status }) =>
      customFetch(`/api/submissions/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });
};

export const useDeleteSubmission = () => {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, { id: number }>({
    mutationFn: ({ id }) =>
      customFetch(`/api/submissions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
  });
};
