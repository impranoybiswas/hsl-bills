import { DefaultSession } from "next-auth";

declare global {
  interface Bill {
    _id: string;
    invoice: string;
    customer: string;
    quantity?: number | string;
    amount: number;
    status?: string;
    date: string;
    method?: string;
    paidAt?: string | Date;
  }

  interface Customer {
    _id: string;
    customerId: string;
    name: string;
    address: string;
    price: number;
    isMonthly: boolean;
    product: string;
  }

  interface pdfBill {
    invoice: string;
    date: string;
    selectedCustomer: Customer;
    quantity: number;
    expiryDate: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export{};