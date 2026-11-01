import React, { useCallback, useMemo, useState } from "react";
import type { VendorItem } from "../../../shared/types.ts";
import { summarizeVendors, type VendorItemPatch } from "../../../shared/vendors.ts";
import { usePlanDispatch, usePlanState } from "../../state/PlanContext.tsx";
import { CARD_EMPTY_CLASS, SECTION_HEADING_2XL, SECTION_HEADING_XL } from "../ui/styles.ts";
import { VendorRow } from "./VendorRow.tsx";
import { VendorSummaryCards } from "./VendorSummaryCards.tsx";

async function fetchCategoryGuidance(
  category: string,
  eventType: string,
  targetId: string,
  onUpdate: (id: string, patch: VendorItemPatch) => void,
): Promise<void> {
  try {
    const res = await fetch("/api/vendor-guidance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, eventType }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.questionsToAsk && data.redFlags) {
        onUpdate(targetId, { questionsToAsk: data.questionsToAsk, redFlags: data.redFlags });
      }
    }
  } catch {
    // Retain embedded fallback
  }
}

function VendorEmptyState(): React.JSX.Element {
  return (
    <div className={CARD_EMPTY_CLASS}>
      <h2 id="section-heading-vendors" tabIndex={-1} className={SECTION_HEADING_XL}>
        No Vendor Checklist Active
      </h2>
      <p className="mt-2 text-sm text-slate-700">Please complete the Intake Wizard to initialize your vendor roster.</p>
    </div>
  );
}

function VendorRosterList({
  vendors,
  currency,
  loadingCategory,
  onUpdate,
  onLoadGuidance,
}: {
  vendors: readonly VendorItem[];
  currency: string;
  loadingCategory: string | null;
  onUpdate: (vendorId: string, patch: VendorItemPatch) => void;
  onLoadGuidance: (category: string) => Promise<void>;
}): React.JSX.Element {
  return (
    <div className="space-y-4">
      {vendors.map((vendor) => (
        <VendorRow
          key={vendor.id}
          vendor={vendor}
          currency={currency}
          onUpdate={onUpdate}
          onLoadGuidance={onLoadGuidance}
          guidanceLoading={loadingCategory === vendor.category}
        />
      ))}
    </div>
  );
}

/**
 * Vendor Checklist component with status tracking, quotes, and AI-grounded vetting questions.
 */
export function VendorChecklist(): React.JSX.Element {
  const { plan } = usePlanState();
  const dispatch = usePlanDispatch();
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const rawVendors = plan?.vendors;
  const vendors = useMemo<readonly VendorItem[]>(() => rawVendors ?? [], [rawVendors]);
  const currency = plan?.intake.currency ?? "USD";
  const summary = useMemo(() => summarizeVendors(vendors), [vendors]);

  const handleUpdate = useCallback(
    (vendorId: string, patch: VendorItemPatch): void => {
      dispatch({ type: "UPDATE_VENDOR", payload: { vendorId, patch } });
    },
    [dispatch],
  );

  const handleLoadGuidance = useCallback(
    async (category: string): Promise<void> => {
      if (!plan) return;
      const target = vendors.find((v) => v.category === category);
      if (!target) return;
      setLoadingCategory(category);
      await fetchCategoryGuidance(category, plan.intake.eventType, target.id, handleUpdate);
      setLoadingCategory(null);
    },
    [plan, vendors, handleUpdate],
  );

  if (!plan) return <VendorEmptyState />;

  return (
    <div className="space-y-6">
      <div>
        <h2 id="section-heading-vendors" tabIndex={-1} className={SECTION_HEADING_2XL}>
          Vendor Checklist & Vetting
        </h2>
        <p className="text-sm text-slate-700">
          Track vendor statuses, quotes, and vetting guidelines. Figures entered are guidelines and planning estimates.
        </p>
      </div>

      <VendorSummaryCards
        totalCount={vendors.length}
        bookedCount={summary.bookedCount}
        totalBookedMinor={summary.totalBookedMinor}
        totalQuotedMinor={summary.totalQuotedMinor}
        currency={currency}
      />

      <VendorRosterList
        vendors={vendors}
        currency={currency}
        loadingCategory={loadingCategory}
        onUpdate={handleUpdate}
        onLoadGuidance={handleLoadGuidance}
      />
    </div>
  );
}
