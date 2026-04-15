export interface ComponentInstance {
    _id: string;
    id: string; // Redux normalization
    type: string;
    name: string;
    data: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface ComponentPayload {
    type: string;
    name: string;
    data?: Record<string, unknown>;
}

export interface ComponentState {
    instances: ComponentInstance[];
    currentInstance: ComponentInstance | null;
    isLoading: boolean;
    error: string | null;
}
