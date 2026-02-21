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

interface BillsResponse {
  bills: Bill[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalPaid: number;
    totalPending: number;
    totalCount: number;
  };
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
    queryFn: async (): Promise<BillsResponse> => {
      const params: Record<string, string> = {};
      if (customer) params.customer = customer;
      if (status) params.status = status;
      if (sortOrder) params.sortOrder = sortOrder;
      params.page = page.toString();
      params.limit = limit.toString();

      const res = await axiosSecure.get<BillsResponse>("/api/bills", {
        params,
      });
      return res.data;
    },
    enabled,
  });
}
