"use client";

import { useEffect } from "react";

import { lockPlayersAction } from "@/actions/players-access";

/**
 * Locks the Clients list when Home is actually opened. It runs in the browser,
 * so link prefetches of Home (which never mount the page) cannot lock it.
 */
export default function LockOnVisit() {
  useEffect(() => {
    void lockPlayersAction();
  }, []);

  return null;
}
