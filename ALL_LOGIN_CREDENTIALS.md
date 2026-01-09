# 🔐 Complete Login Credentials - Community Grievance System

**Last Updated:** January 6, 2026

---

## 🌟 SUPER ADMIN (System-Wide Access)

**Access Level:** Can view and manage ALL complaints across ALL localities

```
Email:    superadmin@system.gov
Password: superadmin123
```

---

## 👨‍💼 LOCALITY ADMINS (Locality-Specific Access)

Each admin can only view/manage complaints from their locality:

### Jangaon Admin
```
Email:    admin@jangaon.gov
Password: admin123
```

### Warangal Admin
```
Email:    admin@warangal.gov
Password: admin123
```

### Narapally Admin
```
Email:    admin@narapally.gov
Password: admin123
```

### Pocharam Admin
```
Email:    admin@pocharam.gov
Password: admin123
```

### Karimnagar Admin
```
Email:    admin@karimnagar.gov
Password: admin123
```

---

## 👷 STAFF ACCOUNTS (Department & Locality Specific)

**Email Format:** `{department}.{level}@{locality}.staff`  
**Password:** `staff123` (for all staff)

### Departments:
- roads
- water
- sanitation
- electricity
- municipal
- **others** ⭐ (newly added)

### Staff Levels:
- **junior** - Can handle low priority complaints
- **mid** - Can handle low & medium priority complaints
- **senior** - Can handle all complaints (low, medium, high)

### Localities:
- jangaon
- warangal
- narapally
- pocharam
- karimnagar

---

## 📋 Staff Login Examples:

### Roads Department:
```
roads.junior@jangaon.staff / staff123
roads.mid@warangal.staff / staff123
roads.senior@narapally.staff / staff123
```

### Water Department:
```
water.junior@pocharam.staff / staff123
water.mid@karimnagar.staff / staff123
water.senior@jangaon.staff / staff123
```

### Sanitation Department:
```
sanitation.junior@warangal.staff / staff123
sanitation.mid@narapally.staff / staff123
sanitation.senior@pocharam.staff / staff123
```

### Electricity Department:
```
electricity.junior@karimnagar.staff / staff123
electricity.mid@jangaon.staff / staff123
electricity.senior@warangal.staff / staff123
```

### Municipal Department:
```
municipal.junior@narapally.staff / staff123
municipal.mid@pocharam.staff / staff123
municipal.senior@karimnagar.staff / staff123
```

### Others Department (Miscellaneous):
```
others.junior@jangaon.staff / staff123
others.mid@warangal.staff / staff123
others.senior@narapally.staff / staff123
```

---

## 🏠 Total Staff Count by Locality:

Each locality has **18 staff members** (6 departments × 3 levels):
- Jangaon: 18 staff
- Warangal: 18 staff
- Narapally: 18 staff
- Pocharam: 18 staff
- Karimnagar: 18 staff

**Grand Total: 90 staff members + 5 locality admins + 1 super admin = 96 accounts**

---

## 🔄 Escalation Flow:

When a complaint exceeds its SLA deadline:
1. **Junior staff** → complaint escalates to → **Mid staff**
2. **Mid staff** → complaint escalates to → **Senior staff**
3. **Senior staff** → marked as critical (no further escalation)

---

## 🌐 Application URLs:

- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:5000

---

## 📝 Notes:

- ✅ All passwords are for development/testing only
- ✅ Super admin can see ALL complaints regardless of locality
- ✅ Locality admins see only their locality's complaints
- ✅ Staff see only complaints assigned to them
- ✅ Citizens see their own complaints + locality transparency view
- ✅ "Others" department handles miscellaneous/general complaints

---

## 🚀 Quick Test Accounts:

**For Admin Testing:**
```
superadmin@system.gov / superadmin123  (See everything)
admin@jangaon.gov / admin123           (See only Jangaon)
```

**For Staff Testing:**
```
roads.senior@jangaon.staff / staff123     (Roads - High priority)
water.mid@warangal.staff / staff123       (Water - Medium priority)
others.junior@narapally.staff / staff123  (Others - Low priority)
```

**For Citizen Testing:**
Create new accounts via registration form (any locality).

---

**Status:** ✅ All accounts created and verified  
**Last Script Run:** createSuperAdmin.js
