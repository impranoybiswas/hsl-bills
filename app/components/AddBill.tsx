"use client";

import React, { useMemo, useState } from "react";
import { useCustomers } from "../hooks/useCustomers";
import axiosSecure from "../libs/axiosSecure";
import toast from "react-hot-toast";
import { generatePDF } from "../libs/generatePDF";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Button,
  FloatButton,
  Typography,
  Space,
} from "antd";
import { PlusOutlined, FilePdfOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function AddBill({ userRole }: { userRole: string }) {
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: customers } = useCustomers();

  // Selected customer details from form
  const customerName = Form.useWatch("customerName", form);
  const quantity = Form.useWatch("quantity", form) || 1;

  const uniqueCustomers = useMemo(() => {
    if (!customers) return [];
    const names = customers.map((c) => c.name);
    return Array.from(new Set(names));
  }, [customers]);

  const selectedCustomer = useMemo(() => {
    if (!customers || !customerName) return null;
    return customers.find((c) => c.name === customerName) || null;
  }, [customers, customerName]);

  const totalAmount = useMemo(() => {
    if (!selectedCustomer) return 0;
    return selectedCustomer.price * quantity;
  }, [selectedCustomer, quantity]);

  const handleAddBill = async (values: { quantity: number; expiryDate?: { format: (fmt: string) => string } | null }) => {
    if (!selectedCustomer) {
      toast.error("Please select a customer.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.post("/api/bills", {
        customer: selectedCustomer.name,
        quantity: selectedCustomer.isMonthly ? "monthly" : values.quantity,
        amount: totalAmount,
      });

      toast.success(
        `Bill added successfully! Invoice: ${response.data.invoice}`
      );

      generatePDF({
        invoice: response.data.invoice,
        date: new Date().toISOString(),
        selectedCustomer,
        quantity: values.quantity,
        expiryDate: values.expiryDate ? values.expiryDate.format("YYYY-MM-DD") : "",
      });

      setShowModal(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding bill:", error);
      toast.error("Failed to add bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        style={{ right: 24, bottom: 24, width: 64, height: 64 }}
        onClick={() => setShowModal(true)}
        tooltip={<div>Create New Bill</div>}
      />

      <Modal
        title="Create New Bill"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBill}
          initialValues={{ quantity: 1 }}
        >
          <Form.Item
            name="customerName"
            label="Select Customer"
            rules={[{ required: true, message: "Please select a customer" }]}
          >
            <Select
              showSearch
              placeholder="Search or Select Customer"
              onChange={() => form.setFieldValue("quantity", 1)}
            >
              {uniqueCustomers.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedCustomer && !selectedCustomer.isMonthly && (
            <Form.Item name="quantity" label="Quantity">
              <InputNumber min={1} max={100} style={{ width: "100%" }} />
            </Form.Item>
          )}

          <Form.Item name="expiryDate" label="Expiry Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {selectedCustomer && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Text strong style={{ fontSize: 16 }}>
                Total Amount:{" "}
                <Text type="success" style={{ fontSize: 18 }}>
                  ৳{totalAmount.toLocaleString()}
                </Text>
              </Text>
            </div>
          )}

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<FilePdfOutlined />}
              block
              size="large"
              loading={loading}
              disabled={userRole !== "editor" || !selectedCustomer}
            >
              Add & Download PDF
            </Button>
            {userRole !== "editor" && (
              <Text type="danger" style={{ display: "block", textAlign: "center" }}>
                Only Editor can add new Bills
              </Text>
            )}
          </Space>
        </Form>
      </Modal>
    </>
  );
}
