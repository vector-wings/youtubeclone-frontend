import { User } from '@/api/user'
import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'

export interface State {
  count: number
  user: User | null
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    count: 0,
    user: JSON.parse(window.localStorage.getItem('user') || 'null')
  },
  mutations: {
    setUser(state, user: User) {
      state.user = user
      window.localStorage.setItem('user', JSON.stringify(state.user))
    }
  }
})

export function useStore() {
  return baseUseStore(key)
}
