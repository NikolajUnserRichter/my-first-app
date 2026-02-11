import { useState } from "react";
import { usePowerAppsContext } from "@/hooks/use-power-apps-context";
import { usePeriods } from "@/hooks/use-periods";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Bell,
  Building2,
  Menu,
  LogOut,
  User,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeftRight,
  FileSpreadsheet,
  MailOpen,
} from "lucide-react";

// ── Notification Bell Data ───────────────────────────────────────────

interface BellNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  icon: React.ElementType;
  iconColor: string;
}

const bellNotifications: BellNotification[] = [
  { id: "n1", title: "Package abgelehnt", description: "REMONDIS Polska: IC-Salden stimmen nicht überein", timestamp: "vor 15 Min.", isRead: false, icon: AlertTriangle, iconColor: "text-red-600" },
  { id: "n2", title: "IC-Differenz erkannt", description: "010100 ↔ 040100: EUR 2.350 (L+L)", timestamp: "vor 1 Std.", isRead: false, icon: ArrowLeftRight, iconColor: "text-purple-600" },
  { id: "n3", title: "Neue Einreichung", description: "REMONDIS UK Ltd hat Kontensalden eingereicht", timestamp: "vor 2 Std.", isRead: false, icon: FileSpreadsheet, iconColor: "text-blue-600" },
  { id: "n4", title: "Upload-Deadline in 5 Tagen", description: "7 Gesellschaften haben noch nicht eingereicht", timestamp: "vor 3 Std.", isRead: true, icon: Clock, iconColor: "text-yellow-600" },
  { id: "n5", title: "Package freigegeben", description: "REMONDIS Assets & Services — Controller Approval", timestamp: "vor 5 Std.", isRead: true, icon: CheckCircle, iconColor: "text-green-600" },
  { id: "n6", title: "3 Validierungsfehler", description: "REMONDIS Aqua: Bilanzgleichung, Anlagenspiegel, IC-Salden", timestamp: "Gestern", isRead: true, icon: AlertTriangle, iconColor: "text-orange-600" },
];

// ── Component ────────────────────────────────────────────────────────

interface TopBarProps {
  onToggleSidebar: () => void;
  onNavigate?: (page: string) => void;
}

export function TopBar({ onToggleSidebar, onNavigate }: TopBarProps) {
  const { data: powerAppsCtx } = usePowerAppsContext();
  const { data: periods } = usePeriods();

  // Get active period (status = InProgress)
  const activePeriod = periods?.value?.find((p) => p.rem_status === 200000);

  const account = {
    name: powerAppsCtx?.user.fullName || "User",
    username: powerAppsCtx?.user.userPrincipalName || "user@example.com",
  };

  const initials = account?.name
    ? account.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const [notifications, setNotifications] = useState(bellNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    // Power Apps handles logout
    console.log("Logout");
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left: Logo + Toggle */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg"
            alt="REMONDIS"
            className="h-8 w-auto hidden"
          />
          <span className="text-lg font-semibold hidden sm:inline text-primary">
            Consolidation
          </span>
        </div>
      </div>

      {/* Center: Period Selector */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-sm">
          {activePeriod?.rem_label || activePeriod?.p3_name || "Keine aktive Periode"}
        </Badge>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notification Bell with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <h4 className="text-sm font-semibold">Benachrichtigungen</h4>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllRead}>
                  Alle gelesen
                </Button>
              )}
            </div>
            <Separator />
            <ScrollArea className="max-h-[380px]">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.id}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors",
                      !n.isRead && "bg-accent/20"
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted", n.iconColor)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm truncate", !n.isRead && "font-semibold")}>{n.title}</p>
                        {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.timestamp}</p>
                    </div>
                  </button>
                );
              })}
            </ScrollArea>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => onNavigate?.("notifications")}
              >
                Alle Benachrichtigungen anzeigen
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{account?.name || "Benutzer"}</p>
                <p className="text-xs text-muted-foreground">
                  {account?.username || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate?.("settings")}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate?.("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
