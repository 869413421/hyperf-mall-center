import request from '@/utils/request'

export function getProductList(query) {
  return request({
    url: '/center/product',
    method: 'get',
    params: query
  })
}

export function updateProduct(id, data) {
  return request({
    url: `/center/product/${id}`,
    method: 'patch',
    data: data
  })
}

export function createProduct(data) {
  return request({
    url: `/center/product`,
    method: 'post',
    data: data
  })
}

export function deleteProduct(id) {
  return request({
    url: `/center/product/${id}`,
    method: 'delete'
  })
}

