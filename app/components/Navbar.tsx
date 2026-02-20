"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Layout, Button, Avatar, Spin, Space } from "antd";
import { LogoutOutlined, LoadingOutlined } from "@ant-design/icons";

const { Header } = Layout;

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <Header
      style={{
        position: "sticky",
        zIndex: 1000,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        height: "64px",
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <Image
          className="h-8 w-fit"
          src="/title.png"
          alt="HSL Title"
          width={120}
          height={40}
        />
      </div>

      <Space size="middle">
        {status === "loading" && (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        )}
        {status === "authenticated" && (
          <>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={() => signOut()}
              shape="round"
            >
              Log out
            </Button>
            <Avatar
              src={session?.user?.image || "/title.png"}
              size="large"
              style={{ border: "1px solid #3b82f6" }}
            />
          </>
        )}
      </Space>
    </Header>
  );
}
