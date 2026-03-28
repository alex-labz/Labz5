import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export interface SelectedKol {
  id: number;
  name: string;
  niche: string;
  imageUrl: string;
}

export interface ProjectRequest {
  id: number;
  userId: number;
  projectName: string;
  twitterLink: string;
  websiteLink: string;
  projectInfo: string;
  campaignInfo: string;
  offer: string;
  selectedKolIds: number[];
  selectedKols: SelectedKol[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userLogin?: string | null;
}

export interface CreateProjectRequest {
  userId: number;
  projectName: string;
  twitterLink: string;
  websiteLink: string;
  projectInfo: string;
  campaignInfo: string;
  offer: string;
  selectedKolIds: number[];
}

export const useListProjectRequests = () =>
  useQuery<ProjectRequest[]>({
    queryKey: ["/api/project-requests"],
    queryFn: () => customFetch("/api/project-requests"),
  });

export const useListUserProjectRequests = (userId: number | null | undefined) =>
  useQuery<ProjectRequest[]>({
    queryKey: ["/api/project-requests/user", userId],
    queryFn: () => customFetch(`/api/project-requests/user/${userId}`),
    enabled: !!userId,
  });

export const useCreateProjectRequest = () => {
  const qc = useQueryClient();
  return useMutation<ProjectRequest, unknown, CreateProjectRequest>({
    mutationFn: (data) =>
      customFetch("/api/project-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/project-requests"] });
      qc.invalidateQueries({ queryKey: ["/api/project-requests/user", vars.userId] });
    },
  });
};

export const useUpdateProjectRequestStatus = () => {
  const qc = useQueryClient();
  return useMutation<ProjectRequest, unknown, { id: number; status: string }>({
    mutationFn: ({ id, status }) =>
      customFetch(`/api/project-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/project-requests"] });
    },
  });
};
