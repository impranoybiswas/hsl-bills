"use client";

import { useState, useMemo } from "react";
import { useBills } from "../hooks/useBills";
import { useCustomers } from "../hooks/useCustomers";
import AddBill from "./AddBill";
import { format } from "date-fns";
import UpdateBill from "./UpdateBill";
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Tag,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

export default function BillsTable({ userRole }: { userRole: string }) {
  const [status, setStatus] = useState("");
  const [customer, setCustomer] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const {
    data,
    isLoading,
    refetch,
  } = useBills({ status, customer, sortOrder, page, limit: pageSize });

  const bills = useMemo(() => data?.bills || [], [data?.bills]);
  const totalItems = data?.total || 0;
  const stats = data?.stats;

  const { data: customers } = useCustomers();

  const columns: ColumnsType<Bill> = [
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      align: "center",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => format(new Date(date), "dd MMM yyyy"),
      align: "center",
      className: "whitespace-nowrap",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      className: "capitalize whitespace-nowrap",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      className: "capitalize",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => `৳${Number(amount).toLocaleString()}`,
      className: "font-semibold",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          icon={status === "paid" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={status === "paid" ? "success" : "warning"}
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Paid At",
      dataIndex: "paidAt",
      key: "paidAt",
      align: "center",
      render: (paidAt, record) =>
        record.status === "paid" ? format(new Date(paidAt), "dd MMM yyyy") : "—",
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      align: "center",
      render: (method) => method || "—",
      className: "capitalize",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <UpdateBill userRole={userRole} bill={record} refetch={refetch} />
      ),
    },
  ];

  const uniqueCustomers = useMemo(() => {
    if (!customers) return [];
    const names = customers.map((c) => c.name);
    return Array.from(new Set(names));
  }, [customers]);

  return (
    <div className="w-full h-dvh p-4 md:p-6 bg-[#0a0a0a] overflow-hidden flex flex-col">
      <Space orientation="vertical" size="large" style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* Statistics Cards */}
        <Row gutter={[12, 12]}>
          <Col xs={8} sm={8}>
            <Card variant="borderless" className="bg-[#121212] border border-white/5 shadow-xl transition-all">
              <Statistic
                title={<span className="text-gray-400 font-medium">Total Bills</span>}
                value={stats?.totalCount || 0}
                styles={{ content: { color: "#3b82f6" } }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card variant="borderless" className="bg-[#121212] border border-white/5 shadow-xl transition-all">
              <Statistic
                title={<span className="text-gray-400 font-medium">Paid</span>}
                value={stats?.totalPaid || 0}
                precision={2}
                prefix="৳"
                styles={{ content: { color: "#22c55e" } }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card variant="borderless" className="bg-[#121212] border border-white/5 shadow-xl transition-all">
              <Statistic
                title={<span className="text-gray-400 font-medium">Pending</span>}
                value={stats?.totalPending || 0}
                precision={2}
                prefix="৳"
                styles={{ content: { color: "#f97316" } }}
              />
            </Card>
          </Col>
        </Row>

        <Card variant="borderless" className="bg-[#121212] border border-white/5 shadow-xl flex-1 flex flex-col min-h-0">
          {/* Filters Area */}
          <div className="flex flex-nowrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-nowrap w-full md:max-w-md items-center gap-2 flex-1 min-w-0">
              <Select
                placeholder="Status"
                style={{ width: "40%" }}
                allowClear
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                key="status"
                options={
                  [
                    {
                      value: "paid",
                      label: "Paid",
                    },
                    {
                      value: "pending",
                      label: "Pending",
                    },
                  ]
                }
              />
              <Select
                placeholder="Customers"
                style={{ width: "60%" }}
                showSearch
                allowClear
                onChange={(value) => {
                  setCustomer(value);
                  setPage(1);
                }}
                options={uniqueCustomers.map((name: string) => ({
                  value: name,
                  label: name,
                }))}
              />
            </div>

            <Select
              value={sortOrder}
              style={{ width: "130px", flexShrink: 0 }}
              onChange={(value) => setSortOrder(value)}
              options={[
                {
                  value: "desc",
                  label: "Newest First",
                },
                {
                  value: "asc",
                  label: "Oldest First",
                },
              ]}
            />
          </div>

          {/* Bills Table */}
          <Table
            columns={columns}
            dataSource={bills}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalItems,
              onChange: (p) => setPage(p),
              showSizeChanger: false,
              placement: ["bottomCenter"],
              styles: { item: { borderRadius: 999, backgroundColor: "#121212" } }
            }}
            scroll={{ x: 1000, y: "calc(100vh - 420px)" }}
            sticky
            className="custom-antd-table flex-1 min-h-0"
          />
        </Card>
      </Space>

      <AddBill userRole={userRole} />
    </div>
  );
}
