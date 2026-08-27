// Centralized responsive grid definitions for consistent filter layouts
// These replace fixed size={N} with responsive breakpoints

// Standard filter field (most common - text inputs, pickers, medium-sized fields)
export const GRID_RESPONSIVE_STANDARD = { xs: 12, sm: 6, md: 4, lg: 3 };

// Small fields (checkboxes, status pickers, narrow inputs)
export const GRID_RESPONSIVE_SMALL = { xs: 12, sm: 6, md: 3, lg: 2 };

// Large fields (date ranges, complex pickers, wider inputs)
export const GRID_RESPONSIVE_LARGE = { xs: 12, sm: 12, md: 6, lg: 4 };

// Extra large fields (full-width sections within containers)
export const GRID_RESPONSIVE_XL = { xs: 12, sm: 12, md: 12, lg: 6 };

// Full width (location filters, special cases that need entire row)
export const GRID_RESPONSIVE_FULL = { xs: 12 };

// Half width (for paired elements like date ranges)
export const GRID_RESPONSIVE_HALF = { xs: 12, sm: 6 };

// Quarter width (for very small elements)
export const GRID_RESPONSIVE_QUARTER = { xs: 12, sm: 6, md: 3 };
