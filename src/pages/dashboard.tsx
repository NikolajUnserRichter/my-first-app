import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Globe,
  Coins,
  TrendingUp,
  TrendingDown,
  Minus,
  FileCheck,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useEntities } from "@/hooks/use-entities";
import { useActivePeriod, usePeriods } from "@/hooks/use-periods";
import { PeriodStatus } from "@/types/dataverse";
import type { DvEntity, DvPeriod } from "@/types/dataverse";

function periodStatusLabel(status: number, t: (key: string) => string): string {
  switch (status) {
    case PeriodStatus.Open:
      return t("dashboard.statusOpen");
    case PeriodStatus.InProgress:
      return t("dashboard.statusInProgress");
    case PeriodStatus.Closed:
      return t("dashboard.statusClosed");
    case PeriodStatus.Locked:
      return t("dashboard.statusLocked");
    default:
      return "–";
  }
}

const dateDe = (iso: string | null): string => {
  if (!iso) return "–";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export function DashboardPage() {
  const { t } = useTranslation();

  // Fetch active period
  const {
    data: activePeriod,
    isLoading: isPeriodLoading,
    isError: isPeriodError,
  } = useActivePeriod();

  // Fetch all periods
  const {
    data: periodsData,
    isLoading: isPeriodsLoading,
  } = usePeriods();

  // Fetch entities
  const {
    data: entitiesData,
    isLoading: isEntitiesLoading,
    isError: isEntitiesError,
  } = useEntities();

  const entities: DvEntity[] = entitiesData?.value ?? [];
  const periods: DvPeriod[] = periodsData?.value ?? [];

  const totalEntities = entities.length;
  const activeEntities = entities.filter((e) => e.p3_isactive).length;
  const countries = new Set(entities.map((e) => e.rem_country));
  const foreignCurrency = entities.filter((e) => e.rem_currency !== "EUR").length;

  const isAnyLoading = isPeriodLoading || isEntitiesLoading || isPeriodsLoading;

  if (isPeriodError || isEntitiesError) {
    return (
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            {t("dashboard.loadError")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">
            {activePeriod
              ? t("dashboard.subtitleWithPeriod", { period: activePeriod.rem_label })
              : t("dashboard.subtitle")}
          </p>
        </div>
        {activePeriod && (
          <Badge variant="outline">
            {periodStatusLabel(activePeriod.rem_status, t)}
          </Badge>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {t("dashboard.entities")}
              </CardDescription>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{totalEntities}</div>
                <p className="text-xs text-muted-foreground">
                  {activeEntities} {t("dashboard.active")} ({Math.round((activeEntities / totalEntities) * 100)}%)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {t("dashboard.activeEntities")}
              </CardDescription>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">{activeEntities}</div>
                <Progress
                  value={(activeEntities / totalEntities) * 100}
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {t("dashboard.countries")}
              </CardDescription>
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{countries.size}</div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.globalPresence")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {t("dashboard.foreignCurrency")}
              </CardDescription>
              <Coins className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{foreignCurrency}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((foreignCurrency / totalEntities) * 100)}% {t("dashboard.ofTotal")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Period KPIs */}
      {activePeriod && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  {t("dashboard.activePeriod")}
                </CardDescription>
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold tracking-tight">{activePeriod.rem_label || activePeriod.p3_name}</div>
                <p className="text-xs text-muted-foreground">
                  {dateDe(activePeriod.rem_startdate)} - {dateDe(activePeriod.rem_enddate)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  {t("dashboard.periodStatus")}
                </CardDescription>
                <FileCheck className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className={
                    activePeriod.rem_status === PeriodStatus.Open
                      ? "border-green-500 text-green-700"
                      : activePeriod.rem_status === PeriodStatus.InProgress
                      ? "border-blue-500 text-blue-700"
                      : activePeriod.rem_status === PeriodStatus.Closed
                      ? "border-orange-500 text-orange-700"
                      : "border-red-500 text-red-700"
                  }
                >
                  {periodStatusLabel(activePeriod.rem_status, t)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wide">
                  {t("dashboard.totalPeriods")}
                </CardDescription>
                <Clock className="h-4 w-4 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">{periods.length}</div>
                <p className="text-xs text-muted-foreground">
                  {periods.filter(p => p.rem_status === PeriodStatus.Open || p.rem_status === PeriodStatus.InProgress).length} {t("dashboard.active")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Periods */}
      {periods.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t("dashboard.allPeriods")}
                </CardTitle>
                <CardDescription className="mt-1">
                  {t("dashboard.periodsInSystem", { count: periods.length })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              {periods.map((period) => (
                <div key={period.rem_periodid} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{period.p3_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateDe(period.rem_startdate)} - {dateDe(period.rem_enddate)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      period.rem_status === PeriodStatus.Open
                        ? "border-green-500 text-green-700"
                        : period.rem_status === PeriodStatus.InProgress
                        ? "border-blue-500 text-blue-700"
                        : period.rem_status === PeriodStatus.Closed
                        ? "border-orange-500 text-orange-700"
                        : "border-red-500 text-red-700"
                    }
                  >
                    {periodStatusLabel(period.rem_status, t)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entities by Country */}
      {entities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t("dashboard.entitiesByCountry")}
                </CardTitle>
                <CardDescription className="mt-1">
                  {totalEntities} {t("dashboard.entities")} · {countries.size} {t("dashboard.countries")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(countries)
                .sort()
                .map((country, index) => {
                  const count = entities.filter((e) => e.rem_country === country).length;
                  const percentage = Math.round((count / totalEntities) * 100);
                  const colors = [
                    'bg-blue-600',
                    'bg-green-600',
                    'bg-purple-600',
                    'bg-orange-600',
                    'bg-pink-600',
                    'bg-teal-600',
                    'bg-indigo-600',
                    'bg-red-600',
                    'bg-yellow-600',
                    'bg-cyan-600',
                  ];
                  const barColor = colors[index % colors.length];
                  return (
                    <div key={country} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm uppercase tracking-wide min-w-[3rem]">{country}</span>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                      />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isAnyLoading && entities.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3 py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">{t("dashboard.noData")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("dashboard.noDataDescription")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
