export const leadLayers = [
  {
    number: "01",
    title: "Attract",
    color: "border-t-hot",
    body: "Connect search, useful content, local visibility, social campaigns, and landing pages to a clear offer.",
  },
  {
    number: "02",
    title: "Convert",
    color: "border-t-volt",
    body: "Give visitors useful answers, industry-specific intake, and an obvious path to inquire, book, or order.",
  },
  {
    number: "03",
    title: "Follow up",
    color: "border-t-flare",
    body: "Organize campaign contacts, review conversations, qualify interest, and hand opportunities to your team.",
  },
  {
    number: "04",
    title: "Improve",
    color: "border-t-volt",
    body: "Review campaign history, recorded costs, handoffs, and outcomes to decide what to strengthen next.",
  },
] as const;

export const workspaceModules = [
  {
    title: "Customers & company profiles",
    category: "CUSTOMER RECORDS",
    body: "Keep the business, website, contact people, and customer details together. Reuse saved customer information when preparing the next campaign.",
    details: [
      "Customer directory and profile updates",
      "Campaign contacts and handoff destinations",
      "Campaign history organized by customer",
    ],
  },
  {
    title: "Campaign planning & territories",
    category: "CAMPAIGN BUILDER",
    body: "Start with the customer, industry, offer, desired lead volume, service level, schedule, and requested communication channels.",
    details: [
      "Counties, ZIP codes, cities, and states",
      "Industry-specific criteria and qualification questions",
      "Draft messaging and preparation review before activation",
    ],
  },
  {
    title: "Lead & contact review",
    category: "LEAD OPERATIONS",
    body: "Bring in your existing customer lists and approved imports. Review each record for targeting fit and contact readiness before outreach starts.",
    details: [
      "Import status for your existing lists",
      "Lead and contact records connected to a campaign",
      "Review notes and channel-readiness checks",
    ],
  },
  {
    title: "Inbox & assisted conversations",
    category: "COMMUNICATIONS",
    body: "Email and text replies stay in one Demore Lead Engine inbox with their campaign context. Staff can review AI-suggested replies grounded in approved business information. Suggestions are drafts, and a person decides what gets sent.",
    details: [
      "Email and text conversation history",
      "Employee-reviewed reply drafts",
      "Qualification notes and requests for a person",
    ],
  },
  {
    title: "Qualified leads & team handoffs",
    category: "SALES FOLLOW-UP",
    body: "Capture what the prospect needs and their agreement to be contacted, then hand the opportunity to the responsible campaign contact.",
    details: [
      "Service request and timing",
      "Contact details and a useful handoff summary",
      "Handoff history tied to the customer and campaign",
    ],
  },
  {
    title: "Campaign costs & invoices",
    category: "REPORTING & BILLING",
    body: "Review recorded operating costs, usage estimates, lead delivery history, and customer invoice records in the same workspace.",
    details: [
      "Actual costs and estimates shown separately",
      "Configured rates and manual cost allocations",
      "Weekly lead summaries and invoice history",
    ],
  },
  {
    title: "Sending & campaign readiness",
    category: "CONTROLLED OUTREACH",
    body: "Prepare email and SMS batches around reviewed content and contact readiness, with opt-out handling. Your team controls activation and sending.",
    details: [
      "Channel-specific preparation",
      "Sending status and opt-out handling",
      "Campaign-level activity records",
    ],
  },
  {
    title: "Employees & operations",
    category: "WORKSPACE CONTROL",
    body: "Give authorized employees a private workspace. Administrators manage accounts, password resets, service setup, and operational status.",
    details: [
      "Employee accounts and administrator controls",
      "Password management and sign-in",
      "Setup checklist, job status, and recent activity",
    ],
  },
] as const;

export const industryExamples = [
  {
    id: "restaurants",
    label: "Restaurants",
    title: "From catering inquiry to a useful sales conversation.",
    offer: "Catering, private dining, and group reservations",
    entry: "A guest opens your catering page or submits a group-dining inquiry.",
    questions: [
      "Event date and service location",
      "Guest count and service needs",
      "Preferred contact time",
    ],
    workflow:
      "Record the inquiry under the restaurant’s campaign, review the request, and hand it to the staff member responsible for catering or group dining.",
    measurement: "Inquiry source, qualified handoffs, staff follow-up, and campaign costs.",
    path: "/industries/restaurants",
  },
  {
    id: "pubs",
    label: "Pubs",
    title: "Give private events a clear booking path.",
    offer: "Private parties, group bookings, and community events",
    entry: "An event organizer finds your venue page and asks about a private booking.",
    questions: [
      "Occasion and requested date",
      "Party size and venue needs",
      "Preferred contact method",
    ],
    workflow:
      "Keep the event inquiry and conversation together, clarify the requirements, and route the qualified request to your venue team to confirm availability.",
    measurement:
      "Event inquiries, qualified booking requests, completed handoffs, and campaign costs.",
    path: "/industries/pubs",
  },
  {
    id: "pizza-shops",
    label: "Pizza Shops",
    title: "Turn group-order interest into an organized handoff.",
    offer: "Office lunches, parties, catering, and recurring group orders",
    entry: "A customer opens your group-order page or asks about catering for an event.",
    questions: [
      "Order date and guest count",
      "Delivery address or pickup preference",
      "Order requirements and contact details",
    ],
    workflow:
      "Connect the request to the right campaign, confirm the order needs with a staff member, and hand it to the shop team. Existing ordering tools remain part of the scoped integration.",
    measurement: "Group-order inquiries, qualified handoffs, inquiry sources, and campaign costs.",
    path: "/industries/pizza-shops",
  },
  {
    id: "contractors",
    label: "Contractors & services",
    title: "Carry the project details into the next conversation.",
    offer: "Estimates, inspections, and service appointments",
    entry:
      "A homeowner requests an estimate or a campaign contact expresses interest in a service.",
    questions: [
      "Service or project type",
      "Property location and timing",
      "Preferred contact time",
    ],
    workflow:
      "Review the contact and project context, document interest, and send a qualified handoff to the estimator or service team with the details they need.",
    measurement: "Estimate inquiries, qualified handoffs, delivery history, and campaign costs.",
    path: "/industries/contractors",
  },
] as const;

export const leadFaqs = [
  {
    q: "Can I preview Demore Lead Engine without logging in?",
    a: "Yes. The interactive preview on this page shows fictional current, past, and draft campaign examples for viewing purposes only. Visitors cannot create or save campaign drafts. The follow-up form sends your contact details and goals to Ryan so he can contact you; it does not create a campaign.",
  },
  {
    q: "Can I see current and past campaigns at the same time?",
    a: "Yes. Sign in and choose All campaigns — current & past. The campaign history view brings all customers’ campaigns together, with a customer filter and links to each campaign’s details.",
  },
  {
    q: "Do I need a separate Demore Lead Engine password?",
    a: "You can use your website login when its verified email matches an existing active Demore Lead Engine account. Your existing permissions are preserved. Existing employee username and password login remains available.",
  },
  {
    q: "Is this just a website or a separate lead list?",
    a: "The website is the public entry point. Demore Lead Engine is the private workspace that organizes customers, campaign planning, lead review, conversations, handoffs, and costs. It is not a lead list. Website forms, existing tools, and imports of your own customer lists are scoped during setup.",
  },
  {
    q: "Can we use the tools we already have?",
    a: "Often, yes. We review your website, CRM, ordering or booking system, customer lists, email, SMS, and analytics tools before proposing integrations. Compatibility and access need to be checked for each service.",
  },
  {
    q: "Does choosing an industry automatically generate leads?",
    a: "No. An industry preset supplies relevant campaign criteria and qualification questions. It does not provide a contact list. Imports of your own lists, permissions, and campaign preparation are configured separately.",
  },
  {
    q: "Will AI send messages or replace our employees?",
    a: "No. AI-assisted replies are drafts for staff review. Live email or SMS goes out only after contact readiness and permissions are checked and your team approves the campaign. Your team retains responsibility for the offer, accuracy, and the next action.",
  },
  {
    q: "What can we see about costs and billing?",
    a: "The workspace shows recorded costs separately from usage estimates, and keeps lead delivery and invoice history tied to each campaign. Rates and billing are confirmed during setup.",
  },
  {
    q: "Can the system be introduced in phases?",
    a: "Yes. Start with the website, customer records, and campaign structure. Then set up imports of your existing lists, lead review, the inbox, and handoffs. Add approved email and SMS sending, AI reply drafts, and wider integrations as the workflow is ready.",
  },
  {
    q: "Are appointments, sales, or a specific lead volume guaranteed?",
    a: "No. Results depend on demand, your offer, data quality, permissions, response time, and sales execution. We define the business goal and the measures that make sense for your workflow.",
  },
] as const;
