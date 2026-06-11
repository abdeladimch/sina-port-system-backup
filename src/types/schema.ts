export type Department = "Admin" | "Closer" | "Delivery" | "Setter";

export type Role =
    | "CEO"
    | "EA"
    | "QA"
    | "Closer"
    | "Success Manager"
    | "Setter";

export interface PersonRow {
    person_id: string;
    full_name: string;
    email: string;
    department: Department;
    role: Role;
    reports_to_id: string | null;
    employment_type: string | null;
    status: "Active" | "Inactive";
    start_date: string | null;
    end_date: string | null;
}

export interface KpiRow {
    kpi_id: string;
    kpi_name: string;
    economic_engine_flow: string | null;
    department: string | null;
    owner_role: string | null;
    source_raw_tables: string | null;
    formula_plain_english: string | null;
    formula_sql: string | null;
    frequency: string | null;
    target_value: string | null;
    target_unit: string | null;
    direction: string | null;
    winner_condition: string;
    losing_condition: string;
    observation_condition: string;
    notes: string | null;
    legacy_kpi_name: string | null;
}

export interface DashboardMetric {
    metric: string;
    value: string;
}
