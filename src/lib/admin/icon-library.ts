export type AdminIconCategory = 'Navigation' | 'Catalog' | 'Content' | 'Commerce' | 'Communication' | 'Status' | 'People & places' | 'Media' | 'Interface';

export interface AdminIconItem {
  name: string;
  category: AdminIconCategory;
}

// Material Symbols names used by the storefront and CMS. Keeping this list in
// one place makes icon names reusable from content JSON without duplicating UI.
export const ADMIN_ICON_LIBRARY: AdminIconItem[] = [
  ...['home', 'menu', 'close', 'arrow_back', 'arrow_forward', 'chevron_left', 'chevron_right', 'expand_more', 'expand_less', 'keyboard_arrow_down', 'keyboard_arrow_up', 'north_east', 'open_in_new', 'login', 'logout', 'more_vert', 'drag_indicator'].map((name) => ({ name, category: 'Navigation' as const })),
  ...['inventory_2', 'category', 'account_tree', 'collections', 'collections_bookmark', 'shopping_bag', 'shopping_cart', 'local_mall', 'sell', 'sell', 'payments', 'credit_card', 'receipt_long', 'local_shipping', 'package_2', 'sell'].map((name) => ({ name, category: 'Catalog' as const })),
  ...['edit_document', 'edit_note', 'edit', 'auto_stories', 'article', 'description', 'notes', 'title', 'format_quote', 'format_bold', 'palette', 'brush', 'design_services', 'lightbulb', 'tips_and_updates', 'star', 'workspace_premium'].map((name) => ({ name, category: 'Content' as const })),
  ...['add_shopping_cart', 'add', 'remove', 'delete', 'save', 'favorite', 'favorite_border', 'bookmark', 'bookmark_border', 'local_offer', 'percent', 'sell'].map((name) => ({ name, category: 'Commerce' as const })),
  ...['chat', 'mail', 'call', 'send', 'share', 'link', 'language', 'public', 'alternate_email', 'forum', 'notifications', 'campaign'].map((name) => ({ name, category: 'Communication' as const })),
  ...['check', 'check_circle', 'task_alt', 'verified', 'info', 'help', 'error', 'warning', 'report_problem', 'progress_activity', 'lock', 'visibility', 'visibility_off', 'sync', 'refresh'].map((name) => ({ name, category: 'Status' as const })),
  ...['person', 'group', 'storefront', 'location_on', 'map', 'travel_explore', 'public', 'place', 'calendar_month', 'schedule', 'local_cafe', 'restaurant'].map((name) => ({ name, category: 'People & places' as const })),
  ...['image', 'photo_library', 'add_photo_alternate', 'cloud_upload', 'upload', 'download', 'movie', 'play_arrow', 'pause', 'camera_alt', 'photo_camera', 'collections'].map((name) => ({ name, category: 'Media' as const })),
  ...['search', 'tune', 'filter_alt', 'filter_alt_off', 'sort', 'view_list', 'grid_view', 'more_horiz', 'settings', 'build', 'key', 'shield', 'verified_user', 'database', 'apps', 'widgets', 'dashboard', 'space_dashboard', 'menu_open', 'fullscreen'].map((name) => ({ name, category: 'Interface' as const })),
].filter((item, index, items) => items.findIndex((candidate) => candidate.name === item.name) === index);
