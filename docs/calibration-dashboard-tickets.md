# Calibration dashboard tickets

Read-only department page for one **cycle**. The department page is the only test seam: each ticket is verified by what that page shows. Nothing on the page can change a **rating**.

Tickets 2 and 3 can both start once ticket 1 is done. Ticket 5 waits for ticket 2 and ticket 4.

## 1. One shown team on the department page

**Blocked by:** None (can start immediately)

**What to build:** Engineering's **calibration session** is open. Platform, a closed team of 8, shows its **spread** histogram and a **person line** for each person: both **ratings**, both justifications, and the **self review**, with no name. Engineering shows its name and that it is open, and draws no histogram, because Platform is shown and nobody rolls into Engineering.

- [x] The page shows Engineering open and Platform closed
- [x] Platform's histogram shows the five bands from both **ratings** on each **manager assessment**
- [x] Each Platform **person line** shows both **ratings**, both justifications, and the **self review**, and shows no name
- [x] Engineering draws no histogram
- [x] The page has no way to change a **rating**

## 2. Rating change history

**Blocked by:** 1

**What to build:** Choosing a Platform **person line** shows only that person's **rating changes**: previous band, new band, axis, written reason, and the **calibration session**. The line itself shows the current **ratings**.

- [x] Choosing a **person line** shows that person's **rating changes** and no one else's
- [x] Each **rating change** shows the previous band, the new band, the axis, the written reason, and the session
- [x] The **person line** shows the current **ratings**

## 3. Flag and AI summary

**Blocked by:** 1

**What to build:** Platform is a **flag**, so its **AI summary** is on the card. Infra, a closed team of 6, shows its histogram and **person lines**, is not a **flag**, and has no **AI summary**. A **spread** at exactly 40% Exceeding or Exceptional is not a **flag**.

- [x] Platform shows a **flag** and its **AI summary**
- [x] Infra shows its histogram and **person lines**, and shows neither a **flag** nor an **AI summary**
- [x] A **spread** with exactly 40% of its **ratings** at Exceeding or Exceptional is not a **flag**
- [x] A **spread** with more than 40% of its **ratings** at Exceeding or Exceptional is a **flag**

## 4. Hidden spread

**Blocked by:** 3

**What to build:** Design (3) and Research (3) are shown like any other **group**: name, closed session, and **person lines**. Design is a **flag** and shows its **AI summary**. Research is not. Neither draws a histogram.

- [x] Design shows its name, a closed session, its **person lines**, a **flag**, and its **AI summary**
- [x] Research shows its name, a closed session, and its **person lines**, and shows neither a **flag** nor an **AI summary**
- [x] Design and Research draw no histogram

## 5. Rollup into the open department

**Blocked by:** 2 and 4

**What to build:** Engineering's histogram is only Design and Research (6 people), so it is shown and it is not a **flag**. It does not repeat their **person lines**, and it does not include Platform or Infra. A **rating change** made in Engineering's session appears on Design's **person line** and in that person's history.

- [ ] Engineering's histogram counts only Design and Research
- [ ] Engineering's histogram does not include Platform or Infra
- [ ] Engineering does not repeat Design's or Research's **person lines**
- [ ] Engineering's **spread** is shown and is not a **flag**
- [ ] A **rating change** from Engineering's session appears on Design's **person line** and in that person's history

## 6. Rollup when the parent is still under 5

**Blocked by:** 5

**What to build:** A department whose hidden children still total fewer than 5 people draws no histogram. Those **ratings** would roll to the next parent. The Engineering fixture from ticket 5 stays as it is.

- [ ] A department whose rolled-up **spread** still has fewer than 5 people draws no histogram
- [ ] Those **ratings** are carried toward the next parent
- [ ] The Engineering fixture from ticket 5 still shows its histogram of 6 people
