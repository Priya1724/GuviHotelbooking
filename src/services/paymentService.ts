import { supabase, Payment } from '../lib/supabase';

export const paymentService = {
  async createPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async getPaymentByBookingId(bookingId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) throw error;
    return data as Payment | null;
  },

  async updatePaymentStatus(id: string, status: Payment['payment_status'], transactionId?: string) {
    const updates: Partial<Payment> = { payment_status: status };
    if (transactionId) {
      updates.transaction_id = transactionId;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async simulatePayment(bookingId: string, amount: number, paymentMethod: string): Promise<Payment> {
    const payment = await this.createPayment({
      booking_id: bookingId,
      amount,
      payment_method: paymentMethod,
      payment_status: 'PENDING',
      transaction_id: null,
      payment_date: new Date().toISOString(),
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.1;
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    return this.updatePaymentStatus(
      payment.id,
      success ? 'SUCCESS' : 'FAILED',
      success ? transactionId : undefined
    );
  },

  async getAllPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id(
          id,
          guest_name,
          guest_email,
          hotels:hotel_id(name),
          rooms:room_id(room_number)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
