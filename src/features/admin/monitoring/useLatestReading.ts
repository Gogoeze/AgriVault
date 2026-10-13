import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/shared/lib/firebase";

export function useLatestReading(path: string) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, path), (snap) => setData(snap.val()));
    return unsubscribe;
  }, [path]);

  return data;
}