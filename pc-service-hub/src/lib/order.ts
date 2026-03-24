export type ServiceType =
  | "cleaning"
  | "os_reinstall"
  | "data_recovery"
  | "hardware_upgrade"
  | "system_optimization";

export type DeviceType = "laptop" | "desktop" | "aio";

export type LocationType = "onsite" | "store";

export type OrderStatus = "pending" | "completed" | "cancelled";

export interface Order {
  id: string; // PC-YYYYMMDD-1234
  service: ServiceType;
  deviceType: DeviceType;
  model: string;
  issueDescription?: string;
  locationType: LocationType;
  address?: string;
  phone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // 09:00-12:00 ...
  status: OrderStatus;
  createdAt: number;
}

const STORAGE_KEY = "pc-service-hub:orders:v1";

export function generateOrderId(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `PC-${y}${m}${d}-${rand}`;
}

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as Order[];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(order: Order) {
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const orders = loadOrders();
  const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
  saveOrders(next);
  return next;
}

