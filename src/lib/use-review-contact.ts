import { useEffect, useState } from "react";
import type { ReviewContact } from "@/lib/website-review/contact";

export function useReviewContact() {
  const [contact, setContact] = useState<ReviewContact>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [canSkip, setCanSkip] = useState(false);
  const [skipContact, setSkipContact] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/admin/review-access", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (active) setCanSkip(data.canSkipContact === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return { contact, setContact, canSkip, skipContact, setSkipContact };
}

