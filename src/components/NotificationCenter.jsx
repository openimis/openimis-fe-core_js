import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { graphqlWithVariables } from "../actions";
import { useGraphqlQuery } from "../helpers/hooks";
import { useTranslations } from "../helpers/i18n";
import { useModulesManager } from "../helpers/modules";

const QUERY = `
  query NotificationInbox($first: Int) {
    unreadNotificationCount
    notifications(first: $first, orderBy: ["-created_at"]) {
      edges { node { id uuid type severity titleKey messageKey messageParams entityType entityId createdAt readAt } }
    }
  }
`;

const MARK_READ = `
  mutation MarkNotificationsRead($ids: [UUID]!) {
    markNotificationsRead(ids: $ids) { updatedCount }
  }
`;

const MIN_DELAY = 15000;
const MAX_DELAY = 300000;
const MIN_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

const defaultWebSocketUrl = () => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/notifications/`;
};

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations("core", modulesManager);
  const webSocketEnabled = modulesManager.getConf("fe-core", "notificationWebSocketEnabled", false);
  const webSocketUrl = modulesManager.getConf("fe-core", "notificationWebSocketUrl", null);
  const [open, setOpen] = useState(false);
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const delay = useRef(MIN_DELAY);
  const timer = useRef();
  const { data, error } = useGraphqlQuery(QUERY, { first: 30 }, { refreshKey, keepStale: true });

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    if (document.hidden) return;
    const jitter = 0.9 + Math.random() * 0.2;
    timer.current = setTimeout(() => setRefreshKey((key) => key + 1), delay.current * jitter);
  }, []);

  useEffect(() => {
    delay.current = error ? Math.min(delay.current * 2, MAX_DELAY) : webSocketConnected ? MAX_DELAY : MIN_DELAY;
    schedule();
    return () => clearTimeout(timer.current);
  }, [data, error, schedule, webSocketConnected]);

  useEffect(() => {
    if (!webSocketEnabled) return undefined;

    let stopped = false;
    let socket;
    let reconnectTimer;
    let reconnectDelay = MIN_RECONNECT_DELAY;

    const connect = () => {
      if (stopped || !navigator.onLine) return;
      socket = new WebSocket(webSocketUrl || defaultWebSocketUrl());
      socket.onopen = () => {
        reconnectDelay = MIN_RECONNECT_DELAY;
        setWebSocketConnected(true);
        setRefreshKey((key) => key + 1);
      };
      socket.onmessage = ({ data: message }) => {
        try {
          const event = JSON.parse(message);
          if (event.type === "notification.inbox.changed" && event.version === 1) {
            setRefreshKey((key) => key + 1);
          }
        } catch (_error) {
          // Ignore unknown events. The periodic GraphQL pull remains authoritative.
        }
      };
      socket.onerror = () => socket.close();
      socket.onclose = () => {
        setWebSocketConnected(false);
        if (!stopped && navigator.onLine) {
          reconnectTimer = setTimeout(connect, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
        }
      };
    };

    const reconnectOnline = () => {
      if (!socket || socket.readyState === WebSocket.CLOSED) connect();
    };

    connect();
    window.addEventListener("online", reconnectOnline);

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      window.removeEventListener("online", reconnectOnline);
      if (socket) socket.close();
    };
  }, [webSocketEnabled, webSocketUrl]);

  useEffect(() => {
    const catchUp = () => {
      if (!document.hidden && navigator.onLine) {
        delay.current = MIN_DELAY;
        setRefreshKey((key) => key + 1);
      }
    };
    document.addEventListener("visibilitychange", catchUp);
    window.addEventListener("online", catchUp);
    return () => {
      document.removeEventListener("visibilitychange", catchUp);
      window.removeEventListener("online", catchUp);
    };
  }, []);

  const notifications = useMemo(() => data?.notifications?.edges?.map(({ node }) => node) || [], [data]);

  const messageParams = (notification) => {
    if (typeof notification.messageParams !== "string") return notification.messageParams || {};
    try {
      return JSON.parse(notification.messageParams);
    } catch (_error) {
      return {};
    }
  };

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      await dispatch(graphqlWithVariables(MARK_READ, { ids: [notification.uuid] }, "MARK_NOTIFICATION_READ"));
      setRefreshKey((key) => key + 1);
    }
    const resolver = modulesManager.getRef(`core.notificationLink.${notification.entityType}`);
    const link = resolver?.(notification);
    if (link) history.push(link.startsWith("/") ? link : `/${link}`);
    setOpen(false);
  };

  return (
    <>
      <IconButton color="inherit" aria-label={formatMessage("notificationCenter.open")} onClick={() => setOpen(true)}>
        <Badge badgeContent={data?.unreadNotificationCount || 0} color="error" showZero>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Typography variant="h6" sx={{ p: 2, minWidth: 360 }}>
          {formatMessage("notificationCenter.title")}
        </Typography>
        <Divider />
        <List>
          {notifications.map((notification) => (
            <ListItemButton
              key={notification.id}
              selected={!notification.readAt}
              onClick={() => openNotification(notification)}
            >
              <ListItemText
                primary={formatMessage(notification.titleKey)}
                secondary={formatMessageWithValues(notification.messageKey, messageParams(notification))}
              />
              <Chip
                label={formatMessage(notification.readAt ? "notificationCenter.seen" : "notificationCenter.new")}
                color={notification.readAt ? "default" : "primary"}
                size="small"
                variant={notification.readAt ? "outlined" : "filled"}
                sx={{ ml: 2 }}
              />
            </ListItemButton>
          ))}
          {!notifications.length && <ListItemText sx={{ p: 2 }} primary={formatMessage("notificationCenter.empty")} />}
        </List>
      </Drawer>
    </>
  );
};

export default NotificationCenter;
