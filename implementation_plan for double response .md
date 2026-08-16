# Critical Bug Fixes & Security Improvements

Your senior developer found **5 major issues**. Here's the complete plan to fix all of them.

---

## Issues Identified

### 1. 🔐 JWT Token Exposed in Browser (Security – CRITICAL)
**Problem**: The API response from `loginUser` and `verifyOTP` includes `token` in the JSON body (`res.json({ ..., token })`). This `token` shows up in the browser's Network tab (inspect → XHR responses). Anyone watching can copy your JWT.

**Root cause**: `authController.js` sends the token in the response body, AND the frontend stores it in `localStorage`. `localStorage` is readable by any JS on your page (XSS attack vector).

**Fix**:
- Remove `token` from all JSON response bodies in `authController.js`
- The token is already being set as an **httpOnly cookie** (which hides it from JS) — we just need to stop also sending it in the response body
- Switch client to rely on the cookie instead of localStorage token

---

### 2. 🚦 Too Many AI Requests / Token Usage (Scalability)
**Problem**: The AI chatbot sends the **entire resume data JSON** on every single message. With many users, each call is massive (hundreds of tokens), and users might spam it. No rate limiting exists on AI-specific routes.

**Fix**:
- Add a **stricter rate limiter** specifically for AI routes (e.g., 10 requests per 15 min per IP/user)
- Add **debouncing** on the frontend chatbot so rapid sends are throttled
- Add AI request rate limit middleware in `aiRoutes.js`

---

### 3. ✅ No Input Validation on Forms
**Problem**: All form inputs (email, phone, LinkedIn, name, etc.) have zero client-side validation — no format checks, no length checks.

**Fix**: Add validation across all form inputs:
- **Email**: Must match email regex
- **Phone**: Must be validated with country code (works with phone input)
- **LinkedIn**: Must start with `linkedin.com/in/`
- **Location**: Non-empty check
- **Name**: Only letters and spaces, min 2 chars
- **Skills**: No duplicates, non-empty

---

### 4. 📞 Phone Input — Country Code Selector
**Problem**: Users have to manually type `+91` or `+1`. Standard sites have a country dropdown with flag + dial code.

**Fix**:
- Replace the plain phone `<Input>` in `PersonalInfoForm.jsx` with a proper **phone input with country code selector**
- Use the `react-phone-input-2` library (lightweight, widely used)
- Shows country flag, dial code dropdown, and formats number automatically

---

### 5. 💡 Skills — Auto-suggest as User Types
**Problem**: No suggestions appear when a user types a skill. If they type "j", they should see "JavaScript", "Java", "jQuery", etc.

**Fix**:
- Add a built-in skills suggestion list (300+ common tech/soft skills)
- Show a dropdown below the skill input filtered by what the user types
- Click suggestion to add it (or press Enter to add typed value)

---

### 6. 📄 PDF Download — Blank Pages
**Problem**: The PDF generator clones the DOM element but the resume templates use **Tailwind CSS classes** which are compiled at build time. The cloned element in a detached state doesn't get the correct styles applied because computed styles from CSS classes aren't fully inlined.

**Fix**:
- Rewrite `pdfGenerator.js` to use `html2canvas` directly (capturing the element as an image), then embed into jsPDF
- Alternatively, use `window.print()` with a print-specific CSS (`@media print`) which is much more reliable for styled components
- The most reliable approach: use a **print window** approach — open the resume in a new iframe, inject computed styles, and use `window.print()`
- We'll go with the `html2canvas` → `jsPDF` direct approach since html2pdf.js is already installed, but we'll fix the clone approach to properly capture rendered content without cloning

---

## Proposed Changes

### Security — JWT Exposure

#### [MODIFY] [authController.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/server/src/controllers/authController.js)
- Remove `token` field from all `res.json()` bodies (keep only cookie)

#### [MODIFY] [authService.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/services/authService.js)
- Remove `localStorage.setItem('token', data.token)` — rely on httpOnly cookie instead

#### [MODIFY] [AuthContext.jsx](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/context/AuthContext.jsx)
- Remove token-based `isAuthenticated()` check from localStorage; use user state instead

#### [MODIFY] [useResumeStore.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/store/useResumeStore.js) & [groqService.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/services/groqService.js)
- Remove `getAuthHeader()` token injection (cookie is sent automatically with `credentials: 'include'`)

---

### AI Rate Limiting

#### [MODIFY] [aiRoutes.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/server/src/routes/aiRoutes.js)
- Add a tight rate limiter: **10 AI requests per 15 minutes per IP**

---

### Input Validation

#### [MODIFY] [PersonalInfoForm.jsx](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/components/builder/forms/PersonalInfoForm.jsx)
- Add email format validation (regex check)
- Add LinkedIn URL validation
- Add name validation (letters + spaces, min 2 chars)
- Replace phone input with `react-phone-input-2` country code selector
- Show inline error messages below each invalid field

#### [MODIFY] [SkillsForm.jsx](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/components/builder/forms/SkillsForm.jsx)
- Add a **skills suggestion dropdown** with 300+ common skills
- Filter by typed text
- Click to insert

#### [NEW] [skillsList.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/utils/skillsList.js)
- List of 300+ common tech and soft skills for autocomplete

---

### PDF Fix

#### [MODIFY] [pdfGenerator.js](file:///d:/projects/GETRESUMEAIFINAL-main/GETRESUMEAIFINAL-main/client/src/utils/pdfGenerator.js)
- Replace the flawed clone + compute-styles approach
- Use `html2canvas` directly on the live element (no clone needed) with `scrollY` offset fixes
- This captures the visually rendered element exactly as-is

---

## Open Questions

> [!IMPORTANT]
> **Phone input library**: I plan to use `react-phone-input-2`. The default style is basic. Should I style it to match your dark/orange UI theme, or use the built-in style? I'll match it to your existing UI by default.

> [!IMPORTANT]
> **JWT Storage**: Removing the token from localStorage is a security improvement. The httpOnly cookie approach already in place is correct. However — this means `isAuthenticated()` can no longer check localStorage. I'll update the auth check to rely on the `user` state in context instead. Confirm this is okay?

---

## Verification Plan

### After Fix
- Login → Inspect Network tab → verify `token` field is gone from response JSON
- Check Application → Cookies → see `token` cookie set as httpOnly (not visible to JS)
- Try downloading PDF → verify it captures all text and styles correctly
- Type in skills input → verify suggestion dropdown appears
- Type in phone → verify country code dropdown shows
- Try invalid email/phone → verify red error messages appear
- Make >10 AI requests in 15 min → verify 429 Too Many Requests
