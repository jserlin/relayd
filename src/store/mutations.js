import * as types from './mutation-type'

// mutations 单词写错 导致 eslint报错
const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  }
}

export default mutations