"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { loadOrders } from "@/lib/order";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SuccessPage() {
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [found, setFound] = React.useState(false);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("orderId");
    setOrderId(id);
    if (id) {
      const orders = loadOrders();
      setFound(orders.some((o) => o.id === id));
    }
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 text-green-600">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">预约提交成功</h1>
              <p className="mt-2 text-sm text-slate-600">
                工程师将与您联系确认细节；服务完成后{" "}
                <span className="font-medium text-slate-900">线下结算</span>。
              </p>
              {orderId ? (
                <p className="mt-3 text-sm text-slate-600">
                  订单号：<span className="font-mono text-slate-900">{orderId}</span>
                  {found ? null : (
                    <span className="ml-2 text-xs text-amber-700">
                      （本地未找到该订单，可能已清空浏览器存储）
                    </span>
                  )}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  未获取到订单号（可返回首页重新提交）。
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              返回首页
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/admin";
              }}
            >
              管理后台
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

