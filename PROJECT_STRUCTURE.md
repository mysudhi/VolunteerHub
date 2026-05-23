# VolunteerHub Monorepo Structure

```text
.
├── client
│   ├── index.html
│   ├── package.json
│   ├── src
│   │   ├── App.tsx
│   │   ├── components
│   │   │   └── layout
│   │   │       ├── DesktopHeader.tsx
│   │   │       └── MobileTabBar.tsx
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── DashboardPage.tsx
│   │   │   └── LoginPage.tsx
│   │   └── styles.css
│   ├── tsconfig.json
│   └── vite.config.ts
├── prisma
│   └── schema.prisma
├── server
│   ├── package.json
│   ├── src
│   │   ├── app.ts
│   │   ├── config
│   │   │   └── env.ts
│   │   ├── index.ts
│   │   ├── middleware
│   │   │   └── tenant-context.ts
│   │   ├── plugins
│   │   │   └── hook-registry.ts
│   │   └── routes
│   │       └── index.ts
│   └── tsconfig.json
├── shared
│   ├── package.json
│   ├── src
│   │   ├── index.ts
│   │   ├── schemas
│   │   │   └── organization.ts
│   │   └── types
│   │       └── rbac.ts
│   └── tsconfig.json
├── .gitignore
├── package.json
└── tsconfig.base.json
```
