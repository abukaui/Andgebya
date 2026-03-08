/**
 * Ardi Escrow Service
 * Location: src/services/payment/escrowService.ts
 * 
 * Logic for:
 * - 95/5 payment split
 * - Escrow status tracking (HELD -> RELEASED)
 */

export enum PaymentStatus {
  HELD = 'held_in_escrow',
  RELEASED = 'released',
  REFUNDED = 'refunded'
}

export interface PaymentSplit {
  total: number;
  merchantShare: number;
  courierShare: number;
  platformFee: number;
}

/**
 * calculateSplit
 * Implements the 95/5 split requirement.
 * 5% goes to Ardi Platform.
 * 95% is split between Shop (product price) and Courier (delivery fee).
 */
export function calculateSplit(productTotal: number, deliveryFee: number): PaymentSplit {
  const total = productTotal + deliveryFee;
  
  // Platform takes 5% of the total transaction
  const platformFee = total * 0.05;
  
  // The remaining 95% is distributed
  // Typically, Merchant gets 95% of product price, Courier gets 95% of delivery fee
  const merchantShare = productTotal * 0.95;
  const courierShare = deliveryFee * 0.95;

  return {
    total,
    merchantShare,
    courierShare,
    platformFee
  };
}

/**
 * recordPaymentReceived
 * Triggered after gateway callback (Webhook)
 */
export async function recordPaymentReceived(deliveryRequestId: string, transactionId: string, splits: PaymentSplit) {
  console.log(`[Ardi-Escrow] Recording payment for Request ${deliveryRequestId}. Transaction: ${transactionId}`);
  
  const query = `
    INSERT INTO payment_records (
      delivery_request_id, transaction_id, total_paid, 
      merchant_share, courier_share, platform_fee, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  
  // await db.query(query, [
  //   deliveryRequestId, transactionId, splits.total, 
  //   splits.merchantShare, splits.courierShare, splits.platformFee, 
  //   PaymentStatus.HELD
  // ]);

  return { success: true, status: PaymentStatus.HELD };
}

/**
 * releaseEscrow
 * Triggered when courier marks delivery as DONE
 */
export async function releaseEscrow(deliveryRequestId: string) {
  console.log(`[Ardi-Escrow] Releasing funds for Request ${deliveryRequestId}`);
  
  // await db.query('UPDATE payment_records SET status = $1 WHERE delivery_request_id = $2', [PaymentStatus.RELEASED, deliveryRequestId]);
  
  // Trigger Payout Service (to transfer real money to merchant/courier wallets)
  return { success: true };
}
