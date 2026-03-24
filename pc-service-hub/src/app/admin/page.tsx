"use client";

import * as React from "react";
import { Shield, Wrench } from "lucide-react";

import {
  loadOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
  type ServiceType,
} from "@/lib/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, THead, TH, TR } from "@/components/ui/table";

const serviceLabel: Record<ServiceType, string> = {
  cleaning: "清灰换硅脂",
  os_reinstall: "系统重装",
  data_recovery: "数据恢复",
  hardware_upgrade: "硬件升级",
  system_optimization: "系统优化",
};

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "待处理";
    case "completed":
      return "已完成";
    case "cancelled":
      return "取消";
  }
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={status}>{statusLabel(status)}</Badge>;
}

const SESSION_KEY = "pc-service-hub:admin:authed:v1";

function useAdminGate() {
  const required = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const isEnabled = Boolean(required && required.trim().length > 0);

  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);

  React.useEffect(() => {
    if (!isEnabled) {
      setAuthed(true);
      setReady(true);
      return;
    }
    try {
      const ok = window.sessionStorage.getItem(SESSION_KEY) === "1";
      setAuthed(ok);
    } finally {
      setReady(true);
    }
  }, [isEnabled]);

  const login = (password: string) => {
    if (!isEnabled) return true;
    if (password === required) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  return { ready, isEnabled, authed, login, logout };
}

function GateCard({ onAuthed }: { onAuthed: () => void }) {
  const gate = useAdminGate();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (gate.ready && gate.authed) onAuthed();
  }, [gate.ready, gate.authed, onAuthed]);

  if (!gate.ready) return null;
  if (!gate.isEnabled) return null;
  if (gate.authed) return null;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-blue-600">
          <Shield size={22} />
        </div>
        <div className="w-full">
          <div className="text-lg font-semibold text-slate-900">管理员验证</div>
          <p className="mt-1 text-sm text-slate-600">
            请输入管理员密码以访问订单管理页面。
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="管理员密码"
            />
            <Button
              onClick={() => {
                const ok = gate.login(password);
                if (!ok) setError("密码不正确");
              }}
            >
              进入后台
            </Button>
          </div>

          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <p className="mt-4 text-xs text-slate-500">
            提示：这是前端演示型门禁（使用 `NEXT_PUBLIC_ADMIN_PASSWORD`），并不等同于真正的账号登录系统。
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function AdminPage() {
  const gate = useAdminGate();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [authedPing, setAuthedPing] = React.useState(false);

  const authed = gate.isEnabled ? authedPing || gate.authed : true;

  React.useEffect(() => {
    if (!authed) return;
    setOrders(loadOrders());
  }, [authed]);

  const setStatus = (id: string, status: OrderStatus) => {
    const next = updateOrderStatus(id, status);
    setOrders(next);
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-blue-600">Admin Panel</div>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <Wrench size={20} />
              订单管理
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              查看用户预约订单，并更新处理状态。
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              返回首页
            </Button>
            {gate.isEnabled && authed ? (
              <button
                className="text-xs text-slate-500 underline underline-offset-4"
                onClick={() => {
                  gate.logout();
                  setAuthedPing(false);
                }}
              >
                退出后台
              </button>
            ) : null}
          </div>
        </div>

        {!authed ? (
          <GateCard onAuthed={() => setAuthedPing(true)} />
        ) : orders.length === 0 ? (
          <Card className="p-6">
            <div className="text-lg font-semibold text-slate-900">暂无订单</div>
            <p className="mt-2 text-sm text-slate-600">
              请先在首页提交预约订单，然后回到此页面查看与管理。
            </p>
            <div className="mt-5">
              <Button
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                去首页创建订单
              </Button>
            </div>
          </Card>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>订单号</TH>
                <TH>服务项目</TH>
                <TH>设备</TH>
                <TH>方式</TH>
                <TH>电话</TH>
                <TH>预约时间</TH>
                <TH>状态</TH>
                <TH>操作</TH>
              </TR>
            </THead>
            <TBody>
              {orders.map((o) => (
                <TR key={o.id}>
                  <TD className="font-mono text-xs">{o.id}</TD>
                  <TD>{serviceLabel[o.service]}</TD>
                  <TD className="text-sm text-slate-700">{o.model}</TD>
                  <TD className="text-sm text-slate-700">
                    {o.locationType === "onsite" ? "上门" : "到店"}
                  </TD>
                  <TD className="font-mono text-xs">{o.phone}</TD>
                  <TD className="text-sm text-slate-700">
                    {o.appointmentDate} {o.appointmentTime}
                  </TD>
                  <TD>
                    <StatusBadge status={o.status} />
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={o.status === "pending" ? "primary" : "secondary"}
                        onClick={() => setStatus(o.id, "pending")}
                      >
                        待处理
                      </Button>
                      <Button
                        size="sm"
                        variant={o.status === "completed" ? "primary" : "secondary"}
                        onClick={() => setStatus(o.id, "completed")}
                      >
                        已完成
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          o.status === "cancelled" ? "destructive" : "secondary"
                        }
                        onClick={() => setStatus(o.id, "cancelled")}
                      >
                        取消
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}

