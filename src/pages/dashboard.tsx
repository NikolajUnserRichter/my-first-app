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
import {
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Globe,
  Coins,
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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                {t("dashboard.entities")}
              </CardDescription>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{totalEntities}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                {t("dashboard.activeEntities")}
              </CardDescription>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{activeEntities}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                {t("dashboard.countries")}
              </CardDescription>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{countries.size}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs font-medium">
                {t("dashboard.foreignCurrency")}
              </CardDescription>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {isAnyLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold">{foreignCurrency}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Active Period Info */}
        {activePeriod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("dashboard.activePeriod")}
              </CardTitle>
              <CardDescription>
                {activePeriod.rem_label || activePeriod.p3_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("dashboard.periodName")}</span>
                <span className="font-medium">{activePeriod.p3_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("dashboard.periodRange")}</span>
                <span className="font-medium">
                  {dateDe(activePeriod.rem_startdate)} - {dateDe(activePeriod.rem_enddate)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("dashboard.periodStatus")}</span>
                <Badge variant="outline">
                  {periodStatusLabel(activePeriod.rem_status, t)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Periods */}
        {periods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t("dashboard.allPeriods")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.periodsInSystem", { count: periods.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {periods.map((period, index) => (
                  <div key={period.rem_periodid}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <p className="font-medium">{period.p3_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {dateDe(period.rem_startdate)} - {dateDe(period.rem_enddate)}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {periodStatusLabel(period.rem_status, t)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Entities by Country */}
      {entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("dashboard.entitiesByCountry")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.entitiesDistribution", { total: totalEntities, countries: countries.size })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(countries)
                .sort()
                .map((country, index) => {
                  const count = entities.filter((e) => e.rem_country === country).length;
                  const percentage = Math.round((count / totalEntities) * 100);
                  const colors = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-pink-500',
                    'bg-teal-500',
                    'bg-indigo-500',
                    'bg-red-500',
                    'bg-yellow-500',
                    'bg-cyan-500',
                  ];
                  const barColor = colors[index % colors.length];
                  return (
                    <div key={country} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{country}</span>
                          <Badge variant="secondary" className="text-xs">
                            {t("dashboard.entityCount", { count })}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
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
