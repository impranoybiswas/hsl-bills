"use client";

import { useQuery } from "@tanstack/react-query";
import axiosSecure from "../libs/axiosSecure";

interface UseCustomersOptions {
  name?: string;
  enabled?: boolean;
}

export function useCustomers({ name, enabled = true }: UseCustomersOptions = {}) {
  return useQuery({
    queryKey: ["customers", name],
    queryFn: async (): Promise<Customer[]> => {
      const params: Record<string, string> = {};
      if (name) params.name = name;
      const res = await axiosSecure.get<Customer[]>("/api/customers", {
        params,
      });
      return res.data;
    },
    enabled,
  });
}
