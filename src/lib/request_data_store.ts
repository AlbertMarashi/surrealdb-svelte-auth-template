import { request_symbol } from "safe-ssr";
import type Surreal from "surrealdb";


class RequestDataStore<T> {
    // We use a WeakMap, so that the request data is
    // garbage collected after the request is complete.
    stores: WeakMap<symbol, T> = new WeakMap()

    // Only valid to call after `safe_request_wrapper` has run
    set request_data(data: T){
        const sym = request_symbol.current()
        this.stores.set(sym, data)
    }

    // Only valid to call after `safe_request_wrapper` has run
    get request_data() {
        const sym = request_symbol.current()

        const request_data = this.stores.get(sym)

        // this means you accessed request data before `safe_request_wrapper` has run, or did not use `request_data_initaliser`
        if(!request_data) throw new Error("No request data found for symbol")

        return request_data
    }
}

export const request_data_store = new RequestDataStore<{
    user_db: () => Promise<Surreal>
}>()