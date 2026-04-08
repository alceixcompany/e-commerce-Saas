export interface ComponentInstance {
    _id: string;
    type: string;
    name: string;
    data: any;
    createdAt: string;
    updatedAt: string;
}

export interface ComponentState {
    instances: ComponentInstance[];
    currentInstance: ComponentInstance | null;
    isLoading: boolean;
    error: string | null;
}
