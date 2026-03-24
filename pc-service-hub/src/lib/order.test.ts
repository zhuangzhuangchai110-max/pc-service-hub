import { generateOrderId, loadOrders, saveOrders, createOrder, updateOrderStatus } from './order';
import type { Order } from './order';

describe('order utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  describe('generateOrderId', () => {
    it('should generate a string matching PC-YYYYMMDD-XXXX format', () => {
      const fixedDate = new Date('2026-03-19T12:00:00Z');
      const id = generateOrderId(fixedDate);
      expect(id).toMatch(/^PC-20260319-\d{4}$/);
    });

    it('should generate different ids for different calls (random part)', () => {
      const id1 = generateOrderId();
      const id2 = generateOrderId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('loadOrders & saveOrders', () => {
    it('should return empty array when localStorage is empty', () => {
      const orders = loadOrders();
      expect(orders).toEqual([]);
    });

    it('should save and load orders', () => {
      const mockOrders: Order[] = [
        {
          id: 'PC-20260319-1234',
          service: 'cleaning',
          deviceType: 'laptop',
          model: 'ThinkPad X1',
          issueDescription: 'fan noisy',
          locationType: 'onsite',
          address: '123 Main St',
          phone: '13800138000',
          appointmentDate: '2026-03-20',
          appointmentTime: '09:00-12:00',
          status: 'pending',
          createdAt: 1234567890,
        },
      ];
      saveOrders(mockOrders);
      const loaded = loadOrders();
      expect(loaded).toEqual(mockOrders);
    });
  });

  describe('createOrder', () => {
    it('should add a new order to localStorage', () => {
      const order: Order = {
        id: 'PC-20260319-9999',
        service: 'os_reinstall',
        deviceType: 'desktop',
        model: 'iMac',
        issueDescription: undefined,
        locationType: 'store',
        address: '到店服务',
        phone: '13900139000',
        appointmentDate: '2026-03-21',
        appointmentTime: '13:00-18:00',
        status: 'pending',
        createdAt: 1234567890,
      };
      createOrder(order);
      const orders = loadOrders();
      expect(orders).toHaveLength(1);
      expect(orders[0]).toEqual(order);
    });
  });

  describe('updateOrderStatus', () => {
    const baseOrder: Omit<Order, 'id' | 'status'> = {
      service: 'cleaning',
      deviceType: 'laptop',
      model: 'Test Model',
      issueDescription: undefined,
      locationType: 'onsite',
      address: 'Test Address',
      phone: '13800138000',
      appointmentDate: '2026-03-19',
      appointmentTime: '09:00-12:00',
      createdAt: 1234567890,
    };

    it('should update status of existing order', () => {
      const order: Order = {
        ...baseOrder,
        id: 'PC-20260319-1111',
        status: 'pending',
      };
      saveOrders([order]);
      const updated = updateOrderStatus(order.id, 'completed');
      expect(updated).toHaveLength(1);
      expect(updated[0].status).toBe('completed');
      // Verify localStorage updated
      const loaded = loadOrders();
      expect(loaded[0].status).toBe('completed');
    });

    it('should not affect other orders', () => {
      const order1: Order = { ...baseOrder, id: 'PC-1', status: 'pending' };
      const order2: Order = { ...baseOrder, id: 'PC-2', status: 'pending' };
      saveOrders([order1, order2]);
      const updated = updateOrderStatus('PC-1', 'cancelled');
      expect(updated.find(o => o.id === 'PC-1')?.status).toBe('cancelled');
      expect(updated.find(o => o.id === 'PC-2')?.status).toBe('pending');
    });
  });
});