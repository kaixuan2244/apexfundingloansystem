# Apex Funding Client Portal

A clean front-end prototype for Apex Funding to show customer profiles, loan amounts, repayment terms, payment progress, contact details, and document status.

All customer records in this prototype are fictional demo records.

## Open

Open `index.html` in a browser. No installation is required.

## Included

- Apex Funding branding and logo assets
- Add new customer and loan application records
- Edit saved customer and loan records
- Clickable Dashboard, Clients, Loans, and Documents sections
- Pending status with loading animation
- Fail / Reject status with a visible rejection reason
- Customer avatar, IC photo, selfie with IC, and supporting document uploads
- Browser-local saved records for quick demos
- Customer search and status filtering
- Customer profile details
- Loan amount, repayment term, monthly payment, interest rate, balance, and next due date
- Document verification status
- Responsive layout for desktop and mobile

## Supabase sync

The app can now sync customers between desktop and mobile through Supabase.

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase-schema.sql`.
3. In the app sidebar, paste the Project URL and anon public key.
4. Keep the bucket name as `customer-files`.
5. Click Connect.

The included SQL uses demo-friendly public policies so the system is easy to test. Before entering real customer IC photos, selfie photos, addresses, or loan files, add login and private storage policies.
