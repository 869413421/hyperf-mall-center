import request from '@/utils/request'

export function createCrowdfunding(data) {
  return request({
    url: `/center/crowdfunding`,
    method: 'post',
    data: data
  })
}

export function updateCrowdfunding(id, data) {
  return request({
    url: `/center/crowdfunding/${id}`,
    method: 'patch',
    data: data
  })
}

