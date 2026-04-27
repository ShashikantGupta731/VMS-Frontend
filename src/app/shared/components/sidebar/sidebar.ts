import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarMenuItem {
  label: string;
  route?: string;
  icon?: string;
  children?: SidebarMenuItem[];
  action?: () => void;
  disabled?: boolean;
  badge?: string | number;
}

export interface SidebarConfig {
  position?: 'left' | 'right';
  collapsed?: boolean;
  width?: string;
  collapsedWidth?: string;
  showUserSection?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() config: SidebarConfig = {};
  @Input() currentUser?: { name: string; avatar?: string };
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<SidebarMenuItem>();
  @Output() logout = new EventEmitter<void>();
  @Output() mouseLeave = new EventEmitter<void>();

  isCollapsed: boolean = false;
  isSidebarHovered: boolean = false;
  activeItem: SidebarMenuItem | null = null;
  expandedItems: Set<string> = new Set();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isCollapsed = this.config.collapsed ?? true;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggleCollapse.emit();
  }

  handleItemClick(item: SidebarMenuItem, event?: Event): void {
    if (item.disabled) return;
    
    // Toggle expanded state for items with children
    if (this.hasChildren(item)) {
      const itemKey = item.label;
      if (this.expandedItems.has(itemKey)) {
        this.expandedItems.delete(itemKey);
      } else {
        this.expandedItems.add(itemKey);
      }
      // Clear activeItem when expanding parent
      this.activeItem = null;
      // Prevent navigation when item has children
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.menuItemClick.emit(item);
      return;
    }
    
    if (item.route) {
      this.router.navigate([item.route]);
    }
    this.activeItem = item;
    this.menuItemClick.emit(item);
  }

  isItemActive(item: SidebarMenuItem): boolean {
    if (!item.route) return false;
    return this.router.isActive(item.route, false);
  }

  hasChildren(item: SidebarMenuItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  isExpanded(item: SidebarMenuItem): boolean {
    return this.expandedItems.has(item.label);
  }

  onLogout(): void {
    this.logout.emit();
  }

  onMouseEnter(): void {
    this.isSidebarHovered = true;
  }

  onMouseLeave(): void {
    this.isSidebarHovered = false;
    this.mouseLeave.emit();
  }

  get isSidebarExpanded(): boolean {
    return !this.isCollapsed || this.isSidebarHovered;
  }
}
