import { db } from './firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, query, getDocs, where } from 'firebase/firestore';
import { TradeEntry, UserProfile, TradeDataStore } from './types';
import { getJSTDateTime, getJSTDateString } from './date';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return null;
  }
}

export async function saveUserProfile(userId: string, data: Partial<UserProfile>) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    ...data,
    updatedAt: getJSTDateTime()
  }, { merge: true });
}

export async function fetchTradeData(
  userId: string, 
  year?: number, 
  month?: number,
  fetchFullYear: boolean = false
): Promise<TradeDataStore> {
  const tradeData: TradeDataStore = {};
  const entriesRef = collection(db, 'users', userId, 'trade_entries');
  
  try {
    const queryConstraints = [];
    if (year !== undefined) {
      if (fetchFullYear) {
        // 1年分のデータを取得
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        queryConstraints.push(
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
      } else if (month !== undefined) {
        // 特定の月のデータのみ取得
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(Date.UTC(year, month, 0));
        const endDate = getJSTDateString(lastDay);
        
        queryConstraints.push(
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
      }
    }

    const querySnapshot = await getDocs(query(entriesRef, ...queryConstraints));
    querySnapshot.forEach(doc => {
      const data = doc.data() as TradeEntry;
      if (!data.deleted) { // 削除済みデータを除外
        tradeData[doc.id] = {
          pnl: data.pnl,
          rulesFollowed: data.rulesFollowed,
          memo: data.memo,
          deleted: data.deleted
        };
      }
    });
    
    return tradeData;
  } catch (error) {
    console.error('データ取得エラー:', error);
    return {};
  }
}

export async function saveTradeEntry(
  userId: string,
  date: string,
  data: { pnl: number; rulesFollowed: { name: string; followed: boolean; }[]; memo?: string; } | null
) {
  const entryRef = doc(db, 'users', userId, 'trade_entries', date);

  try {
    if (data === null) {
      await deleteDoc(entryRef);
      return;
    }

    const saveData: TradeEntry = {
      date,
      pnl: Number(data.pnl),
      rulesFollowed: data.rulesFollowed.map(rule => ({
        name: String(rule.name),
        followed: Boolean(rule.followed)
      })),
      memo: data.memo ? String(data.memo) : '',
      updatedAt: getJSTDateTime()
    };

    await setDoc(entryRef, saveData);
  } catch (error) {
    console.error('データ保存エラー:', error);
    throw error;
  }
}