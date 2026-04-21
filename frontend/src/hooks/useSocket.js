// ─── Socket.IO Hook ───
// FIX (Bug #2): Stable socket — created once per component mount.
// onNewDonation is stored in a ref so its identity doesn't trigger reconnections.

import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export function useSocket(onNewDonation) {
  const socketRef = useRef(null);
  // Store the callback in a ref so the useEffect below doesn't re-run
  // every time the parent re-renders and produces a new function reference.
  const callbackRef = useRef(onNewDonation);

  useEffect(() => {
    callbackRef.current = onNewDonation;
  }, [onNewDonation]);

  useEffect(() => {
    // Create socket ONCE on mount
    socketRef.current = io("/", {
      transports: ["websocket", "polling"],
    });

    // Stable handler that delegates to the latest callback via ref
    const handler = (data) => {
      callbackRef.current?.(data);
    };

    socketRef.current.on("new-donation", handler);

    return () => {
      // Clean disconnect on unmount only
      socketRef.current?.off("new-donation", handler);
      socketRef.current?.disconnect();
    };
  }, []); // ← Empty deps: socket created once, never recreated on re-render

  const joinCampaign = useCallback((campaignId) => {
    socketRef.current?.emit("join-campaign", campaignId);
  }, []);

  const leaveCampaign = useCallback((campaignId) => {
    socketRef.current?.emit("leave-campaign", campaignId);
  }, []);

  return { socket: socketRef.current, joinCampaign, leaveCampaign };
}
