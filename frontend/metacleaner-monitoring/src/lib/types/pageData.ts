import type { SectionResult } from '$lib/server/clients/types.js';
import type {
	DashboardStat,
	DashboardAlert,
	MachineInstance,
	DeployEntry,
	RuntimeStat,
	RuntimeErrorEntry,
	ServiceCard,
	HealthCheck,
	Incident,
	SlaGoal,
	ErrorLogEntry,
	ErrorKpi,
	TopEndpoint,
	DbKpi,
	TableSize,
	EdgeKpiStat,
	GeoDistribution,
	WafLogEntry,
	HttpStatusDistribution,
	PerformanceKpiStat,
	SlowEndpoint,
	PerformanceEvent,
	BusinessKpiStat,
	PlanRevenue,
	ConversionFunnelStep,
	UserStat,
	User
} from '$lib/repositories/index.js';

export interface DashboardPageData {
	stats: SectionResult<DashboardStat[]>;
	alerts: SectionResult<DashboardAlert[]>;
}

export interface RuntimePageData {
	stats: SectionResult<RuntimeStat[]>;
	machines: SectionResult<MachineInstance[]>;
	deploys: SectionResult<DeployEntry[]>;
	errors: SectionResult<RuntimeErrorEntry[]>;
}

export interface AvailabilityPageData {
	services: SectionResult<ServiceCard[]>;
	healthChecks: SectionResult<HealthCheck[]>;
	incidents: SectionResult<Incident[]>;
	slaGoals: SectionResult<SlaGoal[]>;
}

export interface ErrorsPageData {
	kpis: SectionResult<ErrorKpi[]>;
	log: SectionResult<ErrorLogEntry[]>;
	topEndpoints: SectionResult<TopEndpoint[]>;
}

export interface DatabasePageData {
	kpis: SectionResult<DbKpi[]>;
	tableSizes: SectionResult<TableSize[]>;
}

export interface EdgePageData {
	kpis: SectionResult<EdgeKpiStat[]>;
	geoDistribution: SectionResult<GeoDistribution[]>;
	wafLog: SectionResult<WafLogEntry[]>;
	httpStatusDistribution: SectionResult<HttpStatusDistribution[]>;
}

export interface PerformancePageData {
	kpis: SectionResult<PerformanceKpiStat[]>;
	slowEndpoints: SectionResult<SlowEndpoint[]>;
	events: SectionResult<PerformanceEvent[]>;
}

export interface BusinessPageData {
	kpis: SectionResult<BusinessKpiStat[]>;
	planRevenue: SectionResult<PlanRevenue[]>;
	conversionFunnel: SectionResult<ConversionFunnelStep[]>;
}

export interface UsersPageData {
	stats: SectionResult<UserStat[]>;
	users: SectionResult<User[]>;
}
