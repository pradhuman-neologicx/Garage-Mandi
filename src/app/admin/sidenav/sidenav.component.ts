import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtService } from 'src/app/core/services/jwt.service';

interface MenuItem {
  index: number;
  icon: string;
  label: string;
  route: string;
  subItems?: MenuItem[];
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  menuItems: MenuItem[] = [];
  @Input() collapsed: boolean = false;
  @Input() isMobile: boolean = false;
  @Output() closeSidenav = new EventEmitter<void>();

  constructor(
    private jwtService: JwtService,
    private router: Router,
  ) { }
  ProfilePicSizeClass(): string {
    return this.collapsed ? 'profile-pic-small' : 'profile-pic-large';
  }

  ShortnameB(): string {
    return this.collapsed ? 'shortname-small-b' : 'shortname-big-b';
  }

  Shortname(): string {
    return this.collapsed ? 'shortname-small' : 'shortname-big';
  }

  sideNavCollapsed(): boolean {
    return this.collapsed;
  }

  loginAS!: number;
  paneluserId!: String;
  roles: any;
  ngOnInit(): void {
    this.roles = this.jwtService.getadmiRole();
    this.menuItems = [];

    if (this.roles == 'admin') {
      this.menuItems = [
        {
          index: 1,
          icon: 'home',
          label: 'Dashboard',
          route: 'dashboard',
        },
        {
          index: 2,
          icon: 'manage_accounts',
          label: 'User Management',
          route: '/admin/user-management',
        },
         {
          index: 3,
          icon: 'category',
          label: 'Category Management',
          route: '/admin/category-management',
        },
        {
          index: 4,
          icon: 'payments',
          label: 'Subscriptions',
          route: '/admin/subscription-management',
        },
        
        {
          index: 5,
          icon: 'list_alt',
          label: 'Requests',
          route: '/admin/requests-monitoring',
        },
        {
          index: 6,
          icon: 'group_add',
          label: 'Referrals',
          route: '/admin/referral-tracking',
        },
       {
          index: 7,
          icon: 'star_half',
          label: 'Feedbacks',
          route: '/admin/feedback-monitoring',
        },
        // {
        //   index: 8,
        //   icon: 'widgets',
        //   label: 'Master',
        //   route: '/admin/master',
        //   subItems: [
        //     {
        //       index: 1,
        //       icon: 'inventory_2',
        //       label: 'Department',
        //       route: '/admin/master/department',
        //     },

        //   ],
        // },


      ];
    } else if (this.roles == 'Engineer') {
      this.menuItems = [
        {
          index: 1,
          icon: 'home',
          label: 'Dashboard',
          route: 'dashboard',
        },
      ];
    }
  }

  removeDuplicateMenuItems(menuItems: any) {
    let uniqueItems: any;
    const seenRoutes = new Set();
    if (menuItems != undefined) {
      menuItems.forEach((item: any) => {
        if (item != undefined) {
          if (item.route != undefined) {
            if (!seenRoutes.has(item.route)) {
              uniqueItems.push(item);
              seenRoutes.add(item.route);
            }
          }
        }
      });
    }

    return uniqueItems;
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  closeSidebar() {
    this.collapsed = true;
  }
  ImageUrl!: String;

  name!: string;
  email!: string;

  getShortName(user: any) {
    if (this.name != undefined) {
      if (this.name != null) {
        return this.name.charAt(0);
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  isExpanded: boolean = false;

  // Function to toggle the expansion state
  toggleExpansion() {
    this.isExpanded = !this.isExpanded;
  }

  expandedSubmenu: string | null = null;

  isSubmenuExpanded(route: string): boolean {
    return this.expandedSubmenu === route;
  }

  toggleSubmenu(route: string): void {
    if (this.expandedSubmenu === route) {
      this.expandedSubmenu = null;
    } else {
      this.expandedSubmenu = route;
    }
  }
  closeSubmenu(): void {
    this.expandedSubmenu = null; // Close submenu
  }
}
