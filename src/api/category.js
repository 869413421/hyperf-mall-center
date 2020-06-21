import request from '@/utils/request'

export function getCategoryList(query) {
    return request({
      url: '/category',
      method: 'get',
      params: query
    })
  }