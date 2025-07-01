import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from './firebase';

// Circuit Breaker state
let isNetworkEnabled = true;
let failureCount = 0;
const failureThreshold = 3; // Number of failures before tripping the circuit
const resetTimeout = 30000; // 30 seconds to wait before trying to reconnect

// Function to disable Firestore network
const tripCircuit = () => {
  if (isNetworkEnabled) {
    console.warn('Firebase Circuit Breaker: Tripping circuit, disabling network.');
    disableNetwork(db);
    isNetworkEnabled = false;

    // Set a timeout to re-enable the network
    setTimeout(() => {
      console.log('Firebase Circuit Breaker: Attempting to reset circuit, enabling network.');
      enableNetwork(db);
      isNetworkEnabled = true;
      failureCount = 0; // Reset failure count on attempt
    }, resetTimeout);
  }
};

// Function to be called on successful connection
export const handleSuccess = () => {
  if (!isNetworkEnabled) {
    console.log('Firebase Circuit Breaker: Network re-enabled, resetting circuit.');
  }
  failureCount = 0; // Reset on success
};

// Function to be called on connection failure
export const handleFailure = () => {
  if (isNetworkEnabled) {
    failureCount++;
    console.warn(`Firebase Circuit Breaker: Failure count: ${failureCount}`);
    if (failureCount >= failureThreshold) {
      tripCircuit();
    }
  }
};

// Wrapper for Firestore operations
export const withCircuitBreaker = async <T>(
  firestoreOperation: () => Promise<T>
): Promise<T> => {
  if (!isNetworkEnabled) {
    console.warn('Firebase Circuit Breaker: Network is disabled, operation skipped.');
    throw new Error('Network is offline.');
  }

  try {
    const result = await firestoreOperation();
    handleSuccess();
    return result;
  } catch (error: any) {
    if (error.code === 'unavailable') {
      handleFailure();
    }
    throw error; // Re-throw the error to be handled by the caller
  }
};
