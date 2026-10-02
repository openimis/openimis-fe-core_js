// Main-menu entries shown to a user. Pure module (no imports) so it runs
// under `node --test`.

// Entries of a configured menu: the contributed entries whose id is listed
// under `menuId` in the fe-core "menus" configuration, ordered by position,
// the first contribution of each id, filtered by the user's rights.
// `resolveIcon(name)` returns the icon element of a configured icon name.
export function configuredMenuEntries(menuConfig, allEntries, menuId, rights, resolveIcon) {
  const submenuMapping = {};
  const menuIcons = {};
  menuConfig
    .filter((menu) => menu.id == menuId)
    .forEach((menu) => {
      (menu.submenus || []).forEach((submenu) => {
        submenuMapping[submenu.id] = submenu.position;
        if (submenu.icon) {
          menuIcons[submenu.id] = submenu.icon;
        }
      });
    });

  const updatedEntries = allEntries
    .map((entry) => {
      const customIcon = menuIcons[entry.id];
      return {
        ...entry,
        position: submenuMapping[entry.id] || null,
        icon: customIcon ? resolveIcon(customIcon) : entry.icon,
      };
    })
    .filter((entry) => entry.position !== null)
    .sort((a, b) => a.position - b.position);

  const uniqueEntries = new Map();
  updatedEntries.forEach((entry) => {
    if (!uniqueEntries.has(entry.id)) {
      uniqueEntries.set(entry.id, entry);
    }
  });

  return Array.from(uniqueEntries.values()).filter((entry) => !entry.filter || entry.filter(rights));
}

// A menu header is drawn only when the user has at least one entry under it.
export const isMenuShown = (entries) => Array.isArray(entries) && entries.length > 0;
