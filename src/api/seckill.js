import request from '@/utils/request'

export function createSeckill(data) {
  return request({
    url: `/center/seckill`,
    method: 'post',
    data: data
  })
}

export function updateSeckill(id, data) {
  return request({
    url: `/center/seckill/${id}`,
    method: 'patch',
    data: data
  })
}
