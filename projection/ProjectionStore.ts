export class ProjectionStore {
    private store: Record<string, unknown> = {}
    put(id: string, data: unknown) {
        this.store[id] = data
    }
    get<T>(id: string): T {
        return this.store[id] as T
    }
}