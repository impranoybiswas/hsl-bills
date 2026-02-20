"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { EditOutlined } from "@ant-design/icons";
import { Modal, Form, Select, Button, Space } from "antd";
import axiosSecure from "../libs/axiosSecure";

export default function UpdateBill({
  bill,
  userRole,
  refetch,
}: {
  bill: Bill;
  userRole: string;
  refetch: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEditBill = async (values: { status: string; method?: string }) => {
    if (!bill._id) return;

    setLoading(true);
    try {
      await axiosSecure.patch("/api/bills", {
        id: bill._id,
        status: values.status,
        method: values.method,
      });

      toast.success("Bill updated successfully!");
      refetch();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Error updating bill:", error);
      toast.error("Failed to update bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => {
          setShowModal(true);
          form.setFieldsValue({
            status: bill.status || "pending",
            method: bill.method || undefined,
          });
        }}
      >
        Update
      </Button>

      <Modal
        title={`Edit Bill: ${bill.invoice}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditBill}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="paid">Paid</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="method"
            label="Payment Method"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue("status") === "paid" && !value) {
                    return Promise.reject(new Error("Payment method is required for paid bills"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Select placeholder="Select Method" allowClear>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="online">Online</Select.Option>
              <Select.Option value="check">Check</Select.Option>
            </Select>
          </Form.Item>

          <Space direction="horizontal" style={{ width: "100%", justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={userRole !== "editor"}
            >
              Save Changes
            </Button>
          </Space>
          {userRole !== "editor" && (
            <div style={{ marginTop: 8, textAlign: "center", color: "#ff4d4f" }}>
              Only Editor can update bills
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
}
