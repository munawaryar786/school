# Architecture Diagram

Project: School ERP Management System  
Phase: 1 - System Architecture

## Logical System Diagram

```mermaid
flowchart TB
  subgraph Clients
    Web[Next.js Web App]
    Mobile[Future Mobile Apps]
    Public[Public Website CMS Pages]
  end

  subgraph Edge
    CDN[CDN / Static Asset Delivery]
    LB[Load Balancer / Reverse Proxy]
  end

  subgraph Backend
    API[Express.js TypeScript API]
    Worker[Background Worker]
    Shared[Shared Zod Contracts and Permission Constants]
  end

  subgraph Data
    DB[(PostgreSQL)]
    Redis[(Redis Cache / Queue)]
    S3[(S3-Compatible Object Storage)]
  end

  subgraph External
    Email[Email Provider]
    SMS[SMS Provider]
    Push[Push Provider]
    Pay[Payment Provider]
    Monitor[Error Monitoring / Logs]
  end

  Web --> CDN
  Public --> CDN
  CDN --> LB
  Mobile --> LB
  LB --> API
  API --> Shared
  Worker --> Shared
  API --> DB
  API --> Redis
  API --> S3
  Worker --> DB
  Worker --> Redis
  Worker --> S3
  Worker --> Email
  Worker --> SMS
  Worker --> Push
  API --> Pay
  API --> Monitor
  Web --> Monitor
```

## Request Flow

```mermaid
sequenceDiagram
  actor User
  participant Web as Next.js Web App
  participant API as Express API
  participant Auth as Auth/RBAC Middleware
  participant Service as Domain Service
  participant DB as PostgreSQL
  participant Audit as Audit Logger

  User->>Web: Submit protected action
  Web->>API: HTTPS request with JWT
  API->>Auth: Verify token and tenant context
  Auth->>Auth: Check permission
  API->>Service: Execute validated business command
  Service->>DB: Tenant-scoped transaction
  Service->>Audit: Record sensitive action
  API->>Web: Typed response envelope
  Web->>User: Success, error, loading, or empty state
```

## Multi-School Data Isolation Diagram

```mermaid
flowchart LR
  Platform[Platform Tenant Context] --> SuperAdmin[Super Admin]
  SchoolA[School A Tenant Context] --> AUsers[School A Users]
  SchoolA --> AData[School A Academic / Finance / People Data]
  SchoolB[School B Tenant Context] --> BUsers[School B Users]
  SchoolB --> BData[School B Academic / Finance / People Data]

  SuperAdmin --> SchoolA
  SuperAdmin --> SchoolB
  AUsers -. no access .-> BData
  BUsers -. no access .-> AData
```

## Module Dependency Diagram

```mermaid
flowchart TB
  Foundation[Foundation: Auth, RBAC, Tenancy, Theme, Shared Components]
  Academic[Academic Core]
  People[People: Students, Guardians, Teachers, Staff]
  Attendance[Attendance]
  Exams[Examinations]
  LMS[LMS]
  Finance[Fees and Finance]
  Ops[Operations: Library, Documents, Certificates, Meetings, CMS]
  Reports[Reports and Analytics]
  Security[Security Hardening]
  Mobile[Mobile API Layer]

  Foundation --> Academic
  Foundation --> People
  Academic --> Attendance
  People --> Attendance
  Academic --> Exams
  People --> Exams
  Academic --> LMS
  People --> LMS
  People --> Finance
  Finance --> Reports
  Attendance --> Reports
  Exams --> Reports
  LMS --> Reports
  Foundation --> Ops
  Reports --> Mobile
  Foundation --> Mobile
  Foundation --> Security
```

