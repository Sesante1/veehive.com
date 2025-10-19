// services/userService.js
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

/**
 * Service for managing user operations with Firebase
 */
export const userService = {
  /**
   * Approve a user's verification
   * @param {string} userId - The user's document ID
   * @returns {Promise<Object>} Success response
   */
  approveUser: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verificationStatus: 'approved',
        rejectionRemarks: null,
        approvedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('User approved successfully:', userId);
      return { success: true, message: 'User approved successfully' };
    } catch (error) {
      console.error('Error approving user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error('Failed to approve user: ' + errorMessage);
    }
  },

  /**
   * Reject a user's verification with remarks
   * @param {string} userId - The user's document ID
   * @param {string} remarks - Rejection reason
   * @returns {Promise<Object>} Success response
   */
  rejectUser: async (userId: string, remarks: string) => {
    try {
      if (!remarks || remarks.trim() === '') {
        throw new Error('Remarks are required for rejection');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        verificationStatus: 'rejected',
        rejectionRemarks: remarks.trim(),
        rejectedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('User rejected successfully:', userId);
      return { success: true, message: 'User rejected successfully' };
    } catch (error) {
        console.error('Error rejecting user:', error);
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error('Failed to reject user');
        }
    }
  },

  /**
   * Ban a user permanently
   * @param {string} userId - The user's document ID
   * @returns {Promise<Object>} Success response
   */
  banUser: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'banned',
        bannedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('User banned successfully:', userId);
      return { success: true, message: 'User banned successfully' };
    } catch (error) {
      console.error('Error banning user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error('Failed to ban user: ' + errorMessage);
    }
  },

  /**
   * Suspend a user for a specified number of days
   * @param {string} userId - The user's document ID
   * @param {number} days - Number of days to suspend
   * @param {string} reason - Reason for suspension
   * @returns {Promise<Object>} Success response
   */
  suspendUser: async (userId: string, days: number, reason: string) => {
    try {
      if (!days || days <= 0) {
        throw new Error('Days must be a positive number');
      }
      if (!reason || reason.trim() === '') {
        throw new Error('Reason is required for suspension');
      }

      // Calculate suspension end date
      const suspendedUntil = new Date();
      suspendedUntil.setDate(suspendedUntil.getDate() + days);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'suspended',
        suspendedAt: Timestamp.now(),
        suspendedUntil: Timestamp.fromDate(suspendedUntil),
        suspensionReason: reason.trim(),
        suspensionDays: days,
        updatedAt: Timestamp.now()
      });
      
      console.log('User suspended successfully:', userId, 'for', days, 'days');
      return { success: true, message: `User suspended for ${days} days` };
    } catch (error) {
        console.error('Error suspending user:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to suspend user');
      }
  },

  /**
   * Reactivate a suspended or banned user
   * @param {string} userId - The user's document ID
   * @returns {Promise<Object>} Success response
   */
  reactivateUser: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'active',
        suspendedAt: null,
        suspendedUntil: null,
        suspensionReason: null,
        suspensionDays: null,
        bannedAt: null,
        reactivatedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('User reactivated successfully:', userId);
      return { success: true, message: 'User reactivated successfully' };
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw new Error('Failed to reactivate user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};

export default userService;