import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { CustomerUser, CustomerSavedQuote, VaultDocument, ShipmentTrackStatus } from '../types';

interface AuthContextType {
  user: User | null;
  customerProfile: CustomerUser | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string, phone: string, companyName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithDemoUser: (role?: 'vip' | 'corporate') => Promise<void>;
  logout: () => Promise<void>;
  
  // Real-time Firestore customer data
  userShipments: ShipmentTrackStatus[];
  userDocuments: VaultDocument[];
  userQuotes: CustomerSavedQuote[];
  
  // Firestore Mutation helpers
  saveQuoteToCloud: (quote: CustomerSavedQuote) => Promise<void>;
  deleteQuoteFromCloud: (quoteId: string) => Promise<void>;
  saveDocumentToCloud: (docData: VaultDocument) => Promise<void>;
  updateDocumentInCloud: (docId: string, updates: Partial<VaultDocument>) => Promise<void>;
  updateProfileInCloud: (updates: Partial<CustomerUser>) => Promise<void>;
  updateShipmentInCloud: (trackingId: string, updates: Partial<ShipmentTrackStatus>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial verified sample documents for a newly authenticated customer
const INITIAL_DEMO_DOCS: VaultDocument[] = [
  {
    id: 'DOC-INS-2026-904',
    title: 'Goods-In-Transit (GIT) Marine & Road Insurance Certificate',
    docType: 'insurance_certificate',
    referenceNumber: 'NIA-GIT-POL-84920-A',
    issuedDate: '2026-08-20',
    expiryDate: '2026-09-30',
    status: 'active',
    fileSize: '420 KB',
    underwriterOrIssuer: 'Leadway Assurance Plc & AIICO Insurance Consortium',
    coverageAmountNaira: 35000000,
    originCity: 'Victoria Island, Lagos',
    destinationCity: 'Maitama, Abuja',
    signatories: ['Dr. Babatunde Sanusi (Chief Underwriter, Leadway)', 'T. Adeleke (Authorized Client)'],
    summaryText: 'Official Goods-In-Transit All-Risk Certificate granting 100% full replacement value indemnity for high-value residential furniture, executive IT infrastructure, and fine art with Zero Deductible.',
    verifiedStampCode: 'NIA-CERT-VERIFIED-2026-904',
    tags: ['Insurance', 'Leadway', 'All-Risk', 'Zero-Deductible'],
  },
  {
    id: 'DOC-MSA-2026-318',
    title: 'Signed Master Relocation & Commercial Haulage Service Agreement',
    docType: 'moving_agreement',
    referenceNumber: 'MSA-MEGATREND-2026-089',
    issuedDate: '2026-08-19',
    expiryDate: '2027-08-19',
    status: 'signed',
    fileSize: '680 KB',
    underwriterOrIssuer: 'Megatrend Logistics Legal & Compliance Directorate',
    coverageAmountNaira: 15000000,
    originCity: 'Lagos Corporate Hub',
    destinationCity: 'Nationwide Delivery Network',
    signatories: ['Engr. O. Bello (VP Operations, Megatrend)', 'Authorized Customer Representative'],
    summaryText: 'Executed bilateral Master Service Agreement establishing SLAs, guaranteed dispatch timelines, tamper-proof chain-of-custody protocols, and professional white-glove uncrating standards.',
    verifiedStampCode: 'LEGAL-EXEC-MGT-2026-88',
    tags: ['Agreement', 'Contract', 'Corporate SLA', 'Signed'],
  },
  {
    id: 'DOC-WBL-2026-441',
    title: 'Tamper-Proof Electronic Waybill & Consignment Handover Manifest',
    docType: 'waybill_manifest',
    referenceNumber: 'WBL-LAG-ABJ-90482',
    issuedDate: '2026-08-22',
    status: 'active',
    fileSize: '310 KB',
    underwriterOrIssuer: 'Megatrend Central Dispatch Office (Lagos Branch)',
    coverageAmountNaira: 25000000,
    originCity: 'Plot 14, Victoria Island, Lagos',
    destinationCity: 'Maitama District, Abuja, FCT',
    signatories: ['Captain S. Danjuma (Lead Convoy Captain)', 'M. Ibrahim (Site Loading Supervisor)'],
    summaryText: 'Official dispatch manifest detailing sealed cartons, padded furniture modules, GPS tracking transponder #GPS-889, and tamper seal serial numbers #SEAL-99482 through #SEAL-99486.',
    verifiedStampCode: 'WAYBILL-DISPATCH-90482-OK',
    tags: ['Waybill', 'Tamper-Seal', 'Manifest', 'Active Transit'],
  },
];

// Initial verified sample shipments for customer
const INITIAL_DEMO_SHIPMENTS: ShipmentTrackStatus[] = [
  {
    trackingId: 'MGT-2026-8942-LA',
    clientName: 'Chief Emeka Adeleke',
    serviceType: 'Corporate Office & Executive Relocation',
    origin: 'Victoria Island, Lagos',
    destination: 'Maitama District, Abuja',
    currentLocation: 'Lokoja Bypass Toll Corridor, Kogi State',
    status: 'In Transit',
    progressPercent: 68,
    estimatedArrival: 'Today at 17:45 WAT',
    driverName: 'Captain Sunday Danjuma',
    driverPhone: '0803 555 0192',
    vehiclePlate: 'ABC-482-XA (DAF XF 480 30-Ton Enclosed)',
    vehicleType: '30-Ton Air-Ride Hydraulic Tail-Lift Truck',
    vehicleUnit: 'Fleet Unit #44 (GPS Transponder Active)',
    tamperSealCode: 'SEAL-NG-90482-OK',
    speedKmh: 64,
    fuelLevelPercent: 82,
    cargoTempCelsius: 23,
    geofenceStatus: 'On Highway Route',
    currentCoordinates: { lat: 7.8023, lng: 6.7431 },
    originCoordinates: { lat: 6.4281, lng: 3.4219, label: 'Lagos Hub' },
    destinationCoordinates: { lat: 9.0765, lng: 7.3986, label: 'Abuja Hub' },
    smsNotificationsEnabled: true,
    smsNotificationPhone: '+234 806 246 6212',
    smsLastDispatchedAt: '2026-08-28T11:15:00Z',
    smsLastDispatchedSid: 'SM-TWILIO-90482-OK',
    updates: [
      { date: '2026-08-28', time: '11:15', location: 'Lokoja Highway, Kogi', note: 'Convoy cruising safely at 64 km/h with armed escort escort car in visual range.' },
      { date: '2026-08-28', time: '08:30', location: 'Ore Express Bypass, Ondo', note: 'Refueling stop and hydraulic suspension checkpoint passed with 100% green integrity.' },
      { date: '2026-08-28', time: '05:00', location: 'Ikeja Logistics Depot, Lagos', note: 'Consignment sealed under customs-grade tamper transponders and dispatched.' },
    ],
  },
  {
    trackingId: 'MGT-2026-7731-PH',
    clientName: 'Chief Emeka Adeleke',
    serviceType: 'Interstate Haulage & Industrial Freight',
    origin: 'Trans-Amadi Industrial Layout, Port Harcourt',
    destination: 'Ikeja Industrial Zone, Lagos',
    currentLocation: 'Megatrend Central Logistics Hub, Ikeja, Lagos',
    status: 'Delivered',
    progressPercent: 100,
    estimatedArrival: 'Delivered & Signed',
    driverName: 'Alhaji Musa Garba',
    driverPhone: '0802 888 1204',
    vehiclePlate: 'KJA-914-YZ',
    vehicleType: '40ft Skeletal Container Carrier',
    tamperSealCode: 'SEAL-PH-7731-CLEARED',
    currentCoordinates: { lat: 6.5954, lng: 3.3515 },
    originCoordinates: { lat: 4.8156, lng: 7.0498, label: 'PH Terminal' },
    destinationCoordinates: { lat: 6.5954, lng: 3.3515, label: 'Ikeja Hub' },
    updates: [
      { date: '2026-08-26', time: '14:20', location: 'Ikeja Terminal, Lagos', note: 'Consignment inspected, unsealed, and signed off with zero damage.' },
      { date: '2026-08-25', time: '18:40', location: 'Benin Bypass, Edo', note: 'Scheduled driver rotation and cargo lashing re-tensioning.' },
      { date: '2026-08-25', time: '06:00', location: 'Trans-Amadi Depot, Port Harcourt', note: 'Heavy industrial valves container loaded and departed.' },
    ],
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userShipments, setUserShipments] = useState<ShipmentTrackStatus[]>([]);
  const [userDocuments, setUserDocuments] = useState<VaultDocument[]>([]);
  const [userQuotes, setUserQuotes] = useState<CustomerSavedQuote[]>([]);

  const clearError = () => setError(null);

  // Sync user profile & subcollections from Firestore whenever auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);

      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const userDocRef = doc(db, 'users', uid);

        try {
          // 1. Fetch or initialize customer profile in Firestore
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setCustomerProfile(userSnap.data() as CustomerUser);
          } else {
            const newProfile: CustomerUser = {
              id: uid,
              email: firebaseUser.email || 'customer@megatrendmovers.com',
              fullName: firebaseUser.displayName || 'VIP Relocation Client',
              phone: firebaseUser.phoneNumber || '+234 806 246 6212',
              companyName: 'Private / Corporate Client',
              defaultCity: 'Lagos / Abuja',
              registeredAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setCustomerProfile(newProfile);
          }

          // 2. Check and seed initial shipments if empty
          const shipmentsCol = collection(db, 'users', uid, 'shipments');
          const shipmentSnaps = await getDocs(shipmentsCol);
          if (shipmentSnaps.empty) {
            for (const ship of INITIAL_DEMO_SHIPMENTS) {
              await setDoc(doc(db, 'users', uid, 'shipments', ship.trackingId), ship);
            }
          }

          // 3. Check and seed initial documents if empty
          const docsCol = collection(db, 'users', uid, 'documents');
          const docSnaps = await getDocs(docsCol);
          if (docSnaps.empty) {
            for (const vDoc of INITIAL_DEMO_DOCS) {
              await setDoc(doc(db, 'users', uid, 'documents', vDoc.id), vDoc);
            }
          }
        } catch (err: any) {
          console.warn('[AuthContext] Firestore initial read warning:', err.message);
          // Fallback in-memory profile if Firestore is still provisioning or offline
          setCustomerProfile({
            id: uid,
            email: firebaseUser.email || 'customer@megatrendmovers.com',
            fullName: firebaseUser.displayName || 'Valued Client',
            phone: '+234 806 246 6212',
            companyName: 'Megatrend Portal User',
            defaultCity: 'Lagos & Abuja',
            registeredAt: new Date().toISOString(),
          });
          setUserShipments(INITIAL_DEMO_SHIPMENTS);
          setUserDocuments(INITIAL_DEMO_DOCS);
        }

        // Set up real-time listener for user shipments
        const unsubShipments = onSnapshot(
          collection(db, 'users', uid, 'shipments'),
          (snapshot) => {
            const list: ShipmentTrackStatus[] = [];
            snapshot.forEach((d) => list.push(d.data() as ShipmentTrackStatus));
            setUserShipments(list.length > 0 ? list : INITIAL_DEMO_SHIPMENTS);
          },
          (err) => {
            console.warn('[AuthContext] Shipment snapshot error:', err);
            setUserShipments(INITIAL_DEMO_SHIPMENTS);
          }
        );

        // Set up real-time listener for user documents
        const unsubDocs = onSnapshot(
          collection(db, 'users', uid, 'documents'),
          (snapshot) => {
            const list: VaultDocument[] = [];
            snapshot.forEach((d) => list.push(d.data() as VaultDocument));
            setUserDocuments(list.length > 0 ? list : INITIAL_DEMO_DOCS);
          },
          (err) => {
            console.warn('[AuthContext] Documents snapshot error:', err);
            setUserDocuments(INITIAL_DEMO_DOCS);
          }
        );

        // Set up real-time listener for user saved quotes
        const unsubQuotes = onSnapshot(
          collection(db, 'users', uid, 'quotes'),
          (snapshot) => {
            const list: CustomerSavedQuote[] = [];
            snapshot.forEach((d) => list.push(d.data() as CustomerSavedQuote));
            setUserQuotes(list);
          },
          (err) => {
            console.warn('[AuthContext] Quotes snapshot error:', err);
          }
        );

        setLoading(false);
        return () => {
          unsubShipments();
          unsubDocs();
          unsubQuotes();
        };
      } else {
        setCustomerProfile(null);
        setUserShipments([]);
        setUserDocuments([]);
        setUserQuotes([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify your credentials or register a new portal account.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Sign Up with Email & Password
  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    phone: string,
    companyName?: string
  ) => {
    setError(null);
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(userCred.user, { displayName: fullName });

      const newProfile: CustomerUser = {
        id: userCred.user.uid,
        email: email.trim(),
        fullName,
        phone,
        companyName: companyName || '',
        defaultCity: 'Lagos / Abuja',
        registeredAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCred.user.uid), newProfile);
      setCustomerProfile(newProfile);
    } catch (err: any) {
      console.error('[AuthContext] Sign up error:', err);
      let msg = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email address is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const uid = userCred.user.uid;
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        const newProfile: CustomerUser = {
          id: uid,
          email: userCred.user.email || '',
          fullName: userCred.user.displayName || 'Google Verified Client',
          phone: userCred.user.phoneNumber || '+234 806 246 6212',
          companyName: '',
          defaultCity: 'Lagos',
          registeredAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setCustomerProfile(newProfile);
      }
    } catch (err: any) {
      console.error('[AuthContext] Google sign in error:', err);
      setError(err.message || 'Google sign in was cancelled or failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // One-Click Demo VIP Customer Sign-In
  const signInWithDemoUser = async (role: 'vip' | 'corporate' = 'vip') => {
    setError(null);
    setLoading(true);
    const demoEmail = role === 'vip' ? 'chief.adeleke@groupcorp.ng' : 'corporate.client@megatrend.ng';
    const demoPass = 'MegatrendVIP2026!';
    const demoName = role === 'vip' ? 'Chief Emeka Adeleke' : 'Adeola Alabi (Corporate Dispatch Manager)';
    const demoPhone = '+234 803 555 0192';
    const demoCompany = 'Adeleke Logistics & Holdings Plc';

    try {
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          const userCred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          await updateProfile(userCred.user, { displayName: demoName });
          const newProfile: CustomerUser = {
            id: userCred.user.uid,
            email: demoEmail,
            fullName: demoName,
            phone: demoPhone,
            companyName: demoCompany,
            defaultCity: 'Lagos (Victoria Island)',
            registeredAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', userCred.user.uid), newProfile);
          setCustomerProfile(newProfile);
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      console.error('[AuthContext] Demo sign in error:', err);
      // Create local session fallback if auth provider is blocked
      const fallbackUser: CustomerUser = {
        id: 'DEMO-VIP-' + Date.now(),
        email: demoEmail,
        fullName: demoName,
        phone: demoPhone,
        companyName: demoCompany,
        defaultCity: 'Lagos (Victoria Island)',
        registeredAt: new Date().toISOString(),
      };
      setCustomerProfile(fallbackUser);
      setUserShipments(INITIAL_DEMO_SHIPMENTS);
      setUserDocuments(INITIAL_DEMO_DOCS);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    } finally {
      setUser(null);
      setCustomerProfile(null);
      setUserShipments([]);
      setUserDocuments([]);
      setUserQuotes([]);
    }
  };

  // Cloud Mutation Helpers
  const saveQuoteToCloud = async (quote: CustomerSavedQuote) => {
    if (!user) return;
    try {
      const qId = quote.id || `QUO-${Date.now()}`;
      await setDoc(doc(db, 'users', user.uid, 'quotes', qId), {
        ...quote,
        id: qId,
        savedAt: quote.savedAt || new Date().toISOString(),
      });
    } catch (err) {
      console.error('[AuthContext] Save quote error:', err);
    }
  };

  const deleteQuoteFromCloud = async (quoteId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'quotes', quoteId));
    } catch (err) {
      console.error('[AuthContext] Delete quote error:', err);
    }
  };

  const saveDocumentToCloud = async (docData: VaultDocument) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'documents', docData.id), docData);
    } catch (err) {
      console.error('[AuthContext] Save document error:', err);
    }
  };

  const updateDocumentInCloud = async (docId: string, updates: Partial<VaultDocument>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'documents', docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await setDoc(docRef, { ...snap.data(), ...updates }, { merge: true });
      }
    } catch (err) {
      console.error('[AuthContext] Update document error:', err);
    }
  };

  const updateProfileInCloud = async (updates: Partial<CustomerUser>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updates, { merge: true });
      setCustomerProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error('[AuthContext] Update profile error:', err);
    }
  };

  const updateShipmentInCloud = async (trackingId: string, updates: Partial<ShipmentTrackStatus>) => {
    // Optimistically update local state
    setUserShipments((prev) =>
      prev.map((s) => (s.trackingId.toLowerCase() === trackingId.toLowerCase() ? { ...s, ...updates } : s))
    );

    if (!user) return;
    try {
      const shipRef = doc(db, 'users', user.uid, 'shipments', trackingId);
      await setDoc(shipRef, updates, { merge: true });
    } catch (err) {
      console.error('[AuthContext] Update shipment error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        loading,
        error,
        clearError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithDemoUser,
        logout,
        userShipments,
        userDocuments,
        userQuotes,
        saveQuoteToCloud,
        deleteQuoteFromCloud,
        saveDocumentToCloud,
        updateDocumentInCloud,
        updateProfileInCloud,
        updateShipmentInCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
