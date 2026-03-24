"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cpu,
  Database,
  Fan,
  HardDrive,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { format } from "date-fns";

import {
  createOrder,
  generateOrderId,
  type DeviceType,
  type LocationType,
  type Order,
  type ServiceType,
} from "@/lib/order";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const TIME_SLOTS = ["09:00-12:00", "13:00-18:00", "19:00-22:00"] as const;

const serviceOptions: Array<{
  value: ServiceType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}> = [
  { value: "cleaning", title: "清灰换硅脂", subtitle: "¥80 起", icon: <Fan /> },
  {
    value: "os_reinstall",
    title: "系统重装",
    subtitle: "¥50 起",
    icon: <HardDrive />,
  },
  {
    value: "data_recovery",
    title: "数据恢复",
    subtitle: "¥200 起",
    icon: <Database />,
  },
  {
    value: "hardware_upgrade",
    title: "硬件升级",
    subtitle: "按需报价",
    icon: <Cpu />,
  },
  {
    value: "system_optimization",
    title: "系统优化",
    subtitle: "¥60 起",
    icon: <Sparkles />,
  },
];

const deviceTypeLabel: Record<DeviceType, string> = {
  laptop: "笔记本",
  desktop: "台式机",
  aio: "一体机",
};

const schema = z
  .object({
    service: z.custom<ServiceType>(),
    deviceType: z.custom<DeviceType>(),
    model: z.string().min(2, "请填写品牌型号（至少 2 个字）"),
    issueDescription: z.string().optional(),
    locationType: z.custom<LocationType>(),
    phone: z
      .string()
      .regex(/^1\d{10}$/, "手机号格式不正确（需 11 位大陆手机号）"),
    address: z.string().optional(),
    appointmentDate: z
      .date({
        required_error: "请选择预约日期",
        invalid_type_error: "请选择预约日期",
      })
      .refine((d) => d instanceof Date && !Number.isNaN(d.getTime()), {
        message: "请选择预约日期",
      }),
    appointmentTime: z.custom<(typeof TIME_SLOTS)[number]>(),
  })
  .superRefine((val, ctx) => {
    if (val.locationType === "onsite") {
      if (!val.address || val.address.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "上门服务请填写详细地址（至少 5 个字）",
          path: ["address"],
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const steps = [
  { title: "服务选择", hint: "请选择您需要的服务" },
  { title: "设备信息", hint: "填写设备类型与品牌型号" },
  { title: "服务方式", hint: "上门或到店，并填写联系方式" },
  { title: "时间预约", hint: "选择预约日期和服务时段" },
] as const;

function Stepper({ step }: { step: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>
          Step {step + 1}/{steps.length}
        </span>
        <span className="font-medium text-slate-900">{steps[step].title}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function BookingForm() {
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      service: "cleaning",
      deviceType: "laptop",
      model: "",
      issueDescription: "",
      locationType: "onsite",
      phone: "",
      address: "",
      appointmentDate: undefined as unknown as Date,
      appointmentTime: TIME_SLOTS[0],
    },
  });

  const values = form.watch();

  const goNext = async () => {
    const fieldsByStep: Array<Array<keyof FormValues>> = [
      ["service"],
      ["deviceType", "model", "issueDescription"],
      ["locationType", "phone", "address"],
      ["appointmentDate", "appointmentTime"],
    ];
    const ok = await form.trigger(fieldsByStep[step], { shouldFocus: true });
    if (!ok) return;
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const submitBooking = async () => {
    setSubmitError(null);
    const ok = await form.trigger(undefined, { shouldFocus: true });
    if (!ok) {
      setSubmitError("请先完善必填项后再提交。");
      return;
    }
    const data = form.getValues();
    setSubmitting(true);
    try {
      const order: Order = {
        id: generateOrderId(),
        service: data.service,
        deviceType: data.deviceType,
        model: data.model.trim(),
        issueDescription: data.issueDescription?.trim() || undefined,
        locationType: data.locationType,
        address:
          data.locationType === "onsite"
            ? data.address?.trim()
            : (data.address?.trim() || "到店服务"),
        phone: data.phone,
        appointmentDate: format(data.appointmentDate, "yyyy-MM-dd"),
        appointmentTime: data.appointmentTime,
        status: "pending",
        createdAt: Date.now(),
      };
      createOrder(order);
      window.location.href = `/success?orderId=${encodeURIComponent(order.id)}`;
    } catch {
      setSubmitError("提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = serviceOptions.find((s) => s.value === values.service);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-blue-600">PC Service Hub</div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            电脑综合服务预约
          </h1>
          <p className="mt-1 text-sm text-slate-600">{steps[step].hint}</p>
        </div>
        <div className="w-44">
          <Stepper step={step} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitBooking();
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {step === 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {serviceOptions.map((opt) => {
                  const active = values.service === opt.value;
                  return (
                    <Card
                      key={opt.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => form.setValue("service", opt.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          form.setValue("service", opt.value);
                        }
                      }}
                      className={[
                        "cursor-pointer p-4 transition",
                        active
                          ? "border-blue-600 ring-2 ring-blue-600/20"
                          : "hover:border-slate-300",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={[
                              "flex h-10 w-10 items-center justify-center rounded-xl",
                              active ? "bg-blue-600 text-white" : "bg-slate-100",
                            ].join(" ")}
                          >
                            {React.cloneElement(opt.icon as React.ReactElement, {
                              size: 18,
                            })}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {opt.title}
                            </div>
                            <div className="text-sm text-slate-600">
                              {opt.subtitle}
                            </div>
                          </div>
                        </div>
                        <div
                          className={[
                            "h-5 w-5 rounded-full border",
                            active ? "border-blue-600 bg-blue-600" : "border-slate-300",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {step === 1 ? (
              <Card className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      设备类型
                    </label>
                    <div className="mt-2">
                      <Select
                        value={values.deviceType}
                        onChange={(e) =>
                          form.setValue("deviceType", e.target.value as DeviceType, {
                            shouldTouch: true,
                          })
                        }
                      >
                        {Object.entries(deviceTypeLabel).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      品牌型号（必填）
                    </label>
                    <div className="mt-2">
                      <Input
                        value={values.model}
                        onChange={(e) =>
                          form.setValue("model", e.target.value, { shouldTouch: true })
                        }
                        placeholder="例如：ThinkPad X1 Carbon / iMac 27"
                      />
                      {form.formState.errors.model ? (
                        <p className="mt-2 text-sm text-red-600">
                          {form.formState.errors.model.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">
                    问题描述（选填）
                  </label>
                  <div className="mt-2">
                    <textarea
                      className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ring-offset-slate-50"
                      value={values.issueDescription || ""}
                      onChange={(e) =>
                        form.setValue("issueDescription", e.target.value, {
                          shouldTouch: true,
                        })
                      }
                      placeholder="例如：风扇声音大、蓝屏、开机慢等"
                    />
                  </div>
                </div>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      服务方式
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className={[
                          "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                          values.locationType === "onsite"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                        onClick={() =>
                          form.setValue("locationType", "onsite", { shouldTouch: true })
                        }
                      >
                        <Truck size={16} />
                        上门服务
                      </button>
                      <button
                        type="button"
                        className={[
                          "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                          values.locationType === "store"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                        ].join(" ")}
                        onClick={() =>
                          form.setValue("locationType", "store", { shouldTouch: true })
                        }
                      >
                        <Store size={16} />
                        预约到店
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      联系电话
                    </label>
                    <div className="mt-2">
                      <Input
                        inputMode="numeric"
                        value={values.phone}
                        onChange={(e) =>
                          form.setValue("phone", e.target.value.trim(), {
                            shouldTouch: true,
                          })
                        }
                        placeholder="11 位手机号"
                      />
                      {form.formState.errors.phone ? (
                        <p className="mt-2 text-sm text-red-600">
                          {form.formState.errors.phone.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">
                    详细地址{values.locationType === "onsite" ? "（必填）" : "（到店可选）"}
                  </label>
                  <div className="mt-2">
                    <Input
                      value={values.address || ""}
                      onChange={(e) =>
                        form.setValue("address", e.target.value, { shouldTouch: true })
                      }
                      placeholder={
                        values.locationType === "onsite"
                          ? "例如：朝阳区 XX 路 XX 号 XX 小区 XX 栋"
                          : "可选：如需备注可填写"
                      }
                    />
                    {form.formState.errors.address ? (
                      <p className="mt-2 text-sm text-red-600">
                        {form.formState.errors.address.message as string}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="text-sm font-medium text-slate-700">
                    预约日期（禁用历史日期）
                  </div>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={values.appointmentDate}
                      onSelect={(d) =>
                        d
                          ? form.setValue("appointmentDate", d, { shouldTouch: true })
                          : null
                      }
                      disabled={{ before: today }}
                    />
                    {form.formState.errors.appointmentDate ? (
                      <p className="mt-2 text-sm text-red-600">
                        {form.formState.errors.appointmentDate.message as string}
                      </p>
                    ) : null}
                  </div>
                </div>

                <Card className="p-6">
                  <div className="text-sm font-medium text-slate-700">服务时段</div>
                  <div className="mt-3 space-y-2">
                    {TIME_SLOTS.map((slot) => {
                      const active = values.appointmentTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          className={[
                            "w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition",
                            active
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                          ].join(" ")}
                          onClick={() =>
                            form.setValue("appointmentTime", slot, { shouldTouch: true })
                          }
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs text-slate-600">本次预约</div>
                    <div className="mt-2 text-sm text-slate-900">
                      <div className="font-semibold">
                        {selectedService?.title ?? "服务"} ·{" "}
                        {deviceTypeLabel[values.deviceType]}
                      </div>
                      <div className="mt-1 text-slate-600">
                        {values.locationType === "onsite" ? "上门服务" : "预约到店"}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={goPrev}
            disabled={step === 0 || submitting}
          >
            上一步
          </Button>

          {step < steps.length - 1 ? (
            <Button type="button" onClick={goNext} disabled={submitting}>
              下一步
            </Button>
          ) : (
            <Button type="button" onClick={() => void submitBooking()} isLoading={submitting}>
              提交预约
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          提交后将提示预约成功，工程师会与您联系；服务完成后{" "}
          <span className="font-medium text-slate-900">线下结算</span>。
        </p>
        {submitError ? (
          <p className="mt-2 text-center text-sm text-red-600">{submitError}</p>
        ) : null}
      </form>
    </div>
  );
}

