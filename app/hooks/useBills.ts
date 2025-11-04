"use client";

import { useQuery } from "@tanstack/react-query";
import axiosSecure from "../libs/axiosSecure";

interface UseBillsOptions {
  customer?: string;
  status?: string;
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
}

export function useBills({
  customer,
  status,
  sortOrder,
  enabled = true,
}: UseBillsOptions = {}) {
  return useQuery({
    queryKey: ["bills", customer, status, sortOrder],
    queryFn: async (): Promise<Bill[]> => {
      const params: Record<string, string> = {};
      if (customer) params.customer = customer;
      if (status) params.status = status;
      if (sortOrder) params.sortOrder = sortOrder;

      const res = await axiosSecure.get<Bill[]>("/api/bills", { params });
      return res.data;
    },
    enabled,
  });
}
