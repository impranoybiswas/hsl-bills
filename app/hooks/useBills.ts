"use client";

import { useQuery } from "@tanstack/react-query";
import axiosSecure from "../libs/axiosSecure";

interface UseBillsOptions {
  customer?: string;
  status?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useBills({
  customer,
  status,
  sortOrder,
  page = 1,
  limit = 50,
  enabled = true,
}: UseBillsOptions = {}) {
  return useQuery({
    queryKey: ["bills", customer, status, sortOrder, page, limit],
    queryFn: async (): Promise<{
      bills: Bill[];
      total: number;
      stats: {
        totalAmount: number;
        totalPaid: number;
        totalPending: number;
        totalCount: number;
      };
    }> => {
      const params: Record<string, string | number> = {};
      if (customer) params.customer = customer;
      if (status) params.status = status;
      if (sortOrder) params.sortOrder = sortOrder;
      params.page = page;
      params.limit = limit;

      const res = await axiosSecure.get<{
        bills: Bill[];
        total: number;
        stats: {
          totalAmount: number;
          totalPaid: number;
          totalPending: number;
          totalCount: number;
        };
      }>("/api/bills", { params });
      return res.data;
    },
    enabled,
  });
}
