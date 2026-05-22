# Admin Panel Implementation Plan: Automotive Marketplace & Service Quotation Platform

This document outlines the detailed implementation plan and design strategy for the Admin Panel of the Automotive Marketplace & Service Quotation Platform, based on the provided Business Requirements Document (BRD).

## Goal Description

The objective is to design and develop a comprehensive web-based Admin Portal that allows administrators to oversee and manage the entire automotive marketplace ecosystem. This includes user management (customers, providers, field executives, and sub-admins), subscription monitoring, category configuration, platform analytics, and operational tracking. The panel will support Role-Based Access Control (RBAC) differentiating between Super Admins and System Admins.

> [!NOTE]
> As per instructions, this phase is strictly for **understanding and planning**. No code or UI has been built yet. 

## User Review Required & Open Questions

> [!IMPORTANT]
> Please review the following questions to clarify some ambiguities in the BRD before we proceed to any future development phases:

1. **Pricing Update Permissions:** Section 4.1 of the BRD states "Subscription pricing can only be modified by Super Admin", but Section 3.5.5 mentions System Admins can "Update subscription plan pricing". We will restrict this to Super Admins only for security. Is this correct?
2. **Provider Approval Workflow:** Section 3.5.4 mentions "Approve/reject providers if approval workflow is enabled". Should this manual approval workflow be enabled by default for Phase 1?
3. **Tech Stack Preferences:** Do you have any preferred frontend framework (e.g., Next.js, React/Vite) or UI component library (e.g., Material-UI, Tailwind CSS, Ant Design) for the Admin Panel? We recommend React/Vite with Tailwind CSS for a premium and fast experience.

## Proposed System Architecture & Tech Stack (Recommendation)
* **Frontend Framework:** React 18 (using Vite for fast builds) or Next.js.
* **Styling:** Vanilla CSS / Tailwind CSS (if approved) to ensure a modern, rich, and highly responsive aesthetic.
* **Routing:** React Router (or Next.js App Router).
* **State Management:** Zustand or Redux Toolkit.
* **Charts/Analytics:** Recharts or Chart.js for rendering the dashboard statistics.

## Role-Based Access Control (RBAC)

The system will strictly enforce role-based routing and actions:

* **Super Admin:** Full system access. Can manage System Admins and update global subscription pricing.
* **System Admin:** Operational access. Can manage end-users, approve providers, monitor requests, view reports, but cannot create other admins or change subscription prices.

## Proposed UI/UX Layout Structure

The Admin Panel will follow a modern, premium B2B dashboard aesthetic:
* **Sidebar (Left):** Primary navigation menu (collapsible).
* **Topbar:** User profile, role indicator, quick notifications, and logout.
* **Main Content Area:** Data tables, analytical charts, forms, and detail views.

## Functional Modules & Pages

### 1. Dashboard & Analytics (Home)
A bird's-eye view of marketplace operations using visual charts and metric cards.
* **Key Metrics Cards:** Total Customers, Total Providers, Active Subscriptions, Renewals Due.
* **Activity Metrics:** Total Requests, Total Quotations Submitted.
* **Performance Charts:** Provider Onboarding statistics over time, Executive Onboarding performance.
* **Feedback Overview:** Average platform ratings.

### 2. User Management
Divided into distinct sub-sections for clear organization.
* **System Admins (Super Admin Only):** Table of admins, create new admin, activate/deactivate toggle.
* **Customers:** Table listing registered customers, vehicle counts, and account status.
* **Service Providers:** 
  * Pending Approvals list (if workflow enabled).
  * Active/Inactive toggle.
  * View detailed profile (Shop details, categories, ratings, field employee code).
* **Field Executives:** Table of field staff, mapped onboarding counts, and performance metrics.

### 3. Category & Taxonomy Management
Allow admins to define the data structures that drive the platform's matching algorithm.
* **Vehicle Categories:** 2-Wheeler, 3-Wheeler, 4-Wheeler, Trucks.
* **Service Categories:** Engine repair, AC service, etc.
* **Spare Part Categories:** Bumpers, Brakes, etc.

### 4. Subscription & Payment Management
* **Subscription Plans (Super Admin Only):** Edit pricing for regular plans.
* **Provider Subscriptions:** View list of providers and their current subscription status (Active, Expired, Promotional Phase).
* **Payment History:** Log of all subscription payments (UPI, Cards, etc.) with success/failure status.
* **Renewal Alerts:** List of subscriptions expiring in the next X days.

### 5. Requests & Quotations Monitoring
Read-only monitoring to oversee platform health without interfering in transactions.
* **Requests Log:** View customer requests, uploaded images, and status (open, quoted).
* **Quotations Log:** View which providers quoted on which requests (pricing hidden or visible depending on privacy policy).

### 6. Feedback & Ratings Moderation
* View all customer ratings and feedback comments for providers.
* Ability to hide/remove abusive or fake reviews (Moderation capabilities).

## Verification Plan

When development begins, we will verify the Admin Panel through:
1. **Access Control Testing:** Attempt to access Super Admin routes using a System Admin account to ensure proper blockage.
2. **Data Consistency Checks:** Verify that dashboard counts perfectly match the underlying database records.
3. **Responsive Design:** Ensure the tables and charts are usable on smaller screens or tablets, not just large desktop monitors. 
4. **Workflow Testing:** Simulate provider registration and verify the Admin approval and activation flows.
