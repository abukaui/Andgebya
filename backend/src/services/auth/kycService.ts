/**
 * Ardi KYC & Security Service
 * Location: src/services/auth/kycService.ts
 * 
 * Logic for:
 * - Fayda ID Verification
 * - Courier-Bond™ account management
 */

export type KYCStatus = 'none' | 'pending' | 'approved' | 'rejected';

/**
 * initiateCourierKYC
 * Couriers must provide their Fayda ID and upload documents.
 */
export async function initiateCourierKYC(userId: string, faydaId: string, documentUrls: string[]) {
  console.log(`[Ardi-KYC] Initiating verification for Courier ${userId} with Fayda ID: ${faydaId}`);

  // 1. Update Profile with Fayda ID and change status to pending
  const query = `
    UPDATE courier_profiles 
    SET fayda_id = $1, kyc_status = 'pending', updated_at = NOW()
    WHERE user_id = $2
  `;
  
  // await db.query(query, [faydaId, userId]);

  // 2. Log documents for admin review
  // await db.query('INSERT INTO kyc_documents (user_id, urls) VALUES ($1, $2)', [userId, documentUrls]);

  return { success: true, status: 'pending' };
}

/**
 * depositCourierBond
 * The "Courier-Bond™" system.
 */
export async function depositCourierBond(userId: string, amount: number) {
  if (amount < 0) throw new Error("Invalid deposit amount");

  console.log(`[Ardi-Security] Courier ${userId} depositing Courier-Bond of $${amount}`);

  const query = `
    UPDATE courier_profiles 
    SET bond_amount = bond_amount + $1, updated_at = NOW()
    WHERE user_id = $2
    RETURNING bond_amount;
  `;

  // const result = await db.query(query, [amount, userId]);
  
  // If bond exceeds threshold (e.g. $50), mark as potentially verified if KYC also passes
  return { success: true, newBalance: amount };
}

/**
 * verifyCourier
 * Admin action to finalise trust
 */
export async function verifyCourier(userId: string, approved: boolean) {
  const status: KYCStatus = approved ? 'approved' : 'rejected';
  
  await db.query(`
    UPDATE courier_profiles 
    SET kyc_status = $1, is_verified = $2, updated_at = NOW() 
    WHERE user_id = $3
  `, [status, approved, userId]);

  return { success: true, status };
}
