import { fPermissions } from "src/app/core/enums/system-enums/permission.enum";
import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: "Menu",
    isTitle: true,
  },
  {
    id: 2,
    label: "Dashboard",
    icon: "fas fa-chart-bar",
    subItems: [],
  },
  {
    id: 3,
    label: "Gate Pass",
    icon: "far fa-credit-card",
    link: "/gate-pass",
    subItems: [],
  },
  {
    id: 10,
    label: "Quality Control",
    icon: "fas fa-anchor",
    subItems: [
      {
        id: 11,
        label: "QC Eligible Entities",
        // link: "/master-data/items",
        parentId: 10,
        permission: fPermissions.VIEW_USERS_LIST,
        subItems: [
          {
            id: 11,
            label: "Items",
            link: "/master-data/items",
            parentId: 11,
            permission: fPermissions.VIEW_USERS_LIST,
          },
          {
            id: 11,
            label: "Warehouses",
            link: "/master-data/items",
            parentId: 11,
            permission: fPermissions.VIEW_USERS_LIST,
          },
        ],
      },
      {
        id: 21,
        label: "QC Parameters",
        link: "/quality-control/qc-parameters",
        parentId: 28,
        permission: fPermissions.VIEW_USERS_LIST,
      },
      {
        id: 21,
        label: "Stages",
        link: "/quality-control/stages",
        parentId: 28,
        permission: fPermissions.VIEW_USERS_LIST,
      },
      {
        id: 21,
        label: "Operations",
        parentId: 28,
        permission: fPermissions.VIEW_USERS_LIST,
        subItems: [
          {
            id: 11,
            label: "Inspections",
            link: "/quality-control/inspections",
            parentId: 11,
            permission: fPermissions.VIEW_USERS_LIST,
          },
          {
            id: 11,
            label: "Rejections",
            link: "/master-data/items",
            parentId: 11,
            permission: fPermissions.VIEW_USERS_LIST,
          },
          {
            id: 11,
            label: "Cancellations",
            link: "/master-data/items",
            parentId: 11,
            permission: fPermissions.VIEW_USERS_LIST,
          },
        ],
      },
    ],
  },
  {
    id: 20,
    label: "Master Data",
    icon: "fas fa-sitemap",
    subItems: [
      {
        id: 21,
        label: "Items",
        link: "/master-data/items",
        parentId: 28,
        permission: fPermissions.VIEW_USERS_LIST,
      },
    ],
  },
  {
    id: 30,
    label: "User Management",
    icon: "fas fa-user-cog",
    subItems: [
      {
        id: 31,
        label: "System Users",
        link: "/user-management/users",
        parentId: 30,
        permission: fPermissions.VIEW_USERS_LIST,
      },
      {
        id: 32,
        label: "User Roles",
        link: "/user-management/roles",
        parentId: 30,
        permission: fPermissions.VIEW_ROLES_LIST,
      },
      {
        id: 33,
        label: "Permissions",
        link: "/user-management/permissions",
        parentId: 30,
        permission: fPermissions.VIEW_PERMISSION_LIST,
      },
    ],
  },
];
