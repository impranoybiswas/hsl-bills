"use client";

import { useSession } from "next-auth/react";
import { Typography, Result, Card } from "antd";
import { SmileOutlined } from "@ant-design/icons";

const { Title, Text, Link: AntdLink } = Typography;

export default function UserView() {
  const { data: session, status } = useSession();

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card
        variant="borderless"
        className="bg-white/5 max-w-2xl w-full"
        style={{ padding: "24px" }}
      >
        <Result
          icon={<SmileOutlined style={{ color: "#22c55e" }} />}
          title={
            <Title level={2} style={{ color: "#f0fdf4", margin: 0 }}>
              Welcome back, {status === "loading" ? "User" : session?.user?.name || "User"}!
            </Title>
          }
          subTitle={
            <Text style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: 16 }}>
              You currently have standard user access.
              <br />
              Please contact{" "}
              <AntdLink
                href="https://impranoybiswas.vercel.app/"
                target="_blank"
                style={{ fontWeight: 600, color: "#3b82f6" }}
              >
                Pranoy
              </AntdLink>{" "}
              to update your role to <strong>Admin, Viewer, or Editor</strong> for more features.
            </Text>
          }
        />
      </Card>
    </div>
  );
}
