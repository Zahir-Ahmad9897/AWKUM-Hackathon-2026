# 🚀 TrustFund Pitch Deck Structure
**Target Duration:** 10 Minutes
**Slide Count:** 12 Power-Packed Slides
**Team:** 404 Engr. (Zahir Ahmad & Mehran Ullah)
**Institution:** University of Engineering Technology, Mardan

---

## 🎯 Slide 1: Title Slide (0:00 - 0:30)
*   **Visual:** Dark gradient background. Large, elegant logo of **TrustFund** centered. 
*   **Text (Minimal):** 
    *   **TrustFund**: Verified Crowdfunding for Social Impact.
    *   **Team:** 404 Engr. (Zahir Ahmad & Mehran Ullah)
    *   **Institution:** UET Mardan
*   **Animation:** Team name fades in smoothly from the bottom *after* the logo.

## 🚨 Slide 2: The Core Problem (0:30 - 1:30)
*   **Visual:** Split screen. Left side: An icon of a donor with a question mark. Right side: A pie chart showing "Lost Trust" in online fundraising.
*   **Text:** 
    *   The "Scam" Crisis.
    *   Zero Accountability.
    *   No tracking of funds post-donation.
*   **Speaker Notes:** "Donors consistently ask: Where is my money actually going? The current landscape lacks absolute verification."

## 💡 Slide 3: Our Solution — TrustFund (1:30 - 2:00)
*   **Visual:** A powerful, centered 3D shield icon. 
*   **Text:** 
    *   Mandatory 3rd-Party NGO Verification.
    *   Regulated Withdrawals.
    *   Transparent, Real-time Ledgers.
*   **Transition:** Use a *Push* or *Zoom* transition from Slide 2.

## ⚙️ Slide 4: Tech Stack (2:00 - 2:45)
*   **Visual:** Grid of beautifully aligned technology logos (React, Node.js, Express, MySQL, Prisma, Socket.IO, Tailwind).
*   **Text:**
    *   **Frontend:** React + Vite
    *   **Backend:** Node.js, Express
    *   **Database:** MySQL with Prisma ORM
    *   **Real-time:** Socket.IO
*   **Animation:** Logos subtly "pop" or "bounce" sequentially from left to right.

## 🔒 Slide 5: Feature I - Pre-Verification Quarantine (2:45 - 3:45)
*   **Visual:** Simple flowchart diagram: `User -> Creates Campaign -> Locked Box (Pending)`.
*   **Text:** 
    *   Campaigns Default to `PENDING`.
    *   Hidden from Public Eye.
    *   Mitigates Immediate Fraud.
*   **Speaker Notes:** Highlight that NO money can be given until the system unlocks it.

## 🏛️ Slide 6: Feature II - NGO Autonomous Auditing (3:45 - 4:45)
*   **Visual:** Diagram continues: `Locked Box -> NGO Agent -> Verified (Green Tick)`.
*   **Text:** 
    *   Strict Conflict-of-Interest Guards.
    *   NGOs Cannot Verify Own Campaigns.
    *   Automated Status Flip to `VERIFIED`.
*   **Animation:** The "Pending" lock shatters and morphs into a green verified checkmark.

## ⚛️ Slide 7: Feature III - Atomic Financial Transactions (4:45 - 6:00)
*   **Visual:** A snippet of your actual **Prisma** `$transaction` code, styled beautifully using a carbon.now.sh code image.
*   **Text:** 
    *   Acid-Compliant Execution.
    *   Simultaneous Receipt & Total Update.
    *   Zero Race Conditions.
*   **Speaker Notes:** Explain that if the server crashes mid-donation, the database strictly rolls back to prevent money glitches.

## 📻 Slide 8: Feature IV - Real-Time Impact Tracking (6:00 - 7:00)
*   **Visual:** A looping GIF of the browser's progress bar jumping up automatically. Socket.IO logo pulsating in the corner.
*   **Text:**
    *   Live WebSockets (Socket.IO).
    *   No Page Refreshes.
    *   Instant Donor Gratification.
*   **Transition:** *Wipe* transition.

## 🛡️ Slide 9: Feature V - Regulated Withdrawals (7:00 - 8:00)
*   **Visual:** A vault icon with two keys. Key 1 = Creator, Key 2 = Admin.
*   **Text:** 
    *   Balance Caps (Cannot overdraw).
    *   Mandatory Withdrawal Proposals.
    *   Secondary Sign-off required.

## 🚦 Slide 10: System Architecture & Security (8:00 - 8:45)
*   **Visual:** High-level architecture block diagram.
*   **Text:**
    *   **Auth:** JWT & Bcrypt (12-salt).
    *   **Security:** Express Rate Limiting (DOS Prevention).
    *   **Validation:** Strict input parsing via Zod.

## 💻 Slide 11: Demo Time (8:45 - 9:30)
*   **Visual:** A full-screen mockup of the UI inside an aesthetic Macbook/Laptop frame.
*   **Text:** "Let's See it Live."
*   **Action for You:** Alt-tab out of the presentation and quickly show 1) Logging in, 2) Creating a campaign, 3) Doing a live donation where the UI updates instantly.

## 🚀 Slide 12: Future Roadmap & Q&A (9:30 - 10:00)
*   **Visual:** A smooth timeline arrow. 
*   **Text:** 
    *   AI Fraud Detection Analysis.
    *   Fiat-to-Crypto Escrow functionality.
    *   Thank You!
*   **Animation:** Text elements fade in gently.
*   **Speaker Notes:** "We are Team 404 Engr., and we are ready for your questions."
