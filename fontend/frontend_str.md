employee-dashboard/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
|   |   |--- AppRoute.jsx
│   │   ├── common/
│   │   │   ├── Loading.jsx
│   │   │   └── NotFoundPage.jsx
│   │   └── layout/
│   │       ├── MainLayout.jsx
│   │       └── SideNav.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── home/
│   │   │   └── Home.jsx
│   │   ├── about/
│   │   │   └── About.jsx
│   │   └── dashboard/
│   │       └── Dashboard.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── RouterContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useRouter.js
│   ├── theme/
│   │   └── theme.js
│   ├── utils/
│   │   └── constants.js
│   ├── App.jsx
│   └── index.js
├── package.json
└── README.md