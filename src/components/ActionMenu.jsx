import React, { useState } from "react";
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip
} from "@mui/material";
import GetIconComponent from "../helpers/icons";
const MoreHorizIcon = GetIconComponent("MoreHoriz")

const ActionMenu = ({ actions }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton size="small" onClick={handleOpen}>
                <MoreHorizIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        boxShadow: "none",
                    },
                }}
            >
                {actions.map((action) => (
                    <React.Fragment key={action.label}>
                        {action.divider && <Divider />}

                        <Tooltip title={action.tooltip}>
                            <MenuItem
                                disabled={action.disabled}
                                onClick={() => {
                                    handleClose();
                                    action.onClick?.();
                                }}
                                sx={{
                                    color: action.color,
                                }}
                            >

                                <ListItemIcon>{action.icon}</ListItemIcon>

                                <ListItemText primary={action.label} />

                            </MenuItem>
                        </Tooltip>
                    </React.Fragment>
                ))}
            </Menu>
        </>
    );
};

export default ActionMenu;