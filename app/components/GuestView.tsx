"use client";
import { signIn } from "next-auth/react";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, Typography, Space, Result, Card } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function GuestView() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card
        variant="borderless"
        className="bg-white/5 max-w-2xl w-full"
        style={{ padding: "24px" }}
      >
        <Result
          status="info"
          title={
            <Title level={2} style={{ color: "#22c55e", margin: 0 }}>
              Welcome to HSL Bills
            </Title>
          }
          subTitle={
            <Text style={{ color: "rgba(255, 255, 255, 0.65)" }}>
              Manage your company bills efficiently with our modern dashboard.
            </Text>
          }
          extra={[
            <Space direction="vertical" size="large" key="actions">
              <Button
                type="primary"
                size="large"
                icon={<GoogleOutlined />}
                onClick={() => signIn("google")}
                style={{ height: 50, padding: "0 40px" }}
              >
                Continue with Google
              </Button>
              <div style={{ textAlign: "center" }}>
                <Paragraph style={{ color: "rgba(255, 255, 255, 0.45)" }}>
                  <Text type="success" strong>Viewer:</Text> View billing history & status
                  <br />
                  <Text type="success" strong>Editor:</Text> Create and manage bills
                </Paragraph>
              </div>
            </Space>,
          ]}
        />
      </Card>
    </div>
  );
}
